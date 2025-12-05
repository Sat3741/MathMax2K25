import { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, Button, Grid, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Chip, CircularProgress, Alert
} from '@mui/material';
import { Add, Delete, Groups } from '@mui/icons-material';
import axios from 'axios';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
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

    const handleCreateGroup = async () => {
        if (newGroupName.trim()) {
            try {
                const token = localStorage.getItem('accessToken');
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
                const token = localStorage.getItem('accessToken');
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
                                    <Groups color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {group.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Created by {group.created_by_name}
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={() => handleDeleteGroup(group.id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </Box>
                                
                                {group.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {group.description}
                                    </Typography>
                                )}
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Chip label={`${group.member_count} Members`} size="small" />
                                    <Button size="small">Manage Members</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                
                {groups.length === 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" align="center">
                                    No groups found. Create a group to organize students.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g. Top Performers"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        placeholder="Describe the purpose of this group"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateGroup} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GroupManagement;
