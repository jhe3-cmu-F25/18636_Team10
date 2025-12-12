"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

/* Please note that the same client (CDP session) should be used in both
 * functions. Otherwise there won't be any recorded information. */

async function StartProfiler(client, interval = 500) {
    assert(typeof(client) == "object" && typeof(client.send) == "function");
    assert(typeof(interval) == "number" && interval > 0);

    /* Start profiler with sampling interval set to 500 microseconds (default)
     * Sampling Frequency: 2 kHz
     */
    await client.send("Profiler.enable");
    await client.send("Profiler.setSamplingInterval", { "interval" : interval });
    await client.send("Profiler.start");
}

async function GetFunctions(client) {
    assert(typeof(client) == "object" && typeof(client.send) == "function");

    let response = await client.send("Profiler.stop");

    assert(typeof(response) == "object");
    assert(typeof(response.profile) == "object");
    assert(typeof(response.profile.nodes) == "object");

    return response.profile.nodes;
}

/****** Functions ******/

module.exports = {
    StartProfiler,
    GetFunctions
};