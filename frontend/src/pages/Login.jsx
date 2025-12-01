import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Card, CardContent, TextField, Button,
    Typography, Tabs, Tab, Alert, CircularProgress
} from '@mui/material';
import { School, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [tab, setTab] = useState(0); // 0 = Student, 1 = Teacher
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(username, password);

            // Validate user type matches selected tab
            if (tab === 0) {
                // Student tab selected
                if (!userData.is_student) {
                    setError('This account is not a student account. Please use the Teacher tab.');
                    setLoading(false);
                    return;
                }
                // Redirect to practice page
                navigate('/practice');
            } else if (tab === 1) {
                // Teacher tab selected
                if (!userData.is_teacher) {
                    setError('This account is not a teacher account. Please use the Student tab.');
                    setLoading(false);
                    return;
                }
                // Redirect to teacher dashboard
                navigate('/teacher/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
                <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                            Welcome to MathMax
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                            Sign in to continue your math journey
                        </Typography>

                        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered sx={{ mb: 3 }}>
                            <Tab icon={<Person />} label="Student" />
                            <Tab icon={<School />} label="Teacher" />
                        </Tabs>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Username"
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
                                sx={{ mb: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default Login;
