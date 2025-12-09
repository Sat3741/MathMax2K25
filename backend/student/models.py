from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import JSONField

User = get_user_model()

class Concept(models.Model):
    """Represents a mathematical concept or topic"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True)
    difficulty_level = models.FloatField(default=1.0)
    
    def __str__(self):
        return self.name

class StudentProgress(models.Model):
    """Tracks student's progress on specific concepts"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='concept_progress')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE)
    mastery_level = models.FloatField(default=0.0)  # 0.0 to 1.0
    last_practiced = models.DateTimeField(auto_now=True)
    next_review = models.DateTimeField(default=timezone.now)
    correct_answers = models.IntegerField(default=0)
    total_attempts = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('student', 'concept')
        verbose_name_plural = 'Student Progresses'
    
    def update_mastery(self, is_correct, response_time):
        """Update mastery level based on response"""
        self.total_attempts += 1
        if is_correct:
            self.correct_answers += 1
        
        # Calculate new mastery (weighted average with decay)
        accuracy = self.correct_answers / self.total_attempts
        time_factor = min(1.0, 5.0 / (response_time + 0.1))  # Normalize time factor
        self.mastery_level = (self.mastery_level * 0.7) + (accuracy * time_factor * 0.3)
        self.save()
        return self.mastery_level

class PracticeSession(models.Model):
    """Tracks a single practice session"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='practice_sessions')
    score = models.FloatField()  # Changed to float for more granular scoring
    total_questions = models.IntegerField()
    topics = models.ManyToManyField(Concept, related_name='practice_sessions')
    difficulty = models.FloatField(default=1.0)
    final_difficulty = models.FloatField(default=1.0)
    avg_time_per_question = models.FloatField(default=0.0)
    difficulty_progression = JSONField(default=list)
    time_per_question = JSONField(default=list)  # Store time taken for each question
    accuracy_per_question = JSONField(default=list)  # Store accuracy for each question
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Performance metrics
    concept_breakdown = JSONField(default=dict)  # {concept_id: {correct: int, total: int}}
    common_errors = JSONField(default=list)  # List of error patterns
    
    # Practice Configuration
    practice_mode = models.CharField(max_length=20, default='fixed')  # 'fixed' or 'timer'
    timer_duration = models.IntegerField(null=True, blank=True)  # in seconds, only for timer mode
    skipped_questions = models.IntegerField(default=0)  # Number of questions skipped
    
    def __str__(self):
        return f"{self.student.username} - {self.created_at.date()} - Score: {self.score}% - Difficulty: {self.final_difficulty:.1f}"
    
    def save(self, *args, **kwargs):
        # Calculate final score as percentage if not set
        if not self.score and self.total_questions > 0:
            correct = sum(1 for x in self.accuracy_per_question if x)
            self.score = (correct / self.total_questions) * 100
        super().save(*args, **kwargs)

class QuestionResponse(models.Model):
    """Stores detailed information about each question in a practice session"""
    session = models.ForeignKey(PracticeSession, on_delete=models.CASCADE, related_name='responses')
    question_type = models.CharField(max_length=50)
    question_data = JSONField()  # The actual question
    student_answer = models.CharField(max_length=255, blank=True, null=True)
    correct_answer = models.CharField(max_length=255)
    is_correct = models.BooleanField()
    time_taken = models.FloatField()  # In seconds
    difficulty = models.FloatField()
    concept = models.ForeignKey(Concept, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.session.student.username} - {self.question_type} - {'✓' if self.is_correct else '✗'}"
