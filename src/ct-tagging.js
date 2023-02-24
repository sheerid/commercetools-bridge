import fetch from 'node-fetch';
import { config } from './config.js';
import { TYPE_NAME } from './ct-customfield.js';

const getCustomer = async (token, customerId) => {
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/customers/${customerId}`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
    });
    return await res.json();
}

const setCustomType = async (token, customerId, version, typeId) => {
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/customers/${customerId}`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
        body: JSON.stringify({
            "version": version,
            "actions": [{
                "action": "setCustomType",
                "type": {
                    "typeId": "type",
                    "id": typeId
                },
            }]
        }),
    });
    return await res.json();

}

const setCustomField = async (token, customerId, verificationId, verification, typeId) => {

    const customer = await getCustomer(token, customerId);
    console.log('customer', customer);
    if (customer.version === undefined) {
        console.log('customer not found by id', customerId);
        return;
    }

    if (customer.custom.type.id !== typeId) {
        await setCustomType(token, customerId, customer.version, typeId);
        customer.version++;
    }

    console.log('setCustomField', customerId, verificationId, verification?.confirmedSegments[0].segment, verification?.personInfo.organization.name);

    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/customers/${customerId}`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
        body: JSON.stringify({
            version: customer.version,
            actions: [{
                action: "setCustomField",
                name: "verificationId",
                value: verificationId,
            },
            {
                action: "setCustomField",
                name: "verifiedCommunity",
                value: verification?.confirmedSegments[0].segment,
            },
            {
                action: "setCustomField",
                name: "verifiedOrganizationName",
                value: verification?.personInfo.organization.name,
            }]
        }),
    });
    return await res.json();
}

export { setCustomField };