import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GameRoom, GamePlayer
from django.contrib.auth import get_user_model

User = get_user_model()

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'game_{self.room_code}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'join_game':
            await self.handle_join(data)
        elif message_type == 'score_update':
            await self.handle_score_update(data)
        elif message_type == 'start_game':
            settings = data.get('settings', {})
            await self.handle_start_game(settings)

    async def handle_join(self, data):
        username = data.get('username')
        # Logic to add player to DB would go here
        
        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_joined',
                'username': username,
                'message': f'{username} has joined the game!'
            }
        )

    async def handle_score_update(self, data):
        username = data.get('username')
        score = data.get('score')
        
        # Broadcast score update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'score_broadcast',
                'username': username,
                'score': score
            }
        )

    async def handle_start_game(self, settings):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_started',
                'settings': settings,
                'message': 'Game is starting!'
            }
        )

    # Handlers for group messages
    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'username': event['username'],
            'message': event['message']
        }))

    async def score_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'username': event['username'],
            'score': event['score']
        }))
        
    async def game_started(self, event):
         await self.send(text_data=json.dumps({
            'type': 'game_started',
            'settings': event.get('settings', {})
        }))
