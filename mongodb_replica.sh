#!/bin/bash

mkdir -p db/db1 db/db2
mkdir -p db/config1 db/config2

cat << EOF > db/config1/mongod.conf
storage:
  dbPath: $(pwd)/db/db1
  journal:
    enabled: true
systemLog:
  destination: file
  path: $(pwd)/db/db1/mongod1.log
  logAppend: true
net:
  bindIp: 127.0.0.1
  port: 2017
replication:
  replSetName: myReplicaSet
EOF

cat << EOF > db/config2/mongod.conf
storage:
  dbPath: $(pwd)/db/db2
  journal:
    enabled: true
systemLog:
  destination: file
  path: $(pwd)/db/db2/mongod2.log
  logAppend: true
net:
  bindIp: 127.0.0.1
  port: 2018
replication:
  replSetName: myReplicaSet
EOF

mongod --config db/config1/mongod.conf --fork
mongod --config db/config2/mongod.conf --fork

mongo --port 2017 --eval "rs.initiate({_id: 'myReplicaSet', members: [{_id: 0, host: 'localhost:2017'}, {_id: 1, host: 'localhost:2018'}]})"

