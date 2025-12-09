import { Container, Box, Typography, Button, Grid, Card, CardContent, Stack, useTheme, alpha } from '@mui/material';
import { GraduationCap, Calculator, TrendingUp, Trophy, ArrowRight, CheckCircle, Rocket, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isTeacher, isStudent } = useAuth();
    const theme = useTheme();

    const handleGetStarted = () => {
        if (isAuthenticated) {
            if (isTeacher) {
                navigate('/teacher/dashboard');
            } else if (isStudent) {
                navigate('/practice');
            }
        } else {
            navigate('/login');
        }
    };

    const features = [
        {
            icon: <Calculator size={40} />,
            title: "Smart Practice",
            description: "Adaptive problems that evolve with your skill level. Get instant feedback and detailed solutions.",
            color: theme.palette.primary.main,
            bg: alpha(theme.palette.primary.main, 0.1)
        },
        {
            icon: <GraduationCap size={40} />,
            title: "Teacher Tools",
            description: "Powerful dashboard for teachers to create assignments, track progress, and manage classes.",
            color: theme.palette.secondary.main,
            bg: alpha(theme.palette.secondary.main, 0.1)
        },
        {
            icon: <Activity size={40} />,
            title: "Analytics",
            description: "Visual progress tracking helps you identify strengths and areas for improvement.",
            color: theme.palette.success.main,
            bg: alpha(theme.palette.success.main, 0.1)
        },
        {
            icon: <Trophy size={40} />,
            title: "Gamification",
            description: "Earn badges, climb leaderboards, and stay motivated with our reward system.",
            color: theme.palette.warning.main,
            bg: alpha(theme.palette.warning.main, 0.1)
        }
    ];

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${theme.palette.background.default} 100%)`
                        : `radial-gradient(${alpha(theme.palette.primary.main, 0.08)} 1.5px, transparent 1.5px), linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)`,
                    backgroundSize: theme.palette.mode === 'dark' ? 'auto' : '24px 24px',
                    pt: { xs: 12, md: 20 },
                    pb: { xs: 12, md: 16 },
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(180deg, transparent 0%, ${theme.palette.background.default} 100%)`,
                        zIndex: 1,
                        pointerEvents: 'none'
                    }
                }}
            >
                {/* Floating Icons Decoration */}
                <Box sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '10%',
                    opacity: theme.palette.mode === 'dark' ? 0.05 : 0.1,
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-20px)' }
                    },
                    zIndex: 0
                }}>
                    <Calculator size={80} color={theme.palette.primary.main} />
                </Box>
                <Box sx={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    opacity: theme.palette.mode === 'dark' ? 0.05 : 0.1,
                    animation: 'float 8s ease-in-out infinite reverse',
                    zIndex: 0
                }}>
                    <Activity size={100} color={theme.palette.secondary.main} />
                </Box>
                <Box sx={{
                    position: 'absolute',
                    top: '40%',
                    right: '25%',
                    opacity: theme.palette.mode === 'dark' ? 0.03 : 0.05,
                    animation: 'float 7s ease-in-out infinite 1s',
                    zIndex: 0
                }}>
                    <TrendingUp size={60} color={theme.palette.success.main} />
                </Box>

                {/* Background Blobs */}
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.08),
                    filter: 'blur(80px)',
                    zIndex: 0,
                    animation: 'pulse 10s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' }
                    }
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: -100,
                    left: -100,
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.1 : 0.08),
                    filter: 'blur(80px)',
                    zIndex: 0,
                    animation: 'pulse 15s ease-in-out infinite reverse'
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ animation: 'fadeInUp 0.8s ease-out', maxWidth: 800, mx: 'auto' }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '3rem', md: '5rem' },
                                lineHeight: 1,
                                mb: 3,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Master Math with Confidence
                        </Typography>
                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{ mb: 5, lineHeight: 1.6, fontWeight: 400, fontSize: '1.25rem' }}
                        >
                            The intelligent learning platform that adapts to your unique learning style. Perfect for students, powerful for teachers.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleGetStarted}
                                endIcon={<ArrowRight />}
                                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 50 }}
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                            </Button>
                            {!isAuthenticated && (
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/login')}
                                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderWidth: 2, borderRadius: 50, '&:hover': { borderWidth: 2 } }}
                                >
                                    Log In
                                </Button>
                            )}
                        </Stack>
                        <Stack direction="row" spacing={3} sx={{ mt: 6 }} justifyContent="center">
                            {['Free for Students', 'Adaptive Learning', 'Real-time Analytics'].map((text) => (
                                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle color={theme.palette.success.main} size={20} />
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                                        {text}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 12 }}>
                <Box sx={{ textAlign: 'center', mb: 8, animation: 'fadeIn 1s ease-out' }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        Features
                    </Typography>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                        Everything you need to excel
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                        Our platform provides a comprehensive suite of tools designed to make learning and teaching mathematics effective and enjoyable.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    background: theme.palette.background.paper,
                                    borderRadius: 4,
                                    border: theme.palette.mode === 'dark' 
                                        ? `1px solid ${theme.palette.divider}` 
                                        : '1px solid rgba(0, 0, 0, 0.05)',
                                    boxShadow: theme.palette.mode === 'dark' 
                                        ? theme.shadows[4] 
                                        : '0 4px 20px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.palette.mode === 'dark' 
                                            ? theme.shadows[8] 
                                            : `0 12px 30px ${alpha(feature.color, 0.2)}`,
                                        borderColor: feature.color
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 3,
                                            background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(feature.color, 0.8)} 100%)`,
                                            color: 'white',
                                            boxShadow: `0 8px 16px ${alpha(feature.color, 0.3)}`,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                boxShadow: `0 10px 20px ${alpha(feature.color, 0.4)}`
                                            }
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h5" gutterBottom fontWeight="bold" color="text.primary">
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;
