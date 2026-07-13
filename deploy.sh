#!/bin/bash

# Auto-generate a version tag
VERSION=$(date +%Y%m%d-%H%M)

echo "Building and pushing version"

# Use -f to point to the file, and change '.' to 'backend'
# to set the 'context' (where your source code lives)
docker buildx build \
  --platform linux/amd64 \
  --target production \
  -f backend/Dockerfile \
  -t 98054/pos-backend:latest \
  -t 98054/pos-backend:$VERSION \
  --push .

echo "Successfully pushed to Docker Hub."
