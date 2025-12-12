"use strict";

/****** Dependencies ******/

const assert = require("assert");

/****** Functions ******/

function GetBrowserOptions(config) {
    assert(typeof(config) == "object");
    assert(typeof(config.headless) == "boolean");
    assert(typeof(config.windowWidth) == "number" && config.windowWidth > 0);
    assert(typeof(config.windowHeight) == "number" && config.windowHeight > 0);
    assert(typeof(config.windowPosX) == "number" && config.windowPosX >= 0);
    assert(typeof(config.windowPosY) == "number" && config.windowPosY >= 0);

    /*
     * Chromium command line switches:
     *
     * --disable-web-security: Don't enforce the same-origin policy.
     *                         (Used by people testing their sites.)
     *
     * --disable-features: Comma-separated list of feature names to disable.
     *                     See also kEnableFeatures.
     *
     * Site Isolation is a security feature in Chrome that offers additional
     * protection against some types of security bugs. It makes it harder for
     * untrustworthy websites to access or steal information from your accounts
     * on other websites.
     *
     * When debugging with --disable-web-security, it may also be necessary to
     * disable Site Isolation
     * (using --disable-features=IsolateOrigins,site-per-process)
     * to access cross-origin frames.
     */

    return {
        headless: config.headless,
        defaultViewport: null,
        ignoreHTTPSErrors: config.ignoreHTTPSErrors,
        args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
            "--window-size=" + config.windowWidth + "," + config.windowHeight,
            "--window-position=" + config.windowPosX + "," + config.windowPosY,
            "--disable-extensions-except=" + __dirname + config.extensionPath,
            "--load-extension=" + __dirname + config.extensionPath
        ]
    };
}

function GetPageLoadOptions(config) {
    assert(typeof(config) == "object");
    assert(typeof(config.waitUntil) == "string" && config.waitUntil.length);
    assert(typeof(config.loadPageTimeout) == "number" && config.loadPageTimeout >= 0);

    return {
        waitUntil: config.waitUntil,
        timeout: config.loadPageTimeout * 1000
    };
}

/****** Exports ******/

module.exports = {
    GetBrowserOptions,
    GetPageLoadOptions
};