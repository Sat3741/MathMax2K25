from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import StudentAssignmentListView, PracticeSessionCreateView, PracticeSessionListView
from .adaptive_learning import AdaptivePracticeView, StudentProgressView

urlpatterns = [
    path('assignments/', StudentAssignmentListView.as_view(), name='student-assignments'),
    path('practice/', PracticeSessionCreateView.as_view(), name='practice-session-create'),
    path('practice/sessions/', PracticeSessionListView.as_view(), name='practice-sessions-list'),
    
    # Adaptive learning endpoints
    path('adaptive/practice/', AdaptivePracticeView.as_view(), name='adaptive-practice'),
    path('progress/', StudentProgressView.as_view(), name='student-progress'),
]
