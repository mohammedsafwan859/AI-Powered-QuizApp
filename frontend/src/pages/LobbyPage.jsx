import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.9 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

function LobbyPage() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onKicked = () => {
        alert("You have been removed from the game by the host.");
        navigate('/');
    };
    socket.on('player:kicked', onKicked);
    return () => {
        socket.off('player:kicked', onKicked);
    };
  }, [navigate]);

  const handleStartGame = () => {
    setIsLoading(true);
    socket.emit('game:start', gameCode);
  };

  const handleKickPlayer = (playerId) => {
    if (window.confirm("Are you sure you want to remove this player?")) {
        socket.emit('admin:kick-player', { gameCode, playerId });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const onGameUpdate = (gameState) => { setLobby(gameState); };
    const onNextQuestion = () => {
      setLobby(currentLobbyState => {
        if (!currentLobbyState) return null;
        const isUserTheHost = socket.id === currentLobbyState.host?.id;
        if (isUserTheHost) {
          navigate(`/proctor/${gameCode}`);
        } else {
          navigate(`/game/${gameCode}`);
        }
        return currentLobbyState;
      });
    };
    socket.on('game:updated', onGameUpdate);
    socket.on('game:next-question', onNextQuestion);
    socket.emit('game:get-state', gameCode);
    return () => {
      socket.off('game:updated', onGameUpdate);
      socket.off('game:next-question', onNextQuestion);
    };
  }, [gameCode, navigate]);

  if (!lobby) {
    return (
      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800 font-sans">
        Loading Lobby...
      </motion.div>
    );
  }

  const isHost = socket.id === lobby.host?.id;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="bg-gray-50 min-h-screen font-sans relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-[-20rem] -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-20rem] -right-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-100 via-white to-pink-100 rounded-full opacity-50 blur-3xl -z-10" />
      
      {isLoading ? (
        <div className="w-full max-w-lg text-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg"
            >
                <svg className="w-16 h-16 text-brand-purple animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.496-2.496L12.75 18l1.177-.398a3.375 3.375 0 002.496-2.496L16.5 14.25l.398 1.177a3.375 3.375 0 002.496 2.496l1.177.398-1.177.398a3.375 3.375 0 00-2.496 2.496z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">AI is Generating Your Quiz...</h2>
                <p className="text-gray-600 mt-2">
                    Crafting <span className="font-bold text-brand-purple">{lobby.settings.questionCount}</span> questions about <span className="font-bold text-brand-purple">"{lobby.settings.topic}"</span>.
                </p>
                <p className="text-sm text-gray-400 mt-4">This may take a few moments.</p>
            </motion.div>
        </div>
      ) : (
        <div className="w-full max-w-lg">
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg text-center">
                <h1 className="text-3xl font-bold text-gray-800">Game Lobby</h1>
                <p className="text-gray-600 mt-2">Share the code with players to have them join!</p>
                
                {/* --- THIS SECTION IS NOW RESTORED --- */}
                <div className="my-6">
                    <button onClick={handleCopyCode} className="bg-white/70 border border-white/50 p-4 rounded-lg text-4xl font-extrabold tracking-widest text-brand-purple transition-transform transform hover:scale-105">
                    {copied ? 'Copied!' : lobby.gameCode}
                    </button>
                </div>

                <div className="text-left bg-white/50 p-4 rounded-lg">
                    {lobby.host && (
                      <div className="mb-4 p-3 rounded-md bg-purple-100 flex items-center justify-between">
                          <div className="flex items-center">
                          <span className="text-2xl mr-3">{lobby.host.avatar}</span>
                          <span className="font-semibold text-brand-purple">{lobby.host.name}</span>
                          </div>
                          <span className="text-xs font-bold text-brand-purple bg-white px-2 py-1 rounded-full">HOST</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Players ({lobby.players.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lobby.players.length > 0 ? (
                        lobby.players.map((player) => (
                          <div key={player.id} className="bg-white/80 p-3 rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">{player.avatar}</span>
                                <span className="font-medium text-gray-800">{player.name}</span>
                            </div>
                            {isHost && player.id !== lobby.host.id && (
                                <button onClick={() => handleKickPlayer(player.id)} className="text-red-500 hover:text-red-700 font-bold text-xl px-2">&times;</button>
                            )}
                          </div>
                        ))
                    ) : (
                        <p className="text-gray-500 p-3">Waiting for players...</p>
                    )}
                    </div>
                </div>
                
                {isHost && (
                    <div className="mt-6">
                    <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg">
                        Start Game
                    </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </motion.div>
  );
}

export default LobbyPage;