from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import json

from .models import (
    PracticeSession, 
    QuestionResponse, 
    StudentProgress,
    Concept
)
from math_engine.logic import (
    generate_problem,
    calculate_next_review,
    analyze_common_errors
)

class AdaptivePracticeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        """Get the next adaptive question for the student"""
        student = request.user
        topic = request.query_params.get('topic', 'addition')
        
        # Get or create concept
        concept, _ = Concept.objects.get_or_create(
            name=topic,
            defaults={'difficulty_level': 1.0}
        )
        
        # Get student's progress on this concept
        progress, _ = StudentProgress.objects.get_or_create(
            student=student,
            concept=concept
        )
        
        # Get recent performance for this concept
        recent_responses = QuestionResponse.objects.filter(
            session__student=student,
            concept=concept
        ).order_by('-created_at')[:5]  # Get last 5 responses
        
        recent_performance = [{
            'correct': r.is_correct,
            'time_taken': r.time_taken,
            'difficulty': r.difficulty
        } for r in recent_responses]
        
        # Generate problem with adaptive difficulty
        problem = generate_problem(
            topic=topic,
            student=student,
            recent_performance=recent_performance
        )
        
        # Create a new practice session if one doesn't exist
        session, created = PracticeSession.objects.get_or_create(
            student=student,
            completed_at__isnull=True,
            defaults={
                'score': 0,
                'total_questions': 0,
                'difficulty': problem.get('difficulty', 1.0),
                'final_difficulty': problem.get('difficulty', 1.0),
                'avg_time_per_question': 0,
                'difficulty_progression': [problem.get('difficulty', 1.0)],
                'time_per_question': [],
                'accuracy_per_question': [],
                'concept_breakdown': {str(concept.id): {'correct': 0, 'total': 0}},
                'common_errors': []
            }
        )
        
        if created:
            session.topics.add(concept)
        
        # Add session ID to problem data
        problem['session_id'] = session.id
        
        return Response(problem)
    
    def post(self, request, format=None):
        """Submit an answer and get feedback"""
        student = request.user
        data = request.data
        
        try:
            session = PracticeSession.objects.get(
                id=data.get('session_id'),
                student=student,
                completed_at__isnull=True
            )
        except PracticeSession.DoesNotExist:
            return Response(
                {'error': 'Invalid or completed session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get concept
        try:
            concept = Concept.objects.get(name=data.get('type', 'addition'))
        except Concept.DoesNotExist:
            return Response(
                {'error': 'Invalid concept'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if answer is correct
        is_correct = str(data.get('answer', '')).strip().lower() == str(data.get('correct_answer', '')).strip().lower()
        time_taken = float(data.get('time_taken', 0))
        difficulty = float(data.get('difficulty', 1.0))
        
        # Update session metrics
        session.total_questions += 1
        session.accuracy_per_question.append(is_correct)
        session.time_per_question.append(time_taken)
        session.difficulty_progression.append(difficulty)
        
        # Update concept breakdown
        concept_data = session.concept_breakdown.get(str(concept.id), {'correct': 0, 'total': 0})
        concept_data['total'] += 1
        if is_correct:
            concept_data['correct'] += 1
        session.concept_breakdown[str(concept.id)] = concept_data
        
        # Calculate new averages
        session.score = (sum(1 for x in session.accuracy_per_question if x) / 
                        len(session.accuracy_per_question)) * 100
        session.avg_time_per_question = sum(session.time_per_question) / len(session.time_per_question)
        session.final_difficulty = difficulty
        
        # Save session
        session.save()
        
        # Save question response
        response = QuestionResponse.objects.create(
            session=session,
            question_type=data.get('type'),
            question_data=data.get('question_data', {}),
            student_answer=data.get('answer'),
            correct_answer=data.get('correct_answer'),
            is_correct=is_correct,
            time_taken=time_taken,
            difficulty=difficulty,
            concept=concept
        )
        
        # Update student progress
        progress, _ = StudentProgress.objects.get_or_create(
            student=student,
            concept=concept
        )
        
        # Update mastery level
        mastery = progress.update_mastery(is_correct, time_taken)
        
        # Calculate next review time using spaced repetition
        progress.next_review = calculate_next_review(mastery)
        progress.save()
        
        # Prepare response
        response_data = {
            'is_correct': is_correct,
            'correct_answer': data.get('correct_answer'),
            'explanation': data.get('explanation', ''),
            'mastery_level': mastery,
            'next_review': progress.next_review,
            'session_score': session.score,
            'session_questions_answered': session.total_questions
        }
        
        # If session is complete (e.g., after 10 questions), mark as completed
        if session.total_questions >= 10:  # Example: 10 questions per session
            session.completed_at = timezone.now()
            
            # Analyze common errors for the session
            session_errors = analyze_common_errors(
                QuestionResponse.objects.filter(session=session).values()
            )
            session.common_errors = session_errors
            session.save()
            
            response_data['session_complete'] = True
            response_data['session_summary'] = {
                'total_questions': session.total_questions,
                'correct_answers': int((session.score / 100) * session.total_questions),
                'average_time': session.avg_time_per_question,
                'final_difficulty': session.final_difficulty,
                'common_errors': session_errors
            }
        
        return Response(response_data)

class StudentProgressView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        """Get student's progress across all concepts"""
        student = request.user
        
        # Get all progress records for the student
        progress_records = StudentProgress.objects.filter(
            student=student
        ).select_related('concept')
        
        # Calculate overall metrics
        total_attempts = sum(p.total_attempts for p in progress_records)
        total_correct = sum(p.correct_answers for p in progress_records)
        overall_accuracy = (total_correct / total_attempts * 100) if total_attempts > 0 else 0
        
        # Get recent activity
        recent_sessions = PracticeSession.objects.filter(
            student=student
        ).order_by('-created_at')[:5]
        
        # Get concept strengths and weaknesses
        concepts = []
        for record in progress_records:
            accuracy = (record.correct_answers / record.total_attempts * 100) if record.total_attempts > 0 else 0
            concepts.append({
                'concept': record.concept.name,
                'mastery_level': record.mastery_level * 100,  # Convert to percentage
                'accuracy': accuracy,
                'total_attempts': record.total_attempts,
                'last_practiced': record.last_practiced,
                'next_review': record.next_review
            })
        
        # Sort concepts by mastery level (lowest first)
        concepts.sort(key=lambda x: x['mastery_level'])
        
        return Response({
            'overall_accuracy': overall_accuracy,
            'total_questions_attempted': total_attempts,
            'concepts': concepts,
            'recent_sessions': [{
                'id': s.id,
                'score': s.score,
                'total_questions': s.total_questions,
                'date': s.created_at,
                'topics': [t.name for t in s.topics.all()]
            } for s in recent_sessions]
        })
