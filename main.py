import os
import csv
from datetime import datetime
from desync_search import DesyncClient

os.environ["DESYNC_API_KEY"] = "s5y3m1PVKGnUf3BPYOMIoAnLzwdwHzkdhST4GjvTGUA"
target_url = "https://www.judyrecords.com/record/dj5gtz1ge359d"

client = DesyncClient()
result = client.search(target_url)

print(f"URL: {result.url}")
print(f"Text Preview: {result.text_content[:10000]}")
print(f"Found {len(result.internal_links)} internal links.")

# Write output to CSV
csv_filename = 'court_cases_output.csv'
file_exists = os.path.exists(csv_filename)

with open(csv_filename, 'a', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['timestamp', 'url', 'text_preview', 'internal_links_count', 'full_text_length']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    if not file_exists:
        writer.writeheader()
    
    writer.writerow({
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'url': result.url,
        'text_preview': result.text_content[:10000],
        'internal_links_count': len(result.internal_links),
        'full_text_length': len(result.text_content)
    })

print(f"\n✓ Data saved to CSV file: {csv_filename}")