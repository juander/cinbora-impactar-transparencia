#!/bin/bash
set -e

# Start MongoDB in background
mongod --port $MONGO_REPLICA_PORT --replSet rs0 --bind_ip 0.0.0.0 &
MONGOD_PID=$!

# Wait for MongoDB to start accepting connections
echo "Waiting for MongoDB to start..."
until mongosh --port $MONGO_REPLICA_PORT --eval "db.adminCommand('ping')" &>/dev/null; do
  sleep 1
done

# Check if replica set is already initialized
echo "Checking replica set status..."
RS_STATUS=$(mongosh --port $MONGO_REPLICA_PORT --eval "rs.status().ok" --quiet || echo "0")

if [ "$RS_STATUS" = "1" ]; then
  echo "Replica set already initialized"
else
  # Initialize replica set
  echo "Initializing replica set..."
  mongosh --port $MONGO_REPLICA_PORT --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '$MONGO_REPLICA_HOST:$MONGO_REPLICA_PORT' }] })"
fi

# Check if admin user exists and create only if needed
echo "Checking for admin user..."
USER_EXISTS=$(mongosh --port $MONGO_REPLICA_PORT admin --quiet --eval "db.getUser('$MONGO_INITDB_ROOT_USERNAME') ? true : false")

if [ "$USER_EXISTS" = "true" ]; then
  echo "Admin user already exists, skipping creation"
else
  echo "Creating admin user..."
  mongosh --port $MONGO_REPLICA_PORT admin --eval "db.createUser({ user: '$MONGO_INITDB_ROOT_USERNAME', pwd: '$MONGO_INITDB_ROOT_PASSWORD', roles: [ 'root' ] })"
fi

echo "REPLICA SET ONLINE"

# Keep container running
wait $MONGOD_PID