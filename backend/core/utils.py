import random
import string
import csv
import io
import openpyxl

def generate_password(length=8):
    """Generate a random password with letters and digits."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def generate_username_from_name(first_name, last_name):
    """Generate username from first and last name."""
    # Remove spaces and convert to lowercase
    first = first_name.strip().lower().replace(' ', '')
    last = last_name.strip().lower().replace(' ', '')
    
    # Create base username: firstname.lastname
    base_username = f"{first}.{last}" if last else first
    
    # Add random number to ensure uniqueness
    random_num = random.randint(100, 999)
    username = f"{base_username}{random_num}"
    
    return username

def generate_credentials_from_name(first_name, last_name):
    """Generate both username and password from name."""
    username = generate_username_from_name(first_name, last_name)
    password = generate_password()
    return username, password

def parse_csv_users(file_content):
    """
    Parse CSV file content and return list of user dictionaries.
    Expected columns: first_name,last_name,email,role,grade_level,section,phone_number
    Username will be auto-generated if not provided.
    """
    users = []
    decoded_content = file_content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(decoded_content))
    
    for row in csv_reader:
        first_name = row.get('first_name', '').strip()
        last_name = row.get('last_name', '').strip()
        
        # Auto-generate username if not provided
        username = row.get('username', '').strip()
        if not username and first_name:
            username = generate_username_from_name(first_name, last_name)
        
        user_data = {
            'username': username,
            'first_name': first_name,
            'last_name': last_name,
            'email': row.get('email', '').strip(),
            'role': row.get('role', 'student').strip().lower(),
            'grade_level': row.get('grade_level', '').strip() or None,
            'section': row.get('section', '').strip(),
            'phone_number': row.get('phone_number', '').strip(),
        }
        
        if user_data['first_name']:  # Only add if first_name exists
            users.append(user_data)
    
    return users

def parse_excel_users(file_content):
    """
    Parse Excel file content and return list of user dictionaries.
    Expected columns: first_name,last_name,email,role,grade_level,section,phone_number
    Username will be auto-generated if not provided.
    """
    users = []
    workbook = openpyxl.load_workbook(io.BytesIO(file_content))
    sheet = workbook.active
    
    # Get header row
    headers = [cell.value for cell in sheet[1]]
    
    # Process data rows
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row[0]:  # Skip if first cell is empty
            continue
            
        user_data = {}
        for i, header in enumerate(headers):
            if i < len(row):
                value = row[i]
                user_data[header] = str(value).strip() if value is not None else ''
        
        first_name = user_data.get('first_name', '').strip()
        last_name = user_data.get('last_name', '').strip()
        
        # Auto-generate username if not provided
        username = user_data.get('username', '').strip()
        if not username and first_name:
            username = generate_username_from_name(first_name, last_name)
        
        processed_data = {
            'username': username,
            'first_name': first_name,
            'last_name': last_name,
            'email': user_data.get('email', '').strip(),
            'role': user_data.get('role', 'student').strip().lower(),
            'grade_level': user_data.get('grade_level', '').strip() or None,
            'section': user_data.get('section', '').strip(),
            'phone_number': user_data.get('phone_number', '').strip(),
        }
        
        if processed_data['first_name']:
            users.append(processed_data)
    
    return users

def parse_file_users(file_content, filename):
    """
    Parse file content (CSV or Excel) and return list of user dictionaries.
    """
    if filename.endswith('.xlsx') or filename.endswith('.xls'):
        return parse_excel_users(file_content)
    elif filename.endswith('.csv'):
        return parse_csv_users(file_content)
    else:
        raise ValueError('Unsupported file format. Please use CSV or Excel (.xlsx) files.')
