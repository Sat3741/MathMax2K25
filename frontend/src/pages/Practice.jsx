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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom align="center">
                Practice Math
            </Typography>

            {/* Score Display */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Chip
                    label={`Correct: ${score.correct}`}
                    color="success"
                    sx={{ fontSize: '1rem', px: 2 }}
                />
                <Chip
                    label={`Total: ${score.total}`}
                    color="primary"
                    sx={{ fontSize: '1rem', px: 2 }}
                />
                <Chip
                    label={`Accuracy: ${score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%`}
                    color="info"
                    sx={{ fontSize: '1rem', px: 2 }}
                />
            </Box>

            {/* Settings */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Topic</InputLabel>
                            <Select value={topic} onChange={(e) => setTopic(e.target.value)} label="Topic">
                                <MenuItem value="addition">Addition</MenuItem>
                                <MenuItem value="subtraction">Subtraction</MenuItem>
                                <MenuItem value="multiplication">Multiplication</MenuItem>
                                <MenuItem value="division">Division</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Difficulty</InputLabel>
                            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} label="Difficulty">
                                <MenuItem value={1}>Easy</MenuItem>
                                <MenuItem value={2}>Medium</MenuItem>
                                <MenuItem value={3}>Hard</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Problem Display */}
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    {loading ? (
                        <CircularProgress />
                    ) : problem ? (
                        <>
                            <Typography variant="h2" fontWeight="bold" sx={{ mb: 4 }}>
                                {problem.question}
                            </Typography>

                            <TextField
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Your answer"
                                type="number"
                                sx={{ mb: 3, width: '300px' }}
                                size="large"
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
                                    icon={feedback.correct ? <CheckCircle /> : <Cancel />}
                                    sx={{ mb: 3, fontSize: '1.1rem' }}
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
                                    >
                                        Check Answer
                                    </Button>
                                ) : (
                                    <Button variant="contained" size="large" onClick={handleNext}>
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
