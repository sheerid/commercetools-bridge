import dotenv from 'dotenv';
let config = dotenv.config().parsed;

if (config == undefined) {
    config = {
        PORT: process.env.PORT,
        CT_PROJECT_KEY: process.env.CT_PROJECT_KEY,
        CT_CLIENT_ID: process.env.CT_CLIENT_ID,
        CT_CLIENT_SECRET: process.env.CT_CLIENT_SECRET,
        CT_SCOPE: process.env.CT_SCOPE,
        CTP_AUTH_URL: process.env.CTP_AUTH_URL,
        CTP_API_URL: process.env.CTP_API_URL,
        CTP_SCOPES: process.env.CTP_SCOPES,
        SHEERID_TOKEN: process.env.SHEERID_TOKEN,
        SHEERID_API_URL: process.env.SHEERID_API_URL,
        URL: process.env.URL,
        CART_DISCOUNT_ID: process.env.CART_DISCOUNT_ID,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
    };
}

export { config };