#!/bin/bash

VERSION=$(date +%Y%m%d-%H%M)

echo "Building and pushing version"

docker buildx build \
  --platform linux/amd64 \
  --target production \
  -f backend/Dockerfile \
  -t 98054/pos-backend:latest \
  -t 98054/pos-backend:$VERSION \
  --push .

echo "Successfully pushed to Docker Hub."
