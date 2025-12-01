import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress
} from '@mui/material';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get('http://localhost:8000/api/teacher/students/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                My Students
            </Typography>

            {students.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Grade Level</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id} hover>
                                    <TableCell>{student.username}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.grade_level || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No students enrolled in your classes yet.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default StudentsList;
