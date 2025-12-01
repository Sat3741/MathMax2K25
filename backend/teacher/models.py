from django.db import models
from django.conf import settings

class Class(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='classes')
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='enrolled_classes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.teacher.username}"

    class Meta:
        verbose_name_plural = "Classes"


class Assignment(models.Model):
    TOPIC_CHOICES = [
        ('addition', 'Addition'),
        ('subtraction', 'Subtraction'),
        ('multiplication', 'Multiplication'),
        ('division', 'Division'),
    ]
    
    DIFFICULTY_CHOICES = [
        (1, 'Easy'),
        (2, 'Medium'),
        (3, 'Hard'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='assignments')
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES)
    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES, default=1)
    num_questions = models.IntegerField(default=10)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.class_assigned.name}"


class StudentProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='student_progress')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"

    class Meta:
        unique_together = ('student', 'assignment')
