from django.urls import path
from .views import ProblemView, LevelsView

urlpatterns = [
    path('problem/', ProblemView.as_view(), name='generate-problem'),
    path('levels/', LevelsView.as_view(), name='list-levels'),
]
