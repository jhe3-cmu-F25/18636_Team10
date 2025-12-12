"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

function RemoveDuplicates(array) {
    assert(typeof(array) == "object");
    return [...new Set(array)];
}

function IsNumber(str) {
    assert(typeof(str) == "string");
    return !isNaN(parseInt(str));
}

function IsDate(str) {
    /* TODO: Date.parse() does not suffice. Use a more robust approach */
    assert(typeof(str) == "string");
    return !isNaN(Date.parse(str));
}

function IsJson(str) {
    assert(typeof(str) == "string");

    if (IsNumber(str)) return false;

    try {
        let obj = JSON.parse(str);
        if (obj === null) return false;
        return true;
    } catch(e) {
        return false;
    }
}

function IsUri(str) {
    assert(typeof(str) == "string");

    try {
        let url = new URL(str);
        return true;
    } catch(e) {
        return false;
    }
}

function ExtractHostname(url) {
    assert(IsUri(url));
    return (new URL(url)).hostname;
}

function GetJsonValues(str) {
    assert(typeof(str) == "string" && IsJson(str));

    const obj = JSON.parse(str);

    return Object.values(obj).map(x => {
        let value = ((typeof(x) == "object") ? JSON.stringify(x) : x + "");
        assert(typeof(value) == "string");
        return value;
    });
}

function AreSameDomain(a, b) {
    assert(typeof(a) == "string" && a.length);
    assert(typeof(b) == "string" && b.length);

    /* This trivial algorithm searches for exact match of domains.
     * Alternatively, you can implement a different algorithm that compares
     * domains based on (eTLD + 1)
     */
    return (
        a === b ||
        a === "www." + b ||
        a === "www2." + b ||
        b === "www." + a ||
        b === "www2." + a
    );
}

/****** Exports ******/

module.exports = {
    RemoveDuplicates,
    IsDate,
    IsJson,
    IsUri,
    ExtractHostname,
    GetJsonValues,
    AreSameDomain
}