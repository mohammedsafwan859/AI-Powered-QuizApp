import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.jsx'; // Make sure this is .jsx

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.9 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

function LoginPage() {
  // --- NEW: Get error and clearError from context ---
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    // --- NEW: Add cleanup function to clear errors when navigating away ---
    return () => {
        if (error) {
            clearError();
        }
    }
  }, [isAuthenticated, navigate, error, clearError]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    login(formData);
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="bg-gray-50 min-h-screen font-sans relative overflow-hidden flex items-center justify-center p-4"
    >
      <div className="absolute top-[-20rem] -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-20rem] -right-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-100 via-white to-pink-100 rounded-full opacity-50 blur-3xl -z-10" />
      
      <div className="w-full max-w-sm">
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg text-center">
            <Link to="/" className="text-2xl font-bold text-gray-800 mb-6 block">QuizMaster</Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            
            {/* --- NEW: Display error message if it exists --- */}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            
            <form onSubmit={onSubmit} className="space-y-4">
              <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required className="w-full px-4 py-3 bg-white/70 rounded-lg border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple text-lg" />
              <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required className="w-full px-4 py-3 bg-white/70 rounded-lg border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple text-lg" />
              <button type="submit" className="w-full bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg">
                Login
              </button>
            </form>
            <p className="mt-6 text-gray-600">
              Don't have an account? <Link to="/signup" className="font-bold text-brand-purple hover:underline">Sign Up</Link>
            </p>
        </div>
      </div>
    </motion.div>
  );
}

export default LoginPage;