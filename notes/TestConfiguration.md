Test setup
Setup file - vitest.config.ts 
Documentation - vitest

There is 2 different setup in vitest.config.ts
1. Unit - This does not run db connection 
2. Integration - This runs db connection. It runs the setup file that connect db before its test run.

Differnet container to run test.
1. From development container (pos)
   a. npm test (Integration testing is failed because of differnet mongodb and redis url).In test.env, the mongodb, and redis are set according to pos-testing-system container.
   b. npm run test:unit (its working because it dont need mongodb)

2. From test container (pos-testing-system)
  - All the test working. As in env, the mongodb, and redis are set according to this docker container.
