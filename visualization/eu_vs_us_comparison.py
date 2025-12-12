import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 11

EU_TLDS = [
    '.uk', '.de', '.fr', '.es', '.it', '.nl', '.be', '.pl', '.se', '.dk',
    '.fi', '.no', '.ie', '.at', '.pt', '.cz', '.gr', '.hu', '.ro', '.eu'
]

EU_DOMAINS = [
    'bbc.', 'theguardian.', 'telegraph.', 'dailymail.',
    'spiegel.', 'bild.',
    'lemonde.', 'lefigaro.',
    'elpais.', 'elmundo.',
    'corriere.', 'repubblica.',
]


def classify_region(domain):
    domain_lower = domain.lower()
    for tld in EU_TLDS:
        if domain_lower.endswith(tld):
            return 'EU'
    for eu_domain in EU_DOMAINS:
        if eu_domain in domain_lower:
            return 'EU'
    return 'US'


def load_and_classify_data():
    df = pd.read_excel('Result.xlsx')
    df = df.rename(columns={
        'ID_Leaking_Count': 'ID_Leaking',
        'Cookie_Sync_Count': 'Cookie_Sync',
        'Fingerprinting_Count': 'Fingerprinting',
        'Is_Compliant': 'Compliant'
    })
    df['Compliant'] = df['Compliant'].map({True: 'Yes', False: 'No'})
    df['Region'] = df['Website'].apply(classify_region)
    return df


def create_comparison_visualizations(df):
    output_dir = Path('visualization')
    output_dir.mkdir(exist_ok=True)

    eu_df = df[df['Region'] == 'EU']
    us_df = df[df['Region'] == 'US']

    eu_compliant_pct = len(eu_df[eu_df['Compliant'] == 'Yes']) / len(eu_df) * 100
    us_compliant_pct = len(us_df[us_df['Compliant'] == 'Yes']) / len(us_df) * 100
    eu_noncompliant_pct = 100 - eu_compliant_pct
    us_noncompliant_pct = 100 - us_compliant_pct

    fig, ax = plt.subplots(figsize=(14, 10))
    ax.axis('tight')
    ax.axis('off')

    summary_data = [
        ['Metric', 'EU', 'US', 'Difference'],
        ['', '', '', ''],
        ['Total Websites', f'{len(eu_df)}', f'{len(us_df)}', f'{len(us_df) - len(eu_df):+d}'],
        ['', '', '', ''],
        ['Compliant Websites',
         f'{len(eu_df[eu_df["Compliant"] == "Yes"])} ({eu_compliant_pct:.1f}%)',
         f'{len(us_df[us_df["Compliant"] == "Yes"])} ({us_compliant_pct:.1f}%)',
         f'{us_compliant_pct - eu_compliant_pct:+.1f}%'],
        ['Non-Compliant Websites',
         f'{len(eu_df[eu_df["Compliant"] == "No"])} ({eu_noncompliant_pct:.1f}%)',
         f'{len(us_df[us_df["Compliant"] == "No"])} ({us_noncompliant_pct:.1f}%)',
         f'{us_noncompliant_pct - eu_noncompliant_pct:+.1f}%'],
        ['', '', '', ''],
        ['Avg Violations per Website',
         f'{eu_df["Total_Violations"].mean():.2f}',
         f'{us_df["Total_Violations"].mean():.2f}',
         f'{us_df["Total_Violations"].mean() - eu_df["Total_Violations"].mean():+.2f}'],
        ['', '', '', ''],
        ['Avg ID Leaking',
         f'{eu_df["ID_Leaking"].mean():.2f}',
         f'{us_df["ID_Leaking"].mean():.2f}',
         f'{us_df["ID_Leaking"].mean() - eu_df["ID_Leaking"].mean():+.2f}'],
        ['Avg Cookie Sync',
         f'{eu_df["Cookie_Sync"].mean():.2f}',
         f'{us_df["Cookie_Sync"].mean():.2f}',
         f'{us_df["Cookie_Sync"].mean() - eu_df["Cookie_Sync"].mean():+.2f}'],
        ['Avg Fingerprinting',
         f'{eu_df["Fingerprinting"].mean():.2f}',
         f'{us_df["Fingerprinting"].mean():.2f}',
         f'{us_df["Fingerprinting"].mean() - eu_df["Fingerprinting"].mean():+.2f}'],
    ]

    table = ax.table(cellText=summary_data, cellLoc='center',
                     colWidths=[0.4, 0.2, 0.2, 0.2],
                     loc='center',
                     bbox=[0, 0, 1, 1])

    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1, 2)

    for i, cell in enumerate(table.get_celld().values()):
        row = i // 4
        col = i % 4

        if row == 0:
            cell.set_facecolor('#3498db')
            cell.set_text_props(weight='bold', color='white', size=13)
            cell.set_height(0.08)
        elif summary_data[row][0] == '':
            cell.set_facecolor('#bdc3c7')
            cell.set_height(0.03)
        elif col == 0:
            cell.set_facecolor('#ecf0f1')
            cell.set_text_props(weight='bold')
        elif col == 1:
            cell.set_facecolor('#d6eaf8')
        elif col == 2:
            cell.set_facecolor('#fdebd0')
        else:
            cell.set_facecolor('#e8f8f5')

        cell.set_edgecolor('black')
        cell.set_linewidth(1)

    plt.title('EU vs US Compliance Comparison Summary\n(Reject All Scenario)',
              fontsize=16, fontweight='bold', pad=20)

    plt.savefig(output_dir / 'eu_vs_us_summary_table.png', dpi=300, bbox_inches='tight')
    plt.close()


def main():
    df = load_and_classify_data()
    create_comparison_visualizations(df)
    output_file = Path('visualization/result250_with_regions.csv')
    df.to_csv(output_file, index=False)


if __name__ == '__main__':
    main()
