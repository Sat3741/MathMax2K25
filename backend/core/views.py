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
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Exclude staff/admin from student count
        total_students = User.objects.filter(is_student=True, is_staff=False).count()
        total_teachers = User.objects.filter(is_teacher=True).count()
        
        # Count actual AcademicClass objects
        active_classes = AcademicClass.objects.count()
        
        return Response({
            'total_students': total_students,
            'total_teachers': total_teachers,
            'active_classes': active_classes
        })

class BulkUserUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        from .utils import parse_file_users, generate_password
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        
        if not (uploaded_file.name.endswith('.csv') or uploaded_file.name.endswith('.xlsx') or uploaded_file.name.endswith('.xls')):
            return Response({'error': 'File must be a CSV or Excel (.xlsx) file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            users_data = parse_file_users(uploaded_file.read(), uploaded_file.name)
            created_users = []
            errors = []
            
            for user_data in users_data:
                try:
                    # Generate password
                    password = generate_password()
                    
                    # Determine role flags
                    is_student = user_data['role'] == 'student'
                    is_teacher = user_data['role'] == 'teacher'
                    
                    # Create user
                    user = User.objects.create_user(
                        username=user_data['username'],
                        email=user_data['email'],
                        password=password,
                        first_name=user_data['first_name'],
                        last_name=user_data['last_name'],
                        is_student=is_student,
                        is_teacher=is_teacher,
                        grade_level=int(user_data['grade_level']) if user_data['grade_level'] else None,
                        section=user_data['section'],
                        phone_number=user_data['phone_number']
                    )
                    
                    created_users.append({
                        'username': user.username,
                        'password': password,
                        'name': f"{user.first_name} {user.last_name}".strip(),
                        'role': user_data['role']
                    })
                    
                except Exception as e:
                    errors.append({
                        'username': user_data.get('username', 'Unknown'),
                        'error': str(e)
                    })
            
            return Response({
                'success': True,
                'created_count': len(created_users),
                'error_count': len(errors),
                'created_users': created_users,
                'errors': errors
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to process CSV: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


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

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

