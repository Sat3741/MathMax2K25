from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_student', 'is_teacher', 'grade_level', 'is_staff')

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'is_student', 'is_teacher', 'grade_level')

    def create(self, validated_data):
        # Ensure only one role is set (either student or teacher, not both)
        is_student = validated_data.get('is_student', False)
        is_teacher = validated_data.get('is_teacher', False)
        
        # If both are True, prioritize teacher
        if is_student and is_teacher:
            is_student = False
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_student=is_student,
            is_teacher=is_teacher,
            grade_level=validated_data.get('grade_level')
        )
        return user
