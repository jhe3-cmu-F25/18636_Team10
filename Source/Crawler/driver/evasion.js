"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

function GetRandomString(length) {
    assert(typeof(length) == "number" && length > 0);
    return Math.random().toString(36).substr(2, length);
}

async function EvadeBotDetection(page) {
    assert(typeof(page) == "object");
    assert(typeof(page.evaluateOnNewDocument) == "function");

    await page.evaluateOnNewDocument(() => {
        /* "Hide" the webdriver property */
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });

        /* Add a random plugin to mess up with detection scripts */
        Object.defineProperty(navigator, "plugins", {
            get: () => [ {
                "name": GetRandomString(10),
                "filename": GetRandomString(10) + "." + GetRandomString(10),
                "length:": 1,
                "description": GetRandomString(15) + ". " + GetRandomString(5)
            } ]
        });
    });
}

/****** Exports ******/

module.exports = {
    EvadeBotDetection
};