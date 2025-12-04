import { useState } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, Button, Grid, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Chip, Avatar, AvatarGroup
} from '@mui/material';
import { Add, Delete, Edit, Groups } from '@mui/icons-material';

const GroupManagement = () => {
    // Mock Data
    const [groups, setGroups] = useState([
        { id: 1, name: 'Math Olympiad Team', members: 12, createdBy: 'Admin' },
        { id: 2, name: 'Remedial Class 6', members: 8, createdBy: 'Teacher A' },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            setGroups([...groups, { 
                id: Date.now(), 
                name: newGroupName, 
                members: 0, 
                createdBy: 'Admin' 
            }]);
            setNewGroupName('');
            setOpenDialog(false);
        }
    };

    const handleDeleteGroup = (id) => {
        setGroups(groups.filter(group => group.id !== id));
    };

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
                                            Created by {group.createdBy}
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={() => handleDeleteGroup(group.id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Chip label={`${group.members} Members`} size="small" />
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
