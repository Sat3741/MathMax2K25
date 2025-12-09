import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Card, 
    CardContent, 
    Stack, 
    Container,
    Paper,
    Avatar
} from '@mui/material';
import { Users, Play, Trophy, Swords } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useMultiplayer } from '../context/MultiplayerContext';

const MultiplayerLobby = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { connect, disconnect, gameState } = useMultiplayer();
    const [joinCode, setJoinCode] = useState('');
    const [username, setUsername] = useState(''); 
    const [isConnecting, setIsConnecting] = useState(false);

    // Reset state on load
    React.useEffect(() => {
        disconnect();
    }, [disconnect]);

    // Navigate when roomCode is set
    React.useEffect(() => {
        if (gameState.roomCode && isConnecting) {
            navigate('/multiplayer/battle');
        }
    }, [gameState.roomCode, isConnecting, navigate]);

    const handleCreate = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setIsConnecting(true);
        connect(code, username || 'Player' + Math.floor(Math.random()*1000));
        // Navigation happens in useEffect
    };

    const handleJoin = () => {
        if (!joinCode) return;
        setIsConnecting(true);
        connect(joinCode, username || 'Player' + Math.floor(Math.random()*1000));
    };

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ 
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Math Battle Arena
                </Typography>
                <Typography variant="h5" color="text.secondary">
                    Challenge friends or global players in real-time!
                </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* CREATE ROOM */}
                <Card sx={{ flex: 1, p: 2, borderRadius: 4, height: '100%', position: 'relative', overflow: 'visible' }}>
                    <Box sx={{
                        position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
                        bgcolor: 'primary.main', borderRadius: '50%', p: 2, boxShadow: 4
                    }}>
                        <Swords size={40} color="white" />
                    </Box>
                    <CardContent sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Create Room</Typography>
                        <Typography variant="body1" color="text.secondary" mb={4}>
                            Host a new game and invite friends with a code.
                        </Typography>
                        <TextField 
                            label="Your Nickname" 
                            variant="outlined" 
                            fullWidth 
                            sx={{ mb: 3 }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button 
                            variant="contained" 
                            size="large" 
                            fullWidth 
                            startIcon={<Play />}
                            onClick={handleCreate}
                            sx={{ borderRadius: 3, py: 1.5, fontSize: '1.2rem' }}
                        >
                            Start Battle
                        </Button>
                    </CardContent>
                </Card>

                {/* JOIN ROOM */}
                <Card sx={{ flex: 1, p: 2, borderRadius: 4, height: '100%', position: 'relative', overflow: 'visible' }}>
                    <Box sx={{
                        position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
                        bgcolor: 'secondary.main', borderRadius: '50%', p: 2, boxShadow: 4
                    }}>
                        <Users size={40} color="white" />
                    </Box>
                    <CardContent sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Join Party</Typography>
                        <Typography variant="body1" color="text.secondary" mb={4}>
                            Enter a room code to join an existing battle.
                        </Typography>
                        <TextField 
                            label="Room Code" 
                            variant="outlined" 
                            fullWidth 
                            sx={{ mb: 3 }}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <Button 
                            variant="contained" 
                            color="secondary"
                            size="large" 
                            fullWidth 
                            disabled={!joinCode}
                            onClick={handleJoin}
                            sx={{ borderRadius: 3, py: 1.5, fontSize: '1.2rem' }}
                        >
                            Join Game
                        </Button>
                    </CardContent>
                </Card>
            </Stack>

            {/* LEADERBOARD PREVIEW */}
            <Box mt={8}>
                <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <Trophy size={32} color="#FFD700" />
                        <Typography variant="h5" fontWeight="bold">Global Legends</Typography>
                    </Stack>
                    <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                            <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" 
                                sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>P{i}</Avatar>
                                    <Typography fontWeight="bold">Player {i}</Typography>
                                </Stack>
                                <Typography fontWeight="bold" color="primary.main">{1000 - i*50} Pts</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
};

export default MultiplayerLobby;
