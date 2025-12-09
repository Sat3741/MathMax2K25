import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, Chip, Divider, useTheme, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack } from '@mui/material';
import { Mail, Phone, GraduationCap, Calendar, Trophy, TrendingUp, Zap, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getAuthToken } from '../utils/authUtils';
import Avatar from '../components/Avatar';
import API_BASE_URL from '../apiConfig';

const Profile = () => {
    const theme = useTheme();
    const { user, isStudent, isTeacher } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [pastSessions, setPastSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = getAuthToken();
                const endpoint = isStudent 
                    ? `${API_BASE_URL}/auth/student/profile/`
                    : isTeacher 
                        ? `${API_BASE_URL}/auth/teacher/profile/`
                        : `${API_BASE_URL}/auth/me/`;
                
                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData(response.data);

                // Fetch past practice sessions
                if (isStudent) {
                    const sessionsResponse = await axios.get(
                        `${API_BASE_URL}/student/practice/sessions/`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setPastSessions(sessionsResponse.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user, isStudent, isTeacher]);

    if (loading) {
        return <LinearProgress />;
    }

    if (!profileData) {
        return <Typography>Error loading profile.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                {/* Left Sidebar */}
                <Grid item xs={12} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: { xs: 2, sm: 2.5, md: 3 }, 
                            borderRadius: 3,
                            position: { md: 'sticky' },
                            top: 20
                        }}
                    >
                        {/* Avatar */}
                        <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
                            <Avatar 
                                user={profileData} 
                                size={{ xs: 80, sm: 100, md: 120 }}
                                sx={{ 
                                    margin: '0 auto',
                                    border: `4px solid ${theme.palette.primary.main}`,
                                    fontSize: { xs: 32, sm: 40, md: 48 },
                                    boxShadow: theme.shadows[8]
                                }} 
                            />
                            <Typography variant="h5" fontWeight="bold" sx={{ mt: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                {profileData.first_name} {profileData.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                @{profileData.username}
                            </Typography>
                            <Chip 
                                label={profileData.role === 'student' ? 'Student' : 'Teacher'} 
                                color="primary"
                                size="small"
                                sx={{ mt: 1 }} 
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Key Stats */}
                        {isStudent && (
                            <Stack spacing={{ xs: 1.5, sm: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Total Matches</Typography>
                                    <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                                        {profileData.total_sessions || 0}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Average Score</Typography>
                                    <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                                        {profileData.average_score || 0}%
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Highest Score</Typography>
                                    <Typography variant="h4" fontWeight="bold" color="secondary.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                                        {profileData.highest_score || 0}%
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Current Streak</Typography>
                                    <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                                        {profileData.current_streak || 0} 🔥
                                    </Typography>
                                </Box>
                            </Stack>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Personal Info */}
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Mail size={20} color={theme.palette.action.active} />
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                    {profileData.email || 'Not provided'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Phone size={20} color={theme.palette.action.active} />
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    {profileData.phone || 'Not provided'}
                                </Typography>
                            </Box>
                            {isStudent && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GraduationCap size={20} color={theme.palette.action.active} />
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        Grade {profileData.grade_level} - {profileData.section || 'N/A'}
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={20} color={theme.palette.action.active} />
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    Joined {new Date(profileData.date_joined).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ width: '100%' }}>
                        {/* Activity Overview Cards */}
                        {isStudent && (
                            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                                <Grid item xs={6} sm={6} md={6} xl={3}>
                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                <BarChart2 color={theme.palette.primary.main} size={24} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                    Avg Difficulty
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' } }}>
                                                Lvl {profileData.avg_difficulty || '1.0'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6} xl={3}>
                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                <TrendingUp color={theme.palette.secondary.main} size={24} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                    Max Difficulty
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' } }}>
                                                Lvl {profileData.max_difficulty || '1.0'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6} xl={3}>
                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                <Zap color={theme.palette.info.main} size={24} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                    Avg Speed
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' } }}>
                                                {profileData.avg_speed || '0'}s
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6} xl={3}>
                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                <Trophy color={theme.palette.warning.main} size={24} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                    Best Score
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' } }}>
                                                {profileData.highest_score || 0}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        {/* Past Sessions Table */}
                        {isStudent && pastSessions.length > 0 && (
                            <Box sx={{ maxWidth: { xs: '100%', md: 1200 }, mx: 'auto' }}>
                                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ 
                                        p: { xs: 2, sm: 2.5, md: 3 }, 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white' 
                                    }}>
                                        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                            📊 Practice Session History
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                            {pastSessions.length} total sessions
                                        </Typography>
                                    </Box>
                                    <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 600 }, overflowX: 'auto' }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 100 }}>
                                                        Date & Time
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 80 }}>
                                                        Score
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 80 }}>
                                                        Questions
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 80 }}>
                                                        Skipped
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 90 }}>
                                                        Avg Time
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 90 }}>
                                                        Difficulty
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2d3748', color: 'white', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 90 }}>
                                                        Mode
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pastSessions.map((session, index) => (
                                                    <TableRow 
                                                        key={session.id || index}
                                                        sx={{ 
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                {new Date(session.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                                                {new Date(session.created_at).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip 
                                                                label={`${Math.round(session.score || 0)}%`}
                                                                color={
                                                                    session.score >= 80 ? 'success' : 
                                                                    session.score >= 60 ? 'primary' : 
                                                                    'error'
                                                                }
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 'bold', 
                                                                    minWidth: { xs: 50, sm: 60 },
                                                                    fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                {session.total_questions || 0}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {session.skipped_questions > 0 ? (
                                                                <Chip 
                                                                    label={session.skipped_questions}
                                                                    color="warning"
                                                                    size="small"
                                                                    sx={{ 
                                                                        minWidth: { xs: 35, sm: 40 },
                                                                        fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>-</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                {(session.avg_time_per_question || 0).toFixed(1)}s
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip 
                                                                label={`Lvl ${(session.final_difficulty || 1.0).toFixed(1)}`}
                                                                color={
                                                                    session.final_difficulty >= 3.5 ? 'secondary' :
                                                                    session.final_difficulty >= 2.0 ? 'primary' :
                                                                    'default'
                                                                }
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ 
                                                                    minWidth: { xs: 50, sm: 60 },
                                                                    fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip 
                                                                label={session.practice_mode === 'timer' ? '⏱️ Timer' : '📝 Fixed'}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{ 
                                                                    minWidth: { xs: 70, sm: 90 },
                                                                    fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Box>
                        )}

                        {/* Teacher Stats */}
                        {isTeacher && (
                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ height: '100%', borderRadius: 3 }}>
                                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                                                Classes Managed
                                            </Typography>
                                            <Typography variant="h3" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                                                {profileData.classes_count || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ height: '100%', borderRadius: 3 }}>
                                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                                                Total Students
                                            </Typography>
                                            <Typography variant="h3" fontWeight="bold" color="secondary.main" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                                                {profileData.total_students || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
