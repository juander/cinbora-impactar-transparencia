#!/bin/bash

# Verifica o tamanho e status do volume do MongoDB
echo "Verificando volume do MongoDB..."
docker volume inspect cinbora-mongodb-data

# Verifica estatísticas de uso do disco dentro do contêiner
echo -e "\nEstatísticas de uso do disco no contêiner:"
docker exec cinbora-mongodb df -h /data/db

# Obtém estatísticas do MongoDB
echo -e "\nEstatísticas do MongoDB:"
docker exec cinbora-mongodb mongosh --quiet --eval 'db.stats()' admin -u mongo -p example

echo -e "\nVerificando databases existentes:"
docker exec cinbora-mongodb mongosh --quiet --eval 'show dbs' admin -u mongo -p example

# Verificar tamanho das coleções no banco de dados mongo
echo -e "\nTamanho das coleções no banco de dados mongo:"
docker exec cinbora-mongodb mongosh --quiet --eval 'use mongo; db.getCollectionNames().forEach(function(c) { print(c + ": " + db[c].stats().size + " bytes"); })' admin -u mongo -p example --authenticationDatabase admin
