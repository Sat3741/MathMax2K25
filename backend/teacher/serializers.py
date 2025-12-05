from rest_framework import serializers
from .models import Class, Assignment, StudentProgress
from django.contrib.auth import get_user_model

User = get_user_model()

class ClassSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'teacher', 'students', 'student_count', 'created_at']
        read_only_fields = ['id', 'teacher', 'created_at']

    def get_student_count(self, obj):
        return obj.students.count()


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'teacher', 'class_assigned', 'topic', 'difficulty', 'num_questions', 'due_date', 'created_at']
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
