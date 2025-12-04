from django.contrib import admin
from .models import Test, Question, Answer, TestAttempt, StudentAnswer

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 1

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    show_change_link = True

class QuestionAdmin(admin.ModelAdmin):
    inlines = [AnswerInline]
    list_display = ('question_text', 'test', 'question_type', 'points')
    list_filter = ('test', 'question_type')
    search_fields = ('question_text',)

class TestAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]
    list_display = ('title', 'created_by', 'difficulty', 'is_published')
    list_filter = ('difficulty', 'is_published')
    search_fields = ('title', 'description')

class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'test', 'start_time', 'end_time', 'score', 'is_completed')
    list_filter = ('is_completed', 'test')
    search_fields = ('student__username', 'test__title')

class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('attempt__student__username', 'question__question_text')

# Register models
admin.site.register(Test, TestAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer)
admin.site.register(TestAttempt, TestAttemptAdmin)
admin.site.register(StudentAnswer, StudentAnswerAdmin)
