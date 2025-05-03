# Dice Chess Game

A tactical board game combining elements of chess and dice mechanics, built with React, Redux, and Express.

## Project Overview

This project consists of two main components:
- **Frontend**: React application with Redux for state management
- **Backend**: Express server for API endpoints

## Features

- Interactive game board with dice-based chess units
- Custom map editor for creating and saving board layouts
- Save/load system with localStorage persistence
- Multiple player support
- Tactical gameplay with move validation

## Project Structure

```
dice-chess-game/
├── board-game/        # Frontend React application
├── server/            # Backend Express server
├── start-dev.bat      # Script to start development environment
├── README.md
```

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

## Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
cd board-game
npm install
```
[Run: Install frontend dependencies](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20board-game%20%26%26%20npm%20install%22%7D)

```bash
# Install backend dependencies
cd ../server
npm install
```
[Run: Install backend dependencies](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20server%20%26%26%20npm%20install%22%7D)

## Running the Application

### Option 1: Using the start-dev script

The easiest way to start the development environment is by running the `start-dev.bat` script:

```bash
# From the project root
./start-dev.bat
```
[Run: Start dev environment](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22.%5Cstart-dev.bat%22%7D)

This will:
- Start the backend server on http://localhost:3001
- Start the frontend on http://localhost:3000

### Option 2: Manual startup

If you prefer to start the applications manually:

```bash
# Start the backend
cd server
npm start
```
[Run: Start backend](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20server%20%26%26%20npm%20start%22%7D)

```bash
# Start the frontend (in a separate terminal)
cd board-game
npm start
```
[Run: Start frontend](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20board-game%20%26%26%20npm%20start%22%7D)

## Game Features

### Map Editor

The game includes a custom map editor that allows you to:
- Create custom board layouts
- Place any unit on any position for any player
- Save layouts with custom names
- Load existing maps for editing

### Save/Load System

The game includes a persistence system that allows you to:
- Save game states to localStorage
- Load saved games
- Create and use custom map layouts
- Automatically resume recent games

## Development

### Frontend

The frontend is built with:
- React 19
- Redux for state management
- React Router for navigation

### Backend

The backend server is built with:
- Express.js
- CORS support
- Body-parser for request handling

## Building for Production

To create a production build of the application:

```bash
# Build the frontend
cd board-game
npm run build
```
[Run: Build frontend](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20board-game%20%26%26%20npm%20run%20build%22%7D)

```bash
# The server can be started in production mode
cd ../server
npm start
```
[Run: Start server in production](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20server%20%26%26%20npm%20start%22%7D)

## Quick Commands

Here are some quick command links to help you navigate the project:

[Open Frontend Directory](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20board-game%22%7D)

[Open Backend Directory](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20server%22%7D)

[Start Development Environment](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22.%5Cstart-dev.bat%22%7D)

[Install All Dependencies](command:workbench.action.terminal.sendSequence?%7B%22text%22:%22cd%20board-game%20%26%26%20npm%20install%20%26%26%20cd%20../server%20%26%26%20npm%20install%22%7D)
