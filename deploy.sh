#!/bin/bash
set -e  # Stop the script if any command fails

VERSION=$(date +%Y%m%d-%H%M)


if [ "$EUID" -ne 0 ]; then
    echo "Administrative privileges required. Requesting sudo..."
    exec sudo "$0" "$@"
fi

echo "Building and pushing version"

docker buildx build \
  --platform linux/amd64 \
  --target production \
  -f Dockerfile \
  -t 98054/pos-backend:latest \
  -t 98054/pos-backend:$VERSION \
  --push .

echo "Successfully pushed to Docker Hub."
