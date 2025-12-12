"use strict";

/****** Dependencies ******/

const assert = require("assert");
const Utils = require(__dirname + "/utils.js");

/****** Functions ******/

function IsRequestValid(req) {
    return (
        typeof(req) == "object" &&
        typeof(req.url) == "string" && req.url.length &&
        typeof(req.method) == "string" && req.method.length &&
        typeof(req.headers) == "object"
    );
}

function IsActualRequest(url) {
    assert(typeof(url) == "string" && url.length > 0);

    return (
        !url.startsWith("data:") &&
        !url.startsWith("https://data:") &&
        !url.startsWith("https://%20") &&
        !url.startsWith("https:// ") &&
        !url.startsWith("blob:") &&
        !url.startsWith("file:") &&
        !url.startsWith("icq:") &&
        !url.startsWith("bacon:") &&
        !url.startsWith("unsaved:") &&
        !url.startsWith("htps:") &&
        !url.startsWith("brave:") &&
        !url.startsWith("edge:") &&
        !url.startsWith("puffin:")
    );
}

function GetUrlParams(str) {
    assert(typeof(str) == "string" && str.length > 0);

    try { str = decodeURIComponent(str); } catch(e) { }

    const url = new URL(str);
    const queryData = url.searchParams;
    const params = [];

    /* Focus only on values and not keys. This is essential to remove false
     * positives. Most of the times the keys are defined based on an API and are
     * common keywords like "login", "desktop", "list"
     */
    for(const [key, value] of queryData) params.push(value);

    /* Search even in the URL's fragment. */
    if (url.hash.length) params.push(url.hash);

    /* Return non-empty values */
    return params.filter(x => x.length > 0);
}

function GetCustomUrlParams(str) {
    assert(typeof(str) == "string" && str.length > 0);

    let query = str.split("/").pop();
    assert(typeof(query) == "string");

    const result = [];

    /* Some libraries isse requests where search parameters are not separated
     * using the standard delimiter (i.e. &) but using a custom one (i.e. ;).
     * e.g.
     *
     * Normal request:
     * https://tracker.com/path?id=1234&country=gr
     *
     * Custom request:
     * https://tracker.com/path?id=1234;country=gr
     *
     * In the second case the standard implementation of the URL class will
     * think that there is a single parameter with key "id" and value
     * 1234;country=gr
     */
    query.split(";").filter(x => x.length).forEach(part => {
        assert(typeof(part) == "string" && part.length);
        const item = part.split("=");
        if (item[1]) result.push(decodeURIComponent(item[1]));
    });

    return Utils.RemoveDuplicates(result);
}

/****** Exports ******/

module.exports = {
    IsRequestValid,
    IsActualRequest,
    GetUrlParams,
    GetCustomUrlParams
};