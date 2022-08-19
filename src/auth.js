var config = require('dotenv').config().parsed;
var request = require('request');

const auth = async () => {
    var auth = 'Basic ' + Buffer.from(config.CTP_CLIENT_ID + ':' + config.CTP_CLIENT_SECRET).toString('base64');
    return new Promise(function (resolve, reject) {
        request({
            'method': 'POST',
            'url': `${config.CTP_AUTH_URL}/oauth/token`,
            'headers': {
                'Authorization': auth,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'grant_type': 'client_credentials',
                'scope': config.CTP_SCOPES
            }
        }, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(error);
            }
        });
    });
}

module.exports = auth;