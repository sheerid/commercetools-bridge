import fetch from 'node-fetch';
import { config } from './config.js';

const setCustomerField = async (token, customerId, verifiactionResult) => {
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/customers/${customerId}`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
        body: JSON.stringify({
            "version" : 3,
            "actions" : [ {
                "action" : "setCustomField",
                "name" : "verification",
                "value" : JSON.stringify(verifiactionResult)
                }
            ]
          }),
    });
    return await res.json();
}

export { setCustomerField };