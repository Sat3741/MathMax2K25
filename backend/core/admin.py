from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, AcademicClass, Section, Group

admin.site.register(User, UserAdmin)
admin.site.register(AcademicClass)
admin.site.register(Section)
admin.site.register(Group)
