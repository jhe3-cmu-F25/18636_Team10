# About

This module is used to perform an offline analysis on the collected data. It examines stored cookies and application-level network traffic in order to detect First-party ID leaking and ID synchronization. Additionally, it utilizes JavaScript call frames to detect Browser Fingerprinting.

# Execution

To perform an offline analysis on the collected data:
```bash
cd Source/Detector
node app <data_directory>
```

When the application is over, the file `result.json` will be created and will contain the results of the analysis. The output file can be configured through the `configs/io.json` file.

# Output file

The output file contains the following fields:

* **path**: Path of processed data.
* **visitedWebsite**: URL of the landing page.
* **idLeaking**: Detected cases of first-party ID leaking.
    * **cookie**: The name of the cookie that stored the leaked ID.
    * **value**: The value of the cookie (i.e. the leaked identifier).
    * **domain**: The domain of the cookie that stored the leaked ID.
    * **associated3rdParties**: The third-parties that received the leaked identifier.
    * **sent**: The URLs of the network requests that leaked the identifier.
* **cookieSync**: Detected cases of third-party ID synchronization.
    * **cookie**: The name of the cookie that stored the leaked ID.
    * **value**: The value of the cookie (i.e. the leaked identifier).
    * **domain**: The domain of the cookie that stored the leaked ID.
    * **associated3rdParties**: The third-parties that received the leaked identifier.
    * **sent**: The URLs of the network requests that leaked the identifier.
* **fingerprinting**: Detected browser fingerprinting functions.
    * **status**: Flag to indicate if a browser fingerprinting function was detected.
    * **functions**: List of detected browser fingerprinting functions.
* **thirdParties**: Third-parties with which the website interacted.

# Module Structure

```
.
├── configs/
├── detectors/
├── helpers/
├── app.js
└── README.md
```

* **configs**: Contains configuration files that affect the behavior of the analysis process.
* **detectors**: Source code of the component responsible for detecting violatios. This component detects First-party ID leaking, ID Synchronization and Browser fingerprinting. Additional violations can be detected by implementing new detectors in this directory.
* **helpers**: Source code of helper functions.