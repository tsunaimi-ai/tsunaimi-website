#!/bin/bash

# Store the starting directory
INITIAL_DIR="$(pwd)"

# Source NAS configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$PROJECT_ROOT/nas-config.sh"

# Ask for version
read -p "Enter new version (format X.Y.Z, e.g., 0.4.4): " VERSION

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Invalid version format. Please use format X.Y.Z (e.g., 0.4.4)"
    exit 1
fi

# Convert version with dots to version with hyphens for project name
VERSION_NO_DOTS=$(echo "$VERSION" | tr '.' '-')


# Ask about network recreation
read -p "Do you want to recreate the Docker network? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    RECREATE_NETWORK=true
    echo "Network will be recreated during deployment"
else
    RECREATE_NETWORK=false
    echo "Existing network will be preserved"
fi

echo "Current branch: $(git branch --show-current)"
echo "New release version: $VERSION"
echo "Working directory: $INITIAL_DIR"

# Confirm with user
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi


# Step 0: Check for existing deployment directories
echo "=== Step 0: Check for existing deployment directories ==="

# Check if directories exist
STAGING_EXISTS=$(ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" \
  "if [ -d \"${NAS_STAGING_PATH}/v${VERSION}\" ]; then echo 'exists'; else echo 'not_exists'; fi")
RELEASES_EXISTS=$(ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" \
  "if [ -d \"${NAS_RELEASES_PATH}/v${VERSION}\" ]; then echo 'exists'; else echo 'not_exists'; fi")

# Handle existing directories if any
if [ "$STAGING_EXISTS" = "exists" ] || [ "$RELEASES_EXISTS" = "exists" ]; then
    echo "Found existing deployment directories:"
    
    if [ "$STAGING_EXISTS" = "exists" ]; then
        echo "- ${NAS_STAGING_PATH}/v${VERSION}"
    fi
    
    if [ "$RELEASES_EXISTS" = "exists" ]; then
        echo "- ${NAS_RELEASES_PATH}/v${VERSION}"
    fi
    
    read -p "Do you want to remove these directories? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing directories..."
        
        if [ "$STAGING_EXISTS" = "exists" ]; then
            ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" \
              "rm -rf \"${NAS_STAGING_PATH}/v${VERSION}\""
        fi

        if [ "$RELEASES_EXISTS" = "exists" ]; then
            ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" \
              "rm -rf \"${NAS_RELEASES_PATH}/v${VERSION}\""
        fi
    else
        echo "Aborting deployment. Please clean up directories manually."
        exit 1
    fi
else
    echo "No existing deployment directories found."
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

# Ensure we're on develop branch
echo "Switching to develop branch..."
git checkout develop

# Check for existing deployment directories
if [ -d "$NAS_RELEASES_PATH/v${VERSION}" ] ||\
   [ -d "$NAS_STAGING_PATH/v${VERSION}" ]; then
    echo "Error: Release directories already exist"
    exit 1
fi

# Step 3: Build Phase
echo "=== Step 3: Build Phase ==="

# Build and save frontend image
echo "Building frontend image..."
docker build -t "tsunaimi-website-frontend-v${VERSION}:latest" -f docker/frontend/Dockerfile.staging .
docker save "tsunaimi-website-frontend-v${VERSION}:latest" > frontend-v${VERSION}.tar

# Build and save postgres image
echo "Building postgres image..."
docker build -t "tsunaimi-website-postgresql-v${VERSION}:latest" -f docker/postgresql/Dockerfile .
docker save "tsunaimi-website-postgresql-v${VERSION}:latest" > postgres-v${VERSION}.tar

# === Step 4: Deploy to NAS ===
echo "=== Step 4: Deploy to NAS ==="

# 4.1: Testing SSH connection
echo "4.1: Testing SSH connection..."
SSH_USER=$(ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "whoami")
if [ $? -eq 0 ]; then
  echo "SSH connection successful as user: $SSH_USER"
else
  echo "SSH connection failed"
  exit 1
fi

# 4.2: Verifying parent directories exist
echo "4.2: Verifying parent directories exist..."
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "
  mkdir -p \"${NAS_RELEASES_PATH%/*}\"
  echo \"Parent directories exist or were created\"
"

# 4.3: Creating release directory
echo "4.3: Creating release directory..."
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "
  mkdir -p \"${NAS_RELEASES_PATH}/v${VERSION}\"
  echo \"Release directory created successfully:\"
"

# 4.4: Copying files to NAS...
echo "4.4: Copying files to NAS..."
sftp -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
# Navigate to the release directory
cd tsunaimi/releases/website/v${VERSION}

# Upload base files
put docker-compose.staging.yml
put .env.staging
put frontend-v${VERSION}.tar
put postgres-v${VERSION}.tar

# Create docker directories and upload files
mkdir docker
cd docker
mkdir frontend
cd frontend
put docker/frontend/Dockerfile.staging Dockerfile.staging
cd ..
mkdir postgresql
cd postgresql
put docker/postgresql/Dockerfile Dockerfile
cd ../..

# Create frontend directories and upload files
mkdir frontend
cd frontend
put frontend/package.json package.json
put frontend/package-lock.json package-lock.json
mkdir scripts
cd scripts
put frontend/scripts/init-db-docker.sql init-db-docker.sql
cd ..
mkdir src
cd src
mkdir db
cd db
mkdir migrations
cd migrations

# Upload SQL migration files individually
put frontend/src/db/migrations/*.sql .

# Return to base directory
cd /tsunaimi/releases/website/v${VERSION}
quit
EOF

if [ $? -eq 0 ]; then
  echo "4.4: Files transferred successfully"
else
  echo "SFTP transfer failed"
  exit 1
fi

echo "Step 4 completed successfully"

# Step 5: Staging Directory Setup
echo "=== Step 5: Staging Directory Setup ==="

# 5.1: Create staging directory
echo "5.1: Creating staging directory..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "mkdir -p ${NAS_STAGING_PATH}/v${VERSION} &&\
  chmod 755 ${NAS_STAGING_PATH}/v${VERSION}"\
   || { echo "Error: Failed to create staging directory"; exit 1; }

# 5.2: Copy reference files
echo "5.2: Copying reference files..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "cp ${NAS_RELEASES_PATH}/v${VERSION}/docker-compose.staging.yml\
  ${NAS_STAGING_PATH}/v${VERSION}/ &&\
  cp ${NAS_RELEASES_PATH}/v${VERSION}/.env.staging\
  ${NAS_STAGING_PATH}/v${VERSION}/"\
   || { echo "Error: Failed to copy reference files"; exit 1; }


# Step 6: Container Deployment
echo "=== Step 6: Container Deployment ==="

echo "DEBUG: VERSION_NO_DOTS='${VERSION_NO_DOTS}'"
PROJECT_NAME="tsunaimi-website-staging-v${VERSION_NO_DOTS}"
echo "DEBUG: PROJECT_NAME='${PROJECT_NAME}'"

# 6.1: Stop existing containers
echo "6.1: Stopping existing containers..."

if [ "$RECREATE_NETWORK" = true ]; then
    echo "Recreating network..."
    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
    "cd ${NAS_STAGING_PATH}/v${VERSION} && \
      export VERSION='${VERSION}' && \
      ${DOCKER_COMPOSE_CMD} \
      -p tsunaimi-website-staging-${VERSION_NO_DOTS} \
      -f docker-compose.staging.yml --env-file .env.staging down" \
      || { echo "Error: Failed to stop containers and remove network"; exit 1; }
else
    echo "Preserving existing network..."

    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
    "cd ${NAS_STAGING_PATH}/v${VERSION} && \
      export VERSION='${VERSION}' && \
      ${DOCKER_COMPOSE_CMD} \
      -p tsunaimi-website-staging-${VERSION_NO_DOTS} \
      -f docker-compose.staging.yml --env-file .env.staging stop" \
      || { echo "Error: Failed to stop containers"; exit 1; }

    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
    "cd ${NAS_STAGING_PATH}/v${VERSION} && \
      export VERSION='${VERSION}' && \
      ${DOCKER_COMPOSE_CMD} \
      -p tsunaimi-website-staging-${VERSION_NO_DOTS} \
      -f docker-compose.staging.yml --env-file .env.staging rm -f" \
      || { echo "Error: Failed to remove containers"; exit 1; }
fi

# 6.2: Loading new images...
echo "6.2: Loading new images..."

ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"cd ${NAS_RELEASES_PATH}/v${VERSION} && \
  ${DOCKER_CMD} rmi tsunaimi-website-frontend-v${VERSION}:latest 2>/dev/null || true && \
  ${DOCKER_CMD} rmi tsunaimi-website-postgresql-v${VERSION}:latest 2>/dev/null || true && \
  ${DOCKER_CMD} load -i frontend-v${VERSION}.tar && \
  ${DOCKER_CMD} load -i postgres-v${VERSION}.tar" \
  || { echo "Error: Failed to load images"; exit 1; }

# 6.3: Start containers
echo "6.3: Starting containers..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "cd ${NAS_STAGING_PATH}/v${VERSION} && \
  export VERSION='${VERSION}' && \
  ${DOCKER_COMPOSE_CMD} \
  -p tsunaimi-website-staging-${VERSION_NO_DOTS} \
  -f docker-compose.staging.yml --env-file .env.staging up -d" \
  || { echo "Error: Failed to start containers"; exit 1; }

# 6.4: Initializing PostgreSQL...
echo "6.4: Initializing PostgreSQL..."

# Verify .env.staging exists
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "[ -f '${NAS_STAGING_PATH}/v${VERSION}/.env.staging' ]"\
  || { echo "Error: .env.staging file not found"; exit 1; }

# Read environment variables from .env.staging
POSTGRES_USER=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"grep '^POSTGRES_USER=' ${NAS_STAGING_PATH}/v${VERSION}/.env.staging | cut -d'=' -f2")
POSTGRES_PASSWORD=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"grep '^POSTGRES_PASSWORD=' ${NAS_STAGING_PATH}/v${VERSION}/.env.staging | cut -d'=' -f2")
POSTGRES_DB=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
"grep '^POSTGRES_DB=' ${NAS_STAGING_PATH}/v${VERSION}/.env.staging | cut -d'=' -f2")

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "Error: Missing required database credentials in .env.staging"
    echo "POSTGRES_USER: $POSTGRES_USER"
    echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
    echo "POSTGRES_DB: $POSTGRES_DB"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "until ${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} pg_isready\
  -h localhost\
  -p 5432\
  -U \"$POSTGRES_USER\"; do sleep 1; done" \
  || { echo "Error: PostgreSQL not ready"; exit 1; }
 
## 6.5: Handle database setup - create user and database if they don't exist
#echo "6.5: Setting up database (if needed)..."
# Check if user exists, create if it doesn't
#ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#  "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#   psql -U postgres -t -c \"SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'\"" | grep -q 1 || \
#  ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#  "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#   psql -U postgres -c \"CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';\""

# Check if database exists, create if it doesn't
#ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#  "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#   psql -U postgres -t -c \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\"" | grep -q 1 || \
#  ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#  "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#   psql -U postgres -c \"CREATE DATABASE ${POSTGRES_DB} WITH OWNER ${POSTGRES_USER};\""

# 6.6: Apply database migrations with versioning
#echo "6.6: Managing database schema..."

# First, create a migrations table if it doesn't exist
#ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#  "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#   psql -U postgres -d ${POSTGRES_DB} -c \"CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);\""

# Check for migrations directory
#migration_dir="db/migrations"
#if [ -d "$migration_dir" ] && [ "$(ls -A $migration_dir 2>/dev/null)" ]; then
#  for migration_file in "$migration_dir"/*.sql; do
#    migration_name=$(basename "$migration_file")
#    migration_version="${migration_name%%_*}"  # Extract version number (e.g., "001" from "001_create_table.sql")
    
#    # Check if this migration version has been applied
#    is_applied=$(ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#      "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#       psql -U postgres -d ${POSTGRES_DB} -t -c \"SELECT 1 FROM schema_migrations WHERE version='${migration_version}'\"")
    
#    if [ -z "$is_applied" ] || ! echo "$is_applied" | grep -q 1; then
#      echo "Applying migration: $migration_name (version $migration_version)"
      
#      # Copy the migration file to the NAS
#      scp -i "$SSH_KEY" "$migration_file" "$NAS_USER@$NAS_IP:/tmp/$migration_name" || { 
#        echo "Error: Failed to copy migration file"; 
#        exit 1; 
#      }
      
#      # Apply the migration
#      ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#        "${DOCKER_CMD} exec -i tsunaimi-website-postgresql-staging-v${VERSION} \
#         psql -U postgres -d ${POSTGRES_DB} -f /tmp/$migration_name" && \

#      # Record the migration version
#      ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" \
#        "${DOCKER_CMD} exec tsunaimi-website-postgresql-staging-v${VERSION} \
#         psql -U postgres -d ${POSTGRES_DB} -c \"INSERT INTO schema_migrations (version) VALUES ('${migration_version}');\"" || {
#        echo "Error: Failed to apply migration $migration_name";
#        exit 1;
#      }
#    else
#      echo "Migration already applied: $migration_name (version $migration_version)"
#    fi
#  done
#else
#  echo "No migrations to apply"
#fi

# 6.7: Verify tables were created
#echo "6.7: Verifying table creation..."
#ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
# "${DOCKER_CMD} \
#  exec -i tsunaimi-website-postgresql-staging-v${VERSION} psql \
#  -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\" \
#  -c '\dt' | grep -q 'contact_submissions'" \
#  || { echo "Error: Failed to create contact_submissions table"; exit 1; }

# Step 7: Verification
echo "=== Step 7: Verification ==="

# 7.1: Check container status
echo "7.1: Checking container status..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" << EOF
  if ! ${DOCKER_CMD} ps | grep \
  -q "tsunaimi-website-frontend-staging-v${VERSION}"; then
    echo "Error: Frontend container is not running"
    exit 1
  fi
  if ! ${DOCKER_CMD} ps | grep \
  -q "tsunaimi-website-postgresql-staging-v${VERSION}"; then
    echo "Error: PostgreSQL container is not running"
    exit 1
  fi
  echo "All containers are running"
EOF

# 7.2: Display container IPs
echo "7.2: Container IP Addresses:"
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" << EOF
  echo "Frontend container:"
  ${DOCKER_CMD} inspect \
  -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' tsunaimi-frontend-staging-v${VERSION}
  echo "PostgreSQL container:"
  ${DOCKER_CMD} inspect \
  -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' tsunaimi-postgresql-staging-v${VERSION}
EOF

# 7.3: Check environment variables
echo "7.3: Checking environment variables..."
echo "Frontend environment:"
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP"\
 "${DOCKER_CMD} \
 exec tsunaimi-website-frontend-staging-v${VERSION} env | grep -E 'DATABASE_URL|POSTGRES'"

# 7.4: User verification
echo "7.4: Manual testing verification"
echo "Please verify that the staging site is working correctly:"
echo "  - Frontend is accessible"
echo "  - Contact form submissions are working"
echo "  - Any other critical functionality"
read -p "Has testing been successful? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Testing failed. Aborting Git operations."
    exit 1
fi

# Only proceed with Git operations if deployment was successful
echo "Deployment successful. Proceeding with Git operations..."

# Step 8: Git Operations
echo "=== Step 8: Git Operations ==="

# 8.1: Develop Branch
echo "8.1: Updating develop branch..."
git add .
git commit -m "chore: prepare release v${VERSION}"
git push origin develop

# 8.2: Release Branch
echo "8.2: Updating release branch..."
BRANCH_NAME="release/${VERSION}"  # Git branch name without 'v'
# Check if release branch exists
if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
    echo "Release branch exists, checking out..."
    git checkout "${BRANCH_NAME}"
    # Check if branch is ahead of remote
    if [ "$(git rev-list HEAD...origin/${BRANCH_NAME} --count)" -gt 0 ]; then
        echo "Local branch is ahead of remote, forcing update..."
        git push -f origin "${BRANCH_NAME}"
    fi
else
    echo "Creating new release branch..."
    git checkout -b "${BRANCH_NAME}"
fi

# Merge develop and push
echo "Merging develop into release branch..."
git merge develop --no-edit
git push -f origin "${BRANCH_NAME}"
git checkout develop

# Step 9: Cleanup
echo "=== Step 9: Cleanup ==="
# Cleanup is handled by the trap in the cleanup function

echo "Deployment completed successfully"
