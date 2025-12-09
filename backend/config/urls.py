from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/math/', include('math_engine.urls')),
    path('api/teacher/', include('teacher.urls')),
    path('api/student/', include('student.urls')),
]
