"use strict";

/****** Dependencies ******/

const assert = require("assert");
const { ConsentString } = require("consent-string");

/****** Functions ******/

async function GetCmpInfo(page) {
    assert(typeof(page) == "object" && typeof(page.evaluate) == "function");

    return await page.evaluate(async () => {
        return await new Promise((resolve, reject) => {

            /* Number of seconds after which the app stops trying to retrieve
             * CMP info. */
            const GET_CMP_TIMEOUT = 15;

            try {
                __cmp("getConsentData", null, result => resolve(result.consentData));
                setTimeout(_ => reject("CMP Data Timeout Expired (" + GET_CMP_TIMEOUT + " secs)"), GET_CMP_TIMEOUT * 1000);

            } catch (err) {
                reject(err);
            }
        });
    })
    .then(data => {
        assert(typeof(data) == "string");

        let consentData = new ConsentString(data);
        consentData.consent_string = data;
        consentData.error = "N/A";

        return consentData;
    })
    .catch(err => {
        return {
            "consent_string": "N/A",
            "error": String(err).split("\n")[0],
        };
    });
}

/****** Exports ******/

module.exports = {
    GetCmpInfo
};