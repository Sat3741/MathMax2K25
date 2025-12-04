import { useState } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, Grid, Button, 
    Stepper, Step, StepLabel, FormControl, InputLabel, Select, MenuItem,
    Alert, LinearProgress
} from '@mui/material';
import { CloudUpload, School, CheckCircle } from '@mui/icons-material';

const BulkOperations = () => {
    // Bulk Upload State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Bulk Promote State
    const [activeStep, setActiveStep] = useState(0);
    const [promoteData, setPromoteData] = useState({
        fromClass: '',
        toClass: ''
    });

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
        setUploadSuccess(false);
    };

    const handleUpload = () => {
        if (uploadFile) {
            setUploading(true);
            // Mock upload delay
            setTimeout(() => {
                setUploading(false);
                setUploadSuccess(true);
                setUploadFile(null);
            }, 2000);
        }
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
                                Upload multiple users via Excel/CSV template.
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Button variant="outlined" component="label">
                                    Choose File
                                    <input type="file" hidden accept=".csv,.xlsx" onChange={handleFileChange} />
                                </Button>
                                {uploadFile && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Selected: {uploadFile.name}
                                    </Typography>
                                )}
                            </Box>

                            {uploading && <LinearProgress sx={{ mb: 2 }} />}
                            
                            {uploadSuccess && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    File uploaded and processed successfully!
                                </Alert>
                            )}

                            <Button 
                                variant="contained" 
                                disabled={!uploadFile || uploading}
                                onClick={handleUpload}
                            >
                                {uploading ? 'Uploading...' : 'Upload Users'}
                            </Button>
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
        </Container>
    );
};

export default BulkOperations;
