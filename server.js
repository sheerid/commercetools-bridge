import { config } from './src/config.js';
import http from 'http';
import { auth } from './src/auth.js';
import url from 'url';
import { createClient } from 'redis';
import { createWebhook, getVerification } from './src/sheerid.js';
import { nano } from './src/nano.js';
import { getCartDiscounts, createCartDiscount, createDiscountCode, applyDiscount, getCart, getCarts } from './src/discount.js';
import fetch from 'node-fetch';

const token = await auth();

const makeid = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return (result.substring(0, length / 2) + nano() + result.substring(length / 2, length)).toUpperCase();
}

const verificationStatus = async (verificationId) => {
    return await getVerification(verificationId);
}

const onSuccess = async (cartId, verificationData) => {
    return await redis.set(`cart-${cartId}`, JSON.stringify(verificationData));
}

const updateCart = async (sessionId, cartId) => {
    const existing = await redis.get(`cartid-${sessionId}`);
    if (existing) {
        return;
    }
    const code = "ST"+makeid(6)
    console.log('updating cart', cartId, code);
    const cart = await getCart(token, cartId);
    const res = await createDiscountCode(token, "Student Discount", config.CART_DISCOUNT_ID, code);
    if (res) {
        console.log(res);
        const res2 = await applyDiscount(token, cartId, cart.version, code);
        console.log(res2);
        await redis.set(`cartid-${sessionId}`, cartId);
    }
}

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

http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        console.log('get /');
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('SheerID - commercetools Demo server');
    } else if (req.url === '/api/demodata') {
        const demoData = {
            "HARVARDCRIMPROXS": "Harvard Business School (Boston, MA)",
            "CALTECHHOODIEXS": "California Institute of Technology (Pasadena, CA)",
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(demoData));
    } else if (req.url.startsWith('/api/create-webhook')) {
        return; // disabled, reference only
        const q = url.parse(req.url, true).query;
        const r = await createWebhook(q.pid);
        res.end(JSON.stringify(r));
    } else if (req.url === '/api/cart-discounts' && req.method === 'GET') {
        return; // disabled, reference only
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
    } else if (req.url.startsWith('/api/getcarts') && req.method === 'GET') {
        return; // disabled, reference only
        const q = url.parse(req.url, true).query;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(await getCarts(token)));
    } else if (req.url.startsWith('/api/update') && req.method === 'GET') {
        const q = url.parse(req.url, true).query;
        console.log('get /api/update', q.cid);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(`{}`);
        try {
            updateCart(q.cid, q.cart);
        } catch (e) {
            console.log(e);
        }
    } else if (req.url === '/api/success-webhook' && req.method === 'POST') {
        console.log(`post /api/success-webhook => ${config.SHEERID_API_URL}`);
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {        
            body = Buffer.concat(body).toString();
            res.end('OK');
            if (body != undefined && body.length > 0) {
                const res = JSON.parse(body);
                console.log(`processing verification ${config.SHEERID_API_URL}`, body);
                verificationStatus(res.verificationId).then((r) => {
                    try {
                        if (r.personInfo?.metadata != undefined) {
                            console.log('metadata', r.personInfo.metadata);
                            const cartId = r.personInfo.metadata.cid;
                            console.log(`saving ${cartId} cart id`);
                            onSuccess(cartId, r);
                        } else {
                            console.log('no metadata', r);
                        }
                    } catch(err) {
                        console.log('error:', err);
                    }    
                });
            }
        });
    } else if (req.url === '/health') {
        res.end('OK');
    } else if (req.url === '/api/webhook' && req.method === 'POST') {
        return; // disabled, reference only
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
        console.log('404', req.url);
        res.statusCode = 404;
        res.end('404: File Not Found');
    }
}).listen(config.PORT);
console.log(`server is running on http://localhost:${config.PORT}/`);
