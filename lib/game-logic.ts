import { roomsStore } from './room-store';
import { pusherServer } from './pusher';
import { EVENTS } from './pusher-events';
import { MiniGameType, Room } from '../types/game';

const MINIGAMES: MiniGameType[] = ['siapa-paling', 'ketik-cepat', 'pilih-menyesal'];

export async function advanceMiniGame(roomCode: string) {
  const room = roomsStore.get(roomCode);
  if (!room) return;

  room.round += 1;

  if (room.round > room.maxRounds) {
    // Game over
    room.gameState = 'final';
    await pusherServer.trigger(`presence-room-${roomCode}`, EVENTS.GAME_OVER, {
      players: Array.from(room.players.values()).sort((a, b) => b.score - a.score),
    });
    return;
  }

  // Pick random game
  const randomGame = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
  room.currentMiniGame = randomGame;
  room.gameState = 'countdown';

  // Initialize game generic data if any
  if (randomGame === 'siapa-paling') {
    const questions = ['Siapa yang paling sering ketiduran di kelas?', 'Siapa yang paling mungkin jadi presiden?', 'Siapa yang paling toxic pas main Valorant?', 'Siapa yang sering lupa bales chat?'];
    room.minigameData = { question: questions[Math.floor(Math.random() * questions.length)], votes: {}, voters: [] };
  } else if (randomGame === 'ketik-cepat') {
    const words = ['Gacor Kang', 'Menyala Abangku', 'Ilmu Padi', 'Skuy Living', 'Bocil Kematian'];
    room.minigameData = { word: words[Math.floor(Math.random() * words.length)], winners: [] };
  } else if (randomGame === 'pilih-menyesal') {
    const prompts = [
      { q: 'Gak bisa buka sosmed setahun', a: 'Gak bisa makan mie instan setahun' },
      { q: 'Punya pacar jutek tapi setia', a: 'Punya pacar baik tapi player' },
      { q: 'HP kentang tapi kuota unlimited', a: 'iPhone 15 tapi kuota 1GB sebulan' },
    ];
    room.minigameData = { options: prompts[Math.floor(Math.random() * prompts.length)], votes: { A: 0, B: 0 }, voters: [] };
  }

  await pusherServer.trigger(`presence-room-${roomCode}`, EVENTS.MINIGAME_BEGIN, {
    gameState: room.gameState,
    currentMiniGame: room.currentMiniGame,
    round: room.round,
    minigameData: room.minigameData
  });

  // Countdown timer 3 seconds
  let countdown = 3;
  const countInterval = setInterval(async () => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(countInterval);
      room.gameState = 'playing';
      await pusherServer.trigger(`presence-room-${roomCode}`, EVENTS.MINIGAME_BEGIN, {
        gameState: room.gameState,
      });
      startGameTimer(roomCode);
    }
  }, 1000);
}

function startGameTimer(roomCode: string) {
  const room = roomsStore.get(roomCode);
  if (!room) return;

  const duration = 20; // 20 seconds per game
  let timeLeft = duration;

  // We could use an interval but to avoid event spam, maybe just send syncs
  const tickInterval = setInterval(async () => {
    timeLeft--;
    await pusherServer.trigger(`presence-room-${roomCode}`, EVENTS.MINIGAME_TICK, { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(tickInterval);
      finishRound(roomCode);
    }
  }, 1000);
  
  // Store reference to clear if needed (early finish)
  room.minigameData = { ...room.minigameData, timerInterval: tickInterval };
}

export async function finishRound(roomCode: string) {
  const room = roomsStore.get(roomCode);
  if (!room) return;

  if (room.minigameData && room.minigameData.timerInterval) {
    clearInterval(room.minigameData.timerInterval);
  }

  room.gameState = 'results';

  // Calculate scores based on game logic here if needed
  if (room.currentMiniGame === 'siapa-paling') {
    // Voted person gets 100 points
    const votes = room.minigameData.votes || {};
    let maxVotes = 0;
    let targetWinner = '';
    Object.keys(votes).forEach(targetId => {
      if (votes[targetId] > maxVotes) {
        maxVotes = votes[targetId];
        targetWinner = targetId;
      }
    });

    if (targetWinner) {
      const p = room.players.get(targetWinner);
      if (p) p.score += 200;
      room.minigameData.winner = targetWinner;
    }
  } else if (room.currentMiniGame === 'pilih-menyesal') {
    // Determine majority
    const votesA = room.minigameData.votes.A;
    const votesB = room.minigameData.votes.B;
    const majority = votesA >= votesB ? 'A' : 'B';
    const votersDict = room.minigameData.votersDict || {};

    room.players.forEach((p, socketId) => {
      if (votersDict[socketId] === majority) {
        p.score += 150;
      }
    });
    room.minigameData.majority = majority;
  }
  // Ketik-cepat scores are awarded dynamically in action route.

  await pusherServer.trigger(`presence-room-${roomCode}`, EVENTS.ROUND_RESULTS, {
    gameState: room.gameState,
    players: Array.from(room.players.values()),
    minigameData: room.minigameData
  });

  // Wait 5 seconds, then next round
  setTimeout(() => {
    advanceMiniGame(roomCode);
  }, 8000);
}
