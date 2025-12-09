import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/authUtils';
import API_BASE_URL from '../apiConfig';
import {
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Box,
    Alert
} from '@mui/material';

const CreateClass = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const token = getAuthToken();
            await axios.post(`${API_BASE_URL}/teacher/classes/`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Class created successfully!');
            setTimeout(() => navigate('/teacher/dashboard'), 1500);
        } catch (err) {
            setError('Failed to create class');
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Create New Class
            </Typography>

            <Paper sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Class Name"
                        required
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Grade 5 Math"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                    >
                        Create Class
                    </Button>

                    {message && <Alert severity="success">{message}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateClass;
