docker exec -it mongo mongosh mongo -u mongo -p example --authenticationDatabase admin --eval 'db.test_collection.insertOne({test: "data", date: new Date()})'
