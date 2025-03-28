#!/bin/bash
set -e

# Start MongoDB in background
mongod --replSet rs0 --bind_ip_all &
MONGO_PID=$!

# Wait for MongoDB to become available
until mongosh --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
  echo "Waiting for MongoDB to start..."
  sleep 1
done

# Initialize replica set if not already done
mongosh --eval "rs.status()" > /dev/null 2>&1 || mongosh <<EOF
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "$MONGO_REPLICA_HOST:$MONGO_REPLICA_PORT" }
    ]
  })
EOF

# Create root user if environment variables provided
if [ -n "$MONGO_INITDB_ROOT_USERNAME" ] && [ -n "$MONGO_INITDB_ROOT_PASSWORD" ]; then
  mongosh admin --eval "
    if (db.getUser('$MONGO_INITDB_ROOT_USERNAME') == null) {
      db.createUser({
        user: '$MONGO_INITDB_ROOT_USERNAME',
        pwd: '$MONGO_INITDB_ROOT_PASSWORD',
        roles: [ { role: 'root', db: 'admin' } ]
      })
    }"
fi

# Create database if specified and not already created
if [ -n "$MONGO_INITDB_DATABASE" ]; then
  mongosh --eval "
    use $MONGO_INITDB_DATABASE
    db.createCollection('_setup_verification')"
fi

echo "MongoDB replica set setup completed"

# Kill the MongoDB process
kill $MONGO_PID
wait $MONGO_PID

# Start MongoDB in foreground mode
exec mongod --replSet rs0 --bind_ip_all