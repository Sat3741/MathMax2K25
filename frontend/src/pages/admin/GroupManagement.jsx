import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/authUtils';
import { 
    Container, Typography, Box, Card, CardContent, Button, Grid, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Chip, CircularProgress, Alert, Checkbox, List, ListItem, ListItemText, ListItemIcon,
    InputAdornment
} from '@mui/material';
import { Add, Delete, Groups, People, Search } from '@mui/icons-material';
import axios from 'axios';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openMembersDialog, setOpenMembersDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');

    useEffect(() => {
        fetchGroups();
        fetchStudents();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/auth/groups/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
            setError('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/auth/users/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data.filter(user => user.is_student));
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    const handleCreateGroup = async () => {
        if (newGroupName.trim()) {
            try {
                const token = getAuthToken();
                await axios.post('http://localhost:8000/api/auth/groups/', {
                    name: newGroupName,
                    description: newGroupDescription,
                    student_ids: []
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNewGroupName('');
                setNewGroupDescription('');
                setOpenDialog(false);
                fetchGroups();
            } catch (err) {
                console.error('Failed to create group:', err);
                setError('Failed to create group');
            }
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                const token = getAuthToken();
                await axios.delete(`http://localhost:8000/api/auth/groups/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchGroups();
            } catch (err) {
                console.error('Failed to delete group:', err);
                setError('Failed to delete group');
            }
        }
    };

    const handleOpenMembersDialog = (group) => {
        setSelectedGroup(group);
        // Get current member IDs from the group
        const currentMemberIds = group.students?.map(s => s.id) || [];
        setSelectedStudents(currentMemberIds);
        setSearchQuery('');
        setGradeFilter('');
        setOpenMembersDialog(true);
    };

    const handleToggleStudent = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSaveMembers = async () => {
        try {
            const token = getAuthToken();
            await axios.patch(`http://localhost:8000/api/auth/groups/${selectedGroup.id}/`, {
                student_ids: selectedStudents
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpenMembersDialog(false);
            setSelectedGroup(null);
            setSelectedStudents([]);
            fetchGroups();
        } catch (err) {
            console.error('Failed to update group members:', err);
            setError('Failed to update group members');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Group Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                >
                    Create Group
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={3}>
                {groups.map((group) => (
                    <Grid item xs={12} md={6} lg={4} key={group.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Groups sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">{group.name}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {group.description || 'No description'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Chip 
                                        label={`${group.member_count || 0} Members`} 
                                        size="small" 
                                        color="primary"
                                    />
                                    <Chip 
                                        label={`Created by: ${group.created_by_name}`} 
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        startIcon={<People />}
                                        onClick={() => handleOpenMembersDialog(group)}
                                    >
                                        Manage Members
                                    </Button>
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteGroup(group.id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {groups.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No groups created yet. Click "Create Group" to get started.
                    </Typography>
                </Box>
            )}

            {/* Create Group Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateGroup} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Manage Members Dialog */}
            <Dialog 
                open={openMembersDialog} 
                onClose={() => setOpenMembersDialog(false)} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle>
                    Manage Members - {selectedGroup?.name}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select students to add to this group:
                    </Typography>
                    
                    {/* Search and Filter */}
                    <Box sx={{ 
                        mb: 3, 
                        p: 2, 
                        bgcolor: 'action.hover', 
                        borderRadius: 2,
                        display: 'flex', 
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            select
                            size="small"
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            sx={{ 
                                minWidth: 160,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="">All Grades</option>
                            {[...new Set(students.map(s => s.grade_level).filter(Boolean))].sort().map(grade => (
                                <option key={grade} value={grade}>Grade {grade}</option>
                            ))}
                        </TextField>
                    </Box>
                    
                    <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        {students
                            .filter(student => {
                                const matchesSearch = !searchQuery || 
                                    student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    student.username?.toLowerCase().includes(searchQuery.toLowerCase());
                                const matchesGrade = !gradeFilter || student.grade_level === parseInt(gradeFilter);
                                return matchesSearch && matchesGrade;
                            })
                            .map((student) => (
                                <ListItem 
                                    key={student.id}
                                    button
                                    onClick={() => handleToggleStudent(student.id)}
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        '&:last-child': {
                                            borderBottom: 'none'
                                        },
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedStudents.includes(student.id)}
                                            tabIndex={-1}
                                            disableRipple
                                            color="primary"
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="body1" fontWeight={500}>
                                                {student.first_name || student.username}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                {student.username} • Grade {student.grade_level || 'N/A'}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                    </List>
                    {students.filter(student => {
                        const matchesSearch = !searchQuery || 
                            student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.username?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesGrade = !gradeFilter || student.grade_level === parseInt(gradeFilter);
                        return matchesSearch && matchesGrade;
                    }).length === 0 && (
                        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                            No students found
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMembersDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveMembers} variant="contained">
                        Save ({selectedStudents.length} selected)
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GroupManagement;
