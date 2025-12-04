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
import ClassManagement from './pages/admin/ClassManagement';
import UserManagement from './pages/admin/UserManagement';
import GroupManagement from './pages/admin/GroupManagement';
import BulkOperations from './pages/admin/BulkOperations';
import AdminRoute from './components/AdminRoute';

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
                            <Route element={<AdminRoute />}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/classes" element={<ClassManagement />} />
                                <Route path="/admin/users" element={<UserManagement />} />
                                <Route path="/admin/groups" element={<GroupManagement />} />
                                <Route path="/admin/bulk" element={<BulkOperations />} />
                            </Route>
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
