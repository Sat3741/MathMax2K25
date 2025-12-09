import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container, useTheme as useMuiTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, Calculator, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';
import { Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { useState } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isTeacher, isStudent, isAdmin, logout, user } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const muiTheme = useMuiTheme();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/');
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
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
                            <Calculator size={28} color='white' />
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
                            {mode === 'dark' ? <Sun /> : <Moon />}
                        </IconButton>

                        {isAuthenticated ? (
                            <>
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
                                            to="/teacher/groups"
                                            color="inherit"
                                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                        >
                                            Groups
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

                                {isStudent && !isAdmin && (
                                    <>
                                        <Button
                                            component={Link}
                                            to="/student/assignments"
                                            color="inherit"
                                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                        >
                                            Assignments
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/practice"
                                            color="inherit"
                                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                        >
                                            Practice
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/student/dashboard"
                                            color="inherit"
                                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
                                        >
                                            Dashboard
                                        </Button>
                                    </>
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



                                <Box sx={{ ml: 2 }}>
                                    <IconButton
                                        onClick={handleClick}
                                        size="small"
                                        sx={{ ml: 2 }}
                                        aria-controls={open ? 'account-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={open ? 'true' : undefined}
                                    >
                                        <Avatar user={user} size={40} />
                                    </IconButton>
                                </Box>
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={open}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1,
                                            },
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleProfile}>
                                        <ListItemIcon>
                                            <User size={20} />
                                        </ListItemIcon>
                                        Profile
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogOut size={20} />
                                        </ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
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
