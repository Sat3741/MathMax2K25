import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container, useTheme as useMuiTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Logout, Brightness4, Brightness7, Calculate } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isTeacher, isStudent, isAdmin, logout, user } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const muiTheme = useMuiTheme();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
                background: muiTheme.palette.mode === 'dark' 
                    ? 'rgba(15, 23, 42, 0.8)' 
                    : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                boxShadow: muiTheme.shadows[1],
                borderBottom: `1px solid ${muiTheme.palette.divider}`,
                color: 'text.primary',
                transition: 'all 0.3s ease'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ minHeight: { xs: 70, md: 80 }, py: 1, justifyContent: 'space-between', px: { xs: 2, md: 0 } }}>
                    {/* Logo Section */}
                    <Box 
                        component={Link}
                        to="/"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 2,
                            textDecoration: 'none',
                            '&:hover': {
                                opacity: 0.9
                            }
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
                                }
                            }}
                        >
                            <Calculate sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: 'text.primary',
                                letterSpacing: '-0.5px',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            MathMax
                        </Typography>
                    </Box>

                    {/* Navigation Section */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <IconButton 
                            onClick={toggleTheme} 
                            color="inherit"
                            sx={{ 
                                '&:hover': {
                                    backgroundColor: muiTheme.palette.action.hover,
                                }
                            }}
                        >
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>

                        {isAuthenticated ? (
                            <>
                                <Typography 
                                    variant="body2"
                                    sx={{ 
                                        display: { xs: 'none', md: 'flex' }, 
                                        alignItems: 'center', 
                                        mr: 2, 
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                    }}
                                >
                                    Hi, {user?.username}
                                </Typography>

                                {isTeacher && (
                                    <>
                                        <Button
                                            component={Link}
                                            to="/teacher/dashboard"
                                            color="inherit"
                                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                        >
                                            Dashboard
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/teacher/students"
                                            color="inherit"
                                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                        >
                                            Students
                                        </Button>
                                    </>
                                )}

                                {isStudent && (
                                    <Button
                                        component={Link}
                                        to="/practice"
                                        color="inherit"
                                        sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                    >
                                        Practice
                                    </Button>
                                )}

                                {isAdmin && (
                                    <Button
                                        component={Link}
                                        to="/admin/dashboard"
                                        color="inherit"
                                        sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                    >
                                        Admin
                                    </Button>
                                )}

                                <Button
                                    onClick={handleLogout}
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<Logout />}
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        ml: 1
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                component={Link}
                                to="/login"
                                variant="contained"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    px: 3,
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }
                                }}
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
