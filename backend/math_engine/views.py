from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .logic import generate_problem

class ProblemView(APIView):
    permission_classes = [permissions.AllowAny] # Allow any for MVP testing

    def get(self, request):
        topic = request.query_params.get('topic', 'addition')
        difficulty = int(request.query_params.get('difficulty', 1))
        
        problem = generate_problem(topic, difficulty)
        return Response(problem)
