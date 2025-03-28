#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
# Check MongoDB connection using Node.js script
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if node check-mongo.js; then
    echo "MongoDB connection successful"
    break
  fi
  
  attempt=$((attempt+1))
  echo "MongoDB connection attempt $attempt of $max_attempts failed. Retrying in 5 seconds..."
  sleep 5
done

if [ $attempt -eq $max_attempts ]; then
  echo "Failed to connect to MongoDB after $max_attempts attempts. Exiting."
  exit 1
fi

echo "MongoDB is ready. Pushing Prisma schema..."
# Run Prisma database push
npx prisma db push

echo "Starting backend application..."
# Start the application
exec node -r module-alias/register dist/server.js