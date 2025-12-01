import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Card, CardContent, TextField, Button,
    Typography, Alert, CircularProgress
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/auth/admin/login/', {
                username,
                password
            });

            localStorage.setItem('accessToken', response.data.tokens.access);
            localStorage.setItem('refreshToken', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Login error:", err);
            setError('Invalid admin credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
                <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <AdminPanelSettings sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                Admin Portal
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in to access the admin dashboard
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Admin Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                            />

                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Access Dashboard'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default AdminLogin;
