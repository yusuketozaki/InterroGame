# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InterroGame (犯人を導けワトソン！) is a web-based detective game where players interrogate suspects to identify the culprit in murder cases. The game uses AI (LLM) to generate realistic suspect responses based on their character profiles and guilt status.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + React Router
- **Backend**: Python + FastAPI + Ollama integration
- **API Communication**: REST API with proxy configuration
- **AI Integration**: Ollama with qwen3:4b model for suspect responses

## Development Commands

### Frontend (React)
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:5173)
npm run build           # Build for production (runs TypeScript compiler first)
npm run lint            # Run ESLint
npm run preview         # Preview production build
```

### Backend (FastAPI)
```bash
cd backend
uv sync                 # Install dependencies with uv
uvicorn app.main:app --reload --port 8000  # Start development server
ruff check              # Run linting
ruff format             # Format code
mypy .                  # Type checking
```

### Pre-commit hooks
```bash
pre-commit install      # Install hooks
pre-commit run --all-files  # Run all hooks manually
```

## Key System Components

### Backend Architecture (backend/app/main.py)
- Single FastAPI endpoint: `/v1/api/chat`
- Ollama integration for AI-powered suspect responses
- Character-based system prompts for each suspect
- Structured message handling for conversation context

### Frontend Architecture
- **Routing**: React Router with pages for Home, Game, Result, Profile, Admin
- **Game Logic**: Centralized in `GamePage.tsx` with local state management
- **API Client**: `utils/apiClient.ts` handles backend communication and prompt generation
- **Data Layer**: `data/suspects.ts` contains suspect profiles and scenarios
- **Storage**: `utils/gameStorage.ts` for game state persistence

### Game Flow Architecture
1. Scenario selection from predefined murder cases
2. Player asks questions to 3 suspects (with question limits)
3. AI generates responses based on suspect personality and guilt status
4. Player analyzes testimonies to identify contradictions
5. Final suspect selection and results display

### AI Integration Pattern
- Each suspect has a detailed system prompt defining their personality, background, and guilt status
- Conversation history is maintained and passed to AI for context-aware responses
- True criminal has specific instructions to be evasive and create contradictions
- Innocent suspects have cooperative but potentially misleading responses

## Vite Configuration
- Proxy setup: `/v1/api/*` routes to `http://localhost:8000`
- React plugin enabled
- Development server runs on port 5173

## Code Quality Tools
- **ESLint**: Frontend linting with React and TypeScript rules
- **Ruff**: Backend Python linting and formatting
- **MyPy**: Python type checking with strict mode
- **Pre-commit**: Automated formatting and checks on commit

## Development Guidelines
- Maintain clear separation between frontend and backend responsibilities
- Update README.md with API changes and specifications
- Follow existing patterns for new game scenarios in `suspects.ts`
- Use TypeScript interfaces for type safety across API boundaries
- Respect the existing file structure and naming conventions