"use strict";

/****** Dependencies ******/

const assert = require("assert");
const Utils = require(__dirname + "/utils.js");

const commonFiletypes = require(__dirname + "/../configs/commonFileTypes.json");
const commonCookies = require(__dirname + "/../configs/commonCookies.json");
const dictionary = require(__dirname + "/../../../Data/EnglishDictionary/dictionary.json");

/****** Definitions ******/

const MINIMUM_COOKIE_VALUE_LENGTH = 6;

const Dictionary = new Set(dictionary);

const CommonCookies = new Set(commonCookies);

const CommonFileTypes = new Set(commonFiletypes);

/****** Functions ******/

function IsCookieValid(cookie) {
    return (
        typeof(cookie) == "object" &&
        typeof(cookie.name) == "string" && cookie.name.length &&
        typeof(cookie.value) == "string" && // Sometimes there are empty cookies
        typeof(cookie.domain) == "string" && cookie.domain.length
    );
}

function IsCommonCookieValue(value) {
    if (typeof(value) == "boolean") return true;
    else if (typeof(value) == "object") return false;

    value = value + "";
    const extension = value.split('.').pop();

    return (
        value.length < MINIMUM_COOKIE_VALUE_LENGTH ||
        String(value).startsWith("www.") ||
        String(value).startsWith("http") ||
        String(value).startsWith("https") ||
        String(value).endsWith(".com") ||
        String(value).endsWith(".com%2F") ||
        Utils.IsDate(value) ||
        CommonCookies.has(value) ||
        CommonFileTypes.has(extension) ||
        Dictionary.has(value)
    );
}

function IsConsentCookie(name) {
    assert(typeof(name) == "string");

    return (
        name === "euconsent" ||
        name === "eupubconsent" ||
        name === "__cmpconsent" ||
        name === "__cmpiab" ||
        name === "__cmpiabc" ||
        name === "__cmpcvc" ||
        name === "__cmpcpc" ||
        name === "__cmpcc" ||
        name === "eupubconsent-v2"
    );
}

function GetCookieDomain(cookie) {
    assert(IsCookieValid(cookie));

    const domain = cookie.domain.startsWith(".") ? cookie.domain.substr(1) : cookie.domain;

    assert(typeof(domain) == "string" && domain.length);
    assert(!domain.startsWith("."));

    return domain;
}

function GetNestedJsonValues(cookieValues) {
    assert(typeof(cookieValues) == "object");
    assert(typeof(cookieValues.forEach) == "function");

    /* If one of the values is another JSON object, then recursively obtain all
     * values in all nested levels.
     * e.g.
     *
     * Cookie value: { "data" : { "client": "2b52e363924626268943b0b348a86eee", "user": { "id": 12343243432423 } } }
     *
     * In this case, the ExtractCookieValue function will return:
     * [ "2b52e363924626268943b0b348a86eee", "12343243432423" ]
     */
    for(var i = 0; i < cookieValues.length; ++i) {
        if (Utils.IsJson(cookieValues[i])) {
            let obj = cookieValues[i];
            cookieValues.splice(i, 1); // Remove recursive object
            cookieValues = cookieValues.concat( ExtractCookieValues(obj) );
        }
    }

    return cookieValues;
}

function AddDecodedUriValues(cookieValues) {
    assert(typeof(cookieValues) == "object");
    assert(typeof(cookieValues.forEach) == "function");

    /* Decode the values that are encoded as URIs. This is important for
     * searching for cookie values in POST requests.
     * e.g.
     *
     * Cookie value: ABC%20abc%20123
     *
     * When looking for this value in requests, we also want to search for the
     * string "ABC abc 123" which is the decoded cookie value. If we only search
     * for the encoded value we might miss some cases.
     */
    cookieValues.forEach(x => {
        try {
            let decoded = decodeURIComponent(x);
            if (x != decoded) cookieValues.push(decoded);
        } catch(e) { }
    });

    return cookieValues;
}

function ExtractCookieValues(cookie) {
    assert(typeof(cookie) == "string");

    let cookieValues = [];

    /* If the cookie value is a JSON object, focus only on the values of the
     * object. Keys do not contain any valuable information and would lead to
     * multiple false positives.
     * e.g.
     *
     * Cookie value: { "user_id": 12345, "country": "gr" }
     *
     * In this case we don't care about the string "user_id". It does not
     * contain any valuable information and cannot uniquely identify users.
     */
    if (Utils.IsJson(cookie)) cookieValues = Utils.GetJsonValues(cookie);
    else cookieValues.push(cookie);
    assert(cookieValues.length > 0);

    /* Perform various techniques to improve results:
     *
     * 1. Remove common values
     * 2. Get values of nested JSON objects
     * 3. Get decoded values
     */
    cookieValues = cookieValues.filter(x => !IsCommonCookieValue(x));
    cookieValues = GetNestedJsonValues(cookieValues);
    cookieValues = AddDecodedUriValues(cookieValues);

    return Utils.RemoveDuplicates(cookieValues);
}

/****** Exports ******/

module.exports = {
    IsCookieValid,
    IsCommonCookieValue,
    IsConsentCookie,
    GetCookieDomain,
    ExtractCookieValues
};