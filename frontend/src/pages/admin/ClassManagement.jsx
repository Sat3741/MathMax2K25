import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    TextField,
    Alert,
    IconButton,
    Chip,
    Collapse,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    InputAdornment
} from '@mui/material';
import {
    Add,
    Save,
    Cancel,
    Edit,
    Delete,
    ExpandLess,
    ExpandMore,
    Search
} from '@mui/icons-material';
import { getAuthToken } from '../../utils/authUtils';
import API_BASE_URL from '../../apiConfig';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newClass, setNewClass] = useState({
        name: '',
        grade_level: '',
        class_teacher_name: ''
    });
    const [editData, setEditData] = useState({
        name: '',
        grade_level: '',
        class_teacher_name: ''
    });
    const [editSectionData, setEditSectionData] = useState({
        section_teacher: ''
    });
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchClasses();
        fetchStudents();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/classes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
            setError('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mappedUsers = response.data.map(user => ({
                ...user,
                class: user.class_field || user.grade_level || '-',
                phone: user.phone || user.phone_number || '-',
                section: user.section || '-'
            }));
            setStudents(mappedUsers.filter(u => u.is_student));
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    const getStudentsInSection = (gradeLevel, sectionName) => {
        const sectionStudents = students.filter(s => 
            s.grade_level === gradeLevel && s.section === sectionName
        );
        
        if (searchQuery.trim()) {
            return sectionStudents.filter(s =>
                s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.phone?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return sectionStudents;
    };

    const handleAddClass = async () => {
        if (newClass.name.trim() && newClass.grade_level) {
            try {
                const token = getAuthToken();
                await axios.post(`${API_BASE_URL}/auth/classes/`, {
                    name: newClass.name,
                    grade_level: parseInt(newClass.grade_level),
                    class_teacher_name: newClass.class_teacher_name,
                    description: ''
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNewClass({ name: '', grade_level: '', class_teacher_name: '' });
                setIsAdding(false);
                fetchClasses();
            } catch (err) {
                console.error('Failed to create class:', err);
                setError('Failed to create class');
            }
        }
    };

    const handleEditClass = async (id) => {
        try {
            const token = getAuthToken();
            await axios.put(`${API_BASE_URL}/auth/classes/${id}/`, {
                name: editData.name,
                grade_level: parseInt(editData.grade_level),
                class_teacher_name: editData.class_teacher_name,
                description: ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            fetchClasses();
        } catch (err) {
            console.error('Failed to update class:', err);
            setError('Failed to update class');
        }
    };

    const handleEditSection = async (sectionId) => {
        try {
            const token = getAuthToken();
            await axios.patch(`${API_BASE_URL}/auth/sections/${sectionId}/`, {
                section_teacher: editSectionData.section_teacher
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingSectionId(null);
            fetchClasses();
        } catch (err) {
            console.error('Failed to update section:', err);
            setError('Failed to update section');
        }
    };

    const handleDeleteClass = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                const token = getAuthToken();
                await axios.delete(`${API_BASE_URL}/auth/classes/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchClasses();
            } catch (err) {
                console.error('Failed to delete class:', err);
                setError('Failed to delete class');
            }
        }
    };

    const startEdit = (classItem) => {
        setEditingId(classItem.id);
        setEditData({
            name: classItem.name,
            grade_level: classItem.grade_level,
            class_teacher_name: classItem.class_teacher_name || ''
        });
    };

    const startEditSection = (section) => {
        setEditingSectionId(section.id);
        setEditSectionData({
            section_teacher: section.section_teacher || ''
        });
    };

    const toggleExpand = (classId) => {
        setExpandedClass(expandedClass === classId ? null : classId);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Classes & Sections
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                >
                    Add Class
                </Button>
            </Box>

            {/* Search Bar */}
            <Card sx={{ mb: 3, p: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search students by name, username, or phone..."
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
            </Card>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Add Class Form */}
            {isAdding && (
                <Card sx={{ mb: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom>Add New Class</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField 
                            label="Class Name"
                            placeholder="e.g., Class 9"
                            value={newClass.name}
                            onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                        />
                        <TextField 
                            label="Grade Level"
                            type="number"
                            placeholder="e.g., 9"
                            value={newClass.grade_level}
                            onChange={(e) => setNewClass({...newClass, grade_level: e.target.value})}
                        />
                        <TextField 
                            label="Class Teacher"
                            placeholder="Teacher Name"
                            value={newClass.class_teacher_name}
                            onChange={(e) => setNewClass({...newClass, class_teacher_name: e.target.value})}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" startIcon={<Save />} onClick={handleAddClass}>
                            Save Class
                        </Button>
                        <Button variant="outlined" startIcon={<Cancel />} onClick={() => setIsAdding(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Card>
            )}

            {/* Classes List */}
            {classes.map((classItem) => (
                <Card key={classItem.id} sx={{ mb: 3 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => toggleExpand(classItem.id)}>
                                {expandedClass === classItem.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                            {editingId === classItem.id ? (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField 
                                        size="small"
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    />
                                    <TextField 
                                        size="small"
                                        type="number"
                                        value={editData.grade_level}
                                        onChange={(e) => setEditData({...editData, grade_level: e.target.value})}
                                    />
                                    <TextField 
                                        size="small"
                                        value={editData.class_teacher_name}
                                        onChange={(e) => setEditData({...editData, class_teacher_name: e.target.value})}
                                        placeholder="Teacher Name"
                                    />
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h6">{classItem.name}</Typography>
                                    <Chip label={`Grade ${classItem.grade_level}`} color="primary" size="small" />
                                    {classItem.class_teacher_name && (
                                        <Chip label={`Class Teacher: ${classItem.class_teacher_name}`} color="secondary" size="small" />
                                    )}
                                    <Chip label={`${classItem.section_count || 0} Sections`} size="small" />
                                </>
                            )}
                        </Box>
                        <Box>
                            {editingId === classItem.id ? (
                                <>
                                    <IconButton color="primary" onClick={() => handleEditClass(classItem.id)}>
                                        <Save />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => setEditingId(null)}>
                                        <Cancel />
                                    </IconButton>
                                </>
                            ) : (
                                <>
                                    <IconButton onClick={() => startEdit(classItem)}>
                                        <Edit color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClass(classItem.id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* Sections */}
                    <Collapse in={expandedClass === classItem.id}>
                        <Box sx={{ p: 2 }}>
                            {classItem.sections && classItem.sections.length > 0 ? (
                                classItem.sections.map((section) => {
                                    const sectionStudents = getStudentsInSection(classItem.grade_level, section.name);
                                    const displayTeacher = section.section_teacher || classItem.class_teacher_name || 'Not assigned';
                                    
                                    return (
                                        <Card key={section.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                                    <Typography variant="h6">Section {section.name}</Typography>
                                                    {editingSectionId === section.id ? (
                                                        <TextField 
                                                            size="small"
                                                            value={editSectionData.section_teacher}
                                                            onChange={(e) => setEditSectionData({section_teacher: e.target.value})}
                                                            placeholder="Section Teacher"
                                                            sx={{ 
                                                                bgcolor: '#ffffff',
                                                                borderRadius: 1,
                                                                '& .MuiInputBase-input': {
                                                                    color: '#000',
                                                                    fontWeight: 700
                                                                },
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d97706'
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip 
                                                            label={`Teacher: ${displayTeacher}`} 
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: '#fbbf24', 
                                                                color: '#000',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    )}
                                                    <Chip 
                                                        label={`${sectionStudents.length} Students`} 
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                                    />
                                                </Box>
                                                <Box>
                                                    {editingSectionId === section.id ? (
                                                        <>
                                                            <IconButton 
                                                                onClick={() => handleEditSection(section.id)}
                                                                sx={{ color: 'white' }}
                                                            >
                                                                <Save />
                                                            </IconButton>
                                                            <IconButton 
                                                                onClick={() => setEditingSectionId(null)}
                                                                sx={{ color: 'white' }}
                                                            >
                                                                <Cancel />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <IconButton 
                                                            onClick={() => startEditSection(section)}
                                                            sx={{ color: 'white' }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell><strong>Name</strong></TableCell>
                                                            <TableCell><strong>Username</strong></TableCell>
                                                            <TableCell><strong>Phone</strong></TableCell>
                                                            <TableCell><strong>Role</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {sectionStudents.length > 0 ? (
                                                            sectionStudents.map((student) => (
                                                                <TableRow key={student.id}>
                                                                    <TableCell>{student.name}</TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                                                            {student.username}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>{student.phone}</TableCell>
                                                                    <TableCell>
                                                                        <Chip label={student.role} size="small" color="default" />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                                    <Typography color="text.secondary">
                                                                        {searchQuery ? 'No students match your search' : 'No students in this section'}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Card>
                                    );
                                })
                            ) : (
                                <Alert severity="info">No sections created yet. Create sections from User Management.</Alert>
                            )}
                        </Box>
                    </Collapse>
                </Card>
            ))}

            {classes.length === 0 && !isAdding && (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No classes found. Click "Add Class" to create one.</Typography>
                </Card>
            )}
        </Container>
    );
};

export default ClassManagement;
