import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.9 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const leaderboard = location.state?.leaderboard || [];

  const handlePlayAgain = () => {
    navigate('/');
  };

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="bg-gray-50 min-h-screen font-sans relative overflow-hidden flex flex-col items-center justify-center p-4">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
      <div className="absolute top-[-20rem] -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 rounded-full opacity-60 blur-3xl -z-10" />
      <div className="absolute bottom-[-20rem] -right-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-100 via-white to-pink-100 rounded-full opacity-50 blur-3xl -z-10" />
      
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Final Results</h1>
        
        {/* Podium */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }} className="flex items-end justify-center w-full mt-8 gap-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="text-center w-1/3">
              <div className="bg-white/60 backdrop-blur-lg p-4 rounded-t-2xl border-b-4 border-gray-400">
                <p className="text-3xl">{top3[1].avatar}</p>
                <p className="text-xl font-bold truncate text-gray-700">{top3[1].name}</p>
                <p className="text-lg font-semibold text-brand-purple">{top3[1].score} pts</p>
              </div>
              <div className="bg-gray-400 h-24 flex items-center justify-center text-4xl font-extrabold rounded-b-lg">2</div>
            </div>
          )}
          {/* 1st Place */}
          {top3[0] && (
            <div className="text-center w-1/3">
              <div className="bg-white/60 backdrop-blur-lg p-4 rounded-t-2xl border-b-4 border-yellow-400">
                <p className="text-4xl">{top3[0].avatar}</p>
                <p className="text-2xl font-bold truncate text-gray-800">{top3[0].name}</p>
                <p className="text-xl font-semibold text-brand-purple">{top3[0].score} pts</p>
              </div>
              <div className="bg-yellow-400 h-32 flex items-center justify-center text-5xl font-extrabold rounded-b-lg">1</div>
            </div>
          )}
          {/* 3rd Place */}
          {top3[2] && (
            <div className="text-center w-1/3">
               <div className="bg-white/60 backdrop-blur-lg p-4 rounded-t-2xl border-b-4 border-orange-500">
                <p className="text-2xl">{top3[2].avatar}</p>
                <p className="text-lg font-bold truncate text-gray-600">{top3[2].name}</p>
                <p className="text-md font-semibold text-brand-purple">{top3[2].score} pts</p>
              </div>
              <div className="bg-orange-500 h-20 flex items-center justify-center text-3xl font-extrabold rounded-b-lg">3</div>
            </div>
          )}
        </motion.div>

        {/* Other Players List */}
        {others.length > 0 && (
          <div className="mt-12 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-700 mb-2">The Rest of the Players</h2>
            <div className="bg-white/60 backdrop-blur-lg p-4 rounded-2xl border border-white/30 space-y-2">
              {others.map((player, index) => (
                <div key={player.id} className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-500 mr-3">{index + 4}.</span>
                    <span className="text-xl mr-2">{player.avatar}</span>
                    <span className="font-medium text-gray-800">{player.name}</span>
                  </div>
                  <span className="font-bold text-brand-purple">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button onClick={handlePlayAgain} className="mt-12 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 text-xl">
          Play Again
        </button>
      </div>
    </motion.div>
  );
}

export default ResultsPage;