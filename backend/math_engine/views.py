from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .logic import generate_problem

class ProblemView(APIView):
    permission_classes = [permissions.AllowAny] # Allow any for MVP testing

    def get(self, request):
        topic = request.query_params.get('topic', 'addition')
        try:
            # First try to convert to float, then round to nearest integer
            difficulty = float(request.query_params.get('difficulty', 1))
            difficulty = max(1, min(10, round(difficulty)))  # Ensure difficulty is between 1 and 10
        except (ValueError, TypeError):
            difficulty = 1  # Default to 1 if conversion fails
        
        problem = generate_problem(topic, difficulty)
        return Response(problem)
