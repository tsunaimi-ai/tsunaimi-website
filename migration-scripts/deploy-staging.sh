#!/bin/bash


# Store the starting directory
INITIAL_DIR="$(pwd)"

# NAS Configuration
NAS_USER="tsnm_user"
NAS_IP="192.168.1.32"
NAS_RELEASES_PATH="web/tsunaimi/releases"
NAS_STAGING_PATH="web/tsunaimi/staging"
SSH_KEY="$HOME/.ssh/tsunaimi_deploy_key"

# Get current version from package.json
CURRENT_VERSION=$(grep '"version":' package.json | cut -d\" -f4)
echo "Current version in package.json: $CURRENT_VERSION"

# Suggest next version
IFS='.' read -r -a version_parts <<< "$CURRENT_VERSION"
SUGGESTED_VERSION="${version_parts[0]}.${version_parts[1]}.$((version_parts[2] + 1))"

# Ask for version confirmation
read -p "Enter new version [$SUGGESTED_VERSION]: " NEW_VERSION
NEW_VERSION=${NEW_VERSION:-$SUGGESTED_VERSION}

# Validate version format
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Invalid version format. Please use format X.Y.Z (e.g., 0.4.4)"
    exit 1
fi

RELEASE_NAME="tsunaimi-website-v$NEW_VERSION"

echo "Current branch: $(git branch --show-current)"
echo "New release version: $NEW_VERSION"
echo "Working directory: $INITIAL_DIR"

# Confirm with user
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check for existing directories
echo "Checking for existing deployment directories..."
if ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "[ -d '$NAS_STAGING_PATH/$RELEASE_NAME' ] || [ -d '$NAS_RELEASES_PATH/$RELEASE_NAME' ]"; then
    echo "Found existing deployment directories:"
    echo "  - $NAS_STAGING_PATH/$RELEASE_NAME"
    echo "  - $NAS_RELEASES_PATH/$RELEASE_NAME"
    read -p "Do you want to remove these directories? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing directories..."
        ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "rm -rf '$NAS_STAGING_PATH/$RELEASE_NAME' '$NAS_RELEASES_PATH/$RELEASE_NAME'"
    else
        echo "Aborting deployment. Please clean up directories manually."
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

# Check if on develop branch
if [ "$(git branch --show-current)" != "develop" ]; then
    echo "Error: Must be on develop branch to deploy"
    exit 1
fi

# Check for existing deployment directories
if [ -d "$NAS_RELEASES_PATH/$RELEASE_NAME" ] || [ -d "$NAS_STAGING_PATH/$RELEASE_NAME" ]; then
    echo "Error: Release directories already exist"
    exit 1
fi

# Step 3: Build Phase
echo "=== Step 3: Build Phase ==="

# Build and save frontend image
echo "Building frontend image..."
docker build -t tsunaimi-website-frontend:v${NEW_VERSION} -f docker/frontend/Dockerfile.staging .
docker save tsunaimi-website-frontend:v${NEW_VERSION} > frontend-v${NEW_VERSION}.tar

# Build and save postgres image
echo "Building postgres image..."
docker build -t tsunaimi-website-postgresql:v${NEW_VERSION} -f docker/postgresql/Dockerfile .
docker save tsunaimi-website-postgresql:v${NEW_VERSION} > postgres-v${NEW_VERSION}.tar

# Step 4: Release Setup
echo "=== Step 4: Release Setup ==="

# 4.1: Test SSH connection
echo "4.1: Testing SSH connection..."
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" echo "SSH connection successful" || { echo "SSH connection failed"; exit 1; }

# 4.2: Create release directory
echo "4.2: Creating release directory..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "mkdir -p ${NAS_RELEASES_PATH}/${RELEASE_NAME} && chmod 755 ${NAS_RELEASES_PATH}/${RELEASE_NAME}"

# 4.3: Transfer files
echo "4.3: Copying files to NAS..."
sftp -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
cd ${NAS_RELEASES_PATH}/${RELEASE_NAME}
put docker-compose.staging.yml
put .env.staging
put frontend-v${NEW_VERSION}.tar
put postgres-v${NEW_VERSION}.tar
mkdir docker
mkdir docker/frontend
mkdir docker/postgresql
put docker/frontend/Dockerfile.staging docker/frontend/
put docker/postgresql/Dockerfile docker/postgresql/
mkdir frontend
mkdir frontend/scripts
put frontend/scripts/init-db-docker.sql frontend/scripts/
mkdir frontend/src
mkdir frontend/src/db
mkdir frontend/src/db/migrations
put frontend/src/db/migrations/*.sql frontend/src/db/migrations/
put frontend/package.json frontend/
put frontend/package-lock.json frontend/
bye
EOF

# Step 5: Staging Directory Setup
echo "=== Step 5: Staging Directory Setup ==="

# 5.1: Create staging directory
echo "5.1: Creating staging directory..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "mkdir -p ${NAS_STAGING_PATH}/${RELEASE_NAME} && chmod 755 ${NAS_STAGING_PATH}/${RELEASE_NAME}"

# 5.2: Copy reference files
echo "5.2: Copying reference files..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/docker-compose.staging.yml ${NAS_STAGING_PATH}/${RELEASE_NAME}/ && cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/.env.staging ${NAS_STAGING_PATH}/${RELEASE_NAME}/"


# Step 6: Container Deployment
echo "=== Step 6: Container Deployment ==="
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
  
  # 6.1: Deploy containers
  echo "6.1: Deploying containers..."
  
  # Stop and remove existing containers
  echo "Stopping and removing existing containers..."
  cd ${NAS_STAGING_PATH}/${RELEASE_NAME}
  for container in $(/volume1/@appstore/ContainerManager/usr/bin/docker-compose -f docker-compose.staging.yml ps -q); do
    /volume1/@appstore/ContainerManager/usr/bin/docker stop $container 2>/dev/null || true
    /volume1/@appstore/ContainerManager/usr/bin/docker rm $container 2>/dev/null || true
  done
  
  # Start new containers
  echo "Starting new containers..."
  /volume1/@appstore/ContainerManager/usr/bin/docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
   
  # 6.2: Deploy PostgreSQL
  echo "6.2: Deploying PostgreSQL..."
  
  # Stop and remove existing postgres container
  echo "Stopping and removing existing postgres container..."
  /volume1/@appstore/ContainerManager/usr/bin/docker stop tsunaimi-postgresql-staging 2>/dev/null || true
  /volume1/@appstore/ContainerManager/usr/bin/docker rm tsunaimi-postgresql-staging 2>/dev/null || true
  
  # Remove any dangling volumes
  /volume1/@appstore/ContainerManager/usr/bin/docker volume prune -f
  
  # Start new postgres container
  echo "Starting new postgres container..."
  cd ${NAS_STAGING_PATH}/${RELEASE_NAME}
  /volume1/@appstore/ContainerManager/usr/bin/docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d postgresql
  
  # Read environment variables from .env.staging
  POSTGRES_USER=\$(grep '^POSTGRES_USER=' ${NAS_STAGING_PATH}/${RELEASE_NAME}/.env.staging | cut -d'=' -f2)
  POSTGRES_PASSWORD=\$(grep '^POSTGRES_PASSWORD=' ${NAS_STAGING_PATH}/${RELEASE_NAME}/.env.staging | cut -d'=' -f2)
  POSTGRES_DB=\$(grep '^POSTGRES_DB=' ${NAS_STAGING_PATH}/${RELEASE_NAME}/.env.staging | cut -d'=' -f2)
  
  if [ -z "\$POSTGRES_USER" ] || [ -z "\$POSTGRES_PASSWORD" ] || [ -z "\$POSTGRES_DB" ]; then
    echo "Error: Missing required database credentials in .env.staging"
    exit 1
  fi
  
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL to be ready..."
  until /volume1/@appstore/ContainerManager/usr/bin/docker exec tsunaimi-postgresql-staging pg_isready -h localhost -p 5432 -U "\$POSTGRES_USER"; do
    sleep 1
  done
  
  # Copy initialization script to container
  echo "Copying initialization script..."
  /volume1/@appstore/ContainerManager/usr/bin/docker cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/frontend/scripts/init-db-docker.sql tsunaimi-postgresql-staging:/docker-entrypoint-initdb.d/
  
  # Run initialization script
  echo "Running database initialization script..."
  /volume1/@appstore/ContainerManager/usr/bin/docker exec -i tsunaimi-postgresql-staging psql -v POSTGRES_USER="'\$POSTGRES_USER'" -v POSTGRES_PASSWORD="'\$POSTGRES_PASSWORD'" -v POSTGRES_DB="'\$POSTGRES_DB'" -U "\$POSTGRES_USER" -f /docker-entrypoint-initdb.d/init-db-docker.sql
  
  # Verify table was created
  echo "Verifying table creation..."
  if ! /volume1/@appstore/ContainerManager/usr/bin/docker exec -i tsunaimi-postgresql-staging psql -U "\$POSTGRES_USER" -d "\$POSTGRES_DB" -c "\dt contact_submissions" | grep -q "contact_submissions"; then
    echo "Error: Failed to create contact_submissions table"
    exit 1
  fi
EOF

# Step 7: Verification
echo "=== Step 7: Verification ==="
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" << EOF
  echo "Checking container status..."
  if ! /volume1/@appstore/ContainerManager/usr/bin/docker ps | grep -q "tsunaimi-frontend-staging"; then
    echo "Error: Frontend container is not running"
    exit 1
  fi
  if ! /volume1/@appstore/ContainerManager/usr/bin/docker ps | grep -q "tsunaimi-postgresql-staging"; then
    echo "Error: PostgreSQL container is not running"
    exit 1
  fi
  echo "All containers are running"
EOF

# Step 8: Git Operations
echo "=== Step 8: Git Operations ==="

# 8.1: Develop Branch
echo "8.1: Updating develop branch..."
git add .
git commit -m "chore: prepare release v${NEW_VERSION}"
git push origin develop

# 8.2: Release Branch
echo "8.2: Updating release branch..."
git checkout -b "release/v${NEW_VERSION}" 2>/dev/null || git checkout "release/v${NEW_VERSION}"
git merge develop
git push origin "release/v${NEW_VERSION}"
git checkout develop

# Step 9: Cleanup
echo "=== Step 9: Cleanup ==="
# Cleanup is handled by the trap 