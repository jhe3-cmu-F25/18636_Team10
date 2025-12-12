"use strict";

/****** Dependencies ******/

const assert = require("assert");

const { GetDateTime } = require(__dirname + "/../helpers/time.js");

/****** Functions ******/

function StripRequest(req, newID) {
    assert(typeof(req) == "object");
    assert(typeof(newID) == "number" && newID >= 0);

    let data = { };

    data.requestID = req._requestId;
    data.customID = newID;
    data.timestamp = GetDateTime();

    if (req.frame())
        data.frame = { "name": req.frame().name(), "url": req.frame().url() };

    data.headers = req.headers();
    data.isNavigationRequest = req.isNavigationRequest();
    data.method = req.method();
    data.postData = req.postData();
    data.redirectChainLength = req.redirectChain().length;
    data.resourceType = req.resourceType();
    data.url = req.url();

    return data;
}

/****** Exports ******/

module.exports = {
    StripRequest
};