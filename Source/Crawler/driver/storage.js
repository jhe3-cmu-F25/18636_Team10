"use strict";

/****** Dependencies ******/

const assert = require("assert");
const fs     = require("fs");

const tracesConfig = require(__dirname + "/../configs/traces.json");

const { SanitizeUrlName } = require(__dirname + "/../helpers/utils.js");

/****** Definitions ******/

const JSON_FORMAT_IDENTATION = 2;

/****** Functions ******/

function StoreString(data, filename) {
    assert(typeof(data) == "string");
    assert(typeof(filename) == "string" && filename.length);

    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, err => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function StoreJson(json, filename) {
    assert(typeof(json) == "object");
    assert(typeof(filename) == "string" && filename.length);

    let data = JSON.stringify(json, null, JSON_FORMAT_IDENTATION);
    return StoreString(data, filename);
}

function EnsureDirectoryExists(dir) {
    assert(typeof(dir) == "string" && dir.length);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        return true;
    }

    return false;
}

async function StoreTraces(traces, targetDir) {
    assert(typeof(targetDir) == "string" && targetDir.length);
    assert(typeof(traces) == "object");
    assert(typeof(traces.websites) == "object");
    assert(typeof(traces.requests) == "object");
    assert(typeof(traces.cookies) == "object");
    assert(typeof(traces.thirdPartyCookies) == "object");
    assert(typeof(traces.functions) == "object");
    assert(typeof(traces.cmp) == "object");

    EnsureDirectoryExists(targetDir);

    let promises = [];

    promises.push(StoreJson(traces.requests,          targetDir + tracesConfig.requestsFile));
    promises.push(StoreJson(traces.cookies,           targetDir + tracesConfig.cookiesFile));
    promises.push(StoreJson(traces.thirdPartyCookies, targetDir + tracesConfig.thirdPartyCookiesFile));
    promises.push(StoreJson(traces.websites,          targetDir + tracesConfig.websiteFile));
    promises.push(StoreJson(traces.functions,         targetDir + tracesConfig.functionsFile));
    promises.push(StoreJson(traces.cmp,               targetDir + tracesConfig.cmpInfoFile));

    /* Wait for all the data to be stored */
    console.log("[INFO] Storing data...");
    await Promise.all(promises).catch(error => { throw String(error) });
}

function GetTracesDir(website, resultsDir) {
    assert(typeof(website) == "string" && website.length);
    assert(typeof(resultsDir) == "string" && resultsDir.length);

    if (!resultsDir.endsWith("/")) resultsDir += "/"
    return resultsDir + SanitizeUrlName(website);
}

/****** Definitions ******/

module.exports = {
    StoreTraces,
    GetTracesDir
};