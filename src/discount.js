var config = require('dotenv').config().parsed;
var request = require('request');

const getCartDiscount = async (code, token) => {
    return new Promise(function (resolve, reject) {
        request({
            'method': 'GET',
            'url': `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/cart-discounts/${code}`,
            'headers': {
                'Authorization': 'Bearer '+token,
            },
        }, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(error);
            }
        });
    });
}

module.exports = getCartDiscount;