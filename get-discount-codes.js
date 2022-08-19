var request = require('request');
var config = require('dotenv').config().parsed;

const auth = require('./src/auth');

async function main() {
    const token = await auth();
    if (token.error) {
        console.log(token.error);
        return;
    }

    request({
        'method': 'GET',
        'url': `${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/discount-codes`,
        'headers': {
        'Authorization': 'Bearer '+token.access_token,
        }
    }, function (error, response) {
        if (error) throw new Error(error);
        const res = JSON.parse(response.body);
        res.results.forEach(element => {
            // console.log(element)
            console.log(`${element.code}: ${element.id} - ${element.name.en} (${element.cartDiscounts[0].id})`);
        });
    });
}

main();

