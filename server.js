import { config } from './src/config.js';
import http from 'http';
import { auth } from './src/auth.js';
import url from 'url';
import { createClient } from 'redis';
import { createWebhook, getVerification } from './src/sheerid.js';

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));

console.log('connecting to Redis...');
await redis.connect();

const verificationStatus = async (verificationId) => {
    return await getVerification(verificationId);
}

const onSuccess = async (cartId, verificationData) => {
    // create new discount code
    // add directDiscount to cart
    return await redis.set(`cart-${cartId}`, JSON.stringify(verificationData));
}

import { getCartDiscounts, createCartDiscount, createDiscountCode } from './src/discount.js';

const token = await auth();

http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        console.log('get /');
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('SheerID - commercetools Demo server');
    } else if (req.url.startsWith('/api/create-webhook')) {
        const q = url.parse(req.url, true).query;
        const r = await createWebhook(q.pid);
        res.end(JSON.stringify(r));
    } else if (req.url === '/api/cart-discounts' && req.method === 'GET') {
        console.log('get /api/cart-discounts');
        res.writeHead(200, {'Content-Type': 'application/json'});
        const discounts = await getCartDiscounts(token.access_token);
        console.log('number of discounts:', discounts.total);
        const o = {};
        discounts.results.forEach(element => {
            console.log(element);
            o[element.id] = element.name.en;
        });
        res.end(JSON.stringify(o));
    } else if (req.url.startsWith('/api/verify') && req.method === 'GET') {
        const q = url.parse(req.url, true).query;
        console.log('get /api/verify', q.cid);
        let cartJson = await redis.get(`cart-${q.cid}`)
        if (cartJson === null) {
            cartJson = `{}`;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(cartJson);
    } else if (req.url.startsWith('/api/update') && req.method === 'GET') {
        const q = url.parse(req.url, true).query;
        console.log('get /api/update', q.cid);
        redis.set(`cartid-${q.cid}`, q.cart);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(`{}`);
    } else if (req.url === '/api/success-webhook' && req.method === 'POST') {
        console.log('post /api/success-webhook');
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {        
            body = Buffer.concat(body).toString();
            res.end('OK');
            if (body != undefined && body.length > 0) {
                const res = JSON.parse(body);
                verificationStatus(res.verificationId).then((r) => {
                    try {
                        if (r.personInfo?.metadata != undefined) {
                            const cartId = r.personInfo.metadata.cartid;
                            console.log(`saving ${cartId} cart id`);
                            onSuccess(cartId, r);
                            updateStatus(cartId, r);
                        } else {
                            console.log('no metadata', r);
                        }
                    } catch(err) {
                        console.log('error:', err);
                    }    
                });
            }
        });
    } else if (req.url === '/api/webhook' && req.method === 'POST') {
        console.log('post /api/cart-discounts');
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {        
            body = Buffer.concat(body).toString();
            res.end('OK');
            if (body != undefined && body.length > 0) {
                const r = JSON.parse(body);
                console.log('processing name', r.name);
                createCartDiscount(token, r);
            }
        });
    } else {
        console.log('404', req);
        res.statusCode = 404;
        res.end('404: File Not Found');
    }
}).listen(config.PORT);
console.log(`server is running on http://localhost:${config.PORT}/`);
