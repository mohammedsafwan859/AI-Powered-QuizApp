require('dotenv').config(); // MUST be the first line
const cors = require('cors');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Now this line will have access to the loaded API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Add these lines after the io definition
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/api/users', require('./routes/users')); // Use the new user routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 4000;
const games = {};


const fetchAIQuestions = async (topic, amount = 10) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Generate ${amount} multiple-choice trivia questions about "${topic}".
      The questions should be in a JSON array format. Do not include any text outside of the JSON array.
      Each object in the array must have these exact keys: "category", "difficulty", "text", "options", and "correctIndex".
      - "category" should be the topic: "${topic}".
      - "difficulty" can be "Easy", "Medium", or "Hard".
      - "text" is the question itself.
      - "options" is an array of 4 strings, with one being the correct answer.
      - "correctIndex" is the index (0-3) of the correct answer within the "options" array.

      Example format:
      [
        {
          "category": "Science",
          "difficulty": "Easy",
          "text": "What is the chemical symbol for water?",
          "options": ["O2", "H2O", "CO2", "NaCl"],
          "correctIndex": 1
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().replace(/```json|```/g, '').trim();

    // Parse the JSON string into an array of objects
    const questions = JSON.parse(jsonText);

    // Basic validation to ensure we got an array
    if (!Array.isArray(questions)) {
      throw new Error("AI did not return a valid JSON array.");
    }

    return questions;

  } catch (error) {
    console.error("Failed to fetch questions from AI:", error);
    // Return an empty array so the game doesn't crash
    return [];
  }
};

const generateGameCode = () => {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 6).toUpperCase();
  } while (games[code]);
  return code;
};

const startGameLoop = (gameCode) => {
  const game = games[gameCode];
  if (!game) return;
  const question = game.questions[game.currentQuestionIndex];
  if (!question) {
    const finalLeaderboard = game.players.sort((a, b) => b.score - a.score);
    io.to(gameCode).emit('game:ended', finalLeaderboard);
    console.log(`Game ${gameCode} has ended.`);
    delete games[gameCode];
    return;
  }
  game.players.forEach(p => p.hasAnswered = false);
  io.to(gameCode).emit('game:next-question', question);
  console.log(`Sending question ${game.currentQuestionIndex + 1} for game ${gameCode}`);
  let timeLeft = game.settings.timePerQuestion;
  if (game.timer) clearInterval(game.timer);
  game.timer = setInterval(() => {
    io.to(gameCode).emit('game:timer', timeLeft);
    if (timeLeft > 0) {
      timeLeft--;
    } else {
      clearInterval(game.timer);
      io.to(gameCode).emit('game:show-results', { correctIndex: question.correctIndex });
      console.log(`Showing results for question ${game.currentQuestionIndex + 1}`);
      setTimeout(() => {
        game.currentQuestionIndex++;
        startGameLoop(gameCode);
      }, 5000);
    }
  }, 1000);
};

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();


io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('admin:login', (password, callback) => {
    if (password === process.env.ADMIN_PASSWORD) {
      callback({ success: true });
    } else {
      callback({ success: false });
    }
  });


  socket.on('lobby:create', (data) => {
    const { hostName, avatar, settings } = data;
    const gameCode = generateGameCode();
    const gameSettings = {
      questionCount: settings.questionCount || 10,
      topic: settings.topic || 'General Knowledge', // We now expect a 'topic'
      timePerQuestion: 15,
    };
    games[gameCode] = {
      gameCode,
      host: { id: socket.id, name: hostName, avatar },
      players: [],
      settings: gameSettings,
      state: "lobby"
    };
    socket.join(gameCode);
    const { timer, ...gameStateToSend } = games[gameCode];
    io.to(gameCode).emit('game:updated', gameStateToSend);
  });

  socket.on('lobby:join', (data) => {
    const { playerName, gameCode, avatar } = data;
    const game = games[gameCode];
    if (game) {
      const newPlayer = { id: socket.id, name: playerName, avatar, score: 0, hasAnswered: false };
      game.players.push(newPlayer);
      socket.join(gameCode);
      const { timer, ...gameStateToSend } = game;
      io.to(gameCode).emit('game:updated', gameStateToSend);
    } else {
      socket.emit('error:game-not-found', { message: `Game with code ${gameCode} not found.` });
    }
  });

  socket.on('game:get-state', (gameCode) => {
    const game = games[gameCode];
    if (game) {
      socket.join(gameCode);
      const { timer, ...gameStateToSend } = game;
      socket.emit('game:updated', gameStateToSend);
      if (game.state === 'in-game' && game.questions && game.questions.length > 0) {
        const currentQuestion = game.questions[game.currentQuestionIndex];
        socket.emit('game:next-question', currentQuestion);
      }
    } else {
      socket.emit('error:game-not-found', { message: `Game with code ${gameCode} not found.` });
    }
  });

  socket.on('game:start', async (gameCode) => {
    const game = games[gameCode];
    if (game && game.host.id === socket.id) {
      game.state = 'in-game';
      game.questions = await fetchAIQuestions(game.settings.topic, game.settings.questionCount);
      if (game.questions.length === 0) { return; }
      game.currentQuestionIndex = 0;
      startGameLoop(gameCode);
    }
  });

  socket.on('game:submit-answer', (data) => {
    const { gameCode, answerIndex } = data;
    const game = games[gameCode];
    const player = game?.players.find(p => p.id === socket.id);
    if (game && player && !player.hasAnswered) {
      const question = game.questions[game.currentQuestionIndex];
      const isCorrect = question.correctIndex === answerIndex;
      player.hasAnswered = true;
      if (isCorrect) {
        player.score += 100;
      }
      const { timer, ...gameStateToSend } = game;
      io.to(gameCode).emit('game:updated', gameStateToSend);
    }
  });

  // --- NEW ADMIN CONTROL HANDLERS ---
  socket.on('admin:next-question', (gameCode) => {
    const game = games[gameCode];
    if (game && game.host.id === socket.id) {
      console.log(`Admin forced next question for game ${gameCode}`);
      if (game.timer) clearInterval(game.timer);
      game.currentQuestionIndex++;
      startGameLoop(gameCode);
    }
  });

  socket.on('admin:kick-player', (data) => {
    const { gameCode, playerId } = data;
    const game = games[gameCode];

    // 1. Verify the requester is the host
    if (game && game.host.id === socket.id) {
      // 2. Find the player to kick
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      
      if (playerIndex > -1) {
        // 3. Remove the player from the game state
        const kickedPlayer = game.players.splice(playerIndex, 1)[0];
        console.log(`Player ${kickedPlayer.name} was kicked from game ${gameCode}`);

        // 4. Notify the kicked player and make them leave the room
        const kickedSocket = io.sockets.sockets.get(kickedPlayer.id);
        if (kickedSocket) {
          kickedSocket.emit('player:kicked');
          kickedSocket.leave(gameCode);
        }

        // 5. Broadcast the updated game state to the remaining players
        const { timer, ...gameStateToSend } = game;
        io.to(gameCode).emit('game:updated', gameStateToSend);
      }
    }
  });

  socket.on('admin:end-game', (gameCode) => {
    const game = games[gameCode];
    if (game && game.host.id === socket.id) {
      console.log(`Admin ended game ${gameCode} early.`);
      if (game.timer) clearInterval(game.timer);
      const finalLeaderboard = game.players.sort((a, b) => b.score - a.score);
      io.to(gameCode).emit('game:ended', finalLeaderboard);
      delete games[gameCode];
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get('/', (req, res) => {
  res.send('QuizChamp Backend with Socket.IO is running!');
});

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});