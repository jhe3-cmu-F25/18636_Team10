import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set plotting style
sns.set_theme(style="whitegrid")

# Define the input file path
# NOTE: Ensure you place your Result.xlsx file in the root of your repo 
# or update this path accordingly.
INPUT_FILE = "Result.xlsx" 
OUTPUT_DIR = "analysis_results"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_data(file_path):
    """Loads data from the Excel file."""
    try:
        # Use the correct engine for Excel files
        df = pd.read_excel(file_path)
        # Clean up column names by stripping whitespace
        df.columns = df.columns.str.strip()
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def calculate_metrics(df):
    """Calculates core compliance and violation metrics."""
    
    total_sites = len(df)
    
    # 1. Compliance Metrics
    # The 'Is_Compliant' column is a boolean (True/False)
    compliant_sites = df['Is_Compliant'].sum()
    non_compliant_sites = total_sites - compliant_sites
    compliance_rate = compliant_sites / total_sites
    non_compliance_rate = non_compliant_sites / total_sites
    
    # 2. Violation Distribution
    total_violations = df['Total_Violations'].sum()
    id_leaking_total = df['ID_Leaking_Count'].sum()
    cookie_sync_total = df['Cookie_Sync_Count'].sum()
    fingerprinting_total = df['Fingerprinting_Count'].sum()
    
    # 3. Average Violations
    avg_violations_per_site = df['Total_Violations'].mean()
    # Calculate average violations only for non-compliant sites
    non_compliant_df = df[df['Is_Compliant'] == False]
    avg_violations_non_compliant = non_compliant_df['Total_Violations'].mean() if not non_compliant_df.empty else 0
    
    # 4. Violation Type Percentages
    violation_counts = {
        'ID Leaking': id_leaking_total,
        'Cookie Sync': cookie_sync_total,
        'Fingerprinting': fingerprinting_total
    }
    violation_series = pd.Series(violation_counts)
    violation_percentages = (violation_series / total_violations) * 100
    
    metrics = {
        'Total Sites': total_sites,
        'Compliant Sites': compliant_sites,
        'Non-Compliant Sites': non_compliant_sites,
        'Compliance Rate (%)': compliance_rate * 100,
        'Non-Compliance Rate (%)': non_compliance_rate * 100,
        'Total Violations Detected': total_violations,
        'Avg Violations (All Sites)': avg_violations_per_site,
        'Avg Violations (Non-Compliant)': avg_violations_non_compliant,
        'ID Leaking Total': id_leaking_total,
        'Cookie Sync Total': cookie_sync_total,
        'Fingerprinting Total': fingerprinting_total,
        'ID Leaking (%)': violation_percentages.get('ID Leaking', 0),
        'Cookie Sync (%)': violation_percentages.get('Cookie Sync', 0),
        'Fingerprinting (%)': violation_percentages.get('Fingerprinting', 0)
    }
    
    return metrics

def generate_visualizations(df, metrics):
    """Generates and saves key visualizations."""
    
    # --- 1. Compliance Rate Pie Chart ---
    compliance_data = df['Is_Compliant'].value_counts()
    labels = ['Compliant', 'Non-Compliant']
    sizes = [compliance_data.get(True, 0), compliance_data.get(False, 0)]
    colors = ['#4CAF50', '#FF5722'] # Green for compliant, Red for non-compliant
    
    plt.figure(figsize=(8, 8))
    plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90,
            wedgeprops={'edgecolor': 'black', 'linewidth': 1})
    plt.title(f'Overall Compliance Rate (N={len(df)})', fontsize=16)
    plt.savefig(os.path.join(OUTPUT_DIR, 'compliance_rate_pie.png'))
    plt.close()
    
    # --- 2. Violation Type Distribution Bar Chart ---
    violation_types = pd.DataFrame({
        'Type': ['ID Leaking', 'Cookie Sync', 'Fingerprinting'],
        'Count': [metrics['ID Leaking Total'], metrics['Cookie Sync Total'], metrics['Fingerprinting Total']]
    })
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Type', y='Count', data=violation_types, palette=['#004B87', '#C41E3A', '#FFC300'])
    plt.title('Distribution of Tracking Violation Types', fontsize=16)
    plt.ylabel('Total Count of Violations', fontsize=12)
    plt.xlabel('Violation Type', fontsize=12)
    plt.savefig(os.path.join(OUTPUT_DIR, 'violation_type_bar.png'))
    plt.close()
    
    # --- 3. Severity Ranking (Top 10 Non-Compliant Sites) ---
    non_compliant_df = df[df['Is_Compliant'] == False].sort_values(by='Total_Violations', ascending=False).head(10)
    
    plt.figure(figsize=(12, 7))
    sns.barplot(x='Total_Violations', y='Website', data=non_compliant_df, palette='Reds_d')
    plt.title('Top 10 Most Non-Compliant Websites (Severity Ranking)', fontsize=16)
    plt.xlabel('Total Violations Detected', fontsize=12)
    plt.ylabel('Website', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'severity_ranking_bar.png'))
    plt.close()
    
    return [
        os.path.join(OUTPUT_DIR, 'compliance_rate_pie.png'),
        os.path.join(OUTPUT_DIR, 'violation_type_bar.png'),
        os.path.join(OUTPUT_DIR, 'severity_ranking_bar.png')
    ]

def main():
    df = load_data(INPUT_FILE)
    
    if df is None or df.empty:
        print("Analysis failed: Data is empty or could not be loaded.")
        return
    
    print(f"Successfully loaded {len(df)} rows of data.")
    
    metrics = calculate_metrics(df)
    
    # Save metrics to a file for the report
    with open(os.path.join(OUTPUT_DIR, 'metrics_summary.txt'), 'w') as f:
        for key, value in metrics.items():
            f.write(f"{key}: {value}\n")
            
    print("Metrics calculated and saved.")
    
    image_paths = generate_visualizations(df, metrics)
    print(f"Visualizations generated: {image_paths}")
    
    # Save the processed DataFrame (optional, but good practice)
    df.to_csv(os.path.join(OUTPUT_DIR, 'processed_data.csv'), index=False)
    
    print("Analysis complete.")
    
if __name__ == "__main__":
    main()
