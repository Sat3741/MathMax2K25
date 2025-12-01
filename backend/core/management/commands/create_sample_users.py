from django.core.management.base import BaseCommand
from core.models import User

class Command(BaseCommand):
    help = 'Create sample teachers and students for testing'

    def handle(self, *args, **kwargs):
        # Create 5 teachers
        teachers = [
            {'username': 'teacher1', 'email': 'teacher1@mathmax.com', 'password': 'teacher123', 'is_teacher': True},
            {'username': 'teacher2', 'email': 'teacher2@mathmax.com', 'password': 'teacher123', 'is_teacher': True},
            {'username': 'teacher3', 'email': 'teacher3@mathmax.com', 'password': 'teacher123', 'is_teacher': True},
            {'username': 'teacher4', 'email': 'teacher4@mathmax.com', 'password': 'teacher123', 'is_teacher': True},
            {'username': 'teacher5', 'email': 'teacher5@mathmax.com', 'password': 'teacher123', 'is_teacher': True},
        ]

        # Create 5 students
        students = [
            {'username': 'student1', 'email': 'student1@mathmax.com', 'password': 'student123', 'is_student': True, 'grade_level': 3},
            {'username': 'student2', 'email': 'student2@mathmax.com', 'password': 'student123', 'is_student': True, 'grade_level': 4},
            {'username': 'student3', 'email': 'student3@mathmax.com', 'password': 'student123', 'is_student': True, 'grade_level': 5},
            {'username': 'student4', 'email': 'student4@mathmax.com', 'password': 'student123', 'is_student': True, 'grade_level': 6},
            {'username': 'student5', 'email': 'student5@mathmax.com', 'password': 'student123', 'is_student': True, 'grade_level': 7},
        ]

        # Create teachers
        for teacher_data in teachers:
            if not User.objects.filter(username=teacher_data['username']).exists():
                user = User.objects.create_user(
                    username=teacher_data['username'],
                    email=teacher_data['email'],
                    password=teacher_data['password'],
                    is_teacher=teacher_data['is_teacher']
                )
                self.stdout.write(self.style.SUCCESS(f'Created teacher: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'Teacher {teacher_data["username"]} already exists'))

        # Create students
        for student_data in students:
            if not User.objects.filter(username=student_data['username']).exists():
                user = User.objects.create_user(
                    username=student_data['username'],
                    email=student_data['email'],
                    password=student_data['password'],
                    is_student=student_data['is_student'],
                    grade_level=student_data.get('grade_level')
                )
                self.stdout.write(self.style.SUCCESS(f'Created student: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'Student {student_data["username"]} already exists'))

        self.stdout.write(self.style.SUCCESS('\nSample users created successfully!'))
        self.stdout.write(self.style.SUCCESS('Teachers: teacher1-5 (password: teacher123)'))
        self.stdout.write(self.style.SUCCESS('Students: student1-5 (password: student123)'))
