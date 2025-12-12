"use strict";

/****** Dependencies ******/

const cookies   = require(__dirname + "/cookies.js");
const network   = require(__dirname + "/network.js");
const functions = require(__dirname + "/functions.js");
const cmp       = require(__dirname + "/cmp.js");

/****** Exports ******/

module.exports = {
    "GetFirstPartyCookies": cookies.GetFirstPartyCookies,
    "GetThirdPartyCookies": cookies.GetThirdPartyCookies,
    "StripRequest": network.StripRequest,
    "StartProfiler": functions.StartProfiler,
    "GetFunctions": functions.GetFunctions,
    "GetCmpInfo": cmp.GetCmpInfo
};