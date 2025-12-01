import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    List, ListItem, ListItemText, Divider, CircularProgress
} from '@mui/material';
import { Add, Class, Assignment, People } from '@mui/icons-material';

const TeacherDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get('http://localhost:8000/api/teacher/dashboard/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboard(response.data);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
                Teacher Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Class sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {dashboard?.classes_count || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Classes</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {dashboard?.students_count || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Students</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Assignment sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {dashboard?.assignments_count || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Assignments</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Add />}
                                component={Link}
                                to="/teacher/classes/create"
                            >
                                Create Class
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                startIcon={<Add />}
                                component={Link}
                                to="/teacher/assignments/create"
                            >
                                Create Assignment
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<People />}
                                component={Link}
                                to="/teacher/students"
                            >
                                View Students
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Recent Classes */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Recent Classes
                            </Typography>
                            {dashboard?.recent_classes?.length > 0 ? (
                                <List>
                                    {dashboard.recent_classes.map((cls, index) => (
                                        <Box key={cls.id}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={cls.name}
                                                    secondary={`${cls.student_count} students`}
                                                />
                                            </ListItem>
                                            {index < dashboard.recent_classes.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                </List>
                            ) : (
                                <Typography color="text.secondary">
                                    No classes yet. Create your first class!
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Assignments */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Recent Assignments
                            </Typography>
                            {dashboard?.recent_assignments?.length > 0 ? (
                                <List>
                                    {dashboard.recent_assignments.map((assignment, index) => (
                                        <Box key={assignment.id}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={assignment.title}
                                                    secondary={`${assignment.class_name} • ${assignment.topic}`}
                                                />
                                            </ListItem>
                                            {index < dashboard.recent_assignments.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                </List>
                            ) : (
                                <Typography color="text.secondary">
                                    No assignments yet. Create your first assignment!
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherDashboard;
