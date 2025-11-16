import sqlite3
import json
import os
import sys
from desync_search import DesyncClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize client
client = DesyncClient()

# Create database and table
def setup_database():
    db_path = os.path.join(os.getcwd(), 'court_cases.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS page_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            title TEXT,
            text_content TEXT,
            html_content TEXT,
            internal_links TEXT,
            external_links TEXT,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    return conn

# Store PageDataObject in database
def store_page_data(conn, page_data):
    cursor = conn.cursor()
    
    try:
        # Handle if page_data is a string (error message) instead of PageDataObject
        if isinstance(page_data, str):
            print(f"Skipping string result: {page_data}")
            return
            
        cursor.execute('''
            INSERT OR REPLACE INTO page_data 
            (url, title, text_content, html_content, internal_links, external_links, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            page_data.url,
            page_data.title if hasattr(page_data, 'title') else '',
            page_data.text_content if hasattr(page_data, 'text_content') else '',
            page_data.html_content if hasattr(page_data, 'html_content') else '',
            json.dumps(page_data.internal_links) if hasattr(page_data, 'internal_links') else '[]',
            json.dumps(page_data.external_links) if hasattr(page_data, 'external_links') else '[]',
            json.dumps(page_data.metadata) if hasattr(page_data, 'metadata') else '{}'
        ))
        conn.commit()
        print(f"✓ Stored: {page_data.url}")
    except Exception as e:
        url = getattr(page_data, 'url', 'unknown')
        print(f"✗ Error storing {url}: {e}")

# Generate sample URLs (replace with your actual URLs)
def generate_urls():
    # Start with just the first URL to test
    base_urls = [
        "https://www.judyrecords.com/record/dj5gtz1ge359d",
    ]
    return base_urls

# Main execution
def main():
    print("="*80)
    print("BULK SEARCH - Court Cases Scraper")
    print("="*80)
    
    # Setup database
    conn = setup_database()
    db_path = os.path.join(os.getcwd(), 'court_cases.db')
    print(f"\n📁 Database: {db_path}")
    
    # Get URLs to process
    urls = generate_urls()
    
    print(f"\n🔍 Processing {len(urls)} URLs...\n")
    
    try:
        # Process each URL individually
        success_count = 0
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Searching: {url}")
            try:
                result = client.search(url)
                if result and not isinstance(result, str):
                    store_page_data(conn, result)
                    success_count += 1
                else:
                    print(f"✗ No valid data returned for {url}")
            except Exception as e:
                print(f"✗ Error processing {url}: {e}")
        
        conn.close()
        print("\n" + "="*80)
        print(f"✅ Completed! Successfully processed {success_count}/{len(urls)} URLs.")
        print(f"📊 Database saved to: {db_path}")
        print("="*80)
    except Exception as e:
        conn.close()
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
