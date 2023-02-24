import fetch from 'node-fetch';
import { config } from './config.js';
import crypto from 'crypto';

const createWebhook = async (programId) => {
    const res = await fetch(
        `${config.SHEERID_API_URL}/program/${programId}/webhook`, {
        'method': 'POST',
        'headers': {
            'Authorization': `Bearer ${config.SHEERID_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SheerID commercetools app '+config.VERSION,
        },
        body: JSON.stringify({
            'callbackUri': `${config.URL}/api/success-webhook`,
        })
    });
    return res.json();
}

const getVerificationPromise = async (verificationId, details) => {
    const url = `${config.SHEERID_API_URL}verification/${verificationId}`;
    const res = await fetch(
        url+(details?"/details":""), {
        'method': 'GET',
        'headers': {
            'Authorization': `Bearer ${config.SHEERID_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SheerID commercetools app '+config.VERSION,
        },
    });
    return res.json();
}

const verifySignature = (headers, body, secret) => {
    const signature = headers['x-sheerid-signature'];
    const hmac = crypto.createHmac('sha256', secret);

    return hmac.update(body).digest('hex') === signature;
}

const getVerification = async (verificationId, details) => {
    return await getVerificationPromise(verificationId, details);
}

export { createWebhook, getVerification, verifySignature };


