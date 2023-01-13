import dotenv from 'dotenv';
let config = dotenv.config().parsed;

if (config == undefined) {
    config = {
        CTP_PROJECT_KEY: process.env.CTP_PROJECT_KEY,
        CTP_CLIENT_SECRET: process.env.CTP_CLIENT_SECRET,
        CTP_CLIENT_ID: process.env.CTP_CLIENT_ID,
        CTP_AUTH_URL: process.env.CTP_AUTH_URL,
        CTP_API_URL: process.env.CTP_API_URL,
        CTP_SCOPES: process.env.CTP_SCOPES,
        SHEERID_TOKEN: process.env.SHEERID_TOKEN,
        SHEERID_API_URL: process.env.SHEERID_API_URL,
        URL: process.env.URL,
        PORT: process.env.PORT,
        CART_DISCOUNT_ID: process.env.CART_DISCOUNT_ID,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        VERSION: process.env.VERSION,
    };
    console.log('using environment variables');
} else {
    console.log('using .env file');
}

export { config };