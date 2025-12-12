"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

async function GetAllCookies(page) {
    assert(typeof(page) == "object");
    assert(typeof(page._client) == "object");
    assert(typeof(page._client.send) == "function");

    let allCookies = await page._client.send("Network.getAllCookies");

    assert(typeof(allCookies) == "object");
    assert(typeof(allCookies.cookies) == "object");

    return allCookies.cookies;
}

async function GetFirstPartyCookies(page) {
    assert(typeof(page) == "object");
    assert(typeof(page.cookies) == "function");

    return await page.cookies();
}

async function GetThirdPartyCookies(page) {
    assert(typeof(page) == "object");

    let thirdPartyCookies = [];

    const allCookies = await GetAllCookies(page);
    assert(typeof(allCookies) == "object");
    assert(typeof(allCookies.forEach) == "function");

    const firstPartyCookies = await GetFirstPartyCookies(page);
    assert(typeof(firstPartyCookies) == "object");
    assert(typeof(firstPartyCookies.forEach) == "function");

    allCookies.forEach(cookie => {

        let exists = firstPartyCookies.find(obj => obj.name === cookie.name &&
                                                   obj.value === cookie.value &&
                                                   obj.domain === cookie.domain &&
                                                   obj.path === cookie.path);

        if (!exists) thirdPartyCookies.push(cookie);
    });

    assert(allCookies.length === firstPartyCookies.length + thirdPartyCookies.length);

    return thirdPartyCookies;
}

/****** Exports ******/

module.exports = {
    GetFirstPartyCookies,
    GetThirdPartyCookies
};