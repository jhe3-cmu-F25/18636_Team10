"use strict";

/****** Dependencies ******/

const assert = require("assert");
const Requests = require(__dirname + "/../helpers/requests.js");
const Utils = require(__dirname + "/../helpers/utils.js");

/****** Functions ******/

function IsValidURL(url) {
    assert(typeof(url) == "string");

    return (
        url.length > 0 &&
        Requests.IsActualRequest(url)
    );
}

function GetThirdParties(requests, firstParty) {
    assert(typeof(requests) == "object");
    assert(typeof(firstParty) == "string" && firstParty.length > 0);
    requests.forEach(req => assert(typeof(req) == "object") && assert(typeof(req.url) == "string" && req.url.length));

    /* In case the domain has been extracted from a cookie value */
    if (firstParty.startsWith(".")) firstParty = firstParty.substr(1);

    let domains = requests.filter(req => IsValidURL(req.url))
                          .map(req => Utils.ExtractHostname(req.url))
                          .map(host => host.trim())
                          .filter(host => host.length);

    domains = Utils.RemoveDuplicates(domains);

    let thirdParties = domains.filter(domain => !Utils.AreSameDomain(domain, firstParty));

    return thirdParties;
}

/****** Exports ******/

module.exports = {
    GetThirdParties
};