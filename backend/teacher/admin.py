from django.contrib import admin
from .models import Class, Assignment, StudentProgress

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher', 'created_at')
    filter_horizontal = ('students',)

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'section_assigned', 'group_assigned', 'topic', 'difficulty', 'due_date')
    list_filter = ('topic', 'difficulty')

@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'score', 'total_questions', 'completed')
    list_filter = ('completed',)
