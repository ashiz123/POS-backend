To run docker for test. I got the separate file.  docker-compose.test.yml
To run this - docker compose -f docker-compose.test.yml up -d

## SETTING HOST 
1. Development
mongo_pos:
        container_name: mongo_pos
        image: mongo:7
        ports:
            - '27017:27017' #host_post:container_port
        volumes:
            - mongo_data:/data/db
        command: ['mongod', '--replSet', 'rs0', '--bind_ip_all']

if this is the case 

mongo_pos:27017 - docker
localhost:27017 - localhost

TO SETUP WITH COMPASS - USE localhost:27017

2. Testing

 database_setup:
        container_name: mongo_pos_test
        image: mongo:7
        ports:
            - '27019:27017' # Host sees 27019, Docker network sees 27017
        volumes:
            - pos_mongo_data:/data/db
        # CRITICAL: Added replica set command
        command: ['mongod', '--replSet', 'rs0', '--bind_ip_all']
        healthcheck:
            test: |
                test $$(mongosh --quiet --eval "try { rs.status().ok } catch (e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'database_setup:27017'}]}).ok || 0 }") -eq 1
            interval: 5s
            timeout: 5s
            retries: 5
            
            
    docker - database_setup: 27017
    localhost - localhost:27019
    
 ## TEST ENVIRONMENT
  1. Using Docker
    To test using docker (docker-compose.test.yml)
    Command  - docker compose -f docker-compose.test.yml up -d
    MONGODB_URL - mongodb://database_setup:27017/pos_testing?replicaSet=rs0&directConnection=true ---------docker test url
    env_file - .env.docker.test //This is setup in docker-compose.test.yml 
    
    
    
  2. Using local 
    To test using in the development ( docker.compose.yml)
    command - docker compose up 
    MONGODB_URL - mongodb://localhost:27017/pos_db?replicaSet=rs0&directConnection=true
    env_file - .env.test //its setup inside the tests/setup/globalSetup.ts   g
    
    note: globalFile setup dont overwrite the docker environment because once env is setup it cannot be overwrite. so the docker use its env inside that docker-compose.test.yml and local use globalFile.
