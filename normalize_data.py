import csv
import re
from datetime import datetime

class DataNormalizer:
    def __init__(self):
        self.name_pattern = re.compile(r'NAME:\s*([A-Z\s,.-]+?)(?=\n|ADDRESS:|PHONE:|ATTORNEY)', re.MULTILINE)
        self.address_pattern = re.compile(r'ADDRESS:\s*(.*?)(?=\n[A-Z]+:|PHONE:|ATTORNEY|\?)', re.DOTALL)
        
    def normalize_name(self, name):
        """Normalize name format from LAST, FIRST MIDDLE to proper case"""
        if not name:
            return ""
        
        name = name.strip()
        # Convert to title case
        parts = [part.strip() for part in name.split(',')]
        
        if len(parts) == 2:
            last_name = parts[0].title()
            first_middle = parts[1].title()
            return f"{first_middle} {last_name}"
        else:
            return name.title()
    
    def normalize_address(self, address):
        """Normalize address format"""
        if not address:
            return ""
        
        # Clean up the address
        lines = [line.strip() for line in address.split('\n') if line.strip()]
        
        # Filter out non-address lines
        cleaned_lines = []
        for line in lines:
            # Skip lines that look like headers or markers
            if line in ['?', 'ADDRESS:', 'PHONE:', 'ATTORNEY']:
                continue
            cleaned_lines.append(line)
        
        # Format address components
        if len(cleaned_lines) >= 2:
            street = cleaned_lines[0].title()
            city_state_zip = cleaned_lines[1] if len(cleaned_lines) > 1 else ""
            
            # Parse city, state, zip
            parts = city_state_zip.split()
            if len(parts) >= 3:
                # Last element is ZIP, second to last is state
                zip_code = parts[-1]
                state = parts[-2]
                city = ' '.join(parts[:-2]).title()
                return {
                    'street': street,
                    'city': city,
                    'state': state,
                    'zip': zip_code,
                    'full_address': f"{street}, {city}, {state} {zip_code}"
                }
        
        return {
            'street': '',
            'city': '',
            'state': '',
            'zip': '',
            'full_address': ' '.join(cleaned_lines)
        }
    
    def extract_case_data(self, text_content):
        """Extract structured data from case text"""
        data = {
            'case_number': '',
            'date_filed': '',
            'case_status': '',
            'court': '',
            'plaintiff_name': '',
            'plaintiff_address': {},
            'plaintiff_attorney': '',
            'plaintiff_attorney_address': {},
            'defendant_name': '',
            'defendant_address': {},
            'defendant_attorney': '',
            'defendant_attorney_address': {},
            'issues': []
        }
        
        # Extract case number
        case_match = re.search(r'CASE NUMBER:\s*([^\n]+)', text_content)
        if case_match:
            data['case_number'] = case_match.group(1).strip()
        
        # Extract date filed
        date_match = re.search(r'DATE FILED:\s*([^\n]+)', text_content)
        if date_match:
            data['date_filed'] = date_match.group(1).strip()
        
        # Extract case status
        status_match = re.search(r'CASE STATUS:\s*([^\n]+)', text_content)
        if status_match:
            data['case_status'] = status_match.group(1).strip()
        
        # Extract court
        court_match = re.search(r'COURT SYSTEM:\s*([^\n]+)', text_content)
        if court_match:
            data['court'] = court_match.group(1).strip()
        
        # Extract plaintiff information
        plaintiff_section = re.search(r'PLAINTIFF INFORMATION(.*?)(?=DEFENDANT INFORMATION|ISSUES INFORMATION|$)', text_content, re.DOTALL)
        if plaintiff_section:
            plaintiff_text = plaintiff_section.group(1)
            
            # Extract plaintiff name (first NAME: in plaintiff section)
            plaintiff_names = self.name_pattern.findall(plaintiff_text)
            if plaintiff_names:
                data['plaintiff_name'] = self.normalize_name(plaintiff_names[0])
            
            # Extract plaintiff address
            plaintiff_addresses = self.address_pattern.findall(plaintiff_text)
            if plaintiff_addresses:
                data['plaintiff_address'] = self.normalize_address(plaintiff_addresses[0])
            
            # Extract attorney info
            attorney_section = re.search(r'ATTORNEY\(S\) FOR THE PLAINTIFF(.*?)(?=DEFENDANT|$)', plaintiff_text, re.DOTALL)
            if attorney_section:
                attorney_text = attorney_section.group(1)
                attorney_names = self.name_pattern.findall(attorney_text)
                if attorney_names:
                    data['plaintiff_attorney'] = self.normalize_name(attorney_names[0])
                
                attorney_addresses = self.address_pattern.findall(attorney_text)
                if attorney_addresses:
                    data['plaintiff_attorney_address'] = self.normalize_address(attorney_addresses[0])
        
        # Extract defendant information
        defendant_section = re.search(r'DEFENDANT INFORMATION(.*?)(?=ISSUES INFORMATION|$)', text_content, re.DOTALL)
        if defendant_section:
            defendant_text = defendant_section.group(1)
            
            # Extract defendant name
            defendant_names = self.name_pattern.findall(defendant_text)
            if defendant_names:
                data['defendant_name'] = self.normalize_name(defendant_names[0])
            
            # Extract defendant address
            defendant_addresses = self.address_pattern.findall(defendant_text)
            if defendant_addresses:
                data['defendant_address'] = self.normalize_address(defendant_addresses[0])
            
            # Extract defendant attorney if present
            attorney_section = re.search(r'ATTORNEY\(S\) FOR THE DEFENDANT(.*?)(?=ISSUES|$)', defendant_text, re.DOTALL)
            if attorney_section:
                attorney_text = attorney_section.group(1)
                attorney_names = self.name_pattern.findall(attorney_text)
                if attorney_names:
                    data['defendant_attorney'] = self.normalize_name(attorney_names[0])
                
                attorney_addresses = self.address_pattern.findall(attorney_text)
                if attorney_addresses:
                    data['defendant_attorney_address'] = self.normalize_address(attorney_addresses[0])
        
        # Extract issues
        issues_matches = re.findall(r'ISSUE:\s*([^\n]+)', text_content)
        if issues_matches:
            # Get unique issues
            data['issues'] = list(set(issues_matches))
        
        return data
    
    def process_csv(self, input_file='court_cases_output.csv', output_file='normalized_cases.csv'):
        """Process the input CSV and create normalized output"""
        normalized_data = []
        
        with open(input_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                case_data = self.extract_case_data(row['text_preview'])
                
                # Create normalized row
                normalized_row = {
                    'timestamp': row['timestamp'],
                    'url': row['url'],
                    'case_number': case_data['case_number'],
                    'date_filed': case_data['date_filed'],
                    'case_status': case_data['case_status'],
                    'court': case_data['court'],
                    'plaintiff_name': case_data['plaintiff_name'],
                    'plaintiff_street': case_data['plaintiff_address'].get('street', '') if isinstance(case_data['plaintiff_address'], dict) else '',
                    'plaintiff_city': case_data['plaintiff_address'].get('city', '') if isinstance(case_data['plaintiff_address'], dict) else '',
                    'plaintiff_state': case_data['plaintiff_address'].get('state', '') if isinstance(case_data['plaintiff_address'], dict) else '',
                    'plaintiff_zip': case_data['plaintiff_address'].get('zip', '') if isinstance(case_data['plaintiff_address'], dict) else '',
                    'plaintiff_attorney': case_data['plaintiff_attorney'],
                    'defendant_name': case_data['defendant_name'],
                    'defendant_street': case_data['defendant_address'].get('street', '') if isinstance(case_data['defendant_address'], dict) else '',
                    'defendant_city': case_data['defendant_address'].get('city', '') if isinstance(case_data['defendant_address'], dict) else '',
                    'defendant_state': case_data['defendant_address'].get('state', '') if isinstance(case_data['defendant_address'], dict) else '',
                    'defendant_zip': case_data['defendant_address'].get('zip', '') if isinstance(case_data['defendant_address'], dict) else '',
                    'defendant_attorney': case_data['defendant_attorney'],
                    'issues': ', '.join(case_data['issues'])
                }
                
                normalized_data.append(normalized_row)
        
        # Write normalized data to CSV
        if normalized_data:
            with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = normalized_data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                writer.writerows(normalized_data)
            
            print(f"✓ Normalized data saved to {output_file}")
            print(f"✓ Processed {len(normalized_data)} records")
            
            # Display sample of first record
            if normalized_data:
                print("\nSample normalized record:")
                print("-" * 80)
                for key, value in normalized_data[0].items():
                    if value:  # Only show non-empty fields
                        print(f"{key:25} : {value}")
        else:
            print("No data to process")
        
        return normalized_data


if __name__ == "__main__":
    normalizer = DataNormalizer()
    normalizer.process_csv()
