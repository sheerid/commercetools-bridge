import fetch from 'node-fetch';
import { config } from './config.js';

const createWebhook = async (programID) => {
    const res = await fetch(
    `${config.SHEERID_API_URL}/rest/v2/program/${programID}/webhook`, {
    'method': 'post',
    'headers': {
        'Authorization': `Basic ${config.SHEERID_TOKEN}`,
        'Content-Type': 'application/json'
    },
    data: {
        'scope': config.URL + '/success-webhook'
    }
    });
    return await res.json();
}

export { createWebhook };


