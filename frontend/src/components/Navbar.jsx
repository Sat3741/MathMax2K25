import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { School, Logout, Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isTeacher, isStudent, isAdmin, logout, user } = useAuth();
    const { mode, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <School sx={{ mr: 2 }} />
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                >
                    MathMax
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    {isAuthenticated ? (
                        <>
                            <Typography sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                Welcome, {user?.username}
                            </Typography>

                            {isStudent && (
                                <Button color="inherit" component={Link} to="/practice">
                                    Practice
                                </Button>
                            )}

                            {isTeacher && (
                                <>
                                    <Button color="inherit" component={Link} to="/teacher/dashboard">
                                        Dashboard
                                    </Button>
                                    <Button color="inherit" component={Link} to="/teacher/students">
                                        Students
                                    </Button>
                                </>
                            )}

                            {isAdmin && (
                                <Button color="inherit" component={Link} to="/admin/dashboard">
                                    Admin
                                </Button>
                            )}

                            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
