import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
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
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const signup = async (userData) => {
        const response = await axios.post('http://localhost:8000/api/auth/create-user/', userData);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
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
