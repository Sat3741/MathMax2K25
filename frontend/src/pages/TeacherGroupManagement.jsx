import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Box,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput
} from '@mui/material';
import { Add, Edit, Delete, Group as GroupIcon } from '@mui/icons-material';
import axios from 'axios';
import { getAuthToken } from '../utils/authUtils';

const TeacherGroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        student_ids: []
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGroups();
        fetchStudents();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/teacher/groups/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data);
        } catch (err) {
            console.error('Error fetching groups:', err);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/teacher/students/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const handleOpenDialog = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                name: group.name,
                description: group.description || '',
                student_ids: group.students || []
            });
        } else {
            setEditingGroup(null);
            setFormData({ name: '', description: '', student_ids: [] });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingGroup(null);
        setFormData({ name: '', description: '', student_ids: [] });
        setMessage('');
        setError('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStudentChange = (event) => {
        setFormData({ ...formData, student_ids: event.target.value });
    };

    const handleSubmit = async () => {
        setMessage('');
        setError('');

        try {
            const token = getAuthToken();
            if (editingGroup) {
                await axios.put(
                    `http://localhost:8000/api/teacher/groups/${editingGroup.id}/`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage('Group updated successfully!');
            } else {
                await axios.post(
                    'http://localhost:8000/api/teacher/groups/',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage('Group created successfully!');
            }
            fetchGroups();
            setTimeout(() => handleCloseDialog(), 1500);
        } catch (err) {
            setError('Failed to save group');
            console.error(err);
        }
    };

    const handleDelete = async (groupId) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;

        try {
            const token = getAuthToken();
            await axios.delete(`http://localhost:8000/api/teacher/groups/${groupId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Group deleted successfully!');
            fetchGroups();
        } catch (err) {
            setError('Failed to delete group');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    My Student Groups
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Create Group
                </Button>
            </Box>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Group Name</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Members</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No groups created yet. Click "Create Group" to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell>{group.name}</TableCell>
                                    <TableCell>{group.description || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip label={`${group.member_count} students`} size="small" color="primary" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenDialog(group)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(group.id)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Group Name"
                            name="name"
                            required
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Select Students</InputLabel>
                            <Select
                                multiple
                                value={formData.student_ids}
                                onChange={handleStudentChange}
                                input={<OutlinedInput label="Select Students" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const student = students.find(s => s.id === value);
                                            return <Chip key={value} label={student?.name || student?.username} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {students.map((student) => (
                                    <MenuItem key={student.id} value={student.id}>
                                        {student.name || student.username} ({student.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {message && <Alert severity="success">{message}</Alert>}
                        {error && <Alert severity="error">{error}</Alert>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingGroup ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherGroupManagement;
