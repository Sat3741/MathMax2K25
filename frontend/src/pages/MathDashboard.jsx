import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Chip,
    Container,
    Grid,
    CircularProgress,
    Tab,
    Tabs
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Use a darker theme specific component if needed, or rely on global theme
// For this task, we will use inline SX styles to approximate the "Homepage.png" dark look
// assuming the global theme might be light, or we force dark backgrounds.

const MathDashboard = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState('All');

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:8000/api/math/levels/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLevels(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching levels:", error);
            setLoading(false);
        }
    };

    const handleLevelClick = (levelCode) => {
        navigate(`/student/practice/${levelCode}`);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Filter logic
    const filteredLevels = levels.filter(level => {
        if (tabValue === 'All') return true;
        return level.cat === tabValue;
    });

    const categories = ['All', ...new Set(levels.map(l => l.cat))];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#121212', color: 'white', p: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        Exercises
                    </Typography>
                </Box>

                {/* Categories */}
                <Box sx={{ mb: 4 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { color: '#aaa', textTransform: 'none', fontSize: '1rem', mr: 2 },
                            '& .Mui-selected': { color: '#fff', fontWeight: 'bold' }
                        }}
                    >
                        {categories.map(cat => (
                            <Tab key={cat} label={cat} value={cat} />
                        ))}
                    </Tabs>
                </Box>

                {/* Grid of Cards */}
                <Grid container spacing={3}>
                    {filteredLevels.map((level) => (
                        <Grid item xs={12} sm={6} md={4} key={level.id}>
                            <Card
                                sx={{
                                    bgcolor: '#1E1E1E',
                                    color: 'white',
                                    borderRadius: 3,
                                    height: '100%',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }
                                }}
                            >
                                <CardActionArea onClick={() => handleLevelClick(level.id)} sx={{ height: '100%', p: 2 }}>

                                    {/* Header Badges */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Chip
                                            label={level.id.toUpperCase()}
                                            size="small"
                                            sx={{ bgcolor: '#333', color: '#ccc', borderRadius: 1, fontWeight: 'bold' }}
                                        />
                                        <Chip
                                            label={`${level.base_xp} XP`}
                                            size="small"
                                            sx={{ bgcolor: '#FFD700', color: '#000', fontWeight: 'bold' }}
                                            icon={<span style={{ fontSize: '1.2em' }}>⭐</span>}
                                        />
                                    </Box>

                                    {/* Content */}
                                    <CardContent sx={{ p: 0 }}>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {level.name}
                                        </Typography>
                                        <Typography variant="body2" color="gray" sx={{ mb: 2, minHeight: '40px' }}>
                                            {level.desc}
                                        </Typography>

                                        {/* Bottom Metadata */}
                                        <Box sx={{ display: 'flex', gap: 2, mt: 'auto', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#aaa' }}>
                                                <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                                                <Typography variant="caption">{level.t_exp}s</Typography>
                                            </Box>

                                            <Chip
                                                label={level.cat}
                                                size="small"
                                                variant="outlined"
                                                sx={{ borderColor: '#555', color: '#888', ml: 'auto' }}
                                            />
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default MathDashboard;
