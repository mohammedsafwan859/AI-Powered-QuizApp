import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { socket } from '../socket';
import { motion } from 'framer-motion';

const avatars = ['🎯', '🚀', '🌟', '🤖', '👾', '🦊', '🐼', '😎'];

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.9 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function JoinGamePage() {
  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onGameUpdate = (game) => {
      navigate(`/lobby/${game.gameCode}`);
    };
    const onGameNotFound = (data) => { 
      setError(data.message);
      setIsJoining(false);
    };
    socket.on('game:updated', onGameUpdate);
    socket.on('error:game-not-found', onGameNotFound);
    return () => {
      socket.off('game:updated', onGameUpdate);
      socket.off('error:game-not-found', onGameNotFound);
    };
  }, [navigate]);

  const handleJoinGame = () => {
    setError(null);
    if (name.trim() === '' || gameCode.trim() === '') {
      setError('Please enter a display name and game code.');
      return;
    }
    setIsJoining(true);
    socket.emit('lobby:join', { playerName: name, gameCode: gameCode.toUpperCase(), avatar: selectedAvatar });
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
      {/* Background Gradients */}
      <div className="absolute top-[-20rem] -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-20rem] -right-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-100 via-white to-pink-100 rounded-full opacity-50 blur-3xl -z-10" />
      
      {/* Join Game Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg text-center">
            <Link to="/" className="text-2xl font-bold text-gray-800 mb-6 block">QuizMaster</Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join a Game</h1>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg my-4">{error}</p>}

            <div className="mb-6 mt-6">
              <p className="text-center text-gray-600 mb-2">Choose your avatar</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {avatars.map((avatar) => (
                  <button key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`text-3xl p-2 rounded-full transition-transform duration-200 ${selectedAvatar === avatar ? 'bg-brand-purple text-white scale-110' : 'bg-white/50 hover:bg-white/80'}`}>
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Display Name</label>
                <input type="text" placeholder="Enter your name" className="w-full px-4 py-3 bg-white/70 rounded-lg border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple text-lg text-center" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Game Code</label>
                <input type="text" placeholder="_ _ _ _" className="w-full text-center tracking-[1em] font-bold text-xl px-4 py-3 bg-white/70 rounded-lg border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple uppercase" value={gameCode} onChange={(e) => setGameCode(e.target.value)} maxLength="4" />
              </div>
              <button 
                className="w-full bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed" 
                onClick={handleJoinGame}
                disabled={isJoining}
              >
                 {isJoining ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  'Join'
                )}
              </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

export default JoinGamePage;