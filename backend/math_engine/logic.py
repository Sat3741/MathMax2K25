import random
import math
from datetime import datetime, timedelta, timezone

class AdaptiveEngine:
    """Handles adaptive learning logic"""
    
    def __init__(self, student):
        self.student = student
        self.concept_mastery = {}
        self._load_student_data()
    
    def _load_student_data(self):
        """Load student's historical performance data"""
        from student.models import StudentProgress
        
        # Get all progress records for the student
        progress_records = StudentProgress.objects.filter(student=self.student)
        
        # Store mastery levels and other metrics
        self.concept_mastery = {
            record.concept_id: {
                'mastery': record.mastery_level,
                'last_practiced': record.last_practiced,
                'next_review': record.next_review,
                'accuracy': record.correct_answers / max(1, record.total_attempts)
            }
            for record in progress_records
        }
    
    def get_concept_difficulty(self, concept_id):
        """Get difficulty level for a concept based on student's mastery"""
        mastery_data = self.concept_mastery.get(concept_id, {
            'mastery': 0,
            'accuracy': 0,
            'next_review': datetime.now()
        })
        
        # Base difficulty on mastery and accuracy
        base_difficulty = 1 + (1 - mastery_data['mastery']) * 9  # Scale 1-10
        
        # Adjust based on when it was last practiced (spaced repetition)
        now = datetime.now(timezone.utc)
        days_since_review = (now - mastery_data.get('last_practiced', now)).days
        
        # If it's time to review, slightly reduce difficulty
        if now >= mastery_data.get('next_review', now):
            base_difficulty *= 0.8  # Make it easier for review
        
        # Add some randomness to prevent predictability
        return min(10, max(1, base_difficulty * random.uniform(0.9, 1.1)))
    
    def get_next_question_difficulty(self, concept_id, recent_performance):
        """Determine difficulty for next question based on recent performance"""
        if not recent_performance:
            return self.get_concept_difficulty(concept_id)
        
        # Calculate performance metrics
        accuracy = sum(1 for p in recent_performance if p['correct']) / len(recent_performance)
        avg_time = sum(p['time_taken'] for p in recent_performance) / len(recent_performance)
        
        # Get current difficulty
        current_difficulty = recent_performance[-1]['difficulty']
        
        # Adjust difficulty based on performance
        if accuracy > 0.8 and avg_time < 15:  # Too easy
            return min(10, current_difficulty * 1.2)
        elif accuracy < 0.4 or avg_time > 30:  # Too hard
            return max(1, current_difficulty * 0.8)
        return current_difficulty

def generate_problem(topic, difficulty=1.0, student=None, recent_performance=None):
    """
    Generates a math problem with adaptive difficulty.
    
    Args:
        topic: The math topic (addition, subtraction, etc.)
        difficulty: Base difficulty level (1.0-10.0)
        student: Optional student object for personalized difficulty
        recent_performance: List of recent question performances
    """
    # Initialize adaptive engine if student is provided
    if student:
        engine = AdaptiveEngine(student)
        difficulty = engine.get_next_question_difficulty(topic, recent_performance or [])
    
    # Ensure difficulty is within bounds
    difficulty = max(1.0, min(10.0, float(difficulty)))
    
    # Select generator based on topic
    generators = {
        'addition': generate_addition,
        'subtraction': generate_subtraction,
        'multiplication': generate_multiplication,
        'division': generate_division
    }
    
    generator = generators.get(topic)
    if not generator:
        return {"error": "Unknown topic"}
    
    # Generate the problem with error handling
    try:
        return generator(difficulty)
    except Exception as e:
        return {"error": f"Error generating problem: {str(e)}"}

def get_range(difficulty, base=10, growth=1.3):
    """
    Calculates the number range based on difficulty using exponential growth.
    Formula: Max = Base * (Growth ^ (Difficulty^0.7)) - Smoother scaling
    """
    max_val = int(base * (growth ** (difficulty ** 0.7)))
    return max(5, max_val)

def generate_addition(difficulty):
    r = get_range(difficulty, base=10, growth=1.4)
    
    # Adjust number of terms based on difficulty
    if difficulty > 7:
        terms = random.randint(3, 4)
    elif difficulty > 4:
        terms = random.choice([2, 3])
    else:
        terms = 2
    
    # Generate terms with increasing difficulty
    numbers = [random.randint(1, r) for _ in range(terms)]
    
    # For higher difficulty, include negative numbers
    if difficulty > 6 and random.random() > 0.7:
        numbers[-1] = -numbers[-1]
    
    question = " + ".join(map(str, numbers))
    answer = sum(numbers)
    
    return {
        "question": question,
        "answer": answer,
        "type": "addition",
        "difficulty": difficulty,
        "hint": "Remember to add all the numbers together.",
        "explanation": f"The sum of {question} is {answer}."
    }

def generate_subtraction(difficulty):
    r = get_range(difficulty, base=12, growth=1.35)
    
    # For higher difficulty, allow negative results
    if difficulty > 5 and random.random() > 0.6:
        a = random.randint(1, r)
        b = random.randint(1, r)
    else:
        a = random.randint(int(r*0.2), r)
        b = random.randint(1, int(r*0.8))
        if a < b:
            a, b = b, a
    
    # For even higher difficulty, chain multiple subtractions
    if difficulty > 8 and random.random() > 0.7:
        c = random.randint(1, r//2)
        question = f"{a} - {b} - {c}"
        answer = a - b - c
    else:
        question = f"{a} - {b}"
        answer = a - b
    
    return {
        "question": question,
        "answer": answer,
        "type": "subtraction",
        "difficulty": difficulty,
        "hint": "Subtract the second number from the first.",
        "explanation": f"{a} - {b} = {answer}"
    }

def generate_multiplication(difficulty):
    # Adjust ranges based on difficulty
    if difficulty > 8:
        r1 = get_range(difficulty, base=15, growth=1.3)
        r2 = get_range(difficulty, base=12, growth=1.3)
    elif difficulty > 5:
        r1 = get_range(difficulty, base=10, growth=1.2)
        r2 = get_range(difficulty, base=8, growth=1.2)
    else:
        r1 = get_range(difficulty, base=5, growth=1.1)
        r2 = get_range(difficulty, base=3, growth=1.1)
    
    a = random.randint(2, r1)
    b = random.randint(2, r2)
    
    # For higher difficulty, include negative numbers
    if difficulty > 6 and random.random() > 0.7:
        a = -a
    
    return {
        "question": f"{a} × {b}",
        "answer": a * b,
        "type": "multiplication",
        "difficulty": difficulty,
        "hint": f"{a} times {b} is the same as {a} added to itself {b} times.",
        "explanation": f"{a} × {b} = {a*b}"
    }

def generate_division(difficulty):
    # Adjust ranges based on difficulty
    if difficulty > 8:
        r1 = get_range(difficulty, base=12, growth=1.3)
        r2 = get_range(difficulty, base=10, growth=1.2)
    elif difficulty > 5:
        r1 = get_range(difficulty, base=8, growth=1.2)
        r2 = get_range(difficulty, base=6, growth=1.1)
    else:
        r1 = get_range(difficulty, base=5, growth=1.1)
        r2 = get_range(difficulty, base=3, growth=1.0)
    
    b = random.randint(2, r2)  # Divisor
    ans = random.randint(2, r1)  # Quotient
    a = b * ans  # Dividend
    
    # For higher difficulty, include remainders
    if difficulty > 6 and random.random() > 0.6:
        remainder = random.randint(1, b-1) if b > 2 else 0
        a += remainder
        return {
            "question": f"{a} ÷ {b}",
            "answer": f"{ans} R{remainder}",
            "type": "division",
            "difficulty": difficulty,
            "hint": f"Divide {a} by {b} and find the quotient and remainder.",
            "explanation": f"{a} ÷ {b} = {ans} with a remainder of {remainder}."
        }
    
    return {
        "question": f"{a} ÷ {b}",
        "answer": ans,
        "type": "division",
        "difficulty": difficulty,
        "hint": f"What number multiplied by {b} equals {a}?",
        "explanation": f"{b} × {ans} = {a}, so {a} ÷ {b} = {ans}"
    }

def calculate_next_review(mastery_level, current_time=None):
    """
    Calculate when the next review should be based on mastery level
    using a spaced repetition algorithm.
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)
    
    # Base interval in days
    if mastery_level < 0.5:  # Low mastery
        days = 1
    elif mastery_level < 0.7:  # Medium mastery
        days = 3
    elif mastery_level < 0.9:  # High mastery
        days = 7
    else:  # Very high mastery
        days = 14
    
    # Add some randomness to prevent reviewing everything on the same day
    days = int(days * random.uniform(0.8, 1.2))
    
    return current_time + timedelta(days=days)

def analyze_common_errors(responses):
    """Analyze responses to identify common error patterns"""
    if not responses:
        return []
    
    error_patterns = {}
    
    for resp in responses:
        if not resp.get('is_correct', True):
            question_type = resp.get('type', 'unknown')
            error_type = f"{question_type}_error"
            
            # Simple error categorization - can be expanded
            if question_type == 'addition':
                if abs(resp.get('student_answer', 0) - resp.get('correct_answer', 0)) == 1:
                    error_type = "off_by_one"
                elif resp.get('student_answer', 0) > resp.get('correct_answer', 0):
                    error_type = "over_counting"
                else:
                    error_type = "under_counting"
            
            error_patterns[error_type] = error_patterns.get(error_type, 0) + 1
    
    # Sort by frequency
    return sorted(error_patterns.items(), key=lambda x: x[1], reverse=True)
