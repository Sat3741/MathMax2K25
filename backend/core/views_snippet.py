
class StudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_student:
             return Response({"error": "Not a student account"}, status=403)
        
        # In a real app, we would fetch attendance, grades, etc here
        # For now, return enriched user data
        data = UserSerializer(user).data
        data.update({
            'total_attendance': 85, # Mock data
            'assignments_pending': 3,
            'average_grade': 'A',
            'next_class': 'Mathematics - 10:00 AM'
        })
        return Response(data)

class TeacherProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_teacher:
             return Response({"error": "Not a teacher account"}, status=403)
        
        # Mock specific teacher stats
        data = UserSerializer(user).data
        data.update({
            'classes_managed': 5,
            'total_students': 120,
            'upcoming_exams': 2,
            'department': 'Science'
        })
        return Response(data)
