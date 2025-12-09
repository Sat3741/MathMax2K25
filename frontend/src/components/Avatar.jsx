import { Box } from '@mui/material';

const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const Avatar = ({ user, size = 40, sx = {} }) => {
    if (!user) return null;

    const name = user.first_name ? `${user.first_name} ${user.last_name}` : user.username;
    const initials = getInitials(name);
    const bgColor = stringToColor(user.username || 'default');

    // Support both number and responsive object for size
    const isResponsive = typeof size === 'object';
    
    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                bgcolor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: isResponsive 
                    ? { xs: size.xs * 0.4, sm: size.sm * 0.4, md: size.md * 0.4 }
                    : size * 0.4,
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '2px solid #fff',
                boxShadow: 1,
                ...sx
            }}
        >
            {initials}
        </Box>
    );
};

export default Avatar;
