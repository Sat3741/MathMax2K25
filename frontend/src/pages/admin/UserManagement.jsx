import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/authUtils';
import API_BASE_URL from '../../apiConfig';
import { 
    Container, Typography, Box, Card, CardContent, Button, TextField, 
    InputAdornment, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, Select, MenuItem, Chip, FormControl,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Add, Search, Edit, Delete, Save, Cancel, VpnKey, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '', role: 'student', username: '', phone: '', class: '', section: '', password: ''
    });

    // Edit State
    const [editUserId, setEditUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '', role: '', username: '', phone: '', class: '', section: ''
    });

    // Password Reset State
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [resetPasswordData, setResetPasswordData] = useState({ username: '', password: '' });

    // User Created Dialog State
    const [userCreatedDialog, setUserCreatedDialog] = useState(false);
    const [createdUserData, setCreatedUserData] = useState({ username: '', password: '', name: '', role: '' });

    // Classes and Sections data
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const filteredSections = sections.filter(sec => sec.academic_class === parseInt(newUser.class));

    useEffect(() => {
        fetchUsers();
        fetchClasses();
        fetchSections();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map API fields to frontend fields
            const mappedUsers = response.data.map(user => ({
                ...user,
                class: user.class_field || user.grade_level || '-',
                phone: user.phone || user.phone_number || '-',
                section: user.section || '-'
            }));
            setUsers(mappedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const fetchClasses = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/classes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (err) {
            console.error("Error fetching classes:", err);
        }
    };

    const fetchSections = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/sections/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSections(response.data);
        } catch (err) {
            console.error("Error fetching sections:", err);
        }
    };

    const handleAddUser = async () => {
        try {
            const token = getAuthToken();
            
            // Auto-generate username and password if not provided
            let username = newUser.username;
            let password = newUser.password;
            
            if (!username && newUser.name) {
                const nameParts = newUser.name.trim().split(' ');
                const firstName = nameParts[0].toLowerCase();
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
                const randomNum = Math.floor(Math.random() * 900) + 100;
                username = lastName ? `${firstName}.${lastName}${randomNum}` : `${firstName}${randomNum}`;
            }
            
            if (!password) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                password = Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            }
            
            // Since class is now a text input for grade level, use it directly
            const gradeLevel = newUser.class ? parseInt(newUser.class) : null;
            
            const payload = {
                username: username,
                first_name: newUser.name,
                last_name: '',
                email: `${username}@mathmax.com`,
                password: password,
                phone_number: newUser.phone,
                grade_level: gradeLevel,
                section: newUser.section,
                is_student: newUser.role === 'student',
                is_teacher: newUser.role === 'teacher',
            };

            await axios.post(`${API_BASE_URL}/auth/create-user/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCreatedUserData({
                username: username,
                password: password,
                name: newUser.name,
                role: newUser.role
            });
            setUserCreatedDialog(true);

            fetchUsers();
            setIsAdding(false);
            setNewUser({ name: '', role: 'student', username: '', phone: '', class: '', section: '', password: '' });
        } catch (err) {
            console.error("Error adding user:", err);
            alert("Failed to add user: " + (err.response?.data?.username?.[0] || err.message));
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = getAuthToken();
                await axios.delete(`${API_BASE_URL}/auth/users/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchUsers();
            } catch (err) {
                console.error("Error deleting user:", err);
                alert("Failed to delete user");
            }
        }
    };

    const handleEditClick = (user) => {
        setEditUserId(user.id);
        setEditFormData({ ...user });
    };

    const handleSaveEdit = async () => {
        try {
            const token = getAuthToken();
            const payload = {
                first_name: editFormData.name,
                username: editFormData.username,
                phone_number: editFormData.phone,
                grade_level: (editFormData.class && editFormData.class !== '-' && !isNaN(editFormData.class)) ? parseInt(editFormData.class) : null,
                section: (editFormData.section && editFormData.section !== '-') ? editFormData.section : '',
                is_student: editFormData.role === 'student',
                is_teacher: editFormData.role === 'teacher',
            };

            await axios.patch(`${API_BASE_URL}/auth/users/${editUserId}/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchUsers();
            setEditUserId(null);
        } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user");
        }
    };

    const handleResetPassword = async (userId, username) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/auth/users/${userId}/reset-password/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setResetPasswordData({
                username: username,
                password: response.data.password
            });
            setPasswordDialog(true);
        } catch (err) {
            console.error("Error resetting password:", err);
            alert("Failed to reset password");
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(resetPasswordData.password);
        alert('Password copied to clipboard!');
    };

    const handleCopyUserDetails = () => {
        const details = `Name: ${createdUserData.name}\nUsername: ${createdUserData.username}\nPassword: ${createdUserData.password}\nRole: ${createdUserData.role}`;
        navigator.clipboard.writeText(details);
        alert('User details copied to clipboard!');
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    User Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                >
                    Add User
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Card>
                    <CardContent>
                        <TextField
                            fullWidth
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </CardContent>
                </Card>
            </Box>

            <Box>
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Username</strong></TableCell>
                                    <TableCell><strong>Phone</strong></TableCell>
                                    <TableCell><strong>Class</strong></TableCell>
                                    <TableCell><strong>Section</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isAdding && (
                                    <TableRow>
                                        <TableCell>
                                            <TextField 
                                                size="small" 
                                                placeholder="Full Name"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                                fullWidth
                                            >
                                                <MenuItem value="student">Student</MenuItem>
                                                <MenuItem value="teacher">Teacher</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <TextField 
                                                size="small" 
                                                placeholder="Phone"
                                                value={newUser.phone}
                                                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField 
                                                size="small" 
                                                placeholder="Grade (e.g., 9)"
                                                type="number"
                                                value={newUser.class}
                                                onChange={(e) => setNewUser({...newUser, class: e.target.value})}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField 
                                                size="small" 
                                                placeholder="Section (e.g., A)"
                                                value={newUser.section}
                                                onChange={(e) => setNewUser({...newUser, section: e.target.value})}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={handleAddUser}>
                                                <Save />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => setIsAdding(false)}>
                                                <Cancel />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        {editUserId === user.id ? (
                                            <>
                                                <TableCell>
                                                    <TextField 
                                                        size="small" 
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        size="small"
                                                        value={editFormData.role}
                                                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                                                    >
                                                        <MenuItem value="student">Student</MenuItem>
                                                        <MenuItem value="teacher">Teacher</MenuItem>
                                                        <MenuItem value="admin">Admin</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField 
                                                        size="small" 
                                                        value={editFormData.username}
                                                        onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField 
                                                        size="small" 
                                                        value={editFormData.phone}
                                                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField 
                                                        size="small" 
                                                        value={editFormData.class}
                                                        onChange={(e) => setEditFormData({...editFormData, class: e.target.value})}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField 
                                                        size="small" 
                                                        value={editFormData.section}
                                                        onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="primary" onClick={handleSaveEdit}>
                                                        <Save />
                                                    </IconButton>
                                                    <IconButton color="error" onClick={() => setEditUserId(null)}>
                                                        <Cancel />
                                                    </IconButton>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={user.role} 
                                                        size="small"
                                                        color={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'primary' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                                        {user.username}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{user.phone}</TableCell>
                                                <TableCell>{user.class}</TableCell>
                                                <TableCell>{user.section}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={() => handleEditClick(user)}>
                                                        <Edit color="primary" />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleResetPassword(user.id, user.username)}>
                                                        <VpnKey color="warning" />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDeleteUser(user.id)}>
                                                        <Delete color="error" />
                                                    </IconButton>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && !isAdding && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">No users found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>

            {/* Password Reset Dialog */}
            <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Password Reset Successful</DialogTitle>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Password has been reset for user: <strong>{resetPasswordData.username}</strong>
                    </Alert>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Please save this password! It will not be shown again.
                    </Alert>
                    <Box sx={{ 
                        bgcolor: 'background.paper',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontFamily: 'monospace',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                letterSpacing: 2
                            }}
                        >
                            {resetPasswordData.password}
                        </Typography>
                        <IconButton onClick={handleCopyPassword} color="primary">
                            <ContentCopy />
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialog(false)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* User Created Success Dialog */}
            <Dialog open={userCreatedDialog} onClose={() => setUserCreatedDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>User Created Successfully!</DialogTitle>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        New user has been created successfully!
                    </Alert>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Please save these credentials! The password will not be shown again.
                    </Alert>
                    <Box sx={{ 
                        bgcolor: 'background.paper', 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2 
                    }}>
                        <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Name:</strong> <span>{createdUserData.name}</span>
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Username:</strong> 
                            <Box component="span" sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '1.1em' }}>
                                {createdUserData.username}
                            </Box>
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Password:</strong> 
                            <Box component="span" sx={{ fontFamily: 'monospace', color: 'error.main', fontSize: '1.1em', fontWeight: 'bold' }}>
                                {createdUserData.password}
                            </Box>
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{createdUserData.role}</span>
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        startIcon={<ContentCopy />} 
                        onClick={handleCopyUserDetails}
                        variant="outlined"
                    >
                        Copy Details
                    </Button>
                    <Button onClick={() => setUserCreatedDialog(false)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
