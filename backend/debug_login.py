import os
import django
import sys
import traceback

# Setup Django environment
sys.path.append('d:\\Programming\\Projects\\MathMax\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from core.views import AdminLoginView

def debug_login():
    print("Debugging login view...")
    try:
        factory = APIRequestFactory()
        request = factory.post('/api/auth/admin/login/', {'username': 'admin', 'password': 'admin'}, format='json')
        view = AdminLoginView.as_view()
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if hasattr(response, 'data'):
            print(f"Data: {response.data}")
        else:
            print(f"Content: {response.content}")
            
    except Exception:
        traceback.print_exc()

if __name__ == '__main__':
    debug_login()
