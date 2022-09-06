import fetch from 'node-fetch';
import { config } from './config.js';

const auth = async () => {
    const res = await fetch(`${config.CTP_AUTH_URL}/oauth/token`, {
        'method': 'post',
        'headers': {
            'Authorization': 'Basic ' + Buffer.from(config.CTP_CLIENT_ID + ':' + config.CTP_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'scope': config.CTP_SCOPES
        })
    });
    if (res.error) {
        throw res.error;
    }
    return await res.json();
}

export { auth };
