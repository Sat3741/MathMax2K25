from django.urls import path
from .views import ProblemView

urlpatterns = [
    path('problem/', ProblemView.as_view(), name='generate-problem'),
]
