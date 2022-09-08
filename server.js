import { config } from 'dotenv';
import http from 'http';
import { auth } from './src/auth.js';

import { getCartDiscounts, createCartDiscount, createDiscountCode } from './src/discount.js';

const token = await auth();

http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('SheerID - commercetools Demo server');
    } else if (req.url === '/cart-discounts' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        const discounts = await getCartDiscounts(token.access_token);
        console.log('number of discounts:', discounts.total);
        const o = {};
        discounts.results.forEach(element => {
            console.log(element);
            o[element.id] = element.name.en;
        });
        res.end(JSON.stringify(o));
    } else if (req.url === '/success-webhook' && req.method === 'POST') {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {        
            body = Buffer.concat(body).toString();
            res.end('OK');
            if (body != undefined && body.length > 0) {
                const discount = JSON.parse(body);
                createDiscountCode("SHEERID-", discount.name, cartDiscountId);
            }
        });
    } else if (req.url === '/webhook' && req.method === 'POST') {
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
        res.statusCode = 404;
        res.end('404: File Not Found');
    }
}).listen(80);
console.log('server is running on http://localhost/');
