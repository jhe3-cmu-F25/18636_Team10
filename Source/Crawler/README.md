# About

This module is responsible for visiting the landing page of a website and emulating a real user. It stores, for each website, a Cookiejar (for both first-party and third-party cookies), HTTP(S) requests, JS function calls and CMP info.

# Execution

In order to crawl a website and collect data:
```bash
cd Source/Crawler
node app <website_url>
```

When the crawler is over, the collected data will be stored in `../Results/`. The output directory can be configured in the `configs/puppeteer.json` file and specifically through the `outputPath` parameter.

# Collected Data

### HTTP(S) Requests
* Request ID
* Custom ID (serial number assigned incrementally)
* Timestamp (generic date-time and UNIX-like timestamp)
* Browser frame information (*if available*)
* Headers
* Is Navigation Request Flag
* Method
* POST Data (*if available*)
* Redirection Chain Length
* Resource Type
* URL

### Cookies
* Name
* Value
* Domain
* Path
* Expiration
* Size
* HTTP Only flag
* Secure flag
* Session Flag
* Same party flag

**Please note that first-party and third-party cookies are stored in different files**.

### JS Functions
* ID
* Function name
* Script ID
* Script URL
* Line number (*if available*)
* Column number (*if available*)
* Hit cout
* Children IDs

# Module Structure

```
.
├── configs/
├── driver/
├── helpers/
├── scrapers/
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

* **configs**: Contains configuration files that affect the behavior of the crawling application. Parameters about the crawling process, as well as, storage options can be configured there.
* **driver**: Source code of the main component of this application. This component is responsible for initializing the instrumented browser instance, visiting the website, scraping data from it and then finally storing collected data.
* **helpers**: Source code of helper functions.
* **scrapers**: Source code of the components responsible for collecting data from the visited website. These "scrapers" are responsible for extracting cookies, observing network traffic, etc.