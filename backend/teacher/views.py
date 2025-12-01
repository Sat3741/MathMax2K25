from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Class, Assignment, StudentProgress
from .serializers import ClassSerializer, AssignmentSerializer, StudentProgressSerializer

User = get_user_model()

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_teacher


class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = request.user
        classes = Class.objects.filter(teacher=teacher)
        assignments = Assignment.objects.filter(teacher=teacher)
        
        return Response({
            'classes_count': classes.count(),
            'assignments_count': assignments.count(),
            'students_count': sum(c.students.count() for c in classes),
            'recent_classes': ClassSerializer(classes[:5], many=True).data,
            'recent_assignments': AssignmentSerializer(assignments[:5], many=True).data,
        })


class ClassListCreateView(generics.ListCreateAPIView):
    serializer_class = ClassSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Class.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClassSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Class.objects.filter(teacher=self.request.user)


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


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Assignment.objects.filter(teacher=self.request.user)


class StudentProgressView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request, student_id):
        # Get all progress for a specific student in teacher's classes
        teacher_classes = Class.objects.filter(teacher=request.user)
        student = User.objects.get(id=student_id)
        
        progress = StudentProgress.objects.filter(
            student=student,
            assignment__class_assigned__in=teacher_classes
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
        # Get all students enrolled in teacher's classes
        teacher_classes = Class.objects.filter(teacher=request.user)
        students = User.objects.filter(
            enrolled_classes__in=teacher_classes,
            is_student=True
        ).distinct()
        
        from core.serializers import UserSerializer
        return Response(UserSerializer(students, many=True).data)
