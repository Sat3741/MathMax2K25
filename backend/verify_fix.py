import os
import django
import sys

# Setup Django environment
sys.path.append('d:\\Programming\\Projects\\MathMax\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

def verify_admin():
    print("Verifying admin user...")
    try:
        admin = User.objects.get(username='admin')
        print(f"Admin user found: {admin.username}")
        if not admin.is_staff:
            print("Admin user is not staff. Fixing...")
            admin.is_staff = True
            admin.save()
            print("Admin user is now staff.")
        else:
            print("Admin user is already staff.")
        
        if not admin.is_superuser:
             print("Admin user is not superuser. Fixing...")
             admin.is_superuser = True
             admin.save()
             print("Admin user is now superuser.")

    except User.DoesNotExist:
        print("Admin user not found. Creating...")
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Admin user created.")

def test_api():
    print("\nTesting API endpoints...")
    client = APIClient()
    
    # Login
    response = client.post('/api/auth/admin/login/', {'username': 'admin', 'password': 'admin'}, format='json')
    if response.status_code != 200:
        print(f"Login failed: {response.status_code}")
        try:
            print(response.data)
        except AttributeError:
            print(response.content.decode())
        return
    
    token = response.data['tokens']['access']
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    print("Login successful.")

    # List Users
    response = client.get('/api/auth/users/')
    if response.status_code == 200:
        print(f"List users successful. Count: {len(response.data)}")
    else:
        print(f"List users failed: {response.status_code}")

    # Create User
    new_user_data = {
        'username': 'testuser_api',
        'password': 'password123',
        'first_name': 'Test',
        'phone_number': '1234567890',
        'is_student': True
    }
    response = client.post('/api/auth/create-user/', new_user_data, format='json')
    if response.status_code == 201:
        print("Create user successful.")
        user_id = response.data['id']
    else:
        print(f"Create user failed: {response.status_code} {response.data}")
        return

    # Update User
    update_data = {'first_name': 'Updated Test'}
    response = client.patch(f'/api/auth/users/{user_id}/', update_data, format='json')
    if response.status_code == 200:
        print("Update user successful.")
    else:
        print(f"Update user failed: {response.status_code} {response.data}")

    # Delete User
    response = client.delete(f'/api/auth/users/{user_id}/')
    if response.status_code == 204:
        print("Delete user successful.")
    else:
        print(f"Delete user failed: {response.status_code}")

if __name__ == '__main__':
    verify_admin()
    test_api()
