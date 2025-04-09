#!/bin/bash

# Deployment Script for Staging (Containerized)
# 
# Deployment Steps:
# 1. Initial Setup
#    - Store current directory
#    - Create temp directory
#    - Set NAS configuration variables
#    - Set up cleanup trap
#
# 2. Pre-deployment Checks
#    - Check if on develop branch
#    - Get current version from package.json
#    - Suggest next version
#    - Ask for version confirmation
#    - Validate version format
#    - Check for existing deployment directories
#
# 3. Build Phase
#    - Build Docker images using docker-compose.staging.yml
#    - Build frontend image specifically
#    - Build PostgreSQL image specifically
#    - Save both images as tar files
#
# 4. Release Setup
#    4.1. SSH Connection
#        - Test SSH connection to NAS
#    4.2. Release Directory Setup
#        - Create release directory: /volume1/web/tsunaimi/releases/tsunaimi-website-vX.Y.Z
#        - Set proper permissions
#    4.3. File Transfer
#        - Copy docker-compose.staging.yml
#        - Copy .env.staging
#        - Copy Docker image tar files
#        - Copy Dockerfiles
#        - Copy frontend files and migrations
#
# 5. Staging Directory Setup
#    5.1. Directory Setup
#        - Create staging directory: /volume1/web/tsunaimi/staging/tsunaimi-website-vX.Y.Z
#    5.2. File Setup
#        - Copy compose and env files for reference
#    5.3. Docker Images
#        - Load frontend image from tar
#        - Load postgres image from tar
#    5.4. Container Management
#        - Stop existing containers
#        - Start new containers
#
# 6. Container Deployment
#    6.1. Load Docker images
#        - Load frontend image from tar
#        - Load postgres image from tar
#    6.2. Stop and remove existing containers
#    6.3. Start new containers
#
# 7. Verification
#    - Check if containers are running
#
# 8. Git Operations
#    8.1. Develop Branch
#        - Commit changes
#        - Push to develop
#    8.2. Release Branch
#        - Create/update release branch
#        - Merge from develop
#        - Push release branch
#        - Return to develop
#
# 9. Cleanup
#    - Remove local temporary files
#
# Prerequisites:
# 1. Make sure you're on the develop branch
# 2. All changes are committed
# 3. SSH key is set up for tsnm_user
# 4. Docker and Docker Compose are installed on the NAS
#
# Usage:
#   ./deploy-staging.sh
#   The script will guide you through version selection

# Store the starting directory
INITIAL_DIR="$(pwd)"

# Create temp directory in parent directory
TEMP_BASE_DIR="$(dirname "$INITIAL_DIR")/temp_deploy"

# NAS Configuration
NAS_USER="tsnm_user"
NAS_IP="192.168.1.32"
NAS_RELEASES_PATH="/volume1/web/tsunaimi/releases"
NAS_STAGING_PATH="/volume1/web/tsunaimi/staging"
SSH_KEY="$HOME/.ssh/tsunaimi_deploy_key"

# Function to clean up on failure
cleanup() {
    echo "Cleaning up..."
    rm -rf "$TEMP_BASE_DIR"
    rm -f frontend-v${NEW_VERSION}.tar postgres-v${NEW_VERSION}.tar
    # Remove project from Container Manager
    PROJECT_NAME="tsunaimi-staging-v$(echo ${NEW_VERSION} | tr -d '.-')"
    ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "if [ -d '/volume1/docker/projects/${PROJECT_NAME}' ]; then rm -rf '/volume1/docker/projects/${PROJECT_NAME}'; fi"
    # Restore staging directory from previous successful deployment if it exists
    ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "if [ -d '$NAS_STAGING_PATH.bak' ]; then rm -rf '$NAS_STAGING_PATH' && mv '$NAS_STAGING_PATH.bak' '$NAS_STAGING_PATH'; fi"
    exit 1
}

# Set up trap for cleanup on script failure
trap cleanup ERR

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "Error: You must be on the develop branch to deploy"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please checkout develop branch and try again"
    exit 1
fi

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

echo "Current branch: $CURRENT_BRANCH"
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

# Step 1: Build Docker images
echo "Step 1: Building Docker images..."
docker-compose -f docker-compose.staging.yml build

# Step 2: Building and saving Docker images
echo "Step 2: Building and saving Docker images..."
echo "Building frontend image..."
docker build -t tsunaimi-website-frontend:v${NEW_VERSION} -f docker/frontend/Dockerfile.staging .
echo "Building PostgreSQL image..."
docker build -t tsunaimi-website-postgresql:v${NEW_VERSION} -f docker/postgresql/Dockerfile .

echo "Saving Docker images..."
docker save tsunaimi-website-frontend:v${NEW_VERSION} > frontend-v${NEW_VERSION}.tar
docker save tsunaimi-website-postgresql:v${NEW_VERSION} > postgres-v${NEW_VERSION}.tar

# Step 4: Release Setup
echo "=== Step 4: Release Setup ==="

# 4.1: SSH Connection
echo "4.1: Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=5 "$NAS_USER@$NAS_IP" echo "SSH connection successful"; then
    echo "Error: Cannot connect to NAS. Please check your SSH key setup."
    exit 1
fi

# 4.2: Release Directory Setup
echo "4.2: Creating release directory..."
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "mkdir -p '$NAS_RELEASES_PATH/$RELEASE_NAME' && chmod 755 '$NAS_RELEASES_PATH/$RELEASE_NAME'"

# 4.3: File Transfer
echo "4.3: Copying files to NAS..."
sftp -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
cd web/tsunaimi/releases/$RELEASE_NAME
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
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
  # 5.1: Create staging directory
  echo "5.1: Creating staging directory..."
  mkdir -p ${NAS_STAGING_PATH}/${RELEASE_NAME}
  
  # Verify directory was created
  if [ ! -d "${NAS_STAGING_PATH}/${RELEASE_NAME}" ]; then
    echo "Error: Failed to create staging directory"
    exit 1
  fi
  
  # 5.2: Copy configuration files from releases
  echo "5.2: Copying configuration files from releases..."
  cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/docker-compose.staging.yml ${NAS_STAGING_PATH}/${RELEASE_NAME}/docker-compose.staging.yml
  cp ${NAS_RELEASES_PATH}/${RELEASE_NAME}/.env.staging ${NAS_STAGING_PATH}/${RELEASE_NAME}/.env.staging
  
  # Verify files were copied
  if [ ! -f "${NAS_STAGING_PATH}/${RELEASE_NAME}/docker-compose.staging.yml" ] || [ ! -f "${NAS_STAGING_PATH}/${RELEASE_NAME}/.env.staging" ]; then
    echo "Error: Failed to copy configuration files from releases"
    exit 1
  fi
EOF

# Step 6: Container Deployment
echo "=== Step 6: Container Deployment ==="
ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" << EOF
  # Export version for docker-compose
  export NEW_VERSION=${NEW_VERSION}
  
  # 6.1: Load Docker images
  echo "6.1: Loading Docker images..."
  echo "Loading frontend image..."
  /volume1/@appstore/ContainerManager/usr/bin/docker load < ${NAS_RELEASES_PATH}/${RELEASE_NAME}/frontend-v${NEW_VERSION}.tar || { echo "Failed to load frontend image"; exit 1; }
  echo "Loading postgres image..."
  /volume1/@appstore/ContainerManager/usr/bin/docker load < ${NAS_RELEASES_PATH}/${RELEASE_NAME}/postgres-v${NEW_VERSION}.tar || { echo "Failed to load postgres image"; exit 1; }
  
  # 6.2: Stop and remove existing containers
  echo "6.2: Stopping and removing existing containers..."
  
  # First try to stop using docker-compose if the file exists
  if [ -f "${NAS_STAGING_PATH}/${RELEASE_NAME}/docker-compose.staging.yml" ]; then
    cd ${NAS_STAGING_PATH}/${RELEASE_NAME}
    /volume1/@appstore/ContainerManager/usr/bin/docker-compose -f docker-compose.staging.yml down --remove-orphans
  fi
  
  # Then ensure all containers are stopped and removed
  /volume1/@appstore/ContainerManager/usr/bin/docker stop \$(/volume1/@appstore/ContainerManager/usr/bin/docker ps -a -q --filter "name=tsunaimi") 2>/dev/null || true
  /volume1/@appstore/ContainerManager/usr/bin/docker rm \$(/volume1/@appstore/ContainerManager/usr/bin/docker ps -a -q --filter "name=tsunaimi") 2>/dev/null || true
  
  # Remove any dangling volumes
  /volume1/@appstore/ContainerManager/usr/bin/docker volume prune -f
  
  # 6.3: Start new containers
  echo "6.3: Starting new containers..."
  cd ${NAS_STAGING_PATH}/${RELEASE_NAME}
  /volume1/@appstore/ContainerManager/usr/bin/docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
  
  # 6.4: Initialize database
  echo "6.4: Initializing database..."
  
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
  
  # Run initialization script
  echo "Running database initialization script..."
  /volume1/@appstore/ContainerManager/usr/bin/docker exec -i tsunaimi-postgresql-staging psql -U "\$POSTGRES_USER" -d "\$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init-db-docker.sql
EOF

# Step 7: Verification
echo "=== Step 7: Verification ==="
echo "Verifying deployment..."
if ! ssh -i "$SSH_KEY" -o BatchMode=yes "$NAS_USER@$NAS_IP" "cd ${NAS_STAGING_PATH}/${RELEASE_NAME} && /volume1/@appstore/ContainerManager/usr/bin/docker-compose -f docker-compose.staging.yml ps | grep -q 'Up'"; then
    echo "Error: Deployment verification failed"
    cleanup
    exit 1
fi

# Step 8: Git Operations
echo "=== Step 8: Git Operations ==="

# 8.1: Develop Branch
echo "8.1: Updating develop branch..."
if [ "$(git branch --show-current)" != "develop" ]; then
    echo "Error: Must be on develop branch for Git operations"
    exit 1
fi

# Commit and push changes to develop
git add docker/frontend/Dockerfile.staging docker-compose.staging.yml
git commit -m "chore: update staging configuration for v${NEW_VERSION}"
git push origin develop

# 8.2: Release Branch
echo "8.2: Updating release branch..."
if git show-ref --verify --quiet "refs/heads/release/${NEW_VERSION}"; then
    # Release branch exists, update it
    git checkout "release/${NEW_VERSION}"
    git merge develop --no-ff -m "chore: merge develop into release/${NEW_VERSION}"
else
    # Create new release branch
    git checkout -b "release/${NEW_VERSION}"
fi

# Push release branch
git push -u origin "release/${NEW_VERSION}"

# Return to develop branch
git checkout develop

# Step 9: Cleanup
echo "=== Step 9: Cleanup ==="
rm -f frontend-v${NEW_VERSION}.tar postgres-v${NEW_VERSION}.tar

echo "Deployment completed successfully!"
echo "To check the status of the containers:"
echo "1. SSH into NAS: ssh -i $SSH_KEY $NAS_USER@$NAS_IP"
echo "2. cd $NAS_STAGING_PATH"
echo "3. docker-compose -f docker-compose.staging.yml ps" 