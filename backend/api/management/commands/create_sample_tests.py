from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Test, Question, Answer
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample tests, questions, and answers for testing purposes'

    def handle(self, *args, **kwargs):
        # Get or create sample teacher
        teacher, created = User.objects.get_or_create(
            username='sample_teacher',
            defaults={
                'email': 'teacher@mathmax.com',
                'is_teacher': True,
                'is_student': False
            }
        )
        if created:
            teacher.set_password('teacher123')
            teacher.save()
            self.stdout.write(self.style.SUCCESS('Created sample teacher account: sample_teacher (password: teacher123)'))
        else:
            self.stdout.write(self.style.SUCCESS('Using existing sample teacher account'))

        # Get or create sample students
        students = []
        for i in range(1, 3):
            student, created = User.objects.get_or_create(
                username=f'sample_student{i}',
                defaults={
                    'email': f'student{i}@mathmax.com',
                    'is_teacher': False,
                    'is_student': True,
                    'grade_level': i + 5  # Grades 6-7
                }
            )
            if created:
                student.set_password('student123')
                student.save()
                self.stdout.write(self.style.SUCCESS(f'Created sample student account: sample_student{i} (password: student123)'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Using existing sample student account: sample_student{i}'))
            students.append(student)

        # Create sample test 1: Basic Arithmetic
        test1, created = Test.objects.get_or_create(
            title='Basic Arithmetic Test',
            defaults={
                'description': 'A test covering basic arithmetic operations',
                'created_by': teacher,
                'time_limit_minutes': 30,
                'difficulty': 'easy',
                'is_published': True
            }
        )
        
        if created:
            # Question 1: Addition
            q1 = Question.objects.create(
                test=test1,
                question_text='What is 5 + 7?',
                question_type='mcq',
                points=1,
                order=1
            )
            Answer.objects.bulk_create([
                Answer(question=q1, answer_text='10', is_correct=False),
                Answer(question=q1, answer_text='11', is_correct=False),
                Answer(question=q1, answer_text='12', is_correct=True),
                Answer(question=q1, answer_text='13', is_correct=False)
            ])
            
            # Question 2: Subtraction
            q2 = Question.objects.create(
                test=test1,
                question_text='What is 15 - 8?',
                question_type='mcq',
                points=1,
                order=2
            )
            Answer.objects.bulk_create([
                Answer(question=q2, answer_text='5', is_correct=False),
                Answer(question=q2, answer_text='6', is_correct=False),
                Answer(question=q2, answer_text='7', is_correct=True),
                Answer(question=q2, answer_text='8', is_correct=False)
            ])
            
            # Question 3: Multiplication
            q3 = Question.objects.create(
                test=test1,
                question_text='What is 6 × 9?',
                question_type='mcq',
                points=2,
                order=3
            )
            Answer.objects.bulk_create([
                Answer(question=q3, answer_text='45', is_correct=False),
                Answer(question=q3, answer_text='54', is_correct=True),
                Answer(question=q3, answer_text='56', is_correct=False),
                Answer(question=q3, answer_text='63', is_correct=False)
            ])
            
            self.stdout.write(self.style.SUCCESS(f'Created test: {test1.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Test "{test1.title}" already exists'))

        # Create sample test 2: Fractions and Decimals
        test2, created = Test.objects.get_or_create(
            title='Fractions and Decimals',
            defaults={
                'description': 'Test your understanding of fractions and decimals',
                'created_by': teacher,
                'time_limit_minutes': 45,
                'difficulty': 'medium',
                'is_published': True
            }
        )
        
        if created:
            # Question 1: Fraction addition
            q1 = Question.objects.create(
                test=test2,
                question_text='What is 1/4 + 1/2?',
                question_type='mcq',
                points=2,
                order=1
            )
            Answer.objects.bulk_create([
                Answer(question=q1, answer_text='1/3', is_correct=False),
                Answer(question=q1, answer_text='2/3', is_correct=False),
                Answer(question=q1, answer_text='3/4', is_correct=True),
                Answer(question=q1, answer_text='1/2', is_correct=False)
            ])
            
            # Question 2: Decimal to fraction
            q2 = Question.objects.create(
                test=test2,
                question_text='Convert 0.75 to a fraction',
                question_type='short',
                points=2,
                order=2
            )
            Answer.objects.create(question=q2, answer_text='3/4', is_correct=True)
            
            # Question 3: True/False
            q3 = Question.objects.create(
                test=test2,
                question_text='0.5 is equal to 1/2',
                question_type='tf',
                points=1,
                order=3
            )
            Answer.objects.bulk_create([
                Answer(question=q3, answer_text='True', is_correct=True),
                Answer(question=q3, answer_text='False', is_correct=False)
            ])
            
            self.stdout.write(self.style.SUCCESS(f'Created test: {test2.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Test "{test2.title}" already exists'))
        
        self.stdout.write(self.style.SUCCESS('\nSample test content created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'Teacher account: sample_teacher (password: teacher123)'))
        self.stdout.write(self.style.SUCCESS('Student accounts: sample_student1, sample_student2 (password: student123)'))
        self.stdout.write(self.style.SUCCESS('\nTests created:'))
        self.stdout.write(self.style.SUCCESS(f'- {test1.title} (Easy)'))
        self.stdout.write(self.style.SUCCESS(f'- {test2.title} (Medium)'))
