import { config } from '../src/config.js';
import { createClient } from 'redis';

const redis = createClient({
    socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT
    },
    password: config.REDIS_PASSWORD
});
redis.on('error', (err) => console.log('Redis Client Error', err));

console.log('connecting to Redis...');
await redis.connect();

export { redis };