from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AcademicClass, Section, Group

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    phone = serializers.CharField(source='phone_number', allow_null=True)
    class_field = serializers.CharField(source='grade_level', allow_null=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'name', 'role', 'phone', 'class_field', 'section', 'is_student', 'is_teacher', 'grade_level', 'phone_number', 'is_staff', 'date_joined', 'last_login')
    
    def get_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username
    
    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'admin'
        elif obj.is_teacher:
            return 'teacher'
        elif obj.is_student:
            return 'student'
        return 'student'

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'is_student', 'is_teacher', 'grade_level', 'phone_number', 'section')

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
            grade_level=validated_data.get('grade_level'),
            phone_number=validated_data.get('phone_number', ''),
            section=validated_data.get('section', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'name', 'academic_class', 'section_teacher', 'capacity', 'created_at']
        read_only_fields = ['id', 'created_at']


class AcademicClassSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()
    section_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AcademicClass
        fields = ['id', 'name', 'grade_level', 'class_teacher_name', 'description', 'sections', 'section_count', 'created_at', 'updated_at']
    
    def get_sections(self, obj):
        sections = Section.objects.filter(academic_class=obj)
        return SectionSerializer(sections, many=True).data
    
    def get_section_count(self, obj):
        return Section.objects.filter(academic_class=obj).count()


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'students', 'student_ids', 'member_count', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'students']

    def get_member_count(self, obj):
        return obj.member_count

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.username
        return 'Unknown'

    def create(self, validated_data):
        student_ids = validated_data.pop('student_ids', [])
        group = Group.objects.create(**validated_data)
        if student_ids:
            students = User.objects.filter(id__in=student_ids, is_student=True)
            group.students.set(students)
        return group

    def update(self, instance, validated_data):
        student_ids = validated_data.pop('student_ids', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        
        if student_ids is not None:
            students = User.objects.filter(id__in=student_ids, is_student=True)
            instance.students.set(students)
        
        return instance
