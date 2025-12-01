from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_student = models.BooleanField(default=True)
    is_teacher = models.BooleanField(default=False)
    
    # Add any additional fields here (e.g., grade level)
    grade_level = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.username
