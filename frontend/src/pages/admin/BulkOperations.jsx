import { useState } from 'react';
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

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
        setUploadSuccess(false);
        setUploadResult(null);
    };

    const handleUpload = async () => {
        if (uploadFile) {
            setUploading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const formData = new FormData();
                formData.append('file', uploadFile);

                const response = await axios.post(
                    'http://localhost:8000/api/auth/bulk-upload/',
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

    const handlePromoteNext = () => {
        if (activeStep === 2) {
            // Finish
            setActiveStep(0);
            setPromoteData({ fromClass: '', toClass: '' });
            alert('Students promoted successfully!');
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const steps = ['Select Current Class', 'Select Target Class', 'Confirm Promotion'];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                Bulk Operations
            </Typography>
            
            <Grid container spacing={4}>
                {/* Bulk User Upload */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom fontWeight="bold">
                                Bulk User Upload
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                Upload multiple users via CSV or Excel template.
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<Download />}
                                    href="http://localhost:8000/static/bulk_upload_template.xlsx"
                                    download="bulk_upload_template.xlsx"
                                    sx={{ mb: 2 }}
                                >
                                    Download Template
                                </Button>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                                <Button variant="outlined" component="label">
                                    Choose File
                                    <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                                </Button>
                                {uploadFile && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Selected: {uploadFile.name}
                                    </Typography>
                                )}
                            </Box>

                            {uploading && <LinearProgress sx={{ mb: 2 }} />}
                            
                            {uploadSuccess && uploadResult && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Successfully created {uploadResult.created_count} users!
                                    {uploadResult.error_count > 0 && ` (${uploadResult.error_count} errors)`}
                                </Alert>
                            )}

                            <Button 
                                variant="contained" 
                                disabled={!uploadFile || uploading}
                                onClick={handleUpload}
                            >
                                {uploading ? 'Uploading...' : 'Upload Users'}
                            </Button>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    CSV Format: username,first_name,last_name,email,role,grade_level,section,phone_number
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bulk Promote */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ py: 4 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <School sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Bulk Promote
                                </Typography>
                            </Box>

                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            <Box sx={{ minHeight: 150 }}>
                                {activeStep === 0 && (
                                    <FormControl fullWidth>
                                        <InputLabel>Promote From Class</InputLabel>
                                        <Select
                                            value={promoteData.fromClass}
                                            label="Promote From Class"
                                            onChange={(e) => setPromoteData({...promoteData, fromClass: e.target.value})}
                                        >
                                            <MenuItem value="6">Class 6</MenuItem>
                                            <MenuItem value="7">Class 7</MenuItem>
                                            <MenuItem value="8">Class 8</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                                {activeStep === 1 && (
                                    <FormControl fullWidth>
                                        <InputLabel>Promote To Class</InputLabel>
                                        <Select
                                            value={promoteData.toClass}
                                            label="Promote To Class"
                                            onChange={(e) => setPromoteData({...promoteData, toClass: e.target.value})}
                                        >
                                            <MenuItem value="7">Class 7</MenuItem>
                                            <MenuItem value="8">Class 8</MenuItem>
                                            <MenuItem value="9">Class 9</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                                {activeStep === 2 && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" gutterBottom>
                                            Confirm Promotion
                                        </Typography>
                                        <Typography>
                                            Promote all students from <strong>Class {promoteData.fromClass}</strong> to <strong>Class {promoteData.toClass}</strong>?
                                        </Typography>
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
                                        (activeStep === 1 && !promoteData.toClass)
                                    }
                                >
                                    {activeStep === 2 ? 'Confirm Promote' : 'Next'}
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
                    User Credentials Created
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Please save these passwords! They will not be shown again.
                    </Alert>
                    
                    {uploadResult && uploadResult.created_users && (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Username</strong></TableCell>
                                        <TableCell><strong>Password</strong></TableCell>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Role</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {uploadResult.created_users.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell><code>{user.password}</code></TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {uploadResult && uploadResult.errors && uploadResult.errors.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="error" gutterBottom>
                                Errors ({uploadResult.errors.length}):
                            </Typography>
                            {uploadResult.errors.map((error, index) => (
                                <Alert severity="error" key={index} sx={{ mb: 1 }}>
                                    {error.username}: {error.error}
                                </Alert>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        startIcon={<Download />} 
                        onClick={downloadPasswordList}
                        variant="outlined"
                    >
                        Download CSV
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
