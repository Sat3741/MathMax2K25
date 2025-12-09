from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, UserCreateSerializer, AcademicClassSerializer, SectionSerializer, GroupSerializer
from django.contrib.auth import get_user_model
from .models import AcademicClass, Section, Group

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        
        if user and user.is_staff:
            tokens = get_tokens_for_user(user)
            return Response({
                "tokens": tokens,
                "user": UserSerializer(user).data
            })
        elif user:
            return Response({"error": "Not authorized as admin"}, status=403)
        else:
            return Response({"error": "Invalid credentials"}, status=400)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]


    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        
        if user:
            # Enforce separation: Admins cannot use this login
            if user.is_staff:
                return Response(
                    {"error": "Administrator accounts must use the Admin Portal"}, 
                    status=403
                )

            tokens = get_tokens_for_user(user)
            return Response({
                "tokens": tokens,
                "user": UserSerializer(user).data
            })
        else:
            return Response({"error": "Invalid credentials"}, status=400)

class CreateUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        # Get the grade_level and section from request
        grade_level = request.data.get('grade_level')
        section_name = request.data.get('section')
        
        print(f"DEBUG: Creating user with grade_level={grade_level}, section={section_name}")
        
        # Auto-create class and section if they don't exist
        if grade_level:
            # Create or get the academic class
            academic_class, created = AcademicClass.objects.get_or_create(
                grade_level=grade_level,
                defaults={
                    'name': f'Class {grade_level}',
                    'description': f'Auto-created for Grade {grade_level}'
                }
            )
            print(f"DEBUG: AcademicClass {'created' if created else 'found'}: {academic_class.name}")
            
            # Create or get the section if section_name is provided
            if section_name:
                section, section_created = Section.objects.get_or_create(
                    name=section_name,
                    academic_class=academic_class,
                    defaults={
                        'capacity': None
                    }
                )
                print(f"DEBUG: Section {'created' if section_created else 'found'}: {section.name}")
        
        # Continue with user creation
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def update(self, request, *args, **kwargs):
        # Get the grade_level and section from request
        grade_level = request.data.get('grade_level')
        section_name = request.data.get('section')
        
        # Auto-create class and section if they don't exist
        if grade_level:
            # Create or get the academic class
            academic_class, created = AcademicClass.objects.get_or_create(
                grade_level=grade_level,
                defaults={
                    'name': f'Class {grade_level}',
                    'description': f'Auto-created for Grade {grade_level}'
                }
            )
            
            # Create or get the section if section_name is provided
            if section_name:
                Section.objects.get_or_create(
                    name=section_name,
                    academic_class=academic_class,
                    defaults={
                        'capacity': None
                    }
                )
        
        # Continue with the normal update
        return super().update(request, *args, **kwargs)



class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            total_students = User.objects.filter(is_student=True).count()
            total_teachers = User.objects.filter(is_teacher=True).count()
            total_classes = AcademicClass.objects.count()
            
            # Calculate recent activity (users joined in last 7 days)
            from django.utils import timezone
            import datetime
            last_week = timezone.now() - datetime.timedelta(days=7)
            new_users = User.objects.filter(date_joined__gte=last_week).count()
            
            return Response({
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_classes': total_classes,
                'new_users': new_users
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkUserUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        from .utils import parse_file_users, generate_password
        
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file_content = file_obj.read()
            filename = file_obj.name
            
            users_data = parse_file_users(file_content, filename)
            
            created_users = []
            errors = []
            
            for user_data in users_data:
                try:
                    username = user_data.get('username')
                    # Check if user exists
                    if User.objects.filter(username=username).exists():
                        errors.append(f"User {username} already exists")
                        continue
                        
                    password = generate_password()
                    
                    # Handle Grade Level and Section auto-creation logic
                    grade_level = user_data.get('grade_level')
                    section_name = user_data.get('section')
                    
                    grade_level_int = None
                    if grade_level:
                        try:
                            if isinstance(grade_level, str) and not grade_level.isdigit():
                                pass # invalid grade
                            else:
                                grade_level_int = int(grade_level)
                                academic_class, _ = AcademicClass.objects.get_or_create(
                                    grade_level=grade_level_int,
                                    defaults={'name': f'Class {grade_level_int}'}
                                )
                                
                                if section_name:
                                    Section.objects.get_or_create(
                                        name=section_name,
                                        academic_class=academic_class
                                    )
                        except ValueError:
                            pass # Ignore invalid grade levels for auto-creation
                    
                    # Create User
                    user = User.objects.create_user(
                        username=username,
                        email=user_data.get('email', ''),
                        password=password,
                        first_name=user_data.get('first_name', ''),
                        last_name=user_data.get('last_name', ''),
                        phone_number=user_data.get('phone_number', ''),
                        is_student=(user_data.get('role') == 'student'),
                        is_teacher=(user_data.get('role') == 'teacher'),
                        grade_level=grade_level_int,
                        section=section_name
                    )
                    
                    created_users.append({
                        'username': username,
                        'password': password,
                        'name': f"{user.first_name} {user.last_name}",
                        'role': 'student' if user.is_student else 'teacher'
                    })
                    
                except Exception as e:
                    errors.append(f"Error creating user {user_data.get('username')}: {str(e)}")
            
            return Response({
                'success': True,
                'created_count': len(created_users),
                'error_count': len(errors),
                'created_users': created_users,
                'errors': errors
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserPasswordResetView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        from .utils import generate_password
        
        try:
            user = User.objects.get(pk=pk)
            new_password = generate_password()
            user.set_password(new_password)
            user.save()
            
            return Response({
                'success': True,
                'username': user.username,
                'password': new_password,
                'message': 'Password reset successfully'
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=404)


class BulkPromoteView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        import traceback
        
        try:
            from_grade = request.data.get('from_grade')
            to_grade = request.data.get('to_grade')
            
            print(f"DEBUG: Bulk promote request - From: {from_grade}, To: {to_grade}")
            
            if not from_grade or not to_grade:
                return Response({
                    'error': 'Both from_grade and to_grade are required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Convert to integers to be safe
            try:
                from_grade = int(from_grade)
                to_grade = int(to_grade)
            except ValueError:
                return Response({
                    'error': 'Grade levels must be valid integers'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get all students in the from_grade
            students = User.objects.filter(
                is_student=True,
                grade_level=from_grade
            )
            
            count = students.count()
            print(f"DEBUG: Found {count} students to promote")
            
            if count == 0:
                return Response({
                    'error': f'No students found in Grade {from_grade}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Auto-create the target class if it doesn't exist
            target_class, created = AcademicClass.objects.get_or_create(
                grade_level=to_grade,
                defaults={
                    'name': f'Class {to_grade}',
                    'description': f'Auto-created for Grade {to_grade}'
                }
            )
            print(f"DEBUG: Target class {'created' if created else 'found'}: {target_class.name}")
            
            # Update all students to the new grade
            rows_updated = students.update(grade_level=to_grade)
            print(f"DEBUG: Updated {rows_updated} rows")
            
            return Response({
                'success': True,
                'promoted_count': rows_updated,
                'from_grade': from_grade,
                'to_grade': to_grade,
                'message': f'Successfully promoted {rows_updated} students from Grade {from_grade} to Grade {to_grade}'
            })
            
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"ERROR in BulkPromoteView: {str(e)}")
            print(error_details)
            return Response({
                'error': f'Server Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Academic Class Views
class AcademicClassViewSet(viewsets.ModelViewSet):
    queryset = AcademicClass.objects.all()
    serializer_class = AcademicClassSerializer
    permission_classes = [permissions.IsAdminUser]

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAdminUser]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        student_ids = request.data.get('student_ids', [])
        
        # Get student users
        students = User.objects.filter(id__in=student_ids, is_student=True)
        instance.students.set(students)
        
        return Response(GroupSerializer(instance).data)

class StudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            if not user.is_student:
                 return Response({"error": "Not a student account"}, status=403)
            
            # Fetch real practice data
            from student.models import PracticeSession
            from teacher.models import StudentProgress
            from django.db.models import Sum, Max, Avg
            from django.utils import timezone
            import datetime
            
            # Calculate Aggregates
            sessions = PracticeSession.objects.filter(student=user)
            total_sessions = sessions.count()
            
            # Aggregate expanded stats
            total_score_agg = sessions.aggregate(
                Sum('score'), 
                Max('score'), 
                Avg('score'),
                Avg('avg_time_per_question'),
                Avg('final_difficulty'),
                Max('final_difficulty')
            )
            
            total_score = total_score_agg['score__sum'] or 0
            highest_score = total_score_agg['score__max'] or 0
            average_score = round(total_score_agg['score__avg'] or 0, 1)
            
            # New Adaptive Stats
            avg_speed = round(total_score_agg['avg_time_per_question__avg'] or 0, 2)
            avg_difficulty = round(total_score_agg['final_difficulty__avg'] or 1.0, 1)
            max_difficulty = round(total_score_agg['final_difficulty__max'] or 1.0, 1)
            
            # Rich Streak Data Calculation with detailed session info
            daily_stats = {}

            # 1. Process Practice Sessions with details
            for s in sessions:
                # Ensure created_at is valid
                if s.created_at:
                    d_str = s.created_at.date().isoformat()
                    if d_str not in daily_stats:
                        daily_stats[d_str] = {
                            'score': 0, 
                            'sessions': 0, 
                            'assignments': 0,
                            'session_details': []
                        }
                    # Ensure score is a number
                    session_score = s.score if s.score is not None else 0
                    daily_stats[d_str]['score'] += session_score
                    daily_stats[d_str]['sessions'] += 1
                    
                    # Add session details
                    topics_list = list(s.topics.values_list('name', flat=True)) if s.topics.exists() else []
                    daily_stats[d_str]['session_details'].append({
                        'id': s.id,
                        'score': round(session_score, 1),
                        'total_questions': s.total_questions,
                        'topics': topics_list,
                        'difficulty': round(s.final_difficulty, 1),
                        'avg_time': round(s.avg_time_per_question, 1),
                        'skipped': s.skipped_questions,
                        'time': s.created_at.strftime('%I:%M %p')
                    })
                
            # 2. Process Assignments
            completed_assignments = StudentProgress.objects.filter(student=user, completed=True)
            assignments_count = completed_assignments.count()
            
            for a in completed_assignments:
                if a.completed_at: # Ensure timestamp exists
                    d_str = a.completed_at.date().isoformat()
                    if d_str not in daily_stats:
                        daily_stats[d_str] = {
                            'score': 0, 
                            'sessions': 0, 
                            'assignments': 0,
                            'session_details': []
                        }
                    daily_stats[d_str]['assignments'] += 1

            # Calculate Current Streak
            active_dates = {datetime.date.fromisoformat(d) for d, stats in daily_stats.items() if stats['sessions'] > 0 or stats['assignments'] > 0}
            
            current_streak = 0
            check_date = timezone.now().date()
            
            if check_date not in active_dates:
                 if (check_date - datetime.timedelta(days=1)) in active_dates:
                     check_date = check_date - datetime.timedelta(days=1)
                 else:
                     # No activity today or yesterday, streak broken
                     current_streak = 0
            
            # If check_date is valid (today or yesterday), count backwards
            if check_date in active_dates:
                # Start streak counting
                while check_date in active_dates:
                    current_streak += 1
                    check_date = check_date - datetime.timedelta(days=1)

            # Format for frontend
            end_date = timezone.now().date()
            start_date = end_date - datetime.timedelta(days=365)
            
            streak_data = [
                {
                    'date': k, 
                    'score': v['score'], 
                    'sessions': v['sessions'], 
                    'assignments': v['assignments'],
                    'session_details': v.get('session_details', [])
                } 
                for k, v in daily_stats.items() 
                if k >= start_date.isoformat()
            ]

            data = UserSerializer(user).data
            data.update({
                'assignments_completed': assignments_count,
                'total_score': total_score,
                'total_sessions': total_sessions,
                'average_score': average_score,
                'highest_score': highest_score,
                'avg_speed': avg_speed,
                'avg_difficulty': avg_difficulty,
                'max_difficulty': max_difficulty,
                'current_streak': current_streak,
                'streak_data': streak_data
            })
            return Response(data)

        except Exception as e:
            import traceback
            print("Error in StudentProfileView:")
            traceback.print_exc()
            return Response(
                {"error": "Internal Server Error", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeacherProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_teacher:
             return Response({"error": "Not a teacher account"}, status=403)
        
        # Real statistics
        from core.models import Section
        # teacher's sections
        sections = Section.objects.filter(teacher=user)
        total_students = 0
        for section in sections:
            # Approximate calculation or real one if filtering
             total_students += User.objects.filter(
                grade_level=section.academic_class.grade_level,
                section=section.name,
                is_student=True
            ).count()

        data = UserSerializer(user).data
        data.update({
            'classes_count': sections.count(),
            'total_students': total_students,
            # 'papers_to_grade': 15, # Placeholder for now
            # 'next_lecture': 'Physics - Class 10A' # Placeholder
        })
        return Response(data)
