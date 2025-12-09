from rest_framework import serializers
from .models import (
    PracticeSession, 
    Concept, 
    StudentProgress, 
    QuestionResponse
)
from django.utils import timezone

class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ['id', 'name', 'description', 'difficulty_level']
        read_only_fields = ['id']

class QuestionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionResponse
        fields = [
            'id', 'question_type', 'question_data', 
            'student_answer', 'correct_answer', 'is_correct',
            'time_taken', 'difficulty', 'created_at'
        ]
        read_only_fields = ['created_at']

class StudentProgressSerializer(serializers.ModelSerializer):
    concept = ConceptSerializer(read_only=True)
    concept_id = serializers.PrimaryKeyRelatedField(
        queryset=Concept.objects.all(),
        source='concept',
        write_only=True
    )
    next_review = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentProgress
        fields = [
            'id', 'concept', 'concept_id', 'mastery_level',
            'correct_answers', 'total_attempts', 'last_practiced',
            'next_review', 'accuracy'
        ]
        read_only_fields = [
            'id', 'mastery_level', 'correct_answers',
            'total_attempts', 'last_practiced', 'accuracy'
        ]
    
    def get_next_review(self, obj):
        if obj.next_review:
            return (obj.next_review - timezone.now()).days
        return None

class PracticeSessionSerializer(serializers.ModelSerializer):
    concept_breakdown = serializers.SerializerMethodField()
    common_errors = serializers.SerializerMethodField()
    topics = ConceptSerializer(many=True, read_only=True)
    topic_ids = serializers.PrimaryKeyRelatedField(
        queryset=Concept.objects.all(),
        source='topics',
        many=True,
        write_only=True,
        required=False
    )
    topic_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = PracticeSession
        fields = [
            'id', 'score', 'total_questions', 'topics', 'topic_ids', 'topic_names',
            'difficulty', 'final_difficulty', 'avg_time_per_question',
            'difficulty_progression', 'time_per_question', 
            'accuracy_per_question', 'concept_breakdown', 'common_errors',
            'practice_mode', 'timer_duration', 'skipped_questions',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'completed_at', 'score',
            'concept_breakdown', 'common_errors'
        ]
    
    def get_concept_breakdown(self, obj):
        return obj.concept_breakdown or {}
    
    def get_common_errors(self, obj):
        return obj.common_errors or []
    
    def create(self, validated_data):
        # Set default values
        validated_data.setdefault('score', 0)
        validated_data.setdefault('total_questions', 0)
        validated_data.setdefault('difficulty', 1.0)
        validated_data.setdefault('final_difficulty', 1.0)
        validated_data.setdefault('avg_time_per_question', 0.0)
        validated_data.setdefault('difficulty_progression', [])
        validated_data.setdefault('time_per_question', [])
        validated_data.setdefault('accuracy_per_question', [])
        validated_data.setdefault('concept_breakdown', {})
        validated_data.setdefault('common_errors', [])
        
        # Allow clients to pass `topics` as a list of concept names or ids.
        # We check both topic_names and the popped fields
        topics_input = validated_data.pop('topic_names', None)
        
        # If topic_ids was passed (via `topics` source), it's handled by m2m automatically by DRF?
        # Actually `source='topics'` with ManyToMany might auto-set it if in validated_data.
        # But we want to support names.

        # Create the PracticeSession instance first
        instance = super().create(validated_data)

        if topics_input:
            from .models import Concept

            # topics_input may be a list of names
            for t in topics_input:
                # Treat as name (string); get or create
                # We normalize to lowercase for consistency if needed, but model has case-sensitive name?
                # Assuming exact match or create
                concept, _ = Concept.objects.get_or_create(name=str(t))
                instance.topics.add(concept)

        return instance

class PracticeSessionDetailSerializer(PracticeSessionSerializer):
    responses = QuestionResponseSerializer(many=True, read_only=True)
    
    class Meta(PracticeSessionSerializer.Meta):
        fields = PracticeSessionSerializer.Meta.fields + ['responses']
