#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
# Wait for MongoDB to be ready
until mongosh --host mongo --port 27017 --eval "print('MongoDB connection successful')" > /dev/null 2>&1; do
  echo "MongoDB connection attempt failed. Retrying in 5 seconds..."
  sleep 5
done

echo "MongoDB is ready. Pushing Prisma schema..."
# Run Prisma database push
npx prisma db push

echo "Starting backend application..."
# Start the application
exec node -r module-alias/register dist/server.js