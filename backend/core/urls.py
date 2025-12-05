from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, AdminLoginView, CreateUserView, UserDetailView, 
    UserListView, UserUpdateView, DashboardStatsView, BulkUserUploadView,
    AcademicClassViewSet, SectionViewSet, GroupViewSet, UserPasswordResetView
)

router = DefaultRouter()
router.register(r'classes', AcademicClassViewSet, basename='academicclass')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('create-user/', CreateUserView.as_view(), name='create-user'),
    path('me/', UserDetailView.as_view(), name='me'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserUpdateView.as_view(), name='user-detail'),
    path('users/<int:pk>/reset-password/', UserPasswordResetView.as_view(), name='user-password-reset'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('bulk-upload/', BulkUserUploadView.as_view(), name='bulk-upload'),
    path('', include(router.urls)),
]
