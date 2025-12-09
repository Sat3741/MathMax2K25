from rest_framework import serializers
from .models import Class, Assignment, StudentProgress
from django.contrib.auth import get_user_model

User = get_user_model()

from core.models import Section
from core.serializers import SectionSerializer

class TeacherSectionSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'name', 'academic_class', 'teacher', 'student_count', 'display_name', 'created_at']
        read_only_fields = ['id', 'teacher', 'created_at']

    def get_student_count(self, obj):
        # Calculate students in this section based on User properties
        return User.objects.filter(
            grade_level=obj.academic_class.grade_level,
            section=obj.name,
            is_student=True
        ).count()

    def get_display_name(self, obj):
        return f"{obj.academic_class.name} - Section {obj.name}"


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'teacher', 'section_assigned', 'group_assigned', 'topic', 'difficulty', 'num_questions', 'due_date', 'created_at']
        read_only_fields = ['id', 'teacher', 'created_at']


class StudentProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.SerializerMethodField()

    class Meta:
        model = StudentProgress
        fields = ['id', 'student', 'student_name', 'assignment', 'assignment_title', 'score', 'total_questions', 'completed', 'completed_at', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.username

    def get_assignment_title(self, obj):
        return obj.assignment.title
