from django.urls import path
from .views import LoginView, AdminLoginView, CreateUserView, UserDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('create-user/', CreateUserView.as_view(), name='create-user'),
    path('me/', UserDetailView.as_view(), name='me'),
]
