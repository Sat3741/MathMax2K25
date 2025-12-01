from rest_framework import serializers
from .models import Class, Assignment, StudentProgress
from core.serializers import UserSerializer

class ClassSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    students = UserSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ('id', 'name', 'teacher', 'students', 'student_count', 'created_at')

    def get_student_count(self, obj):
        return obj.students.count()


class AssignmentSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)

    class Meta:
        model = Assignment
        fields = ('id', 'title', 'description', 'teacher', 'class_assigned', 'class_name', 
                  'topic', 'difficulty', 'num_questions', 'due_date', 'created_at')


class StudentProgressSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = StudentProgress
        fields = ('id', 'student', 'assignment', 'assignment_title', 'score', 
                  'total_questions', 'percentage', 'completed', 'completed_at', 'created_at')

    def get_percentage(self, obj):
        if obj.total_questions > 0:
            return round((obj.score / obj.total_questions) * 100, 2)
        return 0
