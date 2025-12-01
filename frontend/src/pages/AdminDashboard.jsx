import { useState } from 'react';
import axios from 'axios';
import {
    Container, Box, Card, CardContent, Typography, TextField, Button,
    MenuItem, Alert, Grid
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        userType: 'student',
        gradeLevel: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError("Not authenticated");
            return;
        }

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                is_student: formData.userType === 'student',
                is_teacher: formData.userType === 'teacher',
                grade_level: formData.gradeLevel ? parseInt(formData.gradeLevel) : null
            };

            await axios.post('http://localhost:8000/api/auth/create-user/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(`User ${formData.username} created successfully!`);
            setFormData({
                username: '',
                email: '',
                password: '',
                userType: 'student',
                gradeLevel: ''
            });
        } catch (err) {
            console.error("Create user error:", err);
            setError(err.response?.data?.username ? "Username already exists" : "Failed to create user");
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
                Admin Dashboard
            </Typography>

            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h5" fontWeight="bold">
                            Create New User
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="User Type"
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                </TextField>
                            </Grid>
                            {formData.userType === 'student' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Grade Level"
                                        name="gradeLevel"
                                        value={formData.gradeLevel}
                                        onChange={handleChange}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                                            <MenuItem key={grade} value={grade}>
                                                Grade {grade}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}
                        </Grid>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            sx={{ mt: 3 }}
                        >
                            Create User
                        </Button>

                        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AdminDashboard;
