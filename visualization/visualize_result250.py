import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 11


def load_data():
    df = pd.read_excel('Result.xlsx')
    df = df.rename(columns={
        'ID_Leaking_Count': 'ID_Leaking',
        'Cookie_Sync_Count': 'Cookie_Sync',
        'Fingerprinting_Count': 'Fingerprinting',
        'Is_Compliant': 'Compliant'
    })
    df['Compliant'] = df['Compliant'].map({True: 'Yes', False: 'No'})
    return df


def create_visualizations(df):
    output_dir = Path('visualization')
    output_dir.mkdir(exist_ok=True)

    # 1. Compliance Overview - Bar Chart
    fig, ax = plt.subplots(figsize=(10, 6))
    compliance_counts = df['Compliant'].value_counts()
    colors = ['#2ecc71', '#e74c3c']
    bars = ax.bar(compliance_counts.index, compliance_counts.values, color=colors, alpha=0.8, edgecolor='black', linewidth=1.5)
    ax.set_xlabel('Compliance Status', fontsize=14, fontweight='bold')
    ax.set_ylabel('Number of Websites', fontsize=14, fontweight='bold')
    ax.set_title('Cookie Consent Compliance Overview\n(Reject All Scenario, N=222)',
                 fontsize=16, fontweight='bold', pad=20)
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}\n({height/len(df)*100:.1f}%)',
                ha='center', va='bottom', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_dir / 'compliance_overview.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 2. Violation Types Distribution - Bar Chart
    fig, ax = plt.subplots(figsize=(12, 7))
    violation_data = df[['ID_Leaking', 'Cookie_Sync', 'Fingerprinting']].sum()
    colors_violations = ['#e74c3c', '#f39c12', '#9b59b6']
    bars = ax.bar(violation_data.index, violation_data.values, color=colors_violations, alpha=0.8, edgecolor='black', linewidth=1.5)
    ax.set_xlabel('Violation Type', fontsize=14, fontweight='bold')
    ax.set_ylabel('Total Count Across All Websites', fontsize=14, fontweight='bold')
    ax.set_title('Distribution of GDPR Violation Types\n(Reject All Scenario, N=222)',
                 fontsize=16, fontweight='bold', pad=20)
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_dir / 'violation_types_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 3. Top 20 Violators - Horizontal Bar Chart
    fig, ax = plt.subplots(figsize=(12, 10))
    top_violators = df.nlargest(20, 'Total_Violations')[['Website', 'Total_Violations']].sort_values('Total_Violations')
    bars = ax.barh(top_violators['Website'], top_violators['Total_Violations'],
                   color='#e74c3c', alpha=0.7, edgecolor='black', linewidth=1)
    ax.set_xlabel('Total Violations', fontsize=14, fontweight='bold')
    ax.set_ylabel('Website', fontsize=14, fontweight='bold')
    ax.set_title('Top 20 Websites by Total GDPR Violations\n(Reject All Scenario, N=222)',
                 fontsize=16, fontweight='bold', pad=20)
    for i, (bar, val) in enumerate(zip(bars, top_violators['Total_Violations'])):
        ax.text(val + 0.5, bar.get_y() + bar.get_height()/2.,
                f'{int(val)}',
                ha='left', va='center', fontsize=10, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_dir / 'top_violators_ranking.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 4. Violation Type Breakdown - Stacked Horizontal Bar for Top 15
    fig, ax = plt.subplots(figsize=(14, 10))
    top15_temp = df.nlargest(15, 'Total_Violations')[['Website', 'ID_Leaking', 'Cookie_Sync', 'Fingerprinting', 'Total_Violations']]
    top15 = top15_temp.sort_values('Total_Violations')
    y_pos = range(len(top15))
    p1 = ax.barh(y_pos, top15['ID_Leaking'], color='#e74c3c', label='ID Leaking', alpha=0.8, edgecolor='black', linewidth=0.5)
    p2 = ax.barh(y_pos, top15['Cookie_Sync'], left=top15['ID_Leaking'],
                 color='#f39c12', label='Cookie Sync', alpha=0.8, edgecolor='black', linewidth=0.5)
    p3 = ax.barh(y_pos, top15['Fingerprinting'],
                 left=top15['ID_Leaking'] + top15['Cookie_Sync'],
                 color='#9b59b6', label='Fingerprinting', alpha=0.8, edgecolor='black', linewidth=0.5)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(top15['Website'])
    ax.set_xlabel('Number of Violations', fontsize=14, fontweight='bold')
    ax.set_ylabel('Website', fontsize=14, fontweight='bold')
    ax.set_title('Top 15 Violators: Breakdown by Violation Type\n(Reject All Scenario, N=222)',
                 fontsize=16, fontweight='bold', pad=20)
    ax.legend(loc='lower right', fontsize=12, framealpha=0.9)
    plt.tight_layout()
    plt.savefig(output_dir / 'violation_breakdown_top15.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 5. Compliance Rate by Violation Severity - Pie Chart
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    compliance_counts = df['Compliant'].value_counts()
    colors_pie = ['#2ecc71', '#e74c3c']
    explode = (0.1, 0)
    wedges1, texts1, autotexts1 = ax1.pie(compliance_counts.values, labels=compliance_counts.index,
                                            autopct='%1.1f%%',
                                            colors=colors_pie, explode=explode, startangle=90,
                                            textprops={'fontsize': 12, 'fontweight': 'bold'},
                                            wedgeprops={'edgecolor': 'black', 'linewidth': 1.5})
    ax1.set_title('Overall Compliance Status\n(Reject All Scenario, N=222)',
                  fontsize=14, fontweight='bold', pad=15)

    def categorize_severity(violations):
        if violations == 0:
            return 'Compliant (0)'
        elif violations <= 2:
            return 'Low (1-2)'
        elif violations <= 5:
            return 'Medium (3-5)'
        else:
            return 'High (6+)'

    df['Severity'] = df['Total_Violations'].apply(categorize_severity)
    severity_counts = df['Severity'].value_counts()
    colors_severity = ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']
    wedges2, texts2, autotexts2 = ax2.pie(severity_counts.values, labels=severity_counts.index,
                                            autopct='%1.1f%%',
                                            colors=colors_severity, startangle=90,
                                            textprops={'fontsize': 12, 'fontweight': 'bold'},
                                            wedgeprops={'edgecolor': 'black', 'linewidth': 1.5})
    ax2.set_title('Violation Severity Distribution\n(Reject All Scenario, N=222)',
                  fontsize=14, fontweight='bold', pad=15)
    plt.tight_layout()
    plt.savefig(output_dir / 'compliance_severity_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 6. Summary Statistics Table
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.axis('tight')
    ax.axis('off')
    summary_data = [
        ['Metric', 'Value'],
        ['', ''],
        ['Total Websites Analyzed', f"{len(df)}"],
        ['Compliant Websites', f"{len(df[df['Compliant'] == 'Yes'])} ({len(df[df['Compliant'] == 'Yes'])/len(df)*100:.1f}%)"],
        ['Non-Compliant Websites', f"{len(df[df['Compliant'] == 'No'])} ({len(df[df['Compliant'] == 'No'])/len(df)*100:.1f}%)"],
        ['', ''],
        ['Total ID Leaking Violations', f"{df['ID_Leaking'].sum():.0f}"],
        ['Total Cookie Sync Violations', f"{df['Cookie_Sync'].sum():.0f}"],
        ['Total Fingerprinting Violations', f"{df['Fingerprinting'].sum():.0f}"],
        ['Total All Violations', f"{df['Total_Violations'].sum():.0f}"],
        ['', ''],
        ['Average Violations per Website', f"{df['Total_Violations'].mean():.2f}"],
        ['Median Violations per Website', f"{df['Total_Violations'].median():.0f}"],
        ['Max Violations (Single Site)', f"{df['Total_Violations'].max():.0f}"],
        ['', ''],
        ['Most Violated Site', f"{df.loc[df['Total_Violations'].idxmax(), 'Website']}"],
        ['Violations Count', f"{df['Total_Violations'].max():.0f}"],
    ]
    table = ax.table(cellText=summary_data, cellLoc='left',
                     colWidths=[0.6, 0.4],
                     loc='center',
                     bbox=[0, 0, 1, 1])
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1, 2.2)
    for i, cell in enumerate(table.get_celld().values()):
        if i < 2:
            cell.set_facecolor('#3498db')
            cell.set_text_props(weight='bold', color='white', size=13)
            cell.set_height(0.08)
        elif summary_data[i//2][0] == '':
            cell.set_facecolor('#bdc3c7')
            cell.set_height(0.03)
        elif i % 2 == 0:
            cell.set_facecolor('#ecf0f1')
        else:
            cell.set_facecolor('white')
        cell.set_edgecolor('black')
        cell.set_linewidth(1)
    plt.title('GDPR Cookie Compliance Summary Statistics\n(Reject All Scenario, N=222)',
              fontsize=16, fontweight='bold', pad=20)
    plt.savefig(output_dir / 'summary_statistics.png', dpi=300, bbox_inches='tight')
    plt.close()


def main():
    df = load_data()
    create_visualizations(df)


if __name__ == '__main__':
    main()
