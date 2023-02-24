import fetch from 'node-fetch';
import { config } from './config.js';

const TYPE_NAME = 'customer-sheerIDVerificationExample';

const getTypes = async (token) => {
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/types`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
    });
    return await res.json();
}

const isCustomFieldPresent = async (token) => {
    const types = await getTypes(token);
    const customField = types.results.find(type => type.key === TYPE_NAME);
    return customField?.id;
}

const addCustomField = async (token) => {
    const tid = await isCustomFieldPresent(token);
    if (tid !== undefined) {
        console.log('custom field already present');
        return tid;
    }
    const res = await fetch(`${config.CTP_API_URL}/${config.CTP_PROJECT_KEY}/types`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
        },
        body: JSON.stringify({
            key: TYPE_NAME,
            name: { en: "SheerID verification example" },
            resourceTypeIds: [ "customer" ],
            fieldDefinitions: [
                {
                    name: "verificationId",
                    type: { name: "String" },
                    label: { en: "SheerID VerificationID" },
                    required: false,
                    inputHint: "SingleLine"
                },
                {
                    name: "verifiedCommunity",
                    type: { name: "String" },
                    label: { en: "SheerID Community" },
                    required: false,
                    inputHint: "SingleLine"
                },
                {
                    name: "verifiedOrganizationName",
                    type: { name: "String" },
                    label: { en: "Organisation Name" },
                    required: false,
                    inputHint: "SingleLine"
                },
            ]
        }),
    });
    const rjson = await res.json();
    return rjson.id;
}

export { addCustomField, TYPE_NAME };