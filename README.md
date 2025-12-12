## Website Cookie Preference Compliance: A Large-Scale Audit of Post-Rejection Tracking

We extended the original ConsentGuard tool by developing an **automated and fault-tolerant analysis pipeline** to support large-scale evaluation of websites’ compliance with user cookie preferences.

Our contributions include:

* **Automated large-scale crawling and analysis**  
  We implemented a Python-based automation script that reads a list of websites from an external dataset and orchestrates the execution of the existing Crawler and Detector modules in a fully automated, batch-oriented manner. This enables scalable measurements across hundreds of websites without manual intervention.

* **Automated consent-based testing workflow**  
  The automation pipeline supports systematic testing under predefined consent configurations (e.g., “Reject All”), allowing quantitative comparison of tracking behavior across websites under consistent user preference settings.

* **Failure handling and retry mechanisms**  
  To improve robustness, we introduced explicit retry and error-handling logic for both the crawling and detection stages. Websites that fail due to transient issues (e.g., network errors or crashes) are retried automatically, while persistent failures are skipped safely without interrupting the overall experiment.

* **Automated result aggregation and reporting**  
  We added inline result parsing to extract detected tracking violations, including ID leaking, cookie synchronization, and browser fingerprinting. The results are automatically aggregated and exported into a structured spreadsheet for further quantitative analysis.

These extensions were built on top of the official ConsentGuard codebase and aim to improve reproducibility, scalability, and robustness in real-world cookie preference compliance measurements.

### Team Members

- **Zexin Lyu** (zexinlyu)  
- **Jessica He** (jhe3)  
- **Jianwen Li** (jianwenl)  
