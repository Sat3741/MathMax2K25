from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .logic import generate_problem, LEVELS

class LevelsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """
        Returns the list of all available levels.
        """
        # Convert dictionary to list for frontend
        levels_list = []
        for code, data in LEVELS.items():
            level_data = data.copy()
            level_data['id'] = code
            levels_list.append(level_data)
            
        return Response(levels_list)

class ProblemView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        level_code = request.query_params.get('level_code', 'add.1')
        
        # Verify if level exists, else default
        if level_code not in LEVELS:
            level_code = 'add.1'
            
        problem = generate_problem(level_code)
        
        # Return problem
        return Response(problem)
