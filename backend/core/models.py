from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_student = models.BooleanField(default=True)
    is_teacher = models.BooleanField(default=False)
    
    # Add any additional fields here (e.g., grade level)
    grade_level = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    section = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.username


class AcademicClass(models.Model):
    """Represents an academic class/grade level for admin management"""
    name = models.CharField(max_length=50)  # e.g., "Class 9"
    grade_level = models.IntegerField()  # e.g., 9
    class_teacher_name = models.CharField(max_length=100, blank=True, null=True)  # Teacher name
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Academic Classes"
        ordering = ['grade_level']

    def __str__(self):
        return self.name


class Section(models.Model):
    """Represents a section within an academic class"""
    name = models.CharField(max_length=10)  # e.g., "A", "B", "Rose"
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='sections')
    section_teacher = models.CharField(max_length=100, blank=True, null=True)  # Teacher for this specific section
    capacity = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['academic_class', 'name']

    def __str__(self):
        return f"{self.academic_class.name} - Section {self.name}"


class Group(models.Model):
    """Represents a student group for organizing students"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    students = models.ManyToManyField(User, related_name='student_groups', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.students.count()
