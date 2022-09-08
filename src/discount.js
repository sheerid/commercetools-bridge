import fetch from 'node-fetch';
import { config } from './config.js';

const getCartDiscount = async (token, code) => {
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts/${code}`, {
        'method': 'GET',
        'headers': {
            'Authorization': 'Bearer ' + token,
        },
    });
    return await res.json();
}

const getCartDiscounts = async (token) => {
    const res = await fetch(
        `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts`, {
        'method': 'GET',
        'headers': {
            'Authorization': 'Bearer ' + token,
        },
    });
    return await res.json();
}

const createCartDiscount = async (token, discount) => {
    const res = await fetch(
        `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts`,
        {
            'method': 'POST',
            'headers': {
                'Authorization': 'Bearer ' + token.access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": {
                    "en": r.name,
                },
                "value": {
                    "type": "relative",
                    "permyriad": 1000
                },
                "cartPredicate": "1=1",
                "target": {
                    "type": "lineItems",
                    "predicate": "1=1"
                },
                "sortOrder": Math.random().toString(),
                "isActive": true,
                "requiresDiscountCode": false
            })
        });
    return await res.json();
}

const createDiscountCode = (prefix, name, cartDiscountId) => {
    fetch(
        `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/discount-codes`,
        {
        'method': 'POST',
        'headers': {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "code": prefix + makeid(6),
            "name": name,
            "cartDiscounts": [
                {
                    "typeId": "cart-discount",
                    "id": cartDiscountId
                }
            ],
            "isActive": true,
            "cartPredicate": "1=1"
        })
    })
} 

export { getCartDiscount, getCartDiscounts, createCartDiscount, createDiscountCode };