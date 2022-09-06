var http = require('http');
var request = require('request');
var config = require('dotenv').config().parsed;

const auth = require('./src/auth');
const { getCartDiscounts } = require('./src/discount');

http.createServer(function (req, res) {
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('SheerID - commercetools Demo server');
    } else if (req.url === '/webhook' && req.method === 'GET') {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {        
            body = Buffer.concat(body).toString();
            res.end('OK');
            if (body != undefined && body.length > 0) {
                processPayload(body);
            }
        });
    } else {
        res.statusCode = 404;
        res.end('404: File Not Found');
    }
}).listen(8080);

async function processPayload(body) {
    const token = await auth();
    if (token.error) {
        console.log(`Can't process ${body} due to commercetools auth error ${token.error}`);
        return;
    }    

    const r = JSON.parse(body);
    console.log('processing name', r.name);
    
    const discounts = await getCartDiscounts(token.access_token);
    console.log('number of discounts:', discounts.total);
    // To do: loop through discounts and calculate the new sort order instead of random

    request({
        'method': 'POST',
        'url': `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts`,
        'headers': {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "name" : {
                "en" : r.name,
            },
            "value" : {
                "type" : "relative",
                "permyriad" : 1000
            },
            "cartPredicate" : "1=1",
            "target" : {
                "type" : "lineItems",
                "predicate" : "1=1"
            },
            "sortOrder" : Math.random().toString(),
            "isActive" : true,
            "requiresDiscountCode" : false
        })
    }, function (error, response) {
        if (error) throw new Error(error);
        const res = JSON.parse(response.body);
        if (res.id != undefined) {
            console.log('created:', res.id);
        } else {
            console.error('error:', res)
        }
    });
}