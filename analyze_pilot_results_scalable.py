import json
import os
import pandas as pd

# --- ASSUMPTION ---
# This script assumes that the Consent-Guard Detector has been modified 
# to save the 'result.json' file directly into the website's data directory 
# (e.g., /home/ubuntu/consent-guard/Source/Results/www_bbc_com/result.json)
# ------------------

# Define the base directory where the raw Consent-Guard results are stored
BASE_DIR = "raw_consent_guard_output/" # You would clone the Consent-Guard results here

# List of websites crawled (example list)
WEBSITES = [
    "www_bbc_com",
    "www_theguardian_com",
    "www_amazon_co_uk"
]

def parse_results_scalable():
    """
    Parses the result.json file for each website and aggregates the compliance data.
    Reads violation counts directly from the JSON structure.
    """
    data = []
    
    for site_dir in WEBSITES:
        # Construct the expected path for the result.json file
        result_path = os.path.join(BASE_DIR, site_dir, "result.json")
        
        if not os.path.exists(result_path):
            print(f"Warning: result.json not found for {site_dir}. Skipping.")
            continue
            
        try:
            with open(result_path, 'r') as f:
                result_data = json.load(f)
                
            # Extract violation counts from the JSON structure
            id_leaking = result_data.get("idLeaking", 0)
            cookie_sync = result_data.get("cookieSync", 0)
            fingerprinting = result_data.get("fingerprinting", 0)
            
            total_violations = id_leaking + cookie_sync + fingerprinting
            
            site_data = {
                "Website": site_dir.replace("www_", "").replace("_", "."),
                "ID_Leaking_Count": id_leaking,
                "Cookie_Sync_Count": cookie_sync,
                "Fingerprinting_Count": fingerprinting,
                "Total_Violations": total_violations,
                "Is_Compliant": total_violations == 0
            }
            
            data.append(site_data)
            
        except json.JSONDecodeError:
            print(f"Error decoding JSON for {site_dir}. Skipping.")
        except Exception as e:
            print(f"An unexpected error occurred for {site_dir}: {e}")

    return pd.DataFrame(data)

if __name__ == "__main__":
    df = parse_results_scalable()
    
    if not df.empty:
        output_csv_path = "pilot_compliance_data_scalable.csv"
        df.to_csv(output_csv_path, index=False)
        
        print(f"Aggregated data saved to {output_csv_path}")
        print("\n--- Compliance Summary ---")
        print(df)
    else:
        print("No data processed. Check your BASE_DIR and WEBSITES list.")
