import { Box } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
