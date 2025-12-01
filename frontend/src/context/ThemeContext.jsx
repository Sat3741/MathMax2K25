import { createContext, useState, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'light' ? '#2563eb' : '#60a5fa',
                        light: '#60a5fa',
                        dark: '#1e40af',
                    },
                    secondary: {
                        main: mode === 'light' ? '#10b981' : '#34d399',
                        light: '#34d399',
                        dark: '#059669',
                    },
                    background: {
                        default: mode === 'light' ? '#f9fafb' : '#121212',
                        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
                    },
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: {
                        fontWeight: 700,
                    },
                    h2: {
                        fontWeight: 700,
                    },
                    h3: {
                        fontWeight: 600,
                    },
                    button: {
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                },
                shape: {
                    borderRadius: 8,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                padding: '10px 24px',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                boxShadow: mode === 'light'
                                    ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                                    : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -1px rgb(0 0 0 / 0.2)',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
