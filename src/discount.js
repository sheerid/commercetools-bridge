import fetch from 'node-fetch';
import { config } from './config.js';

const getCartDiscount = async (token, code) => {
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts/${code}`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
    });
    return await res.json();
}

const getCart = async (token, cartId) => {
    console.log("getting",cartId, token.access_token);
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/carts/${cartId}`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
    });
    return await res.json();
}

const getCarts = async (token) => {
    console.log("getting ", token.access_token);
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/carts`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
    });
    return await res.json();
}

const getCartDiscounts = async (token) => {
    const res = await fetch(
        `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
    });
    return await res.json();
}

const createCartDiscount = async (token, discount) => {
    const res = await fetch(
        `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token.access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: {
                    en: r.name,
                },
                value: {
                    type: "relative",
                    permyriad: 1000
                },
                cartPredicate: "1=1",
                target: {
                    type: "lineItems",
                    predicate: "1=1"
                },
                sortOrder: Math.random().toString(),
                isActive: true,
                requiresDiscountCode: false
            })
        });
    if (res.status != 200) {
        console.log(res.status, res.body);
        return false;
    }
    return await res.json();
}

const createDiscountCode = async (token, name, cartDiscountId, cartDiscountCode) => {
    const sjson = JSON.stringify({
        code: cartDiscountCode,
        name: { en: name},
        cartDiscounts: [
            {
                typeId: 'cart-discount',
                id: cartDiscountId
            }
        ],
        maxApplications: 1,
        isActive: true,
        cartPredicate: '1=1'
    })
    const res = await fetch(
        `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/discount-codes`,
        {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
        body: sjson,
    });
    // const rr = await res;
    // if (res.status < 300) {
    //     console.log(sjson, res.status, await res.json());
    //     return false;
    // }
    return await res.json();
}

const applyDiscount = async (token, cartId, version, discountCode) => {
    console.log('applying discount to',cartId, version, discountCode);
    const reqj = JSON.stringify({
        version: version,
        actions: [{"action": "addDiscountCode", "code": discountCode}],
    });
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/carts/${cartId}`,
    {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
        body: reqj,
    });
    if (res.status > 299) {
        try {
            console.log(reqj, res, await res.json());
        } catch (e) {
            console.log(e);
        }
        return false;
    }
    return await res.json();
}

export { getCartDiscount, getCartDiscounts, createCartDiscount, createDiscountCode, applyDiscount, getCart, getCarts };