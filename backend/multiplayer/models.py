from django.db import models
from django.conf import settings
import random
import string

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class GameRoom(models.Model):
    code = models.CharField(max_length=8, unique=True, default=generate_room_code)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hosted_rooms')
    is_active = models.BooleanField(default=True)
    mode = models.CharField(max_length=20, default='1vs1') # 1vs1, group
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} ({self.mode})"

class GamePlayer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(GameRoom, related_name='players', on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    is_ready = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'room')

    def __str__(self):
        return f"{self.user.username} in {self.room.code}"
