"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

function FormatTwoDigits(n) {
    assert(typeof(n) == "number" && n >= 0);
    return (n < 10 ? "0" : "") + n;
}

function GetDateTime(timestamp) {
    let now = (typeof(timestamp) == "number" && timestamp > 0) ? new Date(timestamp) : new Date();

    let date = "";
    date += FormatTwoDigits(now.getHours()) + ":" + FormatTwoDigits(now.getMinutes()) + ":" + FormatTwoDigits(now.getSeconds());
    date += " ";
    date += FormatTwoDigits(now.getDate()) + "/" + FormatTwoDigits(now.getMonth() + 1) + "/" + FormatTwoDigits(now.getFullYear());
    date += " [ " + parseInt((now.getTime() / 1000).toFixed(0)) + " ]";

    return date;
}

/****** Functions ******/

module.exports = {
    GetDateTime
};