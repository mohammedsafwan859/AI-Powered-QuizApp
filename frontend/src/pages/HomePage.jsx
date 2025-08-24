import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon, UsersIcon, PuzzleIcon } from '../assets/icons';
import { AuthContext } from '../context/AuthContext.jsx';

function HomePage() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const authLinks = (
    <div className="space-x-4 flex items-center">
      <span className="font-semibold text-gray-700">Hello, {user?.name}</span>
      <button onClick={logout} className="font-semibold text-white bg-brand-purple hover:bg-brand-violet py-2 px-5 rounded-full shadow-lg transition-transform transform hover:scale-105">
        Logout
      </button>
    </div>
  );

  const guestLinks = (
    <div className="space-x-4">
      <Link to="/login">
        <button className="font-semibold text-gray-600 hover:text-brand-purple">Login</button>
      </Link>
      <Link to="/signup">
        <button className="font-semibold text-white bg-brand-purple hover:bg-brand-violet py-2 px-5 rounded-full shadow-lg transition-transform transform hover:scale-105">
          Sign Up
        </button>
      </Link>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-50 min-h-screen font-sans relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute top-[-20rem] -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-20rem] -right-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-100 via-white to-pink-100 rounded-full opacity-50 blur-3xl -z-10" />
      
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">QuizMaster</div>
        <div className="hidden md:flex items-center space-x-6 text-gray-600 font-medium">
          <Link to="/" className="hover:text-brand-purple">Home</Link>
          <button onClick={() => setShowHowToPlay(true)} className="hover:text-brand-purple">How to Play</button>
        </div>
        {isAuthenticated ? authLinks : guestLinks}
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 text-center mt-24">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-800"
        >
          Challenge Your Mind
          <br />
          <span className="text-brand-purple">with Epic Quizzes</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg"
        >
          Join millions of players in the ultimate quiz experience. Test your knowledge, compete with friends, and climb the leaderboard!
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex justify-center space-x-4"
        >
          {isAuthenticated ? (
            <>
              <Link to="/create">
                <button className="font-bold text-white bg-gradient-to-r from-brand-purple to-brand-violet py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                  Start Quiz
                </button>
              </Link>
              <Link to="/join">
                <button className="font-bold text-gray-700 bg-white py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                  Join Game
                </button>
              </Link>
            </>
          ) : (
            <Link to="/login">
              <button className="font-bold text-white bg-gradient-to-r from-brand-purple to-brand-violet py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                Login to Play
              </button>
            </Link>
          )}
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-6 text-center mt-32">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl border border-white/30 shadow-lg"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BoltIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-800">AI-Powered Quizzes</h3>
            <p className="text-gray-500 mt-2">Generate unique questions on any topic imaginable.</p>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl border border-white/30 shadow-lg"
          >
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UsersIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Live Multiplayer</h3>
            <p className="text-gray-500 mt-2">Challenge friends and family in real-time.</p>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl border border-white/30 shadow-lg"
          >
            <div className="bg-gradient-to-r from-teal-400 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <PuzzleIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Endless Topics</h3>
            <p className="text-gray-500 mt-2">From movies to science, the possibilities are endless.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="container mx-auto text-center py-12 mt-24">
        <div className="text-gray-500">
            <p>&copy; {new Date().getFullYear()} QuizMaster. All Rights Reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
                <a href="#" className="hover:text-brand-purple">Privacy Policy</a>
                <a href="#" className="hover:text-brand-purple">Contact</a>
            </div>
        </div>
      </footer>
      
      {/* "How to Play" Modal */}
      <AnimatePresence>
        {showHowToPlay && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">How to Play</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>1. Start a Game:</strong> Click 'Start Quiz' to create a new game lobby. You'll get a unique 4-digit code.</p>
                <p><strong>2. Invite Friends:</strong> Share the game code with others so they can join your lobby.</p>
                <p><strong>3. Begin the Quiz:</strong> Once everyone is in, the host can start the game for all players!</p>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HomePage;