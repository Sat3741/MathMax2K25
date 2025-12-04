import { useState } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, Button, TextField, 
    InputAdornment, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, IconButton, Select, MenuItem, Chip
} from '@mui/material';
import { Add, Search, Edit, Delete, Save, Cancel } from '@mui/icons-material';

const UserManagement = () => {
    // Mock Data
    const [users, setUsers] = useState([
        { id: 1, name: 'Arjun', role: 'student', username: '23CS001', phone: '9876543210', class: '9', section: 'B' },
        { id: 2, name: 'Kavitha', role: 'teacher', username: 'T002', phone: '9988776655', class: '-', section: '-' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '', role: 'student', username: '', phone: '', class: '', section: ''
    });

    // Edit State
    const [editUserId, setEditUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '', role: '', username: '', phone: '', class: '', section: ''
    });

    const handleAddUser = () => {
        if (newUser.name && newUser.username) {
            setUsers([...users, { id: Date.now(), ...newUser }]);
            setNewUser({ name: '', role: 'student', username: '', phone: '', class: '', section: '' });
            setIsAdding(false);
        }
    };

    const handleDeleteUser = (id) => {
        setUsers(users.filter(user => user.id !== id));
    };

    const handleEditClick = (user) => {
        setEditUserId(user.id);
        setEditFormData({ ...user });
    };

    const handleCancelEdit = () => {
        setEditUserId(null);
        setEditFormData({ name: '', role: '', username: '', phone: '', class: '', section: '' });
    };

    const handleSaveEdit = () => {
        setUsers(users.map(user => (user.id === editUserId ? { ...editFormData, id: editUserId } : user)));
        setEditUserId(null);
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
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
                    Add User (Inline)
                </Button>
            </Box>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search users by name or username..."
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
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell fontWeight="bold">Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Section</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isAdding && (
                            <TableRow sx={{ bgcolor: 'info.light' }}>
                                <TableCell>
                                    <TextField 
                                        size="small" 
                                        placeholder="Name" 
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        size="small"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    >
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="teacher">Teacher</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TextField 
                                        size="small" 
                                        placeholder="Username" 
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    />
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
                                        placeholder="Class" 
                                        disabled={newUser.role !== 'student'}
                                        value={newUser.class}
                                        onChange={(e) => setNewUser({...newUser, class: e.target.value})}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField 
                                        size="small" 
                                        placeholder="Section" 
                                        disabled={newUser.role !== 'student'}
                                        value={newUser.section}
                                        onChange={(e) => setNewUser({...newUser, section: e.target.value})}
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
                                                disabled={editFormData.role !== 'student'}
                                                value={editFormData.class}
                                                onChange={(e) => setEditFormData({...editFormData, class: e.target.value})}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField 
                                                size="small" 
                                                disabled={editFormData.role !== 'student'}
                                                value={editFormData.section}
                                                onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={handleSaveEdit}>
                                                <Save />
                                            </IconButton>
                                            <IconButton color="error" onClick={handleCancelEdit}>
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
                                                color={user.role === 'student' ? 'primary' : user.role === 'teacher' ? 'secondary' : 'default'} 
                                            />
                                        </TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>{user.class}</TableCell>
                                        <TableCell>{user.section}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary" onClick={() => handleEditClick(user)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                                                <Delete fontSize="small" />
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
        </Container>
    );
};

export default UserManagement;
