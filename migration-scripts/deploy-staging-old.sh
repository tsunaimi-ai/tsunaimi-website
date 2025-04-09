#!/bin/bash

# Deployment Script for Staging
# 
# Prerequisites:
# 1. Make sure you're on the feature branch you want to deploy
# 2. All changes are committed
# 3. SSH key is set up for tsnm_user
#
# Usage:
#   ./deploy-staging.sh [new-release-version]
#   Example: ./deploy-staging.sh 0.4.2
#
# What this script does:
# 1. Merges current feature branch to develop
# 2. Creates new release branch
# 3. Creates deployment package (TAR file)
# 4. Deploys to NAS staging environment

# Store the starting directory
INITIAL_DIR="$(pwd)"

# Create temp directory in parent directory
TEMP_BASE_DIR="$(dirname "$INITIAL_DIR")/temp_deploy"

# NAS Configuration
NAS_USER="tsnm_user"
NAS_IP="192.168.1.32"
NAS_RELEASES_PATH="/volume1/web/tsunaimi/releases"
NAS_STAGING_PATH="/volume1/web/tsunaimi/staging"
SSH_KEY="$HOME/.ssh/tsunaimi_deploy_key"  # Full path to SSH key

# Function to clean up on failure
cleanup() {
    echo "Cleaning up..."
    rm -rf "$TEMP_BASE_DIR"
    # Restore staging directory from previous successful deployment if it exists
    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "if [ -d '$NAS_STAGING_PATH.bak' ]; then rm -rf '$NAS_STAGING_PATH' && mv '$NAS_STAGING_PATH.bak' '$NAS_STAGING_PATH'; fi"
    exit 1
}

# Set up trap for cleanup on script failure
trap cleanup ERR

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Error: Release version not provided"
    echo "Usage: ./deploy-staging.sh [new-release-version]"
    echo "Example: ./deploy-staging.sh 0.4.2"
    exit 1
fi

NEW_VERSION=$1
CURRENT_BRANCH=$(git branch --show-current)
RELEASE_NAME="tsunaimi-website-v$NEW_VERSION"
TEMP_DIR="$TEMP_BASE_DIR/$RELEASE_NAME"

echo "Current branch: $CURRENT_BRANCH"
echo "New release version: $NEW_VERSION"
echo "Working directory: $INITIAL_DIR"
echo "Temporary directory: $TEMP_DIR"

# Confirm with user
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Git Operations
echo "Step 1: Git Operations..."

# Merge to develop
echo "Merging to develop..."
git checkout develop
git pull origin develop
git merge "$CURRENT_BRANCH"

# Check if merge was successful
if [ $? -ne 0 ]; then
    echo "Error: Merge to develop failed"
    exit 1
fi

# Push to develop
git push origin develop

# Create and push release branch
echo "Creating release branch..."
git checkout -b "release/$NEW_VERSION" || git checkout "release/$NEW_VERSION"
git push -u origin "release/$NEW_VERSION"

# Step 2: Create deployment package
echo "Step 2: Creating deployment package..."
# Clean up any existing temporary files
rm -rf "$TEMP_BASE_DIR"
mkdir -p "$TEMP_DIR"

echo "Copying files..."
# Create a temporary directory for filtering
FILTER_DIR="$TEMP_BASE_DIR/filter"
mkdir -p "$FILTER_DIR"

# Copy files to filter directory
cp -r "$INITIAL_DIR"/* "$FILTER_DIR/"

# Remove excluded directories
rm -rf "$FILTER_DIR/.git"
rm -rf "$FILTER_DIR/node_modules"
rm -rf "$FILTER_DIR/.next"
rm -rf "$FILTER_DIR/temp_deploy"
rm -rf "$FILTER_DIR/scripts_temp"

# Move filtered files to temp directory
mv "$FILTER_DIR"/* "$TEMP_DIR/"
rmdir "$FILTER_DIR"

# Create tar file
echo "Creating tar file..."
cd "$TEMP_DIR"
tar -czf "$TEMP_BASE_DIR/${RELEASE_NAME}.tar.gz" .

# Return to initial directory
cd "$INITIAL_DIR"

# Verify tar file was created
if [ ! -f "$TEMP_BASE_DIR/${RELEASE_NAME}.tar.gz" ]; then
    echo "Error: Failed to create tar file"
    exit 1
fi

echo "TAR file created successfully at $TEMP_BASE_DIR/${RELEASE_NAME}.tar.gz"
echo "TAR file size: $(ls -lh "$TEMP_BASE_DIR/${RELEASE_NAME}.tar.gz" | awk '{print $5}')"

# Step 3: Test SSH connection
echo "Step 3: Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=5 "$NAS_USER@$NAS_IP" echo "SSH connection successful"; then
    echo "Error: Cannot connect to NAS. Please check your SSH key setup."
    exit 1
fi

# Step 4: Deploy to NAS
echo "Step 4: Deploying to NAS..."

# Step 4.1: Create release directory on NAS
echo "Creating release directory..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "mkdir -p '$NAS_RELEASES_PATH/$RELEASE_NAME' && chmod 755 '$NAS_RELEASES_PATH/$RELEASE_NAME'"

# Step 4.2: Copy TAR file to NAS
echo "Copying TAR file to NAS..."
sftp -i "$SSH_KEY" "$NAS_USER@$NAS_IP" << EOF
cd web/tsunaimi/releases/$RELEASE_NAME
put "$TEMP_BASE_DIR/${RELEASE_NAME}.tar.gz"
bye
EOF

# Step 4.3: Extract TAR file
echo "Extracting TAR file..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "cd '$NAS_RELEASES_PATH/$RELEASE_NAME' && tar xzf '${RELEASE_NAME}.tar.gz'"

# Step 4.4: Copy to staging
echo "Copying to staging..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "cp -r '$NAS_RELEASES_PATH/$RELEASE_NAME' '$NAS_STAGING_PATH'"

# Verify staging directory exists with correct name
if ! ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "test -d '$NAS_STAGING_PATH/$RELEASE_NAME'"; then
    echo "Error: Failed to copy release directory to staging"
    echo "Expected directory not found: $NAS_STAGING_PATH/$RELEASE_NAME"
    cleanup
fi

# Step 4.5: Clean up TAR file
echo "Cleaning up..."
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "rm -f '$NAS_RELEASES_PATH/$RELEASE_NAME/${RELEASE_NAME}.tar.gz'"

# Step 4.6: Install dependencies and build
echo "Installing dependencies and building..."
if ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "test -f '$NAS_STAGING_PATH/$RELEASE_NAME/package.json'"; then
    # Set NODE_PATH for the session
    NODE_CMD="PATH=/volume1/@appstore/Node.js_v18/usr/local/bin:/usr/local/bin:/usr/bin:/bin"
    
    echo "Installing npm packages..."
    if ! ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "cd '$NAS_STAGING_PATH/$RELEASE_NAME' && $NODE_CMD npm install"; then
        echo "Error: npm install failed"
        cleanup
    fi
    
    echo "Running build..."
    if ! ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "cd '$NAS_STAGING_PATH/$RELEASE_NAME' && $NODE_CMD npm run build"; then
        echo "Error: npm run build failed"
        cleanup
    fi
else
    echo "Error: package.json not found in staging directory"
    echo "Current staging directory contents:"
    ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "ls -la '$NAS_STAGING_PATH/$RELEASE_NAME'"
    cleanup
fi

# Remove backup if everything succeeded
ssh -i "$SSH_KEY" "$NAS_USER@$NAS_IP" "rm -rf '$NAS_STAGING_PATH.bak'"

# Clean up local temporary files
rm -rf "$TEMP_BASE_DIR"

echo "Deployment completed successfully!"
echo "To start the staging server:"
echo "1. SSH into NAS: ssh -i $SSH_KEY $NAS_USER@$NAS_IP"
echo "2. cd $NAS_STAGING_PATH/$RELEASE_NAME"
echo "3. PORT=3001 npm run start" 