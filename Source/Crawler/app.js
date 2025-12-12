"use strict";

/****** Dependencies ******/

const puppeteer = require("puppeteer");
const assert    = require("assert");

const Init = require(__dirname + "/driver/init.js");
const Storage = require(__dirname + "/driver/storage.js");

const { ScrapeWithTimeout } = require(__dirname + "/driver/scrape.js");
const { IsValidHttpUrl } = require(__dirname + "/helpers/utils.js");

const config = require(__dirname + "/configs/puppeteer.json");

/****** Definitions ******/

const BROWSER_OPTIONS = Init.GetBrowserOptions(config);

/****** Functions ******/

async function CollectTraces(website, listName) {
    assert(typeof(website) == "string" && website.length);
    assert(typeof(listName) == "string" && listName.length);

    let browser = null;

    try {

        browser = await puppeteer.launch(BROWSER_OPTIONS);
        console.log("[INFO] Created browser instance");
        const traces = await ScrapeWithTimeout(browser, website, listName, config.hardTimeout * 1000);

        return traces;

    } catch (err) {
        console.error("Error at", website + ": ", err);
        if (browser) browser.close();
        return null;
    }

}

function ProcessCliArguments(args) {
    assert(typeof(args) == "object");

    if (args.length !== 1) return null;

    let target = args[0];

    const httpPrefix = /https?:\/\//;
    if (!httpPrefix.test(target)) target = "https://" + target;

    if (!IsValidHttpUrl(target)) return null;

    return target;
}

function Usage() {
    console.log("Usage: node app.js <targetURL>");
    console.log("    targetURL\t\tThe URL of the website to crawl\n");
    console.log("Read the documentation for more information.")
    return 0;
}

/****** Main ******/

(async function main() {

    try {

        const args = ProcessCliArguments(process.argv.slice(2));
        if (!args) return Usage();

        console.log("Application Started: [", new Date().toLocaleString(), "]\n");

        const target = args;
        const label = (new URL(target)).hostname;

        const dir = Storage.GetTracesDir(label, __dirname + config.outputPath);

        console.log("[INFO] Crawling", target);
        const traces = await CollectTraces(target, label);

        if (traces) {
            await Storage.StoreTraces(traces, dir);
            console.log("[INFO] Process complete");

            process.exit(0);   // <-- SUCCESS
        } else {
            console.log("[ERROR] No traces collected");
            process.exit(1);   // <-- FAILURE
        }

    } catch (e) {
        console.error("Fatal error:", e);
        console.error("Exiting...");
        process.exit(1);       // <-- FAILURE
    }

})();