import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateClass from './pages/CreateClass';
import CreateAssignment from './pages/CreateAssignment';
import StudentsList from './pages/StudentsList';

function App() {
    return (
        <ThemeProvider>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/practice" element={<Practice />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/admin" element={<AdminLogin />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                            <Route path="/teacher/classes/create" element={<CreateClass />} />
                            <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
                            <Route path="/teacher/students" element={<StudentsList />} />
                        </Routes>
                    </Layout>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
