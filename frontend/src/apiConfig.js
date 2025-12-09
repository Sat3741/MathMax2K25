// Dynamic configuration for API and WebSocket URLs
// This allows the app to work on localhost and on local network (mobile testing) automatically

const getBaseUrl = () => {
    const { hostname } = window.location;
    return `http://${hostname}:8000`;
};

const getWsUrl = () => {
    const { hostname } = window.location;
    return `ws://${hostname}:8000`;
};

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const WS_BASE_URL = `${getWsUrl()}/ws`;

export default API_BASE_URL;
