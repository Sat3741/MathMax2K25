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

import CreateAssignment from './pages/CreateAssignment';
import StudentsList from './pages/StudentsList';
import ClassManagement from './pages/admin/ClassManagement';
import UserManagement from './pages/admin/UserManagement';
import GroupManagement from './pages/admin/GroupManagement';
import BulkOperations from './pages/admin/BulkOperations';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import StudentAssignments from './pages/StudentAssignments';
import TeacherGroupManagement from './pages/TeacherGroupManagement';
import PracticeResults from './pages/PracticeResults';
import LevelInfo from './pages/LevelInfo';
import AdminRoute from './components/AdminRoute';

import MultiplayerLobby from './pages/MultiplayerLobby';
import BattleArena from './pages/BattleArena';
import { MultiplayerProvider } from './context/MultiplayerContext';

function App() {
    return (
        <ThemeProvider>
            <CssBaseline />
            <AuthProvider>
                <MultiplayerProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/practice" element={<Practice />} />
                                <Route path="/multiplayer" element={<MultiplayerLobby />} />
                                <Route path="/multiplayer/battle" element={<BattleArena />} />
                                <Route path="/practice/results" element={<PracticeResults />} />
                                <Route path="/level-info" element={<LevelInfo />} />
                                <Route path="/student/dashboard" element={<StudentDashboard />} />
                                <Route path="/student/assignments" element={<StudentAssignments />} />
                                <Route path="/profile" element={<Profile />} />
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

                                <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
                                <Route path="/teacher/students" element={<StudentsList />} />
                                <Route path="/teacher/groups" element={<TeacherGroupManagement />} />
                            </Routes>
                        </Layout>
                    </Router>
                </MultiplayerProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
