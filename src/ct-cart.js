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

export { getCart, getCarts};