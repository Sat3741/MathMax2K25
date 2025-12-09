import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, Button, useTheme, LinearProgress, Popover } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Rocket, User, Trophy, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getAuthToken } from '../utils/authUtils';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Popover State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const handleDayClick = (event, day) => {
        setAnchorEl(event.currentTarget);
        setSelectedDay(day);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedDay(null);
    };

    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchProfile = async () => {
             try {
                const token = getAuthToken();
                if (!token) {
                    console.warn("No auth token found, redirecting to login.");
                    navigate('/login');
                    return;
                }
                
                const response = await axios.get('http://localhost:8000/api/auth/student/profile/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                if (err.response && err.response.status === 401) {
                    // Token expired or invalid
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const actions = [
        {
            title: 'Start Practice',
            icon: <Rocket size={40} />,
            description: 'Blast off with tailored math problems',
            path: '/practice',
            color: theme.palette.primary.main,
            bg: theme.palette.mode === 'dark' 
                ? 'rgba(33, 150, 243, 0.15)' 
                : theme.palette.primary.light,
            iconColor: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main
        },
        {
            title: 'My Profile',
            icon: <User size={40} />,
            description: 'View your progress and badges',
            path: '/profile',
            color: theme.palette.secondary.main,
            bg: theme.palette.mode === 'dark' 
                ? 'rgba(156, 39, 176, 0.15)' 
                : theme.palette.secondary.light,
            iconColor: theme.palette.mode === 'dark' ? '#fff' : theme.palette.secondary.main
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Welcome back, {user?.first_name || 'Student'}!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Ready to keep your streak alive?
                </Typography>
            </Box>

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {actions.map((action, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8],
                                    borderColor: action.color
                                }
                            }}
                            onClick={() => navigate(action.path)}
                        >
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: '12px', 
                                    bgcolor: action.bg,
                                    color: action.iconColor,
                                    mr: 3,
                                    display: 'flex',
                                    boxShadow: theme.palette.mode === 'dark' 
                                        ? `0 4px 12px rgba(0, 0, 0, 0.3)` 
                                        : `0 4px 12px ${action.bg}`
                                }}>
                                    {action.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {action.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {action.description}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Stats Overview */}
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Your Stats
            </Typography>
            
            {loading ? (
                <LinearProgress />
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                         <Card sx={{ height: '100%', minWidth: 280 }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'warning.main' }}>
                                    <Trophy size={40} />
                                </Box>
                                <Typography color="text.secondary" gutterBottom>Highest Score</Typography>
                                <Typography variant="h3" fontWeight="bold" color="text.primary">
                                    {stats?.highest_score || 0}%
                                </Typography>
                            </CardContent>
                         </Card>
                    </Grid>
                     <Grid item xs={12} md={4}>
                         <Card sx={{ height: '100%', minWidth: 280 }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'info.main' }}>
                                    <TrendingUp size={40} />
                                </Box>
                                <Typography color="text.secondary" gutterBottom>Average Score</Typography>
                                <Typography variant="h3" fontWeight="bold" color="text.primary">
                                    {stats?.average_score || 0}%
                                </Typography>
                            </CardContent>
                         </Card>
                    </Grid>
                     <Grid item xs={12} md={4}>
                         <Card sx={{ 
                             height: '100%',
                             minWidth: 280,
                             background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                             color: 'white'
                         }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'white' }}>
                                    <Flame size={48} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                                </Box>
                                <Typography sx={{ opacity: 0.9, fontWeight: 500 }} gutterBottom>Current Streak</Typography>
                                <Typography variant="h2" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                    {stats?.current_streak || 0} <Typography component="span" variant="h5">days</Typography>
                                </Typography>
                            </CardContent>
                         </Card>
                    </Grid>

                    
                    {/* Streak Section */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Learning Activity
                                </Typography>
                                <Typography variant="caption" color="text.secondary" paragraph>
                                    Your practice consistency over the last year
                                </Typography>
                                
                                {/* Heatmap Logic - Month-Based Sections (Horizontal) */}
                                <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', overflowY: 'hidden', p: 1, pb: 2 }}>
                                    {(() => {
                                        const today = new Date();
                                        const startDate = new Date(today.getFullYear(), 0, 1);
                                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                                        const activityMap = new Map();
                                        if (stats?.streak_data) {
                                            stats.streak_data.forEach(d => activityMap.set(d.date, d));
                                        }

                                        // Group days by month
                                        const monthGroups = [];
                                        let currentDate = new Date(startDate);
                                        
                                        while (currentDate <= today) {
                                            const monthIndex = currentDate.getMonth();
                                            const year = currentDate.getFullYear();
                                            
                                            // Get all days in this month
                                            const monthDays = [];
                                            const monthStart = new Date(year, monthIndex, 1);
                                            const monthEnd = new Date(year, monthIndex + 1, 0);
                                            
                                            let dayDate = new Date(monthStart);
                                            while (dayDate <= monthEnd) {
                                                // Fix: Use local date string construction to avoid timezone shifts
                                                // toISOString() converts to UTC, which can shift the day in +timezones (like India)
                                                const year = dayDate.getFullYear();
                                                const month = String(dayDate.getMonth() + 1).padStart(2, '0');
                                                const day = String(dayDate.getDate()).padStart(2, '0');
                                                const dateStr = `${year}-${month}-${day}`;

                                                const data = activityMap.get(dateStr) || { score: 0, sessions: 0, assignments: 0 };
                                                const totalActivity = (data.sessions || 0) + (data.assignments || 0);
                                                
                                                let bgColor = theme.palette.mode === 'dark' ? '#161b22' : '#ebedf0';
                                                if (theme.palette.mode === 'dark') {
                                                    if (totalActivity > 0) bgColor = '#0c4a6e';
                                                    if (totalActivity > 2) bgColor = '#0369a1';
                                                    if (totalActivity > 4) bgColor = '#0284c7';
                                                    if (totalActivity > 6) bgColor = '#0ea5e9';
                                                } else {
                                                    if (totalActivity > 0) bgColor = '#bfdbfe';
                                                    if (totalActivity > 2) bgColor = '#93c5fd';
                                                    if (totalActivity > 4) bgColor = '#60a5fa';
                                                    if (totalActivity > 6) bgColor = '#3b82f6';
                                                }
                                                
                                                monthDays.push({
                                                    date: dateStr,
                                                    day: dayDate.getDate(),
                                                    dayOfWeek: dayDate.getDay(),
                                                    data: data,
                                                    color: bgColor
                                                });
                                                
                                                dayDate.setDate(dayDate.getDate() + 1);
                                            }
                                            
                                            if (monthDays.length > 0) {
                                                monthGroups.push({
                                                    month: months[monthIndex],
                                                    monthIndex: monthIndex,
                                                    days: monthDays
                                                });
                                            }
                                            
                                            // Move to next month
                                            currentDate = new Date(year, monthIndex + 1, 1);
                                        }

                                        return monthGroups.map((monthGroup, mIndex) => (
                                            <Box key={mIndex} sx={{ minWidth: 'fit-content' }}>
                                                {/* Month Header */}
                                                <Typography 
                                                    variant="subtitle2" 
                                                    fontWeight="bold" 
                                                    sx={{ mb: 1.5, color: 'text.primary' }}
                                                >
                                                    {monthGroup.month}
                                                </Typography>
                                                
                                                {/* Day Labels */}
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 24px)', gap: '6px', mb: 0.5 }}>
                                                    {dayLabels.map((label, i) => (
                                                        <Typography 
                                                            key={i} 
                                                            variant="caption" 
                                                            sx={{ 
                                                                fontSize: '10px', 
                                                                textAlign: 'center',
                                                                color: 'text.secondary',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {label}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                                
                                                {/* Days Grid */}
                                                <Box sx={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(7, 24px)', 
                                                    gap: '6px',
                                                    gridAutoRows: '24px'
                                                }}>
                                                    {/* Empty cells for days before month starts */}
                                                    {monthGroup.days[0] && Array.from({ length: monthGroup.days[0].dayOfWeek }).map((_, i) => (
                                                        <Box key={`empty-${i}`} />
                                                    ))}
                                                    
                                                    {/* Actual day cells */}
                                                    {monthGroup.days.map((day, dIndex) => (
                                                        <Box
                                                            key={dIndex}
                                                            onClick={(e) => handleDayClick(e, day)}
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '4px',
                                                                bgcolor: day.color,
                                                                cursor: 'pointer',
                                                                border: '1px solid',
                                                                borderColor: theme.palette.mode === 'dark' 
                                                                    ? 'rgba(255,255,255,0.05)' 
                                                                    : 'rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease',
                                                                position: 'relative',
                                                                '&:hover': {
                                                                    transform: 'scale(1.15)',
                                                                    borderColor: theme.palette.mode === 'dark' 
                                                                        ? 'rgba(255,255,255,0.4)' 
                                                                        : 'rgba(0,0,0,0.3)',
                                                                    zIndex: 10,
                                                                    boxShadow: theme.palette.mode === 'dark'
                                                                        ? '0 2px 8px rgba(0,0,0,0.5)'
                                                                        : '0 2px 8px rgba(0,0,0,0.15)'
                                                                }
                                                            }}
                                                        >
                                                            <Typography 
                                                                variant="caption" 
                                                                sx={{ 
                                                                    fontSize: '9px',
                                                                    fontWeight: 600,
                                                                    color: theme.palette.mode === 'dark' 
                                                                        ? 'rgba(255,255,255,0.6)' 
                                                                        : 'rgba(0,0,0,0.5)',
                                                                    lineHeight: 1
                                                                }}
                                                            >
                                                                {day.day}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        ));
                                    })()}
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', mt: 2, gap: 1 }}>
                                    <Typography variant="caption">Less</Typography>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: theme.palette.mode === 'dark' ? '#161b22' : '#ebedf0' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: theme.palette.mode === 'dark' ? '#0c4a6e' : '#bfdbfe' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: theme.palette.mode === 'dark' ? '#0369a1' : '#93c5fd' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: theme.palette.mode === 'dark' ? '#0284c7' : '#60a5fa' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: theme.palette.mode === 'dark' ? '#0ea5e9' : '#3b82f6' }} />
                                    <Typography variant="caption">More</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
            
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2.5, minWidth: 300, maxWidth: 400 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
                        {selectedDay?.date && new Date(selectedDay.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </Typography>
                    {selectedDay?.data && (selectedDay.data.sessions > 0 || selectedDay.data.assignments > 0) ? (
                        <>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* Summary */}
                                <Box sx={{ 
                                    p: 1.5, 
                                    borderRadius: 1, 
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                                }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        🎯 <strong>{selectedDay.data.sessions}</strong> practice {selectedDay.data.sessions === 1 ? 'session' : 'sessions'}
                                    </Typography>
                                    {selectedDay.data.assignments > 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            📝 <strong>{selectedDay.data.assignments}</strong> {selectedDay.data.assignments === 1 ? 'assignment' : 'assignments'}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Detailed Session List */}
                                {selectedDay.data.session_details && selectedDay.data.session_details.length > 0 && (
                                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                                            Session Details:
                                        </Typography>
                                        {selectedDay.data.session_details.map((session, idx) => (
                                            <Box 
                                                key={idx} 
                                                sx={{ 
                                                    p: 1.5, 
                                                    mb: 1,
                                                    borderRadius: 1,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                    <Typography variant="caption" fontWeight="bold" color="primary">
                                                        Session #{idx + 1}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {session.time}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', mb: 0.5 }}>
                                                    Score: {session.score}%
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Questions: {session.total_questions} {session.skipped > 0 ? `(${session.skipped} skipped)` : ''}
                                                </Typography>
                                                {session.topics && session.topics.length > 0 && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Topics: {session.topics.join(', ')}
                                                    </Typography>
                                                )}
                                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Difficulty: {session.difficulty}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Avg Time: {session.avg_time}s
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No activity on this day
                        </Typography>
                    )}
                </Box>
            </Popover>
        </Container>
    );
};

export default StudentDashboard;
