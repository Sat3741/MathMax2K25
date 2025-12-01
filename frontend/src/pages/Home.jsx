import { Container, Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { School, Calculate, TrendingUp, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isTeacher, isStudent } = useAuth();

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

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    py: 12,
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" fontWeight="bold" gutterBottom>
                        Master Math with MathMax
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                        Interactive learning platform for elementary and middle school students
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleGetStarted}
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            '&:hover': { bgcolor: 'grey.100' }
                        }}
                    >
                        {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                    </Button>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
                    Why Choose MathMax?
                </Typography>
                <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
                    Everything you need to excel in mathematics
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                            <CardContent>
                                <Calculate sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Practice Problems
                                </Typography>
                                <Typography color="text.secondary">
                                    Unlimited math problems across all topics and difficulty levels
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                            <CardContent>
                                <School sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Teacher Tools
                                </Typography>
                                <Typography color="text.secondary">
                                    Create assignments and track student progress effortlessly
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                            <CardContent>
                                <TrendingUp sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Progress Tracking
                                </Typography>
                                <Typography color="text.secondary">
                                    Monitor improvement with detailed analytics and insights
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                            <CardContent>
                                <EmojiEvents sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Achievements
                                </Typography>
                                <Typography color="text.secondary">
                                    Earn badges and rewards as you master new skills
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;
