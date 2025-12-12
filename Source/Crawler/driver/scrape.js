"use strict";

/****** Dependencies ******/

const assert = require("assert");

const Init = require(__dirname + "/init.js");
const Scrapers = require(__dirname + "/../scrapers");

const { EvadeBotDetection } = require(__dirname + "/evasion.js");

const config = require(__dirname + "/../configs/puppeteer.json");

/****** Definitions ******/

const PAGE_LOAD_OPTIONS = Init.GetPageLoadOptions(config);

/****** Functions ******/

async function Scrape(browser, targetURL, listName) {
    assert(typeof(browser) == "object");
    assert(typeof(browser.newPage) == "function");
    assert(typeof(targetURL) == "string" && targetURL.length);
    assert(typeof(listName) == "string" && listName.length);

    const pages = await browser.pages();
    const page = pages[0];

    const client = await page.target().createCDPSession();
    assert(typeof(client) == "object");

    await EvadeBotDetection(page);

    const requests = [];
    page.on("request", request => requests.push(Scrapers.StripRequest(request, requests.length)));

    await Scrapers.StartProfiler(client);

    console.log("[INFO] Visiting website...")
    await page.goto(targetURL, PAGE_LOAD_OPTIONS);
    console.log("[INFO] Waiting...");
    await page.waitForTimeout(config.waitPeriod * 1000);

    console.log("[INFO] Collecting data...");
    const firstPartyCookies = await Scrapers.GetFirstPartyCookies(page);
    const thirdPartyCookies = await Scrapers.GetThirdPartyCookies(page);
    const cmp               = await Scrapers.GetCmpInfo(page);
    const usedFunctions     = await Scrapers.GetFunctions(client);

    const urls = {
        "listWebsite": listName,
        "targetWebsite": targetURL,
        "landingWebsite": page.url()
    };

    await browser.close();

    return {
        "requests": requests,
        "cookies": firstPartyCookies,
        "thirdPartyCookies": thirdPartyCookies,
        "cmp": cmp,
        "functions": usedFunctions,
        "websites": urls
    };
}

async function ScrapeWithTimeout(browser, targetURL, listName, timeout) {
    assert(typeof(browser) == "object");
    assert(typeof(browser.newPage) == "function");
    assert(typeof(targetURL) == "string" && targetURL.length);
    assert(typeof(listName) == "string" && listName.length);
    assert(typeof(timeout) == "number" && timeout > 0);

    return new Promise((resolve, reject) => {
        Scrape(browser, targetURL, listName).then(resolve).catch(reject);

        setTimeout(_ => {
            browser.process().kill("SIGKILL");
            reject("Hard timeout of " + timeout + " ms exceeded");
        }, timeout);

    });
}

/****** Exports ******/

module.exports = {
    ScrapeWithTimeout
};