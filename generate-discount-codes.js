var request = require('request');
var config = require('dotenv').config().parsed;

const auth = require('./src/auth');
const nano = require('./src/nano');
const getCartDiscount = require('./src/discount');

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return (result.substring(0, length / 2) + nano() + result.substring(length / 2, length)).toUpperCase();
}

async function main() {
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

    const discount = await getCartDiscount(cartDiscountId, token.access_token);
    const name = discount.name.en;
    console.log('Discount Codes');

    for (let i = 0; i < numberOfCodes; i++) {
        request({
            'method': 'POST',
            'url': `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/discount-codes`,
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
        }, function (error, response) {
            if (error) throw new Error(error);
            const res = JSON.parse(response.body);
            console.log(res.code);
        });
    }
}

main();

