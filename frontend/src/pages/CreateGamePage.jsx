import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';

const avatars = ['🎯', '🚀', '🌟', '🤖', '👾', '🦊', '🐼', '😎'];
const questionCountOptions = [5, 10, 15, 20];

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.9 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

// A reusable custom dropdown component
const CustomDropdown = ({ label, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full mt-1 px-3 py-2 bg-white/70 rounded-lg border border-white/50 text-left flex justify-between items-center">
        <span>{selected?.name || selected}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 w-full mt-1 bg-white/80 backdrop-blur-lg rounded-lg shadow-xl border border-white/30 max-h-48 overflow-y-auto">
            {options.map(option => (
              <li key={option.id || option} onClick={() => handleSelect(option)} className="px-4 py-2 hover:bg-purple-100 cursor-pointer rounded-lg">
                {option.name || option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

function CreateGamePage() {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(questionCountOptions[0]);
  const [isCreating, setIsCreating] = useState(false); // --- NEW: State for loading feedback
  const navigate = useNavigate();

  useEffect(() => {
    const onGameUpdate = (game) => {
      navigate(`/lobby/${game.gameCode}`);
    };
    socket.on('game:updated', onGameUpdate);
    return () => {
      socket.off('game:updated', onGameUpdate);
    };
  }, [navigate]);

  const handleCreateGame = () => {
    if (name.trim() !== '' && topic.trim() !== '') {
      setIsCreating(true); // --- NEW: Set loading state to true
      const settings = {
        questionCount: parseInt(questionCount, 10),
        topic: topic,
      };
      socket.emit('lobby:create', { hostName: name, avatar: selectedAvatar, settings });
    } else {
      alert('Please enter a display name and a topic.');
    }
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="bg-gray-50 min-h-screen font-sans relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-[-20rem] -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-20rem] -right-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-100 via-white to-pink-100 rounded-full opacity-50 blur-3xl -z-10" />
      <div className="w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg text-center">
          <Link to="/" className="text-2xl font-bold text-gray-800 mb-6 block">QuizMaster</Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Game</h1>
          <div className="mb-6">
            <p className="text-center text-gray-600 mb-2">Choose your avatar</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {avatars.map((avatar) => (
                <button key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`text-3xl p-2 rounded-full transition-transform duration-200 ${selectedAvatar === avatar ? 'bg-brand-purple text-white scale-110' : 'bg-white/50 hover:bg-white/80'}`}>
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 text-left mb-1">Display Name</label>
              <input type="text" placeholder="Enter your display name" className="w-full px-4 py-3 bg-white/70 rounded-lg border border-white/50 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-purple" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
              <CustomDropdown label="Questions" options={questionCountOptions} selected={questionCount} onSelect={setQuestionCount} />
              <div>
                <label className="block text-sm font-medium text-gray-600">Topic</label>
                <input
                  type="text"
                  placeholder="e.g., Roman History"
                  className="w-full mt-1 px-3 py-2 bg-white/70 rounded-lg border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>
            {/* --- NEW: Updated Button with dynamic content and disabled state --- */}
            <button 
              className="w-full bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={handleCreateGame}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Game'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CreateGamePage;