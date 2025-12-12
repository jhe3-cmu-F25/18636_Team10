"use strict";

/****** Dependencies ******/

const assert = require("assert");
const fs     = require("fs");

/****** Functions ******/

function LoadData(path) {
    assert(typeof(path) == "string" && path.length > 0);

    const text = fs.readFileSync(path, "utf8");
    const data = JSON.parse(text);

    return data;
}

function StoreData(path, data) {
    assert(typeof(path) == "string" && path.length > 0);
    assert(typeof(data) == "object");

    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

/****** Exports ******/

module.exports = {
    LoadData,
    StoreData
};