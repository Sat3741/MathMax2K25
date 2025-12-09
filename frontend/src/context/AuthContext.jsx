import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken, clearAuthTokens } from '../utils/authUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in onto mount (check both storages)
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        const token = getAuthToken();
        
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await axios.post('http://localhost:8000/api/auth/login/', {
            username,
            password
        });

        const { tokens, user: userData } = response.data;
        // Main Login (Student/Teacher) -> Persistent LocalStorage
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const adminLogin = async (username, password) => {
        const response = await axios.post('http://localhost:8000/api/auth/admin/login/', {
            username,
            password
        });

        const { tokens, user: userData } = response.data;
        // Admin Login -> SessionStorage (Auto-logout on close)
        sessionStorage.setItem('accessToken', tokens.access);
        sessionStorage.setItem('refreshToken', tokens.refresh);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const signup = async (userData) => {
        const response = await axios.post('http://localhost:8000/api/auth/create-user/', userData);
        return response.data;
    };

    const logout = () => {
        clearAuthTokens();
        setUser(null);
    };

    const value = {
        user,
        login,
        adminLogin,
        signup,
        logout,
        loading,
        isAuthenticated: !!user,
        isTeacher: user?.is_teacher || false,
        isStudent: user?.is_student || false,
        isAdmin: user?.is_staff || false,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
