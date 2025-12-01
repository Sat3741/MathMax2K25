from django.urls import path
from .views import (
    TeacherDashboardView, ClassListCreateView, ClassDetailView,
    AddStudentToClassView, AssignmentListCreateView, AssignmentDetailView,
    StudentProgressView, StudentsListView
)

urlpatterns = [
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('classes/', ClassListCreateView.as_view(), name='class-list-create'),
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    path('classes/<int:class_id>/add-student/', AddStudentToClassView.as_view(), name='add-student'),
    path('assignments/', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('students/', StudentsListView.as_view(), name='students-list'),
    path('student-progress/<int:student_id>/', StudentProgressView.as_view(), name='student-progress'),
]
