"use strict";

/****** Dependencies ******/

const assert = require("assert");

const fingerprintingFuncs = require(__dirname + "/../configs/fingerprintingFuncs.json");

const {RemoveDuplicates} = require(__dirname + "/../helpers/utils.js");

/****** Definitions ******/

const Fingerprinters = new Set(fingerprintingFuncs);

/****** Functions ******/

function GetFingerprinting(usedFunctions) {
    assert(typeof(usedFunctions) == "object");
    assert(typeof(usedFunctions.forEach) == "function");

    let result = {
        "status": false,
        "functions": []
    };

    let functions = usedFunctions.filter(func => !func.callFrame.url.startsWith("chrome-extension://"))
                                 .map(data => data.callFrame.functionName)
                                 .filter(func => Fingerprinters.has(func));

    result.functions = RemoveDuplicates(functions);

    if (result.functions.length) result.status = true;

    return result;
}

/****** Exports ******/

module.exports = {
    GetFingerprinting
};