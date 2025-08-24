import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { motion } from 'framer-motion';

function AdminProctorPage() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const onGameUpdate = (gameData) => { setGameState(gameData); };
    const onNextQuestion = (questionData) => { setQuestion(questionData); };
    const onTimerUpdate = (timeLeft) => { setTimer(timeLeft); };
    const onGameEnd = (finalLeaderboard) => {
      navigate(`/results/${gameCode}`, { state: { leaderboard: finalLeaderboard } });
    };

    socket.on('game:updated', onGameUpdate);
    socket.on('game:next-question', onNextQuestion);
    socket.on('game:timer', onTimerUpdate);
    socket.on('game:ended', onGameEnd);
    socket.emit('game:get-state', gameCode);

    return () => {
      socket.off('game:updated', onGameUpdate);
      socket.off('game:next-question', onNextQuestion);
      socket.off('game:timer', onTimerUpdate);
      socket.off('game:ended', onGameEnd);
    };
  }, [gameCode, navigate]);

  const handleNextQuestion = () => {
    socket.emit('admin:next-question', gameCode);
  };

  const handleEndGame = () => {
    if (window.confirm("Are you sure you want to end the game for everyone?")) {
        socket.emit('admin:end-game', gameCode);
    }
  };

  if (!gameState || !question) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">Loading Proctor View...</div>;
  }
  
  const timePerQuestion = gameState.settings.timePerQuestion;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 min-h-screen font-sans relative overflow-hidden flex flex-col p-6">
      <div className="absolute top-[-10rem] -left-40 w-[30rem] h-[30rem] bg-gradient-to-br from-purple-200 to-pink-100 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-10rem] -right-40 w-[30rem] h-[30rem] bg-gradient-to-tr from-cyan-100 to-blue-200 rounded-full opacity-50 blur-3xl -z-10" />
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div className="bg-gradient-to-r from-brand-purple to-brand-violet h-2.5 rounded-full" initial={{ width: '100%' }} animate={{ width: `${(timer / timePerQuestion) * 100}%` }} transition={{ duration: 1, ease: 'linear' }} />
      </div>
      
      <header className="my-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Proctor Dashboard</h1>
        <p className="text-lg text-gray-500">Game Code: <span className="font-bold text-brand-purple tracking-widest">{gameCode}</span></p>
      </header>

      <div className="flex-grow grid md:grid-cols-3 gap-6">
        {/* Question & Controls Column */}
        <div className="md:col-span-1 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Current Question</h2>
          <p className="text-gray-500 text-sm">Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}</p>
          <div className="flex-grow mt-4">
            <p className="text-2xl font-bold text-gray-800">{question.text}</p>
            <p className="mt-4 text-lg font-bold text-green-600">Correct Answer: {question.options[question.correctIndex]}</p>
          </div>
          <div className="space-y-3">
            <button onClick={handleNextQuestion} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Skip to Next Question</button>
            <button onClick={handleEndGame} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">End Game Now</button>
          </div>
        </div>

        {/* Player Status Column */}
        <div className="md:col-span-2 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Player Status ({gameState.players.length} Playing)</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {gameState.players.map(player => (
              <div key={player.id} className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-white/50">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{player.avatar}</span>
                  <span className="font-medium text-gray-800">{player.name}</span>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-brand-purple">{player.score} pts</p>
                    <p className={`font-semibold text-sm ${player.hasAnswered ? 'text-brand-cyan' : 'text-yellow-500'}`}>
                        {player.hasAnswered ? 'Answered' : 'Thinking...'}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminProctorPage;