import React, { useEffect, useState, useRef } from 'react';
import { 
    Box, 
    Typography, 
    Container, 
    Grid, 
    Paper, 
    LinearProgress, 
    Stack, 
    TextField, 
    Button,
    Card,
    Slider,
    ToggleButton,
    ToggleButtonGroup,
    Avatar,
    Chip,
    CircularProgress,
    Tooltip,
    IconButton
} from '@mui/material';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Settings, Swords, Trophy, Users, Mic, MicOff } from 'lucide-react';
import { useTheme, keyframes } from '@mui/material/styles';
import useSpeechRecognition, { parseSpokenNumber } from '../hooks/useSpeechRecognition';

const floatUp = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const BattleArena = () => {
    const theme = useTheme();
    const { gameState, sendScore, startGame } = useMultiplayer();
    const navigate = useNavigate();
    
    // Game State
    const [myScore, setMyScore] = useState(0);
    const [problem, setProblem] = useState(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState([]); // Array of { id, val }
    const [isCorrectAnim, setIsCorrectAnim] = useState(false);
    const inputRef = useRef(null);
    
    // Voice Recognition
    const { 
        transcript, 
        resultIndex, 
        sessionId, 
        isListening, 
        startListening, 
        stopListening, 
        resetTranscript 
    } = useSpeechRecognition();
    const processedResultIndices = useRef(new Set());

    // Setup State (Host only)
    const [setupMode, setSetupMode] = useState('custom'); 
    const [timerDuration, setTimerDuration] = useState(60);
    const [digitCount1, setDigitCount1] = useState(1);
    const [digitCount2, setDigitCount2] = useState(1);
    const [customOperator, setCustomOperator] = useState('addition');

    // Timer Logic
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        if (!gameState.roomCode) {
            navigate('/multiplayer');
        }
    }, [gameState.roomCode, navigate]);

    // Initialize Game when Active
    useEffect(() => {
        if (gameState.gameActive) {
            // Apply settings from server
            if (gameState.gameSettings) {
                if (gameState.gameSettings.timerDuration) {
                    setTimeRemaining(gameState.gameSettings.timerDuration);
                }
            } else {
                setTimeRemaining(60);
            }
            if (!problem) {
                generateProblem();
            }
        }
    }, [gameState.gameActive, gameState.gameSettings]);

    // Timer Countdown
    useEffect(() => {
        let interval = null;
        if (gameState.gameActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState.gameActive, timeRemaining]);

    const generateProblem = () => {
        let settings = gameState.gameSettings?.customConfig || {
            digits1: 1,
            digits2: 1,
            operator: 'addition'
        };

        const getMin = (d) => Math.pow(10, d - 1);
        const getMax = (d) => Math.pow(10, d) - 1;
        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const min1 = getMin(settings.digits1);
        const max1 = getMax(settings.digits1);
        const min2 = getMin(settings.digits2);
        const max2 = getMax(settings.digits2);

        let num1, num2, answer, symbol;

        switch (settings.operator) {
            case 'subtraction':
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                if (num2 > num1) [num1, num2] = [num2, num1]; // Swap for positive result
                answer = num1 - num2;
                symbol = '-';
                break;
            case 'multiplication':
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                answer = num1 * num2;
                symbol = '×';
                break;
            case 'division':
                num2 = getRandomInt(min2, max2);
                if (num2 === 0) num2 = 1;
                // Generate a clean division problem
                const quotient = getRandomInt(1, 10); // Keeping it simple for battle
                num1 = num2 * quotient;
                answer = quotient;
                symbol = '÷';
                break;
            case 'addition':
            default:
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                answer = num1 + num2;
                symbol = '+';
                break;
        }

        setProblem({
            num1,
            num2,
            symbol,
            answer
        });
        setUserAnswer("");
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleAnswer = (val, isVoice = false) => {
        setUserAnswer(val);

        if (problem && val) {
            const numVal = parseInt(val);
            // Allow typing partials, but check exact match
            if (numVal === problem.answer) {
                 // Feedback Animation
                 const id = Date.now();
                 setFeedback(prev => [...prev, { id, val: '+10' }]);
                 setTimeout(() => setFeedback(prev => prev.filter(f => f.id !== id)), 1000);
                 
                 setIsCorrectAnim(true);
                 setTimeout(() => setIsCorrectAnim(false), 300);

                 // Double check equality as string for voice to avoid partial matches triggering early? 
                 // Actually parseInt is fine.
                 const newScore = myScore + 10;
                 setMyScore(newScore);
                 sendScore(newScore, "Me");
                 generateProblem();
                 if (isVoice) resetTranscript();
            }
        }
    };

    const handleChange = (e) => {
        handleAnswer(e.target.value);
    };

    // Voice Effect
    useEffect(() => {
        if (transcript && gameState.gameActive && problem) {
            const uniqueKey = `${sessionId}-${resultIndex}`;
            if (processedResultIndices.current.has(uniqueKey)) return;

            const msg = transcript.toLowerCase();
            if (msg.includes('skip') || msg.includes('clear')) {
                resetTranscript();
                setUserAnswer("");
                return;
            }

            const parsed = parseSpokenNumber(transcript);
            if (parsed !== null) {
                if (Math.abs(parsed - problem.answer) < 0.001) {
                    // Correct
                    processedResultIndices.current.add(uniqueKey);
                    resetTranscript();
                    // Direct score update
                    setMyScore(prev => {
                         const s = prev + 10;
                         sendScore(s, "Me");
                         return s;
                    });
                    generateProblem();
                } else {
                    setUserAnswer(parsed.toString());
                }
            }
        }
    }, [transcript, resultIndex, sessionId, problem, gameState.gameActive]);

    
    const handleStartGame = () => {
        startGame({
            mode: setupMode,
            timerDuration: timerDuration,
            customConfig: {
                digits1: digitCount1,
                digits2: digitCount2,
                operator: customOperator
            }
        });
    };

    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    const renderSetup = () => (
        <Container maxWidth="lg" sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Card sx={{ 
                p: { xs: 3, md: 6 }, 
                borderRadius: 6, 
                boxShadow: theme.shadows[20], 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
            }}>
                <Typography variant="h2" fontWeight="900" gutterBottom sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    Battle Setup
                </Typography>
                
                <Box mb={5}>
                    <Chip 
                        label={`Room: ${gameState.roomCode}`} 
                        sx={{ 
                            fontSize: '1.2rem', 
                            py: 2.5, px: 2, 
                            fontWeight: 'bold', 
                            borderRadius: 3,
                            bgcolor: 'primary.main',
                            color: 'white'
                        }} 
                    />
                </Box>

                <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                    <Grid item xs={12} md={5}>
                        <Paper elevation={4} sx={{ p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={3}>
                                <Clock size={32} color={theme.palette.primary.main} />
                                <Typography variant="h5" fontWeight="bold">Duration</Typography>
                            </Box>
                            
                            <Box mb={4}>
                                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                                    {Math.floor(timerDuration/60)}m {timerDuration%60}s
                                </Typography>
                                <Slider 
                                    value={timerDuration}
                                    onChange={(e, v) => setTimerDuration(v)}
                                    min={30} max={300} step={30}
                                    sx={{ mt: 1, '& .MuiSlider-thumb': { width: 16, height: 16 } }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Operation</Typography>
                                <ToggleButtonGroup
                                    value={customOperator}
                                    exclusive
                                    onChange={(e, v) => v && setCustomOperator(v)}
                                    fullWidth
                                    size="medium"
                                    sx={{ mt: 1 }}
                                >
                                    <ToggleButton value="addition" sx={{ py: 1.5 }}><Typography variant="h5">+</Typography></ToggleButton>
                                    <ToggleButton value="subtraction" sx={{ py: 1.5 }}><Typography variant="h5">-</Typography></ToggleButton>
                                    <ToggleButton value="multiplication" sx={{ py: 1.5 }}><Typography variant="h5">×</Typography></ToggleButton>
                                    <ToggleButton value="division" sx={{ py: 1.5 }}><Typography variant="h5">÷</Typography></ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper elevation={4} sx={{ p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={3}>
                                <Settings size={32} color={theme.palette.secondary.main} />
                                <Typography variant="h5" fontWeight="bold">Difficulty</Typography>
                            </Box>

                            <Box mb={4}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>Number 1 Digits</Typography>
                                <Typography variant="h4" fontWeight="bold" color="secondary.main">{digitCount1}</Typography>
                                <Slider 
                                    value={digitCount1} 
                                    onChange={(e, v) => setDigitCount1(v)}
                                    min={1} max={3} marks step={1}
                                    color="secondary"
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>Number 2 Digits</Typography>
                                <Typography variant="h4" fontWeight="bold" color="secondary.main">{digitCount2}</Typography>
                                <Slider 
                                    value={digitCount2} 
                                    onChange={(e, v) => setDigitCount2(v)}
                                    min={1} max={3} marks step={1}
                                    color="secondary"
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Box mt={6} mb={2}>
                    <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<Play size={28} />}
                        onClick={handleStartGame}
                        sx={{ 
                            py: 2, px: 8, 
                            borderRadius: 5, 
                            fontSize: '1.5rem',
                            textTransform: 'none',
                            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.02)'
                            }
                        }}
                    >
                        Start Battle
                    </Button>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center" gap={1.5}>
                     <Users size={20} />
                     <Typography variant="h6" color="text.secondary">{gameState.players.length} Players Ready</Typography>
                </Box>
            </Card>
        </Container>
    );

    const renderGame = () => (
        <Container maxWidth="xl" sx={{ py: 2, height: '95vh', display: 'flex', flexDirection: 'column' }}>
            {/* TOP BAR */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip icon={<Swords size={20} />} label={`Room: ${gameState.roomCode}`} sx={{ fontSize: '1.1rem', py: 2 }} />
                
                <Paper sx={{ 
                    px: 4, py: 1.5, 
                    borderRadius: 5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    bgcolor: timeRemaining < 10 ? 'error.main' : 'primary.main', 
                    color: 'white',
                    transition: 'background-color 0.3s'
                }}>
                    <Clock size={28} />
                    <Typography variant="h3" fontWeight="bold">
                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </Typography>
                </Paper>

                <Chip label={`${gameState.gameSettings?.customConfig?.operator.toUpperCase()}`} color="secondary" sx={{ fontWeight: 'bold' }} />
            </Stack>

            <Grid container spacing={4} sx={{ flex: 1, alignItems: 'center' }}>
                
                {/* LEFT: LEADERBOARD */}
                <Grid item xs={12} md={3}>
                     <Stack spacing={2}>
                        <Typography variant="h5" fontWeight="bold" color="text.secondary">Leaderboard</Typography>
                        {sortedPlayers.map((player) => (
                            <Paper key={player.username} elevation={player.username === 'Me' ? 8 : 1} 
                                sx={{ 
                                    p: 2, 
                                    borderRadius: 3, 
                                    border: player.username === 'Me' ? `2px solid ${theme.palette.primary.main}` : 'none',
                                    transform: player.username === 'Me' ? 'scale(1.05)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? '#cd7f32' : theme.palette.grey[300] }}>
                                            {idx + 1}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight="bold" variant="h6">
                                                {player.username === 'Me' ? 'You' : player.username}
                                            </Typography>
                                            {/* Progress Bar relative to leader */}
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={(player.score / (sortedPlayers[0].score || 1)) * 100} 
                                                sx={{ width: 100, height: 6, borderRadius: 3, mt: 0.5 }}
                                            />
                                        </Box>
                                    </Stack>
                                    <Typography variant="h4" fontWeight="bold" color="primary.main">{player.score}</Typography>
                                </Stack>
                            </Paper>
                        ))}
                     </Stack>
                </Grid>

                {/* CENTER: PROBLEM AREA */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Card sx={{ 
                            py: 8, px: 4,
                            borderRadius: 8, 
                            boxShadow: theme.shadows[20],
                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                            position: 'relative',
                            overflow: 'visible',
                            animation: isCorrectAnim ? `${pulse} 0.3s ease-in-out` : 'none',
                            border: isCorrectAnim ? `2px solid ${theme.palette.success.main}` : 'none'
                        }}>
                             {/* Floating Feedback */}
                             {feedback.map(f => (
                                 <Typography key={f.id} variant="h3" fontWeight="bold" color="success.main" sx={{ 
                                     position: 'absolute', 
                                     top: '20%', 
                                     left: '50%', 
                                     transform: 'translateX(-50%)',
                                     animation: `${floatUp} 0.8s ease-out forwards`,
                                     zIndex: 10,
                                     textShadow: '0px 2px 10px rgba(0,0,0,0.2)'
                                 }}>
                                     {f.val}
                                 </Typography>
                             ))}

                             <Typography variant="h1" fontWeight="900" sx={{ fontSize: { xs: '4rem', md: '7rem' }, mb: 4, fontFamily: 'monospace' }}>
                                {problem ? `${problem.num1} ${problem.symbol} ${problem.num2}` : "..."}
                            </Typography>
                            
                            <Box sx={{ position: 'relative', maxWidth: 300, mx: 'auto' }}>
                                <TextField
                                    inputRef={inputRef}
                                    value={userAnswer}
                                    onChange={handleChange}
                                    placeholder="?"
                                    variant="standard"
                                    InputProps={{
                                        disableUnderline: true,
                                        style: { 
                                            fontSize: '5rem', 
                                            textAlign: 'center', 
                                            fontWeight: 'bold',
                                            color: theme.palette.primary.main,
                                            fontFamily: 'monospace'
                                        }
                                    }}
                                    autoFocus
                                    autoComplete="off"
                                />
                                <Box sx={{ height: 6, bgcolor: 'primary.main', borderRadius: 3, mt: 1 }} />
                                
                                {/* Voice Control */}
                                <Tooltip title={isListening ? "Listening..." : "Start Voice"} arrow>
                                    <IconButton 
                                        onClick={isListening ? stopListening : startListening}
                                        sx={{ 
                                            position: 'absolute', 
                                            right: -60, 
                                            top: '50%', 
                                            transform: 'translateY(-50%)',
                                            bgcolor: isListening ? 'error.light' : 'action.hover',
                                            color: isListening ? 'white' : 'inherit',
                                            '&:hover': { bgcolor: isListening ? 'error.main' : 'action.selected' }
                                        }}
                                    >
                                        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Card>
                    </Box>
                </Grid>

                {/* RIGHT: LOG */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', maxHeight: 500, overflow: 'hidden', bgcolor: 'action.hover' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">Battle Feed</Typography>
                        <Stack spacing={1.5} sx={{ overflowY: 'auto', height: 400, pr: 1 }}>
                            {gameState.messages.slice().reverse().map((msg, i) => (
                                <Box key={i} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {msg}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );

    if (!gameState.gameActive) {
        return renderSetup();
    }

    return renderGame();
};

export default BattleArena;
