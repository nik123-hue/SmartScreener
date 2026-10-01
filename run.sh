#!/usr/bin/env bash

# SmartScreener Concurrent Dev Server Startup Script

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
AMBER='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${PURPLE}====================================================${NC}"
echo -e "${PURPLE}          SMARTSCREENER STARTUP LAUNCHER            ${NC}"
echo -e "${PURPLE}====================================================${NC}"

# Check if Ollama is running
echo -e "${BLUE}[1/3] Checking local AI backend status...${NC}"
if curl -s -f http://localhost:11434/ > /dev/null; then
    echo -e "${GREEN}✓ Ollama LLM is running locally.${NC}"
else
    echo -e "${AMBER}⚠ Ollama is not detected at http://localhost:11434/."
    echo -e "  The application will automatically start in Local NLP Fallback mode."
    echo -e "  To use the full LLM extraction capability, run: 'ollama serve' in another terminal.${NC}"
fi

# Trap exits to kill background servers
trap "kill 0" EXIT

# Start Backend Server
echo -e "${BLUE}[2/3] Starting FastAPI Backend on port 8000...${NC}"
cd backend
source venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait 2 seconds for backend to initialize
sleep 2
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ FastAPI Backend initialized successfully.${NC}"
else
    echo -e "\033[0;31m✗ FastAPI Backend failed to start. Check backend/backend.log for details.\033[0m"
    exit 1
fi

# Start Frontend Next.js Dev Server
echo -e "${BLUE}[3/3] Starting Next.js Dev Server on port 3000...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}  SmartScreener is running!                         ${NC}"
echo -e "${GREEN}  - Web Interface:  http://localhost:3000            ${NC}"
echo -e "${GREEN}  - API Swagger:    http://localhost:8000/docs        ${NC}"
echo -e "${GREEN}  Press [Ctrl+C] to stop all servers.               ${NC}"
echo -e "${GREEN}====================================================${NC}"

# Keep script running to forward logs or wait for exit
wait
