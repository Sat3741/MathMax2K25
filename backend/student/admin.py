from django.contrib import admin
from .models import (
    Concept, 
    PracticeSession, 
    QuestionResponse, 
    StudentProgress
)

class ConceptAdmin(admin.ModelAdmin):
    list_display = ('name', 'difficulty_level')
    search_fields = ('name', 'description')

class QuestionResponseInline(admin.TabularInline):
    model = QuestionResponse
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('question_type', 'is_correct', 'time_taken', 'difficulty', 'created_at')

class PracticeSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'score', 'total_questions', 'created_at')
    list_filter = ('created_at', 'completed_at')
    search_fields = ('student__username', 'student__email')
    readonly_fields = ('created_at', 'completed_at', 'concept_breakdown', 'common_errors')
    inlines = [QuestionResponseInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student')

class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'concept', 'mastery_level', 'accuracy', 'next_review')
    list_filter = ('concept', 'next_review')
    search_fields = ('student__username', 'concept__name')
    readonly_fields = ('mastery_level', 'last_practiced', 'accuracy')
    
    def accuracy(self, obj):
        if obj.total_attempts > 0:
            return f"{(obj.correct_answers / obj.total_attempts * 100):.1f}%"
        return "N/A"
    accuracy.short_description = 'Accuracy'

# Register models
admin.site.register(Concept, ConceptAdmin)
admin.site.register(PracticeSession, PracticeSessionAdmin)
admin.site.register(StudentProgress, StudentProgressAdmin)
