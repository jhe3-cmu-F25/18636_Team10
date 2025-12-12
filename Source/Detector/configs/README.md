# About

This directory contains data necessary for the analysis module to run. It affects the behavior of this module, as well as, the detected violations

---
### commonCookies.json

This is a list of values which are commonly found in cookies. These values cannot uniquely identify users and should therefore be excluded from the analysis process. This list was created manually.

---
### commonFileTypes.json

This is a list of file extensions. If a cookie value is a path or a file name ending in one of these extensions then it should be ignored. Such values cannot uniquely identify users.

---
### fingerPrintingFuncs.json

This is a list of functions that perform browser fingerprinting. This list was created by analysing the code of [**FingerprintJS**](https://github.com/fingerprintjs/fingerprintjs), one of the most popular browser fingerprinting libraries. The code of the file that was originally analysed can be found [**here**](https://github.com/fingerprintjs/fingerprintjs/blob/4d83d68b8b9c3dfb5b2c5eb8a29455f26a509f7a/fingerprint2.js).

Version Info:
* **Commit**: 4d83d68b8b9c3dfb5b2c5eb8a29455f26a509f7a
* **Date**: 15 Sep 2020

---
### io.json

Contains the file names of the collected data as well as the name of the output file.