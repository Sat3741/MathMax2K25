import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { WS_BASE_URL } from '../apiConfig';

const MultiplayerContext = createContext(null);

export const MultiplayerProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState({
        roomCode: null,
        players: [],
        gameActive: false,
        gameSettings: null, // Store settings
        timer: 0,
        messages: []
    });
    const socketRef = useRef(null);
    // const { user } = useAuth(); // Need to send token or username

    const connect = useCallback((roomCode, username) => {
        if (socketRef.current) {
            socketRef.current.close();
        }

        // Use ws:// for local, wss:// for production
        // In channels, path is ws/game/<room_code>/
        const wsUrl = `${WS_BASE_URL}/game/${roomCode}/`;
        console.log("Connecting to", wsUrl);
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket Connected");
            setGameState(prev => ({ ...prev, roomCode }));
            // Send join message
            ws.send(JSON.stringify({ 
                type: 'join_game', 
                username: username 
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received:", data);
            
            switch(data.type) {
                case 'player_joined':
                    setGameState(prev => {
                        const newMsg = data.message;
                        // Check if player already exists
                        const exists = prev.players.find(p => p.username === data.username);
                        let newPlayers = [...prev.players];
                        if (!exists) {
                            newPlayers.push({ username: data.username, score: 0 });
                        }
                        return {
                            ...prev,
                            messages: [...prev.messages, newMsg],
                            players: newPlayers
                        };
                    });
                    break;
                case 'score_update':
                    setGameState(prev => {
                        const newPlayers = prev.players.map(p => 
                            p.username === data.username ? { ...p, score: data.score } : p
                        );
                        // If player not found (joined before us?), add them
                        if (!newPlayers.find(p => p.username === data.username)) {
                            newPlayers.push({ username: data.username, score: data.score });
                        }
                        return { ...prev, players: newPlayers };
                    });
                    break;
                case 'game_started':
                    setGameState(prev => ({ 
                        ...prev, 
                        gameActive: true,
                        gameSettings: data.settings 
                    }));
                    break;
                default:
                    break;
            }
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
            setSocket(null);
        };

        socketRef.current = ws;
        setSocket(ws);

    }, []);

    const sendScore = useCallback((score, username) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'score_update',
                score: score,
                username: username
            }));
        }
    }, []);

    const startGame = useCallback((settings) => {
         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'start_game',
                settings: settings
            }));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
        }
        setSocket(null);
        setGameState({
            roomCode: null,
            players: [],
            gameActive: false,
            gameSettings: null,
            timer: 0,
            messages: []
        });
    }, []);

    return (
        <MultiplayerContext.Provider value={{ connect, disconnect, sendScore, startGame, gameState }}>
            {children}
        </MultiplayerContext.Provider>
    );
};

export const useMultiplayer = () => {
    const context = useContext(MultiplayerContext);
    if (!context) {
        throw new Error("useMultiplayer must be used within a MultiplayerProvider");
    }
    return context;
};

export default MultiplayerContext;
