import { Container, Typography, Grid, Card, CardContent, Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
    People, Class, Groups, CloudUpload, Settings, 
    TrendingUp, AssignmentInd 
} from '@mui/icons-material';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const menuItems = [
        {
            title: 'User Management',
            icon: <People sx={{ fontSize: 40 }} />,
            description: 'Manage students, teachers, and admins',
            path: '/admin/users',
            color: theme.palette.primary.main
        },
        {
            title: 'Classes & Sections',
            icon: <Class sx={{ fontSize: 40 }} />,
            description: 'Configure academic structure',
            path: '/admin/classes',
            color: theme.palette.secondary.main
        },
        {
            title: 'Groups',
            icon: <Groups sx={{ fontSize: 40 }} />,
            description: 'Manage student groups',
            path: '/admin/groups',
            color: theme.palette.success.main
        },
        {
            title: 'Bulk Operations',
            icon: <CloudUpload sx={{ fontSize: 40 }} />,
            description: 'Upload users and promote students',
            path: '/admin/bulk',
            color: theme.palette.warning.main
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Welcome back, Admin
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[4]
                                }
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ 
                                    mb: 2, 
                                    color: item.color,
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Summary Section (Placeholder) */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    System Overview
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Students</Typography>
                                <Typography variant="h3" fontWeight="bold">0</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Teachers</Typography>
                                <Typography variant="h3" fontWeight="bold">0</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Active Classes</Typography>
                                <Typography variant="h3" fontWeight="bold">0</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default AdminDashboard;
