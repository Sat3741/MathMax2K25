from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Class, Assignment, StudentProgress
from .serializers import AssignmentSerializer, StudentProgressSerializer, TeacherSectionSerializer

User = get_user_model()

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow teachers AND admins to access teacher views
        return request.user.is_authenticated and (request.user.is_teacher or request.user.is_staff)


class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = request.user
        # Show ALL sections and students (Global view as requested)
        sections = Section.objects.all()
        assignments = Assignment.objects.filter(teacher=teacher)
        
        # Count all students in the system
        student_count = User.objects.filter(is_student=True).count()

        return Response({
            'classes_count': sections.count(),
            'assignments_count': assignments.count(),
            'students_count': student_count,
            'recent_classes': TeacherSectionSerializer(sections[:5], many=True).data,
            'recent_assignments': AssignmentSerializer(assignments[:5], many=True).data,
        })


from core.models import Section
from core.serializers import SectionSerializer
from .serializers import TeacherSectionSerializer

class SectionListView(generics.ListAPIView):
    serializer_class = TeacherSectionSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        # Return ALL sections so teachers can assign to any class
        return Section.objects.all()

class ClassDetailView(generics.RetrieveAPIView):
    # Read-only detail view for sections
    serializer_class = TeacherSectionSerializer
    permission_classes = [IsTeacher]
    queryset = Section.objects.all()


class AddStudentToClassView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request, class_id):
        try:
            class_obj = Class.objects.get(id=class_id, teacher=request.user)
            student_id = request.data.get('student_id')
            student = User.objects.get(id=student_id, is_student=True)
            class_obj.students.add(student)
            return Response({'message': 'Student added successfully'})
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)


class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Assignment.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def post(self, request, *args, **kwargs):
        print(f"DEBUG: Assignment Create Data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: Assignment Validation Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Assignment.objects.filter(teacher=self.request.user)


class StudentProgressView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request, student_id):
        # Get all progress for a specific student in teacher's sections
        teacher_sections = Section.objects.filter(teacher=request.user)
        student = User.objects.get(id=student_id)
        
        progress = StudentProgress.objects.filter(
            student=student,
            assignment__section_assigned__in=teacher_sections
        )
        
        return Response({
            'student': {
                'id': student.id,
                'username': student.username,
                'email': student.email
            },
            'progress': StudentProgressSerializer(progress, many=True).data
        })


class StudentsListView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        # Allow teachers to see all students to create groups
        students = User.objects.filter(is_student=True)
        print(f"DEBUG: StudentsListView hit by {request.user.username}")
        print(f"DEBUG: Found {students.count()} students in database")
        
        from core.serializers import UserSerializer
        return Response(UserSerializer(students, many=True).data)

from core.models import Group
from core.serializers import GroupSerializer

class TeacherGroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        # Teachers see groups they created OR groups they are involved with?
        # For now, let's say groups they created.
        return Group.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

