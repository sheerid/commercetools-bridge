import config from './src/config.js';
import fetch from 'node-fetch';

import { auth } from './src/auth';
import { nano } from './src/nano';
import { getCartDiscount } from './src/discount.js';

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return (result.substring(0, length / 2) + nano() + result.substring(length / 2, length)).toUpperCase();
}

const main = async () => {
    if (process.argv.length < 5) {
        console.log('Usage: node generate-discount-codes.js <prefix> <cart discount id (UUID)> <number of codes>');
        return;
    }
    const token = await auth();
    if (token.error) {
        console.log(token.error);
        return;
    }

    const prefix = process.argv[2];
    const cartDiscountId = process.argv[3];
    const numberOfCodes = process.argv[4];

    const discount = await getCartDiscount(token.access_token, cartDiscountId);
    console.log('Discount Codes');

    for (let i = 0; i < numberOfCodes; i++) {
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
                "name": discount.name,
                "cartDiscounts": [
                    {
                        "typeId": "cart-discount",
                        "id": cartDiscountId
                    }
                ],
                "isActive": true,
                "cartPredicate": "1=1"
            })
        });
    }
}

main();

