import { config } from './src/config.js';
import http from 'http';
import { auth } from './src/auth.js';
import url from 'url';
import { createWebhook, getVerification } from './src/sheerid.js';
import { getCartDiscounts, createCartDiscount, createDiscountCode, applyDiscount } from './src/ct-discount.js';
import { getCart, getCarts } from './src/ct-cart.js';
import { getBody } from './util/body.js';
import { redis } from './util/redis.js';
import makeId from './util/id.js';
import fs from 'fs';

const buildDate = fs.readFileSync('./build-date.txt', 'utf8');

let token = await auth();

const refreshAuthToken = async () => {
    token.access_token = '';
    token = await auth();
    if (token.access_token) {
        setTimeout(refreshAuthToken, token.expires_in * 1000);
    }
}

const setRedisCart = async (cartId, verificationData) => {
    return await redis.set(`cart-${cartId}`, JSON.stringify(verificationData));
}

const updateCart = async (sessionId, cartId) => {
    if (!token.access_token) {
        console.log('token expired, refreshing', token);
        refreshAuthToken();
        console.log('token refreshed', token.access_token);
    }
    if (!token.access_token) {
        console.log('no token, aborting');
        return;
    }
    const existing = await redis.get(`cartid-${sessionId}`);
    if (existing) {
        return;
    }
    const code = makeId("ST", 6)
    console.log('updating cart', cartId, code, token);
    const cart = await getCart(token, cartId);
    if (cart?.discountCodes?.length > 0) {
        console.log('cart already has discount code');
        return;
    }
    const res = await createDiscountCode(token, "Student Discount", config.CART_DISCOUNT_ID, code);
    if (res) {
        console.log('create discount code result', res);
        const res2 = await applyDiscount(token, cartId, cart.version, code);
        console.log('apply discount code result', res2);
        await redis.set(`cartid-${sessionId}`, cartId);
    }
}

http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        console.log('get /');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('SheerID - commercetools Demo server '+config.VERSION);
    } else if (req.url === '/api/version' && req.method === 'GET') {
            console.log('get /api/version', config.VERSION);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('SheerID - commercetools Demo server '+buildDate+' '+config.VERSION.toString());
    } else if (req.url === '/health') {
        if (token.access_token) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('NO HEALTHY AUTH TOKEN');
        }
    } else if (req.url === '/api/demodata') {
        const demoData = {
            "HARVARDCRIMPROXS": "Harvard Business School (Boston, MA)",
            "CALTECHHOODIEXS": "California Institute of Technology (Pasadena, CA)",
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(demoData));
    } else if (req.url.startsWith('/api/verify') && req.method === 'GET') {
        const q = url.parse(req.url, true).query;
        console.log('get /api/verify', q.cid);
        let cartJson = await redis.get(`cart-${q.cid}`)
        if (cartJson === null) {
            cartJson = `{}`;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(cartJson);
    } else if (req.url.startsWith('/api/update') && req.method === 'GET') {
        const q = url.parse(req.url, true).query;
        console.log('get /api/update', q.cid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(`{}`);
        try {
            updateCart(q.cid, q.cart);
        } catch (e) {
            console.log('error updating cart', e);
        }
    } else if (req.url === '/api/success-webhook' && req.method === 'POST') {
        console.log(`post /api/success-webhook => ${config.SHEERID_API_URL}`);
        const body = await getBody(req);
        res.end('OK');
        if (body != undefined && body.length > 0) {
            const b = JSON.parse(body);
            console.log(`processing verification ${config.SHEERID_API_URL}`, body);
            const r = await getVerification(b.verificationId);
            try {
                if (r.personInfo?.metadata != undefined) {
                    console.log('metadata', r.personInfo.metadata);
                    const cartId = r.personInfo.metadata.cid;
                    console.log(`saving ${cartId} cart id`);
                    setRedisCart(cartId, r);
                } else {
                    console.log('no metadata', r);
                }
            } catch (err) {
                console.log('error setting redis:', err);
            }
        }
    } else if (req.url === '/api/cart-discounts' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const discounts = await getCartDiscounts(token);
        const o = {};
        discounts.results?.forEach(element => {
            o[element.id] = element.name.en;
        });
        res.end(JSON.stringify(o));
    } else if (req.url.startsWith('/api/carts') && req.method === 'GET') {
        const q = url.parse(req.url, true).query;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const carts = await getCarts(token);
        let cartVersions = {};
        carts.results.forEach(element => {
            cartVersions[element.id] = element.version;
        });
        res.end(JSON.stringify(cartVersions, undefined, ' '));
    } else if (req.url.startsWith('/api/cart') && req.method === 'GET') {
        // get cart version
        // get last part of query string /api/cart/{123}
        const q = req.url.replace('/api/cart/', '');
        console.log('get /api/cart', q);
        const cart = await getCart(token, q);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cart, undefined, ' '));
    } else if (req.url === '/api/webhook' && req.method === 'POST') {
        return; // disabled, reference only
        const body = await getBody(req);
        console.log('post /api/webhook', body);
        res.end('OK');
        if (body != undefined && body.length > 0) {
            const r = JSON.parse(body);
            console.log('processing name', r.name);
            createCartDiscount(token, r);
        }
    } else if (req.url.startsWith('/api/create-webhook')) {
        return; // disabled, reference only
        const q = url.parse(req.url, true).query;
        const r = await createWebhook(q.pid);
        res.end(JSON.stringify(r));
    } else {
        console.log('404', req.url);
        res.statusCode = 404;
        res.end('404: File Not Found');
    }
}).listen(config.PORT);
console.log(`server is running on http://localhost:${config.PORT}/`, config.VERSION);
