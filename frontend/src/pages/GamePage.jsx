import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

function GamePage() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    // ... (All socket event listeners are unchanged)
    const onNextQuestion = (questionData) => {
      setQuestion(questionData);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setResults(null);
      setTimer(gameState?.settings?.timePerQuestion || 15);
    };
    const onShowResults = (resultsData) => {
      setResults(resultsData);
      setHasAnswered(true);
    };
    const onTimerUpdate = (timeLeft) => {
      setTimer(timeLeft);
    };
    const onGameUpdate = (gameData) => {
      setGameState(gameData);
    };
    const onGameEnd = (finalLeaderboard) => {
      navigate(`/results/${gameCode}`, { state: { leaderboard: finalLeaderboard } });
    };

    socket.on('game:next-question', onNextQuestion);
    socket.on('game:updated', onGameUpdate);
    socket.on('game:show-results', onShowResults);
    socket.on('game:timer', onTimerUpdate);
    socket.on('game:ended', onGameEnd);
    socket.emit('game:get-state', gameCode);

    return () => {
      socket.off('game:next-question', onNextQuestion);
      socket.off('game:updated', onGameUpdate);
      socket.off('game:show-results', onShowResults);
      socket.off('game:timer', onTimerUpdate);
      socket.off('game:ended', onGameEnd);
    };
  }, [gameCode, navigate, gameState?.settings?.timePerQuestion]);

  const handleAnswerSubmit = (selectedIndex) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(selectedIndex);
    socket.emit('game:submit-answer', { gameCode, answerIndex: selectedIndex });
  };

  if (!gameState || !question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800 font-sans">
        Waiting for game to start...
      </div>
    );
  }

  const timePerQuestion = gameState.settings.timePerQuestion;
  const currentPlayer = gameState.players.find(p => p.id === socket.id);
  const playerScore = currentPlayer ? currentPlayer.score : 0;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="bg-gray-50 min-h-screen font-sans relative overflow-hidden flex flex-col p-4">
      {/* Background Gradients */}
      <div className="absolute top-[-10rem] -left-40 w-[30rem] h-[30rem] bg-gradient-to-br from-purple-200 to-pink-100 rounded-full opacity-60 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-[-10rem] -right-40 w-[30rem] h-[30rem] bg-gradient-to-tr from-cyan-100 to-blue-200 rounded-full opacity-50 blur-3xl -z-10 animate-pulse" />
      
      {/* --- NEW Timer Progress Bar --- */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <motion.div 
          className="bg-gradient-to-r from-brand-purple to-brand-violet h-2.5 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: `${(timer / timePerQuestion) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      <div className="w-full flex justify-between items-center mb-6 px-4">
        <div>
          <p className="font-bold text-xl text-gray-700">Question {gameState.currentQuestionIndex + 1}<span className="font-medium text-gray-400">/{gameState.questions.length}</span></p>
        </div>
        <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-3 rounded-lg text-center shadow-md">
          <p className="font-bold text-xl text-brand-purple">{playerScore}</p>
          <p className="text-xs text-gray-500">SCORE</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-lg text-center mb-6">
            <p className="text-md text-gray-500">{question.category}</p>
            <h2 className="text-3xl mt-2 font-bold text-gray-800">{question.text}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => {
              let buttonClass = 'bg-white/80 hover:bg-white border-white/50 text-gray-800';
              if (results) {
                if (index === results.correctIndex) buttonClass = 'bg-green-500 border-green-600 text-white';
                else if (index === selectedAnswer) buttonClass = 'bg-red-500 border-red-600 text-white';
                else buttonClass = 'bg-gray-300/50 border-gray-400/50 text-gray-500 opacity-60';
              } else if (hasAnswered) {
                buttonClass = 'bg-gray-400/80 border-gray-500/80 text-white';
                if (index === selectedAnswer) buttonClass = 'bg-yellow-400 border-yellow-500 text-black';
              }
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSubmit(index)}
                  disabled={hasAnswered}
                  className={`${buttonClass} font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-300 shadow-md border transform hover:scale-105 disabled:scale-100`}
                >
                  {option}
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default GamePage;