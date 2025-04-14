#!/bin/bash

# Check if we're in the project root
if [ ! -f "docker-compose.yml" ] || [ ! -d "frontend" ] || [ ! -d "migration-scripts" ]; then
    echo "Error: Must be run from the project root directory (tsunaimi-website)"
    echo "Current directory: $(pwd)"
    echo "Please change to the project root and try again"
    exit 1
fi

# Store the starting directory
INITIAL_DIR="$(pwd)"

# NAS Configuration
NAS_USER="tsnm_user"
NAS_IP="192.168.1.32"
NAS_RELEASES_PATH="web/tsunaimi/releases"
NAS_PRODUCTION_PATH="web/tsunaimi/production"
SSH_KEY="$HOME/.ssh/tsunaimi_deploy_key"

# Get current branch and version
CURRENT_BRANCH=$(git branch --show-current)
if [[ ! $CURRENT_BRANCH =~ ^release/([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    echo "Changing branch to release/$VERSION"
    git checkout "release/$VERSION"
fi

VERSION=${BASH_REMATCH[1]}
RELEASE_NAME="tsunaimi-website-v$VERSION"
# Convert version with dots to version with hyphens for project name
VERSION_NO_DOTS=$(echo "$VERSION" | tr '.' '-')

# Ask about network recreation
read -p "Do you want to recreate the production network? This will assign new IPs to containers. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    RECREATE_NETWORK=true
    echo "Network will be recreated during deployment"
else
    RECREATE_NETWORK=false
    echo "Existing network will be preserved"
fi

echo "Current branch: $CURRENT_BRANCH"
echo "Version to deploy: $VERSION"
echo "Working directory: $INITIAL_DIR"

# Confirm with user
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check for existing directories
echo "Checking for existing deployment directories..."
if ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP"\
 "[ -d '$NAS_PRODUCTION_PATH/$RELEASE_NAME' ]"; then
    echo "Found existing deployment directories:"
    echo "  - $NAS_PRODUCTION_PATH/$RELEASE_NAME"
    read -p "Do you want to remove this directory? (y/n) " -n 1 -r
   echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing directories..."
        ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP"\
         "rm -rf '$NAS_PRODUCTION_PATH/$RELEASE_NAME'"
    else
        echo "Aborting deployment. Please clean up directory manually."
        exit 1
    fi
fi


# Step 1: Initial Setup
echo "=== Step 1: Initial Setup ==="
CURRENT_DIR=$(pwd)
TEMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
    echo "Cleaning up..."
    rm -rf "$TEMP_DIR"
    cd "$CURRENT_DIR" || exit 1
}
trap cleanup EXIT

# Step 2: Pre-deployment Checks
echo "=== Step 2: Pre-deployment Checks ==="

# Check if on release branch
if [ "$(git branch --show-current)" != "release/$VERSION" ]; then
    echo "Error: Must be on release/$VERSION branch to deploy to production"
    exit 1
fi

# Step 3: Production Setup
echo "=== Step 3: Production Setup ==="

# 3.1: Copy production files from local machine to releases
echo "3.1: Copying production files to releases..."
sftp -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
cd ${NAS_RELEASES_PATH}/${RELEASE_NAME}
put docker-compose.production.yml
put .env.production
bye
EOF
if [ $? -ne 0 ]; then
    echo "Error: Failed to copy production files"
    exit 1
fi

# 3.2: Create production directory
echo "3.2: Creating production directory..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "mkdir -p ${NAS_PRODUCTION_PATH}/${RELEASE_NAME} &&\
  chmod 755 ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}" ||\
  { echo "Error: Failed to create production directory"; exit 1; }


# 3.3: Copy essential files from releases to production
echo "3.3: Copying essential files\
 from ${NAS_RELEASES_PATH}/${RELEASE_NAME}/ \
 to ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/docker-compose.production.yml \
 ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/ &&\
 cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/.env.production \
 ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/" \
 || { echo "Error: Failed to copy essential files"; exit 1; }

# Step 4: Container Deployment
echo "=== Step 4: Container Deployment ==="

# 4.1: Stop existing containers (if they exist)
echo "4.1: Checking for existing containers..."
if ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"/volume1/@appstore/ContainerManager/usr/bin/docker ps -a | grep \
-q 'tsunaimi-frontend-production'"; then
    echo "Existing containers found, stopping them..."

    # Directly stop and remove containers by name instead of using docker-compose
    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
    "/volume1/@appstore/ContainerManager/usr/bin/docker \
    stop tsunaimi-frontend-production tsunaimi-postgresql-production && \
     /volume1/@appstore/ContainerManager/usr/bin/docker \
     rm tsunaimi-frontend-production tsunaimi-postgresql-production" \
    || true

    # If recreate network is true, remove the network too
    if [ "$RECREATE_NETWORK" = true ]; then
        echo "Recreating network..."
        ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
        "/volume1/@appstore/ContainerManager/usr/bin/docker network rm tsunaimi-network-production" \
        || true
    fi
    else

    echo "No existing containers found, proceeding with deployment..."
fi

# 4.2: Load images
echo "4.2: Loading images..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"cd ${NAS_RELEASES_PATH}/${RELEASE_NAME} &&\
 /volume1/@appstore/ContainerManager/usr/bin/docker load \
 -i frontend-${RELEASE_NAME}.tar && \
 /volume1/@appstore/ContainerManager/usr/bin/docker load \
 -i postgres-${RELEASE_NAME}.tar" \
 || { echo "Error: Failed to load images"; exit 1; }

# 4.3: Start containers
echo "4.3: Starting containers..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "cd ${NAS_PRODUCTION_PATH}/${RELEASE_NAME} &&\
  RELEASE_NAME='${RELEASE_NAME}'\
  /volume1/@appstore/ContainerManager/usr/bin/docker-compose \
   -p tsunaimi-production-${VERSION_NO_DOTS} \
   -f docker-compose.production.yml --env-file .env.production up -d" \
  || { echo "Error: Failed to start containers"; exit 1; }

# 4.4: Initialize PostgreSQL
echo "4.4: Initializing PostgreSQL..."

# Verify .env.production exists
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "[ -f '${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/.env.production' ]" || { echo "Error: .env.production file not found"; exit 1; }

# Read environment variables from .env.production
POSTGRES_USER=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"grep '^POSTGRES_USER=' ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/.env.production | cut -d'=' -f2")
POSTGRES_PASSWORD=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"grep '^POSTGRES_PASSWORD=' ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/.env.production | cut -d'=' -f2")
POSTGRES_DB=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"grep '^POSTGRES_DB=' ${NAS_PRODUCTION_PATH}/${RELEASE_NAME}/.env.production | cut -d'=' -f2")

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "Error: Missing required database credentials in .env.production"
    echo "POSTGRES_USER: $POSTGRES_USER"
    echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
    echo "POSTGRES_DB: $POSTGRES_DB"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"until /volume1/@appstore/ContainerManager/usr/bin/docker \
exec tsunaimi-postgresql-production pg_isready \
-h localhost -p 5432 -U '$POSTGRES_USER'; do sleep 1; done" \
|| { echo "Error: PostgreSQL not ready"; exit 1; }

# 4.5: Create user and database if they don't exist
echo "4.5: Creating user and database if they don't exist..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"/volume1/@appstore/ContainerManager/usr/bin/docker exec \
-i tsunaimi-postgresql-production psql -U $POSTGRES_USER -d postgres \
-c \"CREATE DATABASE $POSTGRES_DB WITH OWNER $POSTGRES_USER;\"" 2>/dev/null \
|| true

# Checking database was created
echo "Checking if database was created..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"/volume1/@appstore/ContainerManager/usr/bin/docker exec \
-i tsunaimi-postgresql-production psql -U $POSTGRES_USER -d postgres \
-c \"SELECT datname FROM pg_database WHERE datname='$POSTGRES_DB';\""

# checking user was created
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"/volume1/@appstore/ContainerManager/usr/bin/docker exec \
-i tsunaimi-postgresql-production psql -U $POSTGRES_USER -d postgres \
-c \"SELECT usename FROM pg_user;\""

# 4.6: Apply migrations
echo "4.6: Applying database migrations..."
for migration in frontend/src/db/migrations/*.sql; do
    echo "Applying migration: $(basename "$migration")"
    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
    "/volume1/@appstore/ContainerManager/usr/bin/docker \
    cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/frontend/src/db/migrations/$(basename "$migration") \
    tsunaimi-postgresql-production:/tmp/" \
    || { echo "Error: Failed to copy migration file"; exit 1; }
    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
    "/volume1/@appstore/ContainerManager/usr/bin/docker exec \
    -i tsunaimi-postgresql-production psql -U '$POSTGRES_USER' \
    -d '$POSTGRES_DB' -f /tmp/$(basename "$migration")" \
    || { echo "Error: Failed to apply migration"; exit 1; }
done

# 4.7: Verify tables were created
echo "4.7: Verifying table creation..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"/volume1/@appstore/ContainerManager/usr/bin/docker exec \
-i tsunaimi-postgresql-production psql -U '$POSTGRES_USER' \
-d '$POSTGRES_DB' -c '\dt' | grep -q 'contact_submissions'" \
|| { echo "Error: Failed to create contact_submissions table"; exit 1; }

# Step 5: Verification
echo "=== Step 5: Verification ==="

# 5.1: Check container status
echo "5.1: Checking container status..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" << EOF
  if ! /volume1/@appstore/ContainerManager/usr/bin/docker ps \
  | grep -q "tsunaimi-frontend-production"; then
    echo "Error: Frontend container is not running"
    exit 1
  fi
  if ! /volume1/@appstore/ContainerManager/usr/bin/docker ps \
  | grep -q "tsunaimi-postgresql-production"; then
    echo "Error: PostgreSQL container is not running"
    exit 1
  fi
  echo "All containers are running"
EOF

# 5.2: Display container IPs
echo "5.2: Container IP Addresses:"
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" << EOF
  echo "Frontend container:"
  /volume1/@appstore/ContainerManager/usr/bin/docker inspect \
  -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' tsunaimi-frontend-production
  echo "PostgreSQL container:"
  /volume1/@appstore/ContainerManager/usr/bin/docker inspect \
  -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' tsunaimi-postgresql-production
EOF

# 5.3: Check environment variables
echo "5.3: Checking environment variables..."
echo "Frontend environment:"
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"/volume1/@appstore/ContainerManager/usr/bin/docker exec \
tsunaimi-frontend-production env | grep -E 'DATABASE_URL|POSTGRES'"

# 5.4: User verification
echo "5.4: Manual testing verification"
echo "Please verify that the production site is working correctly:"
echo "  - Frontend is accessible"
echo "  - Contact form submissions are working"
echo "  - Any other critical functionality"
read -p "Has testing been successful? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Testing failed. Aborting Git operations."
    exit 1
fi

# Step 6: Git Operations
echo "=== Step 6: Git Operations ==="

# 6.0: Check for uncommitted changes
echo "6.0: Checking for uncommitted changes..."
if ! git diff --quiet; then
    echo "Found uncommitted changes. Stashing them temporarily..."
    git stash push -m "Temporary stash during production deployment"
    STASHED_CHANGES=true
else
    STASHED_CHANGES=false
fi

# 6.1: Main Branch
echo "6.1: Updating main branch..."
git checkout main
git pull origin main

# 6.2: Merge Release Branch
echo "6.2: Merging release branch to main..."
git merge "release/${VERSION}" --no-edit
git push origin main

# 6.3: Tag Release
echo "6.3: Creating release tag..."
git tag -a "v${VERSION}" -m "Release v${VERSION}"
git push origin "v${VERSION}"

# 6.4: Cleanup old release branches
echo "6.4: Cleaning up old release branches..."
# Get all release branches, sort them by version number, and keep only n-2 and older
OLD_RELEASE_BRANCHES=$(git branch -r | grep 'origin/release/' | sed 's/origin\///' | sort -V | head -n -2)
if [ -n "$OLD_RELEASE_BRANCHES" ]; then
    echo "Found old release branches to process:"
    for branch in $OLD_RELEASE_BRANCHES; do
        echo "  - $branch"
    done
    echo
    for branch in $OLD_RELEASE_BRANCHES; do
        # Extract version from branch name
        VERSION=${branch#release/}
        TAG="v${VERSION}"
        
        # Check if tag exists
        if ! git tag -l "$TAG" | grep -q "$TAG"; then
            echo "No matching tag found for $branch"
            read -p "Create and push tag $TAG before deleting branch? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "Creating tag $TAG..."
                git tag -a "$TAG" -m "Release $TAG"
                git push origin "$TAG"
            else
                echo "Skipping $branch (no tag created)"
                continue
            fi
        fi
        
        read -p "Delete release branch $branch? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Deleting $branch..."
            git push origin --delete "$branch"
        else
            echo "Skipping $branch"
        fi
    done
else
    echo "No old release branches to process"
fi

# 6.5: Restore stashed changes if any
if [ "$STASHED_CHANGES" = true ]; then
    echo "6.5: Restoring stashed changes..."
    git stash pop
fi

echo "Git operations completed successfully!"
echo "Note: All release tags are kept permanently as they represent official releases."
echo "      Release branches are kept for the current and previous releases only." 