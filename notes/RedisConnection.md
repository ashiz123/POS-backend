
# REDIS CONNECTION
1. Connection setup is in ioRedisConnection.ts

- import IORedis from 'ioredis'

export const redisConnect = new IORedis({
    host: process.env.REDIS_HOST || 'redis_pos',
    port: Number(process.env.REDIS_PORT || 6379),
    maxRetriesPerRequest: null,
})

  (Redis container is setting the connection to string)
    
2. To connect from any environment (development , test)
   container.resolve(TOKENS.REDIS_CONNECT)

3. If connection successful, Connection successful message comes up


# SOME REDIS RULES
1. Redis default port in 6379
2. Though different container use same port , they are different redis application
