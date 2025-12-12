import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 11

INDUSTRY_RULES = {
    'News & Media': [
        'news', 'nytimes', 'washingtonpost', 'guardian', 'telegraph', 'bbc',
        'cnn', 'fox', 'reuters', 'bloomberg', 'forbes', 'wsj', 'usatoday',
        'dailymail', 'huffpost', 'time.com', 'newyorker', 'mirror', 'thesun',
        'independent', 'express', 'metro', 'standard', 'elpais', 'elmundo',
        'lemonde', 'lefigaro', 'spiegel', 'welt', 'repubblica', 'corriere',
        'politico', 'thehill', 'axios', 'vox.com', 'slate', 'salon',
        'buzzfeed', 'vice', 'medium.com', 'substack'
    ],
    'E-commerce': [
        'amazon', 'ebay', 'walmart', 'target', 'bestbuy', 'etsy', 'shopify',
        'aliexpress', 'alibaba', 'mercadolibre', 'rakuten', 'booking',
        'expedia', 'airbnb', 'trivago', 'kayak', 'priceline', 'hotels',
        'wayfair', 'overstock', 'newegg', 'chewy', 'zappos', 'groupon'
    ],
    'Technology': [
        'microsoft', 'apple', 'adobe', 'oracle', 'salesforce', 'sap',
        'vmware', 'intel', 'cisco', 'dell', 'hp.com', 'ibm', 'nvidia',
        'github', 'stackoverflow', 'sourceforge', 'bitbucket', 'gitlab',
        'docker', 'kubernetes', 'aws', 'azure', 'cloudflare', 'akamai',
        'digitalocean', 'heroku', 'netlify', 'vercel', 'cpanel', 'namecheap'
    ],
    'Social Media': [
        'facebook', 'twitter', 'instagram', 'linkedin', 'pinterest',
        'reddit', 'tumblr', 'snapchat', 'tiktok', 'whatsapp', 'telegram',
        'discord', 'twitch', 'youtube', 'vimeo', 'dailymotion', 'youtu.be',
        'flickr', 'imgur', 'deviantart', 'behance', 'dribbble'
    ],
    'Search & Web Services': [
        'google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex',
        'ask.com', 'aol', 'mail.', 'gmail', 'outlook', 'protonmail',
        'zoho', 'godaddy', 'wordpress', 'blogger', 'wix', 'squarespace',
        'weebly', 'typepad', 'livejournal', 'jimdo'
    ],
    'Entertainment & Streaming': [
        'netflix', 'hulu', 'disney', 'hbo', 'spotify', 'soundcloud',
        'pandora', 'apple.music', 'tidal', 'deezer', 'imdb', 'rottentomatoes',
        'metacritic', 'gamespot', 'ign', 'polygon', 'kotaku', 'steam',
        'epicgames', 'twitch', 'crunchyroll', 'funimation'
    ],
    'Education': [
        'wikipedia', 'wikimedia', 'coursera', 'udemy', 'edx', 'khanacademy',
        'skillshare', 'lynda', 'pluralsight', 'codecademy', 'freecodecamp',
        'mit.edu', 'stanford.edu', 'harvard.edu', 'berkeley.edu', 'ox.ac.uk',
        'cambridge.org', 'researchgate', 'academia.edu', 'jstor'
    ],
    'Health & Wellness': [
        'webmd', 'mayoclinic', 'healthline', 'medlineplus', 'nih.gov',
        'cdc.gov', 'who.int', 'drugs.com', 'rxlist', 'medscape',
        'everydayhealth', 'verywellhealth', 'medicalnewstoday', 'patient.info'
    ],
    'Finance & Business': [
        'paypal', 'stripe', 'square', 'venmo', 'chase', 'bankofamerica',
        'wellsfargo', 'citibank', 'capitalone', 'amex', 'discover',
        'mint', 'robinhood', 'coinbase', 'binance', 'kraken', 'etrade',
        'fidelity', 'schwab', 'vanguard', 'td.ameritrade', 'nasdaq',
        'nyse', 'marketwatch', 'investing.com', 'finance.yahoo', 'seeking'
    ],
    'Government & Public': [
        'gov.', 'europa.eu', 'un.org', 'nato.int', 'whitehouse.gov',
        'usa.gov', 'irs.gov', 'sec.gov', 'fda.gov', 'epa.gov',
        'state.gov', 'defense.gov', 'justice.gov', 'treasury.gov',
        'parliament.uk', 'bundestag.de', 'senat.fr', 'congreso.es'
    ],
    'Travel & Transportation': [
        'uber', 'lyft', 'airbnb', 'tripadvisor', 'lonely planet',
        'skyscanner', 'momondo', 'kiwi.com', 'rome2rio', 'viator',
        'getyourguide', 'ticketmaster', 'stubhub', 'seatgeek', 'eventbrite'
    ],
    'Real Estate': [
        'zillow', 'trulia', 'realtor', 'redfin', 'apartments',
        'rightmove', 'zoopla', 'immobilienscout', 'seloger', 'idealista'
    ],
    'Telecom & ISP': [
        'verizon', 'att.com', 't-mobile', 'comcast', 'spectrum',
        'cox.com', 'centurylink', 'frontier', 'vodafone', 'orange',
        'telekom', 'telefonica', 'bt.com', 'sky.com', 'virgin media'
    ],
    'Food & Delivery': [
        'doordash', 'ubereats', 'grubhub', 'postmates', 'instacart',
        'deliveroo', 'just-eat', 'foodpanda', 'zomato', 'swiggy',
        'yelp', 'tripadvisor', 'opentable', 'resy', 'tock'
    ],
    'Marketing & Analytics': [
        'hubspot', 'mailchimp', 'constantcontact', 'sendinblue', 'aweber',
        'getresponse', 'activecampaign', 'convertkit', 'drip', 'klaviyo',
        'segment', 'amplitude', 'mixpanel', 'heap', 'hotjar', 'optimizely',
        'unbounce', 'instapage', 'clickfunnel', 'leadpages'
    ],
    'Cloud Storage & File Sharing': [
        'dropbox', 'box.com', 'onedrive', 'drive.google', 'icloud',
        'mega.nz', 'mediafire', 'wetransfer', 'sendspace', 'zippyshare',
        'rapidshare', 'uploaded', 'filehosting', 'fileserve'
    ],
    'Other': []
}


def classify_industry(website):
    website_lower = website.lower()
    for industry, keywords in INDUSTRY_RULES.items():
        if industry == 'Other':
            continue
        for keyword in keywords:
            if keyword in website_lower:
                return industry
    return 'Other'


def load_and_classify_data():
    df = pd.read_csv('visualization/result250_with_regions.csv')
    df['Industry'] = df['Website'].apply(classify_industry)
    return df


def create_industry_visualizations(df):
    output_dir = Path('visualization')
    output_dir.mkdir(exist_ok=True)

    industry_stats = df.groupby('Industry').agg({
        'Website': 'count',
        'Compliant': lambda x: (x == 'Yes').sum(),
        'Total_Violations': 'mean',
        'ID_Leaking': 'mean',
        'Cookie_Sync': 'mean',
        'Fingerprinting': 'mean'
    }).round(2)

    industry_stats.columns = ['Count', 'Compliant_Count', 'Avg_Violations',
                              'Avg_ID_Leaking', 'Avg_Cookie_Sync', 'Avg_Fingerprinting']
    industry_stats['Compliance_Rate'] = (industry_stats['Compliant_Count'] / industry_stats['Count'] * 100).round(1)
    industry_stats = industry_stats.sort_values('Count', ascending=False)

    # 1. Compliance Rate by Industry
    fig, ax = plt.subplots(figsize=(12, 10))
    industry_stats_filtered = industry_stats[industry_stats['Count'] >= 5].sort_values('Compliance_Rate')
    colors = ['#e74c3c' if x < 50 else '#f39c12' if x < 70 else '#2ecc71'
              for x in industry_stats_filtered['Compliance_Rate']]
    bars = ax.barh(industry_stats_filtered.index, industry_stats_filtered['Compliance_Rate'],
                   color=colors, alpha=0.8, edgecolor='black', linewidth=1)
    ax.set_xlabel('Compliance Rate (%)', fontsize=14, fontweight='bold')
    ax.set_ylabel('Industry', fontsize=14, fontweight='bold')
    ax.set_title('Compliance Rate by Industry\n(Industries with 5+ websites)',
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim([0, 100])
    for i, (bar, val) in enumerate(zip(bars, industry_stats_filtered['Compliance_Rate'])):
        count = industry_stats_filtered['Count'].iloc[i]
        ax.text(val + 2, bar.get_y() + bar.get_height()/2.,
                f'{val:.1f}% (N={count})',
                ha='left', va='center', fontsize=10, fontweight='bold')
    ax.axvline(x=50, color='gray', linestyle='--', linewidth=1.5, alpha=0.5)
    plt.tight_layout()
    plt.savefig(output_dir / 'industry_compliance_rate.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 2. Violation Type Breakdown by Industry
    fig, ax = plt.subplots(figsize=(14, 10))
    industry_stats_filtered = industry_stats[industry_stats['Count'] >= 5].sort_values('Avg_Violations')
    y_pos = range(len(industry_stats_filtered))
    p1 = ax.barh(y_pos, industry_stats_filtered['Avg_ID_Leaking'],
                 color='#e74c3c', label='ID Leaking', alpha=0.8, edgecolor='black', linewidth=0.5)
    p2 = ax.barh(y_pos, industry_stats_filtered['Avg_Cookie_Sync'],
                 left=industry_stats_filtered['Avg_ID_Leaking'],
                 color='#f39c12', label='Cookie Sync', alpha=0.8, edgecolor='black', linewidth=0.5)
    p3 = ax.barh(y_pos, industry_stats_filtered['Avg_Fingerprinting'],
                 left=industry_stats_filtered['Avg_ID_Leaking'] + industry_stats_filtered['Avg_Cookie_Sync'],
                 color='#9b59b6', label='Fingerprinting', alpha=0.8, edgecolor='black', linewidth=0.5)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(industry_stats_filtered.index)
    ax.set_xlabel('Average Violations per Website', fontsize=14, fontweight='bold')
    ax.set_ylabel('Industry', fontsize=14, fontweight='bold')
    ax.set_title('Average Violation Types by Industry\n(Industries with 5+ websites)',
                 fontsize=16, fontweight='bold', pad=20)
    ax.legend(loc='lower right', fontsize=12, framealpha=0.9)
    plt.tight_layout()
    plt.savefig(output_dir / 'industry_violation_breakdown.png', dpi=300, bbox_inches='tight')
    plt.close()

    # 3. Industry Summary Table
    fig, ax = plt.subplots(figsize=(16, 12))
    ax.axis('tight')
    ax.axis('off')
    table_data = [['Industry', 'Websites', 'Compliant', 'Compliance %', 'Avg Violations']]
    for industry in industry_stats.index:
        row = industry_stats.loc[industry]
        table_data.append([
            industry,
            f"{int(row['Count'])}",
            f"{int(row['Compliant_Count'])}",
            f"{row['Compliance_Rate']:.1f}%",
            f"{row['Avg_Violations']:.2f}"
        ])
    table = ax.table(cellText=table_data, cellLoc='left',
                     colWidths=[0.35, 0.15, 0.15, 0.17, 0.18],
                     loc='center',
                     bbox=[0, 0, 1, 1])
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)
    for i, cell in enumerate(table.get_celld().values()):
        row = i // 5
        if row == 0:
            cell.set_facecolor('#3498db')
            cell.set_text_props(weight='bold', color='white', size=11)
            cell.set_height(0.08)
        elif row % 2 == 0:
            cell.set_facecolor('#ecf0f1')
        else:
            cell.set_facecolor('white')
        cell.set_edgecolor('black')
        cell.set_linewidth(1)
    plt.title('GDPR Compliance Summary by Industry\n(Reject All Scenario, N=222)',
              fontsize=16, fontweight='bold', pad=20)
    plt.savefig(output_dir / 'industry_summary_table.png', dpi=300, bbox_inches='tight')
    plt.close()

    return industry_stats


def save_industry_data(df, industry_stats):
    df.to_csv('visualization/result250_with_industry.csv', index=False)
    industry_stats.to_csv('visualization/industry_statistics.csv')
    with pd.ExcelWriter('visualization/industry_analysis.xlsx') as writer:
        df.to_excel(writer, sheet_name='All Websites', index=False)
        industry_stats.to_excel(writer, sheet_name='Industry Summary')


def main():
    df = load_and_classify_data()
    industry_stats = create_industry_visualizations(df)
    save_industry_data(df, industry_stats)


if __name__ == '__main__':
    main()
