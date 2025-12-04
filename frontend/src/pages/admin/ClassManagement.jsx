import { useState } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, Grid, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Collapse, List, ListItem, ListItemText, Chip
} from '@mui/material';
import { Add, ExpandMore, ExpandLess, Delete, Edit } from '@mui/icons-material';

const ClassManagement = () => {
    // Mock Data
    const [classes, setClasses] = useState([
        { id: 1, name: 'Class 6', sections: [{ id: 101, name: 'A' }, { id: 102, name: 'B' }] },
        { id: 2, name: 'Class 7', sections: [{ id: 103, name: 'A' }] },
    ]);

    const [openClassDialog, setOpenClassDialog] = useState(false);
    const [openSectionDialog, setOpenSectionDialog] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [newClassName, setNewClassName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [expandedClass, setExpandedClass] = useState(null);

    const handleAddClass = () => {
        if (newClassName.trim()) {
            setClasses([...classes, { id: Date.now(), name: newClassName, sections: [] }]);
            setNewClassName('');
            setOpenClassDialog(false);
        }
    };

    const handleAddSection = () => {
        if (newSectionName.trim() && selectedClassId) {
            setClasses(classes.map(cls => {
                if (cls.id === selectedClassId) {
                    return { ...cls, sections: [...cls.sections, { id: Date.now(), name: newSectionName }] };
                }
                return cls;
            }));
            setNewSectionName('');
            setOpenSectionDialog(false);
        }
    };

    const handleDeleteClass = (id) => {
        setClasses(classes.filter(cls => cls.id !== id));
    };

    const handleDeleteSection = (classId, sectionId) => {
        setClasses(classes.map(cls => {
            if (cls.id === classId) {
                return { ...cls, sections: cls.sections.filter(sec => sec.id !== sectionId) };
            }
            return cls;
        }));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Class & Section Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setOpenClassDialog(true)}
                >
                    Add Class
                </Button>
            </Box>
            
            <Grid container spacing={3}>
                {classes.map((cls) => (
                    <Grid item xs={12} md={6} key={cls.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {cls.name}
                                    </Typography>
                                    <Box>
                                        <IconButton onClick={() => {
                                            setSelectedClassId(cls.id);
                                            setOpenSectionDialog(true);
                                        }}>
                                            <Add color="primary" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClass(cls.id)}>
                                            <Delete color="error" />
                                        </IconButton>
                                        <IconButton onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}>
                                            {expandedClass === cls.id ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </Box>
                                </Box>
                                
                                <Collapse in={expandedClass === cls.id} timeout="auto" unmountOnExit>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Sections ({cls.sections.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {cls.sections.map((sec) => (
                                                <Chip 
                                                    key={sec.id} 
                                                    label={sec.name} 
                                                    onDelete={() => handleDeleteSection(cls.id, sec.id)}
                                                    color="default"
                                                    variant="outlined"
                                                />
                                            ))}
                                            {cls.sections.length === 0 && (
                                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                    No sections yet
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Collapse>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add Class Dialog */}
            <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)}>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Class Name"
                        fullWidth
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="e.g. Class 8"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenClassDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddClass} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Add Section Dialog */}
            <Dialog open={openSectionDialog} onClose={() => setOpenSectionDialog(false)}>
                <DialogTitle>Add Section</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Section Name"
                        fullWidth
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="e.g. A, B, Rose"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSectionDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddSection} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ClassManagement;
