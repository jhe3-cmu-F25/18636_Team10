"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

function SanitizeUrlName(url) {
    assert(typeof(url) == "string");

    let string = url;

    string = string.replace(/\./g, "_").
                    replace(/-/g, "_").
                    replace(/'/g, "_").
                    replace(/\//g, "_").
                    replace(/:/g, "_").
                    replace(/,/g, "_").
                    replace(/\+/g, "p").
                    replace(/\s/g, "_").
                    replace(/\(/g, "_").
                    replace(/\)/g, "_").
                    replace("&", "and");

    /* Remove consecutive underscores */
    string = string.replace(/_+/g, "_");

    /* Remove whitespace */
    string = string.trim();

    /* Make sure that URIs don't end with an underscore */
    if (string.endsWith("_")) string = string.substr(0, string.length - 1);

	return string;
}

function IsValidHttpUrl(str) {
    assert(typeof(str) == "string" && str.length);

    try {
        let url = new URL(str);
        return (url.protocol === "http:" || url.protocol === "https:");
    } catch(e) {
        return false;
    }
}

/****** Exports ******/

module.exports = {
    SanitizeUrlName,
    IsValidHttpUrl
};