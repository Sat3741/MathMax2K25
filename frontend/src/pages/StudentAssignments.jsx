import { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, CardActions,
    Button, Chip, Box, LinearProgress, Alert
} from '@mui/material';
import { Play, Clock, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthToken } from '../utils/authUtils';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/student/assignments/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(response.data);
        } catch (err) {
            setError('Failed to load assignments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (level) => {
        switch (parseInt(level)) {
            case 1: return 'success';
            case 2: return 'warning';
            case 3: return 'error';
            default: return 'default';
        }
    };

    const handleStart = (assignment) => {
        // For now, redirect to practice area with params
        // Ideally, we'd have a dedicated assignment runner
        navigate(`/practice?topic=${assignment.topic}&difficulty=${assignment.difficulty}&assignment_id=${assignment.id}`);
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ClipboardList size={35} color={theme.palette.primary.main} /> My Assignments
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {assignments.length === 0 && !loading ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                    <ClipboardList size={60} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
                    <Typography variant="h6">No assignments found</Typography>
                    <Typography color="text.secondary">You're all caught up!</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {assignments.map((assignment) => (
                        <Grid item xs={12} md={6} lg={4} key={assignment.id}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {assignment.title}
                                        </Typography>
                                        <Chip 
                                            label={assignment.difficulty === 1 ? 'Easy' : assignment.difficulty === 2 ? 'Medium' : 'Hard'} 
                                            color={getDifficultyColor(assignment.difficulty)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {assignment.description || 'No description provided.'}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        <Chip label={assignment.topic} size="small" />
                                        <Chip label={`${assignment.num_questions} Questions`} size="small" />
                                    </Box>

                                    {assignment.due_date && (
                                        <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Clock size={16} />
                                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                                            {' '}
                                            {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        startIcon={<Play size={20} />}
                                        onClick={() => handleStart(assignment)}
                                    >
                                        Start Assignment
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default StudentAssignments;
