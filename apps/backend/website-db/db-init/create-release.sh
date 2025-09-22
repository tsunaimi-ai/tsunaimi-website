#!/bin/bash

# Git Branch Management Script
# 
# Prerequisites:
# 1. Run this from Git Bash
# 2. Make sure you're on the feature branch you want to release
# 3. All changes are committed
# 4. You have permissions to push to develop and create release branches
#
# Usage:
#   ./create-release.sh [new-release-version]
#   Example: ./create-release.sh 0.4.1

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Error: Release version not provided"
    echo "Usage: ./create-release.sh [new-release-version]"
    echo "Example: ./create-release.sh 0.4.1"
    exit 1
fi

NEW_VERSION=$1
CURRENT_BRANCH=$(git branch --show-current)

echo "Current branch: $CURRENT_BRANCH"
echo "New release version: $NEW_VERSION"

# Confirm with user
read -p "This will merge $CURRENT_BRANCH into develop and create release/$NEW_VERSION. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Merge to develop
echo "Merging to develop..."
git checkout develop
git pull origin develop
git merge $CURRENT_BRANCH

# Check if merge was successful
if [ $? -ne 0 ]; then
    echo "Merge failed. Please resolve conflicts and run script again"
    exit 1
fi

# Step 2: Create release branch
echo "Creating release branch..."
git checkout -b release/$NEW_VERSION

# Step 3: Push branches
echo "Pushing changes..."
git push origin develop
git push origin release/$NEW_VERSION

echo "
Git operations completed successfully!
- Merged $CURRENT_BRANCH into develop
- Created and pushed release/$NEW_VERSION
" 