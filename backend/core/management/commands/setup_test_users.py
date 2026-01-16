from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import User, AcademicClass, Section

class Command(BaseCommand):
    help = 'Creates test users for Admin, Teacher, and Student'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # 1. Create Classes and Sections
        grade5, _ = AcademicClass.objects.get_or_create(name="Grade 5", grade_level=5)
        secA, _ = Section.objects.get_or_create(academic_class=grade5, name="A")
        
        # 2. Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write(self.style.SUCCESS("Created Admin: admin/admin123"))
        else:
            self.stdout.write("Admin already exists")

        # 3. Teacher
        if not User.objects.filter(username='teacher').exists():
            u = User.objects.create_user('teacher', 'teacher@example.com', 'teacher123')
            u.is_teacher = True
            u.first_name = "John"
            u.last_name = "Teacher"
            u.save()
            self.stdout.write(self.style.SUCCESS("Created Teacher: teacher/teacher123"))
        else:
            self.stdout.write("Teacher already exists")

        # 4. Student
        if not User.objects.filter(username='student').exists():
            u = User.objects.create_user('student', 'student@example.com', 'student123')
            u.is_student = True
            u.first_name = "Alice"
            u.last_name = "Student"
            u.grade_level = 5
            u.section = "A"
            u.save()
            self.stdout.write(self.style.SUCCESS("Created Student: student/student123"))
        else:
            self.stdout.write("Student already exists")
