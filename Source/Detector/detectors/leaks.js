"use strict";

/****** Dependencies ******/

const assert = require("assert");
const Cookies = require(__dirname + "/../helpers/cookies.js");
const Requests = require(__dirname + "/../helpers/requests.js");
const Utils = require(__dirname + "/../helpers/utils.js");

/****** Functions ******/

function IsCrossDomain(cookie, req, firstParty) {
    assert(Cookies.IsCookieValid(cookie));
    assert(Requests.IsRequestValid(req));

    let domain = Cookies.GetCookieDomain(cookie);
    assert(typeof(domain) == "string" && domain.length);

    let receivingDomain = Utils.ExtractHostname(req.url);
    assert(receivingDomain.length > 0);

    let isCrossDomain = !Utils.AreSameDomain(domain, receivingDomain);

    /* If the user specified a first party then we need to ensure that not only
     * is the request cross-domain but it is not towards the first party */
    if (typeof(firstParty) === "string" && firstParty.length > 0) {
        return (
            isCrossDomain &&
            !Utils.AreSameDomain(firstParty, receivingDomain)
        );
    }

    return isCrossDomain;
}

function SearchForCookieValues(cookieValues, params) {
    assert(typeof(cookieValues) == "object");
    assert(typeof(params) == "object");

    /* No need to iterate over lists if either of them is empty */
    if (cookieValues.length === 0 || params.length === 0) return [];

    /* There are multiple ways to search for cookie values. The most straight
     * forward is to look for exact matches (i.e. we accept only cookie values
     * that can be found as an exact search parameter). In that case, use the
     * code:
     *
     * return cookieValues.filter(x => params.includes(x));
     *
     * Alternatively, you might want to search for substrings (i.e. we accept
     * cookies which are substrings in search parameters). This is very useful
     * for cases where the search parameters are complex strings or JSON objects
     * e.g.
     *
     * Cookie Name: TrackingUserID
     * Cookie Value: 123456789
     *
     * Request: https://tracker.com/path?data=%7Bid%3D123456789%7D
     * Search params: 'data' => '{id=123456789}'
     */

    return cookieValues.filter(n => {
        for(var i = 0; i < params.length; ++i) {
            if (params[i].includes(n)) return true; /* Search inside strings */
        }
        return false;
    });
}

function IsPartOfGetRequest(cookieValues, req) {
    assert(typeof(cookieValues) == "object");
    assert(Requests.IsRequestValid(req));

    /* For GET requests search for cookie values in the search parameters of the
     * URL. If there are no such parameters search for custom ones using a
     * different delimiter. */
    let params = Requests.GetUrlParams(req.url);
    if (params.length == 0) params = Requests.GetCustomUrlParams(req.url);

    return SearchForCookieValues(cookieValues, params).length > 0;
}

function IsPartOfPostRequest(cookieValues, req) {
    assert(typeof(cookieValues) == "object");
    assert(Requests.IsRequestValid(req));

    /* Ignore POST requests without data */
    if (req.postData === undefined || req.postData === null) return false;

    let params = [];

    /* For POST requests examine the type of data. If it is a JSON object then
     * search for cookie values in the values of the object. If it is a URI then
     * search for cookie values in the search parameters (like in GET requests).
     * Otherwise, treat the data as a string and search in there. This behavior
     * is necessary to ensure that we limit false positives. We don't want to
     * look for cookie values in keys of JSON objects or search parameters
     * becauses these keys contain common keywords.
     */
    if (Utils.IsJson(req.postData)) params = Utils.GetJsonValues(req.postData);
    else if (Utils.IsUri(req.postData)) params = Requests.GetUrlParams(req.postData);
    else params.push(req.postData);

    return SearchForCookieValues(cookieValues, params).length > 0;
}

function IsPartOfRefererHeader(cookieValues, req) {
    assert(typeof(cookieValues) == "object");
    assert(Requests.IsRequestValid(req));

    if (!req.headers.referer) return false;

    /* For the Referer header search for cookie values only in the search
     * parameters (like in GET requests). */
    let params = Requests.GetUrlParams(req.headers.referer);

    return SearchForCookieValues(cookieValues, params).length > 0;
}

function IsPartOfRequest(cookie, req) {
    assert(Cookies.IsCookieValid(cookie));
    assert(Requests.IsRequestValid(req));

    let cookieValues = Cookies.ExtractCookieValues(cookie.value);

    let bool = (
        IsPartOfGetRequest(cookieValues, req) ||
        IsPartOfPostRequest(cookieValues, req) ||
        IsPartOfRefererHeader(cookieValues, req)
    );

    return bool;
}

function IsCookieLeak(cookie, packet, firstParty) {
    assert(Cookies.IsCookieValid(cookie));
    assert(Requests.IsRequestValid(packet));

    /* Decide wether the cookie has been leaked. We only consider cases where:
     *
     * 1. The value beeing leaked is not a common value that cannot uniquely
     *    identify users
     * 2. The cookie being leaked is not a cookie that stores the consent of the
     *    user. Such cookies can and should be sent to other parties.
     * 3. The request is valid.
     * 4. The cookie value is sent to a domain different than the one that set
     *    the cookie.
     * 5. The cookie value can be found inside the request (URL params, referer
     *    header, post data).
     */
    return (
        !Cookies.IsCommonCookieValue(cookie.value) &&
        !Cookies.IsConsentCookie(cookie.name) &&
        Requests.IsActualRequest(packet.url) &&
        IsCrossDomain(cookie, packet, firstParty) &&
        IsPartOfRequest(cookie, packet)
    );
}

function ProcessSentCookieLeak(cookie, req, results) {
    assert(Cookies.IsCookieValid(cookie));
    assert(Requests.IsRequestValid(req));
    assert(typeof(results) == "object");

    //let url = req.method + ":" + req.url.substr(0, 300);
    let url = "[" + req.method + "] " + req.url;
    let thirdParty = Utils.ExtractHostname(req.url);

    /* Examine whether this exact cookie has already been sent to another domain */
    let entry = results.find(e => e.cookie == cookie.name && e.value == cookie.value );

    if (entry) {
        if (!entry.sent.includes(url)) entry.sent.push(url);
        if (!entry.associated3rdParties.includes(thirdParty)) entry.associated3rdParties.push(thirdParty);
    } else {

        let newEntry = {
            "cookie" : cookie.name,
            "value" : cookie.value,
            "domain": cookie.domain,
            "associated3rdParties" : [ thirdParty ],
            "sent" : [ url ]
        };

        /* Enable the following line if you want to examine the identified
         * cookie values. To hold them in a separate file run the following:
         * node app.js 2> cookies.txt
         *
         * console.error(cookie.value);
         */
        results.push(newEntry);
    }

    /* Return true if you want to stop searching for this specific cookie in
     * other requests, false otherwise */
    return false;
}

function CookieLeak(cookies, requests, firstParty) {
    assert(typeof(cookies) == "object");
    assert(typeof(requests) == "object");

    let results = [];

    cookies.forEach(cookie => {
        assert(Cookies.IsCookieValid(cookie));

        /* If the cookie is not important there is no need to check it against
         * all requests */
        if (Cookies.IsCommonCookieValue(cookie.value) ||
            Cookies.IsConsentCookie(cookie.name)) return;

        requests.some(req => {
            assert(Requests.IsRequestValid(req));
            if (IsCookieLeak(cookie, req, firstParty)) return ProcessSentCookieLeak(cookie, req, results);
        });
    });

    return results;
}

/* ID leaking: a first-party alias is leaked from the visited website to
 * different third-parties. */
function IdLeaking(cookies, requests) {
    assert(typeof(cookies) == "object");
    assert(typeof(requests) == "object");

    return CookieLeak(cookies, requests);
}

/* Cookie Synchronization: third-parties link together the different third-party
 * aliases they use for the same user. */
function CookieSynchronization(cookies, requests, firstParty) {
    assert(typeof(cookies) == "object");
    assert(typeof(requests) == "object");
    assert(typeof(firstParty) == "string" && firstParty.length > 0);

    return CookieLeak(cookies, requests, firstParty);
}

/****** Exports ******/

module.exports = {
    IdLeaking,
    CookieSynchronization
}