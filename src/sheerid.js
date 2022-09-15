import fetch from 'node-fetch';
import { config } from './config.js';

const createWebhook = async (programId) => {
    const res = await fetch(
        `${config.SHEERID_API_URL}/program/${programId}/webhook`, {
        'method': 'POST',
        'headers': {
            'Authorization': `Bearer ${config.SHEERID_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'callbackUri': `${config.URL}/api/success-webhook`,
        })
    });
    return res.json();
}

const getVerification = async (verificationId) => {
    const res = await fetch(
        `${config.SHEERID_API_URL}/verification/${verificationId}/details`, {
        'method': 'GET',
        'headers': {
            'Authorization': `Bearer ${config.SHEERID_TOKEN}`,
            'Content-Type': 'application/json'
        },
    });
    return res.json();
}

export { createWebhook, getVerification };


