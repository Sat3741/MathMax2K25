import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/authUtils';
import API_BASE_URL from '../../apiConfig';
import { 
    Container, Typography, Box, Card, CardContent, Grid, Button, 
    Stepper, Step, StepLabel, FormControl, InputLabel, Select, MenuItem,
    Alert, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { CloudUpload, School, CheckCircle, Download } from '@mui/icons-material';
import axios from 'axios';

const BulkOperations = () => {
    // Bulk Upload State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Bulk Promote State
    const [activeStep, setActiveStep] = useState(0);
    const [promoteData, setPromoteData] = useState({
        fromClass: '',
        toClass: ''
    });
    const [classes, setClasses] = useState([]);
    const [promoting, setPromoting] = useState(false);
    const [studentCount, setStudentCount] = useState(0);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (promoteData.fromClass) {
            fetchStudentCount();
        }
    }, [promoteData.fromClass]);

    const fetchClasses = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/classes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const fetchStudentCount = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/auth/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Use loose comparison for grade_level to handle string/number differences
            // Check both is_student flag and role string just in case
            const count = response.data.filter(u => 
                (u.is_student || u.role === 'student') && 
                u.grade_level == promoteData.fromClass
            ).length;
            
            setStudentCount(count);
        } catch (err) {
            console.error('Failed to fetch student count:', err);
        }
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
        setUploadSuccess(false);
        setUploadResult(null);
    };

    const handleUpload = async () => {
        if (uploadFile) {
            setUploading(true);
            try {
                const token = getAuthToken();
                const formData = new FormData();
                formData.append('file', uploadFile);

                const response = await axios.post(
                    `${API_BASE_URL}/auth/bulk-upload/`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                setUploadResult(response.data);
                setUploadSuccess(true);
                setShowPasswordModal(true);
                setUploadFile(null);
            } catch (err) {
                console.error('Upload error:', err);
                alert('Failed to upload file: ' + (err.response?.data?.error || err.message));
            } finally {
                setUploading(false);
            }
        }
    };

    const downloadPasswordList = () => {
        if (!uploadResult || !uploadResult.created_users) return;

        const csvContent = [
            ['Username', 'Password', 'Name', 'Role'].join(','),
            ...uploadResult.created_users.map(user => 
                [user.username, user.password, user.name, user.role].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_passwords_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePromoteNext = async () => {
        if (activeStep === 2) {
            // Execute promotion
            setPromoting(true);
            try {
                const token = getAuthToken();
                await axios.post(
                    `${API_BASE_URL}/auth/bulk-promote/`,
                    {
                        from_grade: parseInt(promoteData.fromClass),
                        to_grade: parseInt(promoteData.toClass)
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                alert(`Successfully promoted ${studentCount} students from Grade ${promoteData.fromClass} to Grade ${promoteData.toClass}!`);
                setActiveStep(0);
                setPromoteData({ fromClass: '', toClass: '' });
                setStudentCount(0);
            } catch (err) {
                console.error('Promotion error:', err);
                alert('Failed to promote students: ' + (err.response?.data?.error || err.message));
            } finally {
                setPromoting(false);
            }
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const steps = ['Select Current Class', 'Select Target Class', 'Confirm Promotion'];

    // Get unique grade levels from classes
    const gradeLevels = [...new Set(classes.map(c => c.grade_level))].sort((a, b) => a - b);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                Bulk Operations
            </Typography>

            <Grid container spacing={4}>
                {/* Bulk Upload Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <CloudUpload sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Bulk User Upload
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Upload an Excel file to create multiple users at once. Download the template to see the required format.
                            </Typography>

                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                fullWidth
                                sx={{ mb: 2 }}
                                onClick={() => window.location.href = '/static/templates/user_upload_template.xlsx'}
                            >
                                Download Template
                            </Button>

                            <Button
                                variant="contained"
                                component="label"
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                {uploadFile ? uploadFile.name : 'Choose File'}
                                <input
                                    type="file"
                                    hidden
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                />
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={!uploadFile || uploading}
                                onClick={handleUpload}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>

                            {uploading && <LinearProgress sx={{ mt: 2 }} />}

                            {uploadSuccess && uploadResult && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Successfully created {uploadResult.created_count} users!
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bulk Promote Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <School sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Promote Students
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Promote all students from one grade to the next grade level.
                            </Typography>

                            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            <Box sx={{ minHeight: 150 }}>
                                {activeStep === 0 && (
                                    <Box>
                                        <FormControl fullWidth>
                                            <InputLabel>Promote From Grade</InputLabel>
                                            <Select
                                                value={promoteData.fromClass}
                                                label="Promote From Grade"
                                                onChange={(e) => setPromoteData({...promoteData, fromClass: e.target.value})}
                                            >
                                                {gradeLevels.map(grade => (
                                                    <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {promoteData.fromClass && (
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                {studentCount} student(s) found in Grade {promoteData.fromClass}
                                            </Alert>
                                        )}
                                    </Box>
                                )}
                                {activeStep === 1 && (
                                    <FormControl fullWidth>
                                        <InputLabel>Promote To Grade</InputLabel>
                                        <Select
                                            value={promoteData.toClass}
                                            label="Promote To Grade"
                                            onChange={(e) => setPromoteData({...promoteData, toClass: e.target.value})}
                                        >
                                            {gradeLevels
                                                .filter(grade => grade > parseInt(promoteData.fromClass))
                                                .map(grade => (
                                                    <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                )}
                                {activeStep === 2 && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Confirm Promotion
                                        </Typography>
                                        <Typography>
                                            Promote <strong>{studentCount} student(s)</strong> from <strong>Grade {promoteData.fromClass}</strong> to <strong>Grade {promoteData.toClass}</strong>?
                                        </Typography>
                                        <Alert severity="warning" sx={{ mt: 2 }}>
                                            This action will update all students' grade levels. This cannot be undone.
                                        </Alert>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button 
                                    disabled={activeStep === 0}
                                    onClick={() => setActiveStep((prev) => prev - 1)}
                                >
                                    Back
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary"
                                    onClick={handlePromoteNext}
                                    disabled={
                                        (activeStep === 0 && !promoteData.fromClass) ||
                                        (activeStep === 1 && !promoteData.toClass) ||
                                        promoting
                                    }
                                >
                                    {promoting ? 'Promoting...' : (activeStep === 2 ? 'Confirm Promote' : 'Next')}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Password Display Modal */}
            <Dialog 
                open={showPasswordModal} 
                onClose={() => setShowPasswordModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Users Created Successfully
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Please save these credentials! Passwords will not be shown again.
                    </Alert>
                    
                    {uploadResult && uploadResult.created_users && (
                        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Username</strong></TableCell>
                                        <TableCell><strong>Password</strong></TableCell>
                                        <TableCell><strong>Role</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {uploadResult.created_users.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                                {user.username}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 'bold' }}>
                                                {user.password}
                                            </TableCell>
                                            <TableCell>{user.role}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        startIcon={<Download />}
                        onClick={downloadPasswordList}
                        variant="outlined"
                    >
                        Download as CSV
                    </Button>
                    <Button onClick={() => setShowPasswordModal(false)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BulkOperations;
