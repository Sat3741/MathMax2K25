import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/authUtils';
import {
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Box,
    Alert,
    MenuItem,
    Grid,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    FormControlLabel
} from '@mui/material';

const CreateAssignment = () => {
    const [classes, setClasses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignment_type: 'class', // 'class' or 'group'
        section_assigned: '',
        group_assigned: '',
        topic: 'addition',
        difficulty: 1,
        num_questions: 10,
        due_date: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
        fetchGroups();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/teacher/classes/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/teacher/groups/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const token = getAuthToken();
            // Prepare payload - convert empty strings to null for optional fields
            const payload = {
                ...formData,
                due_date: formData.due_date || null
            };
            
            await axios.post('http://localhost:8000/api/teacher/assignments/',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Assignment created successfully!');
            setTimeout(() => navigate('/teacher/dashboard'), 1500);
        } catch (err) {
            setError('Failed to create assignment');
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Create Assignment
            </Typography>

            <Paper sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Title"
                        name="title"
                        required
                        fullWidth
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <FormControl component="fieldset">
                        <FormLabel component="legend">Assign To</FormLabel>
                        <RadioGroup
                            row
                            name="assignment_type"
                            value={formData.assignment_type}
                            onChange={handleChange}
                        >
                            <FormControlLabel value="class" control={<Radio />} label="Class" />
                            <FormControlLabel value="group" control={<Radio />} label="Group" />
                        </RadioGroup>
                    </FormControl>

                    {formData.assignment_type === 'class' ? (
                        <TextField
                            select
                            label="Class Section"
                            name="section_assigned"
                            required={formData.assignment_type === 'class'}
                            fullWidth
                            value={formData.section_assigned}
                            onChange={handleChange}
                        >
                            <MenuItem value="">Select a class section</MenuItem>
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.id}>{cls.display_name || cls.name}</MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <TextField
                            select
                            label="Group"
                            name="group_assigned"
                            required={formData.assignment_type === 'group'}
                            fullWidth
                            value={formData.group_assigned}
                            onChange={handleChange}
                        >
                            <MenuItem value="">Select a group</MenuItem>
                            {groups.map((group) => (
                                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                            ))}
                        </TextField>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Topic"
                                name="topic"
                                fullWidth
                                value={formData.topic}
                                onChange={handleChange}
                            >
                                <MenuItem value="addition">Addition</MenuItem>
                                <MenuItem value="subtraction">Subtraction</MenuItem>
                                <MenuItem value="multiplication">Multiplication</MenuItem>
                                <MenuItem value="division">Division</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Difficulty"
                                name="difficulty"
                                fullWidth
                                value={formData.difficulty}
                                onChange={handleChange}
                            >
                                <MenuItem value="1">Easy</MenuItem>
                                <MenuItem value="2">Medium</MenuItem>
                                <MenuItem value="3">Hard</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    <TextField
                        label="Number of Questions"
                        name="num_questions"
                        type="number"
                        fullWidth
                        inputProps={{ min: 1, max: 50 }}
                        value={formData.num_questions}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Due Date (Optional)"
                        name="due_date"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.due_date}
                        onChange={handleChange}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        fullWidth
                        size="large"
                    >
                        Create Assignment
                    </Button>

                    {message && <Alert severity="success">{message}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateAssignment;
