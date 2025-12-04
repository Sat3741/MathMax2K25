import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Box, Card, CardContent, Typography, Button,
    FormControl, InputLabel, Select, MenuItem, TextField,
    Alert, CircularProgress, Chip
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const Practice = () => {
    const [topic, setTopic] = useState('addition');
    const [difficulty, setDifficulty] = useState(1);
    const [problem, setProblem] = useState(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        fetchProblem();
    }, [topic, difficulty]);

    const fetchProblem = async () => {
        setLoading(true);
        setFeedback(null);
        setAnswer('');
        try {
            const response = await axios.get('http://localhost:8000/api/math/problem/', {
                params: { topic, difficulty }
            });
            setProblem(response.data);
        } catch (error) {
            console.error('Error fetching problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAnswer = () => {
        const userAnswer = parseFloat(answer);
        const isCorrect = Math.abs(userAnswer - problem.answer) < 0.01;

        setFeedback({
            correct: isCorrect,
            message: isCorrect ? 'Correct! Great job!' : `Incorrect. The answer is ${problem.answer}`
        });

        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
    };

    const handleNext = () => {
        fetchProblem();
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="800" gutterBottom color="primary">
                    Practice Arena
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Sharpen your skills with adaptive problems
                </Typography>
            </Box>

            {/* Score Display */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-around', py: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                            {score.correct}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                            Correct
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {score.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                            Total
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                            {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                            Accuracy
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Settings */}
            <Card sx={{ mb: 4, borderRadius: 3, overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
                            <InputLabel>Topic</InputLabel>
                            <Select 
                                value={topic} 
                                onChange={(e) => setTopic(e.target.value)} 
                                label="Topic"
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="addition">Addition</MenuItem>
                                <MenuItem value="subtraction">Subtraction</MenuItem>
                                <MenuItem value="multiplication">Multiplication</MenuItem>
                                <MenuItem value="division">Division</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
                            <InputLabel>Difficulty</InputLabel>
                            <Select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value)} 
                                label="Difficulty"
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value={1}>Easy</MenuItem>
                                <MenuItem value={2}>Medium</MenuItem>
                                <MenuItem value={3}>Hard</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Problem Display */}
            <Card sx={{ 
                borderRadius: 4, 
                boxShadow: (theme) => theme.shadows[4],
                border: (theme) => `1px solid ${theme.palette.divider}`
            }}>
                <CardContent sx={{ textAlign: 'center', py: 8, px: 4 }}>
                    {loading ? (
                        <Box sx={{ py: 4 }}>
                            <CircularProgress size={40} />
                            <Typography sx={{ mt: 2 }} color="text.secondary">Loading problem...</Typography>
                        </Box>
                    ) : problem ? (
                        <>
                            <Typography variant="h1" fontWeight="800" sx={{ mb: 6, fontSize: { xs: '3rem', md: '4.5rem' } }}>
                                {problem.question}
                            </Typography>

                            <TextField
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="?"
                                type="number"
                                sx={{ mb: 4, width: '200px' }}
                                InputProps={{ 
                                    sx: { 
                                        fontSize: '2rem', 
                                        textAlign: 'center', 
                                        fontWeight: 'bold',
                                        borderRadius: 3,
                                        py: 1
                                    } 
                                }}
                                disabled={feedback !== null}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !feedback) {
                                        checkAnswer();
                                    }
                                }}
                            />

                            {feedback && (
                                <Alert
                                    severity={feedback.correct ? 'success' : 'error'}
                                    icon={feedback.correct ? <CheckCircle fontSize="large" /> : <Cancel fontSize="large" />}
                                    sx={{ 
                                        mb: 4, 
                                        fontSize: '1.2rem', 
                                        alignItems: 'center',
                                        borderRadius: 3,
                                        width: 'fit-content',
                                        mx: 'auto',
                                        px: 4,
                                        py: 1
                                    }}
                                >
                                    {feedback.message}
                                </Alert>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                {!feedback ? (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={checkAnswer}
                                        disabled={!answer}
                                        sx={{ 
                                            px: 6, 
                                            py: 1.5, 
                                            fontSize: '1.2rem', 
                                            borderRadius: 50,
                                            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
                                        }}
                                    >
                                        Check Answer
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="contained" 
                                        size="large" 
                                        onClick={handleNext}
                                        sx={{ 
                                            px: 6, 
                                            py: 1.5, 
                                            fontSize: '1.2rem', 
                                            borderRadius: 50 
                                        }}
                                    >
                                        Next Problem
                                    </Button>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Typography>Loading problem...</Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default Practice;
