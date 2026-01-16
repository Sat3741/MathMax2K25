#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo -e "${GREEN}🚀 Starting MathMax Development Servers...${NC}\n"

# Function to check if a port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
    return $?
}

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $POSTGRES_PID $DJANGO_PID $NPM_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# 1. Start PostgreSQL
echo -e "${GREEN}[1/3] Starting PostgreSQL...${NC}"

# Check if PostgreSQL is already running
if check_port 5432; then
    echo -e "${YELLOW}   PostgreSQL is already running on port 5432${NC}"
else
    # Try to start PostgreSQL using brew services (macOS)
    if command -v brew &> /dev/null; then
        echo -e "   Attempting to start PostgreSQL via Homebrew..."
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
        
        # Wait a moment for PostgreSQL to start
        sleep 2
        
        if check_port 5432; then
            echo -e "${GREEN}   ✓ PostgreSQL started successfully${NC}"
        else
            echo -e "${RED}   ✗ Failed to start PostgreSQL. Please start it manually.${NC}"
            echo -e "${YELLOW}   You can try: brew services start postgresql@14${NC}"
        fi
    else
        echo -e "${YELLOW}   Homebrew not found. Please ensure PostgreSQL is running.${NC}"
        echo -e "${YELLOW}   You can start it manually or install via Homebrew.${NC}"
    fi
fi

# 2. Start Django Backend Server
echo -e "\n${GREEN}[2/3] Starting Django Backend Server...${NC}"

if check_port 8000; then
    echo -e "${YELLOW}   Port 8000 is already in use. Skipping Django server.${NC}"
else
    cd "$BACKEND_DIR"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${RED}   ✗ Virtual environment not found at $BACKEND_DIR/venv${NC}"
        echo -e "${YELLOW}   Please create it first: python -m venv venv${NC}"
    else
        # Activate virtual environment and start Django
        source venv/bin/activate
        
        # Check if Django is installed
        if ! python -c "import django" 2>/dev/null; then
            echo -e "${RED}   ✗ Django not found. Please install dependencies: pip install -r requirements.txt${NC}"
        else
            echo -e "   Starting Django server on http://127.0.0.1:8000"
            python manage.py runserver > /tmp/django_server.log 2>&1 &
            DJANGO_PID=$!
            sleep 2
            
            if check_port 8000; then
                echo -e "${GREEN}   ✓ Django server started (PID: $DJANGO_PID)${NC}"
            else
                echo -e "${RED}   ✗ Failed to start Django server. Check /tmp/django_server.log${NC}"
            fi
        fi
    fi
fi

# 3. Start Frontend (npm/vite)
echo -e "\n${GREEN}[3/3] Starting Frontend Development Server...${NC}"

if check_port 5173; then
    echo -e "${YELLOW}   Port 5173 is already in use. Skipping frontend server.${NC}"
else
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   node_modules not found. Installing dependencies...${NC}"
        npm install
    fi
    
    echo -e "   Starting Vite dev server on http://localhost:5173"
    npm run dev > /tmp/npm_server.log 2>&1 &
    NPM_PID=$!
    sleep 3
    
    if check_port 5173; then
        echo -e "${GREEN}   ✓ Frontend server started (PID: $NPM_PID)${NC}"
    else
        echo -e "${RED}   ✗ Failed to start frontend server. Check /tmp/npm_server.log${NC}"
    fi
fi

# Summary
echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ All servers are starting!${NC}\n"
echo -e "   Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:   ${GREEN}http://127.0.0.1:8000${NC}"
echo -e "   PostgreSQL: ${GREEN}localhost:5432${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"

# Keep script running
wait


