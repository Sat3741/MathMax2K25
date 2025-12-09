from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeacherDashboardView, SectionListView, ClassDetailView, 
    AddStudentToClassView, AssignmentListCreateView, AssignmentDetailView,
    StudentProgressView, StudentsListView, TeacherGroupViewSet
)

router = DefaultRouter()
router.register(r'groups', TeacherGroupViewSet, basename='teacher-group')

urlpatterns = [
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('classes/', SectionListView.as_view(), name='class-list-create'),
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    path('classes/<int:class_id>/add-student/', AddStudentToClassView.as_view(), name='add-student-to-class'),
    path('assignments/', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('student-progress/<int:student_id>/', StudentProgressView.as_view(), name='student-progress'),
    path('students/', StudentsListView.as_view(), name='students-list'),
    path('', include(router.urls)),
]
