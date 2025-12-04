import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Card, CardContent, TextField, Button,
    Typography, Tabs, Tab, Alert, CircularProgress, InputAdornment, IconButton, useTheme
} from '@mui/material';
import { School, Person, Calculate, Visibility, VisibilityOff, LockOutlined, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [tab, setTab] = useState(0); // 0 = Student, 1 = Teacher
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(username, password);

            if (tab === 0) {
                if (!userData.is_student) {
                    setError('This account is not a student account. Please use the Teacher tab.');
                    setLoading(false);
                    return;
                }
                navigate('/practice');
            } else if (tab === 1) {
                if (!userData.is_teacher) {
                    setError('This account is not a teacher account. Please use the Student tab.');
                    setLoading(false);
                    return;
                }
                navigate('/teacher/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: theme.palette.background.default,
            py: 4,
            transition: 'background 0.3s ease'
        }}>
            <Container maxWidth="sm">
                <Card sx={{ 
                    width: '100%',
                    background: theme.palette.background.paper,
                    boxShadow: theme.shadows[3],
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`
                }}>
                    <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                <Calculate sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                        </Box>

                        <Typography 
                            variant="h4" 
                            align="center" 
                            gutterBottom 
                            sx={{
                                fontWeight: 800,
                                color: 'text.primary',
                                mb: 1
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                            Sign in to continue your learning journey
                        </Typography>

                        <Tabs 
                            value={tab} 
                            onChange={(e, newValue) => setTab(newValue)} 
                            centered 
                            sx={{ 
                                mb: 4,
                                '& .MuiTabs-indicator': { 
                                    height: 3, 
                                    borderRadius: 1.5,
                                    background: theme.palette.primary.main
                                },
                                '& .MuiTab-root': { 
                                    fontWeight: 600, 
                                    fontSize: '1rem',
                                    textTransform: 'none'
                                }
                            }}
                        >
                            <Tab icon={<Person />} iconPosition="start" label="Student" />
                            <Tab icon={<School />} iconPosition="start" label="Teacher" />
                        </Tabs>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ 
                                    py: 1.5, 
                                    fontSize: '1.1rem', 
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
