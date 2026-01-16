import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/authUtils';
import API_BASE_URL from '../../apiConfig';
import {
    Container, Typography, Box, Card, CardContent, Button, TextField,
    InputAdornment, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Select, MenuItem, Chip, FormControl,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, InputLabel
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add, Search, Edit, Delete, Save, Cancel, VpnKey, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({
        first_name: '', last_name: '', email: '', role: 'student', username: '', phone: '', class: '', section: '', password: ''
    })

    // Edit Dialog State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editUserId, setEditUserId] = useState(null); // Keep for reference
    const [editFormData, setEditFormData] = useState({
        first_name: '', last_name: '', email: '', role: '', username: '', phone: '', class: '', section: ''
    });

    // Bulk Edit State
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [bulkEdits, setBulkEdits] = useState({}); // { [userId]: { ...changedFields } }

    // Password Input Dialog State (for entering new password)
    const [passwordInputDialog, setPasswordInputDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState({ id: null, username: '' });
    const [newPasswordInput, setNewPasswordInput] = useState('');

    // Password Reset Success Dialog State
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [resetPasswordData, setResetPasswordData] = useState({ username: '', password: '' });
    const [resettingPassword, setResettingPassword] = useState(false);

    // User Created Dialog State
    const [userCreatedDialog, setUserCreatedDialog] = useState(false);
    const [createdUserData, setCreatedUserData] = useState({ username: '', password: '', name: '', role: '' });

    // Classes data
    // Classes contain nested sections, so we don't need a separate sections state

    useEffect(() => {
        fetchUsers();
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/classes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (err) {
            console.error("Error fetching classes:", err);
            // Don't alert aggressively for background options fetching
        }
    };

    const fetchUsers = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map API fields to frontend fields
            const mappedUsers = response.data.map(user => ({
                ...user,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                // Ensure class (grade) is a string for Select consistency
                class: user.class_field ? String(user.class_field) : (user.grade_level ? String(user.grade_level) : '-'),
                phone: user.phone || user.phone_number || '-',
                section: user.section || '-',
                joined: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'
            }));
            setUsers(mappedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };




    const columns = [
        { field: 'first_name', headerName: 'First Name', flex: 1, minWidth: 120, editable: isBulkEditing },
        { field: 'last_name', headerName: 'Last Name', flex: 1, minWidth: 120, editable: isBulkEditing },
        { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200, editable: isBulkEditing },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            editable: isBulkEditing,
            type: 'singleSelect',
            valueOptions: ['student', 'teacher', 'admin'],
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'admin' ? 'error' : params.value === 'teacher' ? 'primary' : 'default'}
                    size="small"
                />
            )
        },
        { field: 'username', headerName: 'Username', width: 120, editable: isBulkEditing },
        { field: 'phone', headerName: 'Phone', width: 120, editable: isBulkEditing },
        { field: 'class', headerName: 'Grade', width: 100, editable: isBulkEditing },
        { field: 'section', headerName: 'Section', width: 100, editable: isBulkEditing },
        { field: 'joined', headerName: 'Joined', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEditClick(params.row)}>
                        <Edit fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleResetPasswordClick(params.row.id, params.row.username)}>
                        <VpnKey fontSize="small" color="warning" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteUser(params.row.id)}>
                        <Delete fontSize="small" color="error" />
                    </IconButton>
                </Box>
            )
        }
    ];

    const handleAddUser = async () => {
        try {
            const token = getAuthToken();

            // Auto-generate username and password if not provided
            let username = newUser.username;
            let password = newUser.password;

            if (!username && newUser.first_name) {
                const firstName = newUser.first_name.trim().toLowerCase();
                const lastName = newUser.last_name ? newUser.last_name.trim().toLowerCase() : '';
                const randomNum = Math.floor(Math.random() * 900) + 100;
                username = lastName ? `${firstName}.${lastName}${randomNum}` : `${firstName}${randomNum}`;
            }

            if (!password) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                password = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            }

            // Since class is now a text input for grade level, use it directly
            const gradeLevel = newUser.class ? parseInt(newUser.class) : null;

            // Use provided email or generate one
            const email = newUser.email || `${username}@mathmax.com`;

            const payload = {
                username: username,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: email,
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
                name: `${newUser.first_name} ${newUser.last_name}`.trim(),
                role: newUser.role
            });
            setUserCreatedDialog(true);

            fetchUsers();
            setIsAdding(false);
            setNewUser({
                first_name: '', last_name: '', email: '', role: 'student',
                username: '', phone: '', class: '', section: '', password: ''
            });
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
        // Ensure values match MenuItem types exactly
        setEditFormData({
            ...user,
            class: user.class === '-' ? '' : String(user.class),
            section: user.section === '-' ? '' : String(user.section)
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const token = getAuthToken();
            const payload = {
                first_name: editFormData.first_name,
                last_name: editFormData.last_name,
                email: editFormData.email,
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
            setIsEditDialogOpen(false);
            setEditUserId(null);
        } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user");
        }
    };

    // Bulk Edit Handlers
    const handleBulkChange = (userId, field, value) => {
        setBulkEdits(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    const handleSaveBulkEdits = async () => {
        const token = getAuthToken();
        const promises = [];

        Object.entries(bulkEdits).forEach(([userId, changes]) => {
            // Map frontend fields to backend payload
            const payload = {};
            if (changes.first_name !== undefined) payload.first_name = changes.first_name;
            if (changes.last_name !== undefined) payload.last_name = changes.last_name;
            if (changes.email !== undefined) payload.email = changes.email;
            if (changes.username !== undefined) payload.username = changes.username;
            if (changes.phone !== undefined) payload.phone_number = changes.phone;
            if (changes.role !== undefined) {
                payload.is_student = changes.role === 'student';
                payload.is_teacher = changes.role === 'teacher';
            }
            if (changes.class !== undefined) {
                payload.grade_level = (changes.class && changes.class !== '-' && !isNaN(changes.class)) ? parseInt(changes.class) : null;
            }
            if (changes.section !== undefined) {
                payload.section = (changes.section && changes.section !== '-') ? changes.section : '';
            }

            if (Object.keys(payload).length > 0) {
                promises.push(axios.patch(`${API_BASE_URL}/auth/users/${userId}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                }));
            }
        });

        if (promises.length === 0) {
            setIsBulkEditing(false);
            return;
        }

        try {
            await Promise.all(promises);
            fetchUsers();
            setBulkEdits({});
            setIsBulkEditing(false);
            alert("Bulk update successful!");
        } catch (err) {
            console.error("Error saving bulk edits:", err);
            alert("Failed to save some changes. See console for details.");
        }
    };


    const handleResetPasswordClick = (userId, username) => {
        // Open the password input dialog
        setSelectedUser({ id: userId, username: username });
        setNewPasswordInput('');
        setPasswordInputDialog(true);
    };

    const handleConfirmPasswordReset = async () => {
        if (!newPasswordInput) {
            alert("Please enter a new password");
            return;
        }

        if (resettingPassword) return; // Prevent multiple clicks

        try {
            setResettingPassword(true);
            const token = getAuthToken();
            if (!token) {
                alert("You must be logged in to reset passwords");
                setPasswordInputDialog(false);
                return;
            }

            const url = `${API_BASE_URL}/auth/users/${selectedUser.id}/reset-password/`;
            console.log("Resetting password for user:", selectedUser.id, "URL:", url);

            const response = await axios.post(
                url,
                { password: newPasswordInput },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Reset password response:", response.data);

            if (response.data && response.data.password) {
                // Close input dialog
                setPasswordInputDialog(false);

                // Show success dialog
                setResetPasswordData({
                    username: selectedUser.username,
                    password: response.data.password
                });
                setPasswordDialog(true);
            } else {
                alert("Unexpected response format from server");
                console.error("Response data:", response.data);
            }
        } catch (err) {
            console.error("Error resetting password:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);

            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data?.detail ||
                (err.response?.status === 403 ? "You don't have permission to reset passwords. Admin access required." : null) ||
                (err.response?.status === 401 ? "Authentication failed. Please log in again." : null) ||
                err.message ||
                "Failed to reset password. Please check console for details.";
            alert(`Failed to reset password: ${errorMessage}`);
        } finally {
            setResettingPassword(false);
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
        <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#121212', minHeight: '100vh', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    User Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isBulkEditing ? (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Save />}
                                onClick={handleSaveBulkEdits}
                                disabled={Object.keys(bulkEdits).length === 0}
                            >
                                Save Changes ({Object.keys(bulkEdits).length})
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<Cancel />}
                                onClick={() => {
                                    setIsBulkEditing(false);
                                    setBulkEdits({});
                                }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => setIsBulkEditing(true)}
                                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                            >
                                Bulk Edit
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setIsAdding(true)}
                            >
                                Add User
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {isBulkEditing && (
                <Alert severity="info" sx={{ mb: 2, bgcolor: '#1e1e1e', color: '#90caf9' }}>
                    <strong>Bulk Edit Mode Active:</strong> You can now edit cells directly in the table. Click "Save Changes" when done.
                </Alert>
            )}

            <Box sx={{ height: 650, width: '100%', bgcolor: 'transparent', p: 0, borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    autoPageSize
                    pagination
                    processRowUpdate={(newRow, oldRow) => {
                        // Track changes for bulk edit
                        const userId = newRow.id;
                        const changes = {};
                        Object.keys(newRow).forEach(key => {
                            if (newRow[key] !== oldRow[key]) {
                                changes[key] = newRow[key];
                            }
                        });

                        if (Object.keys(changes).length > 0) {
                            setBulkEdits(prev => ({
                                ...prev,
                                [userId]: {
                                    ...(prev[userId] || {}),
                                    ...changes
                                }
                            }));
                        }
                        return newRow;
                    }}
                    onProcessRowUpdateError={(error) => console.error("Grid Edit Error:", error)}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                            sx: {
                                p: 2,
                                color: 'white',
                                '& .MuiButton-root': { color: '#90caf9' },
                                '& .MuiTextField-root': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1,
                                    '& .MuiInputBase-input': { color: 'white' },
                                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }
                                }
                            }
                        },
                    }}
                    disableRowSelectionOnClick
                    density="comfortable"
                    initialState={{
                        pagination: { paginationModel: { pageSize: 20 } },
                    }}
                    pageSizeOptions={[10, 20, 50, 100]}
                    sx={{
                        border: 'none',
                        color: 'white',
                        '& .MuiDataGrid-main': {
                            bgcolor: 'transparent',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#1e1e1e',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold',
                                color: 'white',
                                fontSize: '0.9rem',
                            }
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.8)',
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                            },
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: 'none',
                            bgcolor: 'transparent',
                            color: 'white',
                            '& .MuiTablePagination-root': {
                                color: 'white',
                            },
                            '& .MuiIconButton-root': {
                                color: 'white',
                            }
                        },
                        '& .MuiDataGrid-selectedRowCount': {
                            color: 'white',
                        }
                    }}
                />
            </Box>



            {/* Add User Dialog */}
            <Dialog open={isAdding} onClose={() => setIsAdding(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                value={newUser.first_name}
                                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Last Name"
                                value={newUser.last_name}
                                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                fullWidth
                                required
                            />
                        </Box>
                        <TextField
                            label="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Username (Auto-generated if empty)"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            fullWidth
                            helperText="Leave empty to auto-generate from name"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={newUser.role}
                                label="Role"
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                            </Select>
                        </FormControl>

                        {newUser.role === 'student' && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Grade</InputLabel>
                                    <Select
                                        value={newUser.class}
                                        label="Grade"
                                        onChange={(e) => setNewUser({ ...newUser, class: e.target.value, section: '' })}
                                    >
                                        {classes.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.grade_level}>
                                                {cls.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth disabled={!newUser.class}>
                                    <InputLabel>Section</InputLabel>
                                    <Select
                                        value={newUser.section}
                                        label="Section"
                                        onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
                                    >
                                        {classes
                                            .find(c => c.grade_level === parseInt(newUser.class))
                                            ?.sections?.map((sec) => (
                                                <MenuItem key={sec.id} value={sec.name}>
                                                    {sec.name}
                                                </MenuItem>
                                            )) || []}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        <TextField
                            label="Phone"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAdding(false)} color="error">
                        Cancel
                    </Button>
                    <Button onClick={handleAddUser} variant="contained" color="primary">
                        Create User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                value={editFormData.first_name}
                                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Last Name"
                                value={editFormData.last_name}
                                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="Email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={editFormData.role}
                                label="Role"
                                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Username"
                            value={editFormData.username}
                            onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            fullWidth
                        />
                        {(editFormData.role === 'student' || editFormData.role === 'teacher') && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Grade</InputLabel>
                                    <Select
                                        value={editFormData.class === '-' ? '' : String(editFormData.class)}
                                        label="Grade"
                                        onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value, section: '' })}
                                    >
                                        {classes.map((cls) => (
                                            <MenuItem key={cls.id} value={String(cls.grade_level)}>
                                                {cls.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth disabled={!editFormData.class || editFormData.class === '-'}>
                                    <InputLabel>Section</InputLabel>
                                    <Select
                                        value={editFormData.section || ''}
                                        label="Section"
                                        onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                                    >
                                        {classes
                                            .find(c => String(c.grade_level) === String(editFormData.class))
                                            ?.sections?.map((sec) => (
                                                <MenuItem key={sec.id} value={String(sec.name)}>
                                                    {sec.name}
                                                </MenuItem>
                                            )) || []}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)} color="error">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Input Dialog */}
            <Dialog open={passwordInputDialog} onClose={() => setPasswordInputDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reset Password for {selectedUser.username}</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 3, mt: 2 }}>
                        Enter a new password for user: <strong>{selectedUser.username}</strong>
                    </Alert>
                    <TextField
                        autoFocus
                        fullWidth
                        label="New Password"
                        type="text"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Enter new password"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && newPasswordInput) {
                                handleConfirmPasswordReset();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordInputDialog(false)} disabled={resettingPassword}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmPasswordReset}
                        variant="contained"
                        disabled={resettingPassword || !newPasswordInput}
                    >
                        {resettingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Reset Success Dialog */}
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
