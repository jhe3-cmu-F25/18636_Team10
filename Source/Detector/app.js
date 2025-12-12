"use strict";

/****** Dependencies ******/

const assert = require("assert");
const fs     = require("fs");

const { IdLeaking, CookieSynchronization } = require(__dirname + "/detectors/leaks.js")
const { GetThirdParties } = require(__dirname + "/detectors/thirdParties.js");
const { GetFingerprinting } = require(__dirname + "/detectors/fingerprinting.js");
const { LoadData, StoreData } = require(__dirname + "/helpers/storage.js");

const config = require(__dirname + "/configs/io.json");

/****** Functions ******/

function Analyse(dir) {
    assert(typeof(dir) == "string" && dir.length > 0);

    try {
        const cookies      = LoadData(dir + config.cookiesFile);
        const thirdCookies = LoadData(dir + config.thirdPartyCookiesFile);
        const requests     = LoadData(dir + config.requestsFile);
        const usedFuncs    = LoadData(dir + config.functionsFile);
        const websiteInfo  = LoadData(dir + config.websiteFile);
        console.log("[INFO] Loaded data");

        let visitedWebsite = websiteInfo.landingWebsite;
        let idLeaking = [];
        let cookieSync = [];

        let firstParty = visitedWebsite;

        /* Some websites do not store cookies. These are not involved in ID
         * Leaking as defined in the paper. */
        if (cookies.length > 0 && cookies[0].domain) {
            idLeaking = IdLeaking(cookies, requests);

            firstParty = ( (cookies[0].domain.startsWith(".")) ? cookies[0].domain.substr(1) : cookies[0].domain );
            assert(!firstParty.startsWith("."));
            cookieSync = CookieSynchronization(thirdCookies, requests, firstParty);

        }

        let fingerprints = GetFingerprinting(usedFuncs);
        let thirdParties = GetThirdParties(requests, firstParty);

        return {
            "visitedWebsite": visitedWebsite,
            "idLeaking": idLeaking,
            "cookieSync": cookieSync,
            "fingerprinting": fingerprints,
            "thirdParties": thirdParties
        };

    } catch(error) {
        console.error("Operation failed for", dir + ":", error);

        return {
            "error": String(error)
        };
    }
}

function PrintViolationsInfo(violations) {
    assert(typeof(violations) == "object");
    assert(typeof(violations.idLeaking) == "object");
    assert(typeof(violations.cookieSync) == "object");
    assert(typeof(violations.fingerprinting) == "object");
    assert(typeof(violations.fingerprinting.functions) == "object");
    assert(typeof(violations.thirdParties) == "object");

    console.log("[INFO] Detected", violations.idLeaking.length, "first-party ID leaking violations");
    console.log("[INFO] Detected", violations.cookieSync.length, "third-party ID synchronization violations");
    console.log("[INFO] Detected", violations.fingerprinting.functions.length, "browser fingerprinting functions");
    console.log("[INFO] Found network traffic towards", violations.thirdParties.length, "third-parties");
}

async function ProcessWebsite(targetDir) {
    assert(typeof(targetDir) == "string" && targetDir.length);

    let websiteData = { "path": targetDir };
    const violations = Analyse(targetDir);

    PrintViolationsInfo(violations);

    return Object.assign(websiteData, violations);
}

function ProcessCliArguments(args) {
    assert(typeof(args) == "object");

    if (args.length !== 1) return null;

    let target = args[0];
    if (!fs.existsSync(target)) return null;

    return target;
}

function Usage() {
    console.log("Usage: node app.js <directory>");
    console.log("    directory\t\tThe directory with the data that will be processed\n");
    console.log("Read the documentation for more information.")
    return 0;
}

/****** Main ******/

(async function main() {
    try {
        const args = ProcessCliArguments(process.argv.slice(2));
        if (!args) {
            Usage();
            process.exit(1);
        }

        console.log("Application Started: [", new Date().toLocaleString(), "]\n");

        console.log("[INFO] Processing", args);
        const data = await ProcessWebsite(args);

        if (data.error) {
            console.error("[ERROR] Detector failed:", data.error);
            process.exit(1);    // Failure
        }

        console.log("[INFO] Processed website");

        const outputPath = args + "/result.json";
        StoreData(outputPath, data);
        console.log("[INFO] Stored data to", outputPath);

        process.exit(0);        // Success

    } catch (e) {
        console.error("Fatal error:", e);
        console.error("Exiting...");
        process.exit(1);         // Failure
    }

})();
