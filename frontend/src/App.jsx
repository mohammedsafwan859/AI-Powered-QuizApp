import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import CreateGamePage from './pages/CreateGamePage';
import JoinGamePage from './pages/JoinGamePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
import AdminProctorPage from './pages/AdminProctorPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // 1. Import ProtectedRoute

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join" element={<JoinGamePage />} />
        <Route path="/lobby/:gameCode" element={<LobbyPage />} />
        <Route path="/game/:gameCode" element={<GamePage />} />
        <Route path="/results/:gameCode" element={<ResultsPage />} />

        {/* Protected Routes */}
        {/* 2. Wrap the CreateGamePage route */}
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <CreateGamePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/proctor/:gameCode" 
          element={
            <ProtectedRoute>
              <AdminProctorPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;