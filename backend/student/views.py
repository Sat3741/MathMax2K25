from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from teacher.models import Assignment
from teacher.serializers import AssignmentSerializer
from django.db.models import Q, Count, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from core.models import Section, Group, User
from .models import PracticeSession, Concept, StudentProgress, QuestionResponse
from .serializers import PracticeSessionSerializer, ConceptSerializer, StudentProgressSerializer
from math_engine.logic import calculate_next_review, analyze_common_errors
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

class StudentAssignmentListView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_student:
             return Assignment.objects.none()

        # 1. Get assignments for the student's section
        try:
             student_section = Section.objects.get(
                 academic_class__grade_level=user.grade_level, 
                 name=user.section
             )
        except Section.DoesNotExist:
             student_section = None

        # 2. Get assignments for student's groups
        student_groups = Group.objects.filter(students=user)

        # Combine queries
        query = Q()
        if student_section:
            query |= Q(section_assigned=student_section)
        
        if student_groups.exists():
            query |= Q(group_assigned__in=student_groups)

        # If no section and no groups, return empty
        if not student_section and not student_groups.exists():
             return Assignment.objects.none()

        return Assignment.objects.filter(query).distinct().order_by('due_date')

class PracticeSessionCreateView(generics.CreateAPIView):
    serializer_class = PracticeSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class PracticeSessionListView(generics.ListAPIView):
    serializer_class = PracticeSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_student:
            return PracticeSession.objects.none()
        
        return PracticeSession.objects.filter(student=user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            
            # Convert immutable response.data to mutable list/dict
            if isinstance(response.data, list):
                data = []
                for item in response.data:
                    # Convert each item to mutable dict
                    mutable_item = dict(item)
                    mutable_item['accuracy'] = mutable_item.get('score', 0)
                    mutable_item['avgTime'] = mutable_item.get('avg_time_per_question', 0)
                    data.append(mutable_item)
                return Response(data, status=response.status_code)
            elif isinstance(response.data, dict):
                data = dict(response.data)  # Convert to mutable dict
                if 'results' in data:
                    # Handle paginated response
                    results = []
                    for item in data['results']:
                        # Convert each item to mutable dict
                        mutable_item = dict(item)
                        mutable_item['accuracy'] = mutable_item.get('score', 0)
                        mutable_item['avgTime'] = mutable_item.get('avg_time_per_question', 0)
                        results.append(mutable_item)
                    data['results'] = results
                return Response(data, status=response.status_code)
            
            return response
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )