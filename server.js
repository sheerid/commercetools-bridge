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

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));

console.log('connecting to Redis...');
await redis.connect();

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
    } else if (req.url.startsWith('/api/getcarts') && req.method === 'GET') {
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
        // return;
        // const storedCart = await redis.get(`cart-${q.cid}`);
        // if (!storedCart) {
        //     return;
        // }
        // const rb = await fetch("https://api.europe-west1.gcp.commercetools.com/sunrise-spa/graphql", {
        //     "headers": {
        //         "authorization": "Bearer "+q.t,
        //         "content-type": "application/json",
        //     },
        //     "method": "POST",
        //     "body": "{\"operationName\":\"myCart\",\"variables\":{\"locale\":\"en\"},\"query\":\"query myCart($locale: Locale!) {\\n  myCart: me {\\n    activeCart {\\n      cartId: id\\n      version\\n      lineItems {\\n        lineId: id\\n        name(locale: $locale)\\n        productSlug(locale: $locale)\\n        quantity\\n        price {\\n          value {\\n            centAmount\\n            currencyCode\\n            fractionDigits\\n            __typename\\n          }\\n          discounted {\\n            value {\\n              centAmount\\n              currencyCode\\n              fractionDigits\\n              __typename\\n            }\\n            discount {\\n              name(locale: $locale)\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        totalPrice {\\n          centAmount\\n          currencyCode\\n          fractionDigits\\n          __typename\\n        }\\n        variant {\\n          sku\\n          images {\\n            url\\n            __typename\\n          }\\n          attributesRaw {\\n            name\\n            value\\n            attributeDefinition {\\n              type {\\n                name\\n                __typename\\n              }\\n              name\\n              label(locale: $locale)\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      totalPrice {\\n        centAmount\\n        currencyCode\\n        fractionDigits\\n        __typename\\n      }\\n      shippingInfo {\\n        shippingMethod {\\n          methodId: id\\n          name\\n          localizedDescription(locale: $locale)\\n          __typename\\n        }\\n        price {\\n          centAmount\\n          currencyCode\\n          fractionDigits\\n          __typename\\n        }\\n        __typename\\n      }\\n      taxedPrice {\\n        totalGross {\\n          centAmount\\n          currencyCode\\n          fractionDigits\\n          __typename\\n        }\\n        totalNet {\\n          centAmount\\n          currencyCode\\n          fractionDigits\\n          __typename\\n        }\\n        __typename\\n      }\\n      discountCodes {\\n        discountCode {\\n          codeId: id\\n          code\\n          name(locale: $locale)\\n          __typename\\n        }\\n        __typename\\n      }\\n      shippingAddress {\\n        firstName\\n        lastName\\n        streetName\\n        additionalStreetInfo\\n        postalCode\\n        city\\n        country\\n        phone\\n        email\\n        __typename\\n      }\\n      billingAddress {\\n        firstName\\n        lastName\\n        streetName\\n        additionalStreetInfo\\n        postalCode\\n        city\\n        country\\n        phone\\n        email\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\"}",
        // });
        // const r = await rb.json();
        // const activeCart = await r.data.myCart.activeCart;
        // console.log('cart version:', JSON.stringify(activeCart.version));

        // const code = "ST"+makeid(6)
        // console.log('updating cart', activeCart.cartId, code);
        // const dc = await createDiscountCode(token, "Student Discount", config.CART_DISCOUNT_ID, code);
        // console.log('discountcode:', dc);
        // if (dc) {
        //     const qi = JSON.stringify({
        //         "operationName":"mutateCart",
        //         "variables":{
        //             "actions":[{"addDiscountCode":{"code": dc.code }}],
        //             "version":activeCart.version,
        //             "id":activeCart.cartId,
        //             },
        //         "query":"mutation mutateCart($actions: [MyCartUpdateAction!]!, $version: Long!, $id: String!) {\n updateMyCart(actions: $actions, version: $version, id: $id) {\n id\n version\n lineItems {\nlineId: id\nquantity\n__typename\n}\n__typename\n}\n}",
        //     })
        //     console.log('q', qi);
        //     fetch("https://api.europe-west1.gcp.commercetools.com/sunrise-spa/graphql", {
        //         "headers": {
        //             "authorization": "Bearer "+q.t,
        //             "content-type": "application/json",
        //         },
        //         "method": "POST",
        //         "body": qi,
        //     }).then(async(res)=>{
        //         const r = await res.json();
        //         console.log(r)
        //     });
        // }

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
