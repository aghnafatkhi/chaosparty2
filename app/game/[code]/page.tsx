'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { EVENTS } from '@/lib/pusher-events';
import { Player, MiniGameType } from '@/types/game';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import SiapaYangPaling from '@/components/minigames/SiapaYangPaling';
import KetikSecepatKilat from '@/components/minigames/KetikSecepatKilat';
import PilihAtauMenyesal from '@/components/minigames/PilihAtauMenyesal';

export default function GameScreen({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = resolvedParams.code.toUpperCase();
  const router = useRouter();

  const [gameState, setGameState] = useState<'lobby'|'countdown'|'playing'|'results'|'final'>('countdown');
  const [currentMiniGame, setCurrentMiniGame] = useState<MiniGameType | null>(null);
  const [minigameData, setMinigameData] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [socketId, setSocketId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const pusher = getPusherClient();
    
    if (pusher.connection.state === 'connected') {
      setTimeout(() => setSocketId(pusher.connection.socket_id), 0);
    } else {
      pusher.connection.bind('connected', () => {
        setSocketId(pusher.connection.socket_id);
      });
    }

    const channel = pusher.subscribe(`presence-room-${code}`);

    channel.bind(EVENTS.MINIGAME_BEGIN, (data: any) => {
      setGameState(data.gameState);
      if (data.currentMiniGame) setCurrentMiniGame(data.currentMiniGame);
      if (data.minigameData) setMinigameData(data.minigameData);
      if (data.players) setPlayers(data.players);
    });

    channel.bind(EVENTS.MINIGAME_TICK, (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
    });

    channel.bind(EVENTS.ANSWER_RECEIVED, (data: any) => {
      // Just some visual feedback can be added here
    });

    channel.bind(EVENTS.ROUND_RESULTS, (data: any) => {
      setGameState(data.gameState);
      setPlayers(data.players);
      setMinigameData(data.minigameData);
    });

    channel.bind(EVENTS.GAME_OVER, (data: { players: Player[] }) => {
      setGameState('final');
      setPlayers(data.players);
      confetti({ particleCount: 150, spread: 180, origin: { y: 0.3 } });
    });

    return () => {
      pusher.unsubscribe(`presence-room-${code}`);
    };
  }, [code]);

  const handleAction = async (action: string, payload: any) => {
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, socketId, action, payload })
    });
  };

  const renderMiniGame = () => {
    if (!currentMiniGame) return null;
    switch (currentMiniGame) {
      case 'siapa-paling':
        return <SiapaYangPaling data={minigameData} players={players} socketId={socketId} onAction={handleAction} state={gameState} />;
      case 'ketik-cepat':
        return <KetikSecepatKilat data={minigameData} onAction={handleAction} state={gameState} socketId={socketId} />;
      case 'pilih-menyesal':
        return <PilihAtauMenyesal data={minigameData} onAction={handleAction} state={gameState} socketId={socketId} />; // Add to imports
      default:
        return <div>Mini game belum ada UI nya bos.</div>;
    }
  };

  if (gameState === 'countdown') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.h1 
          initial={{ scale: 0 }} 
          animate={{ scale: [1, 1.5, 1] }} 
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl font-fredoka text-game-pink"
        >
          SIAP-SIAP!
        </motion.h1>
      </div>
    );
  }

  if (gameState === 'final') {
    return (
      <div className="flex-1 flex items-center justify-center bg-game-bg">
        <div className="max-w-md w-full p-6 text-center">
          <h1 className="text-5xl font-fredoka text-game-yellow drop-shadow-lg mb-8">PEMENANGNYA!</h1>
          <div className="space-y-4">
            {players.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className={`flex items-center gap-4 bg-game-surface border-4 rounded-xl p-4 ${i === 0 ? 'border-game-yellow scale-110 shadow-2xl relative' : 'border-white/10'}`}
              >
                {i === 0 && <span className="absolute -top-6 -left-3 text-5xl">👑</span>}
                <div className="text-3xl font-bold w-8 text-left text-gray-400">#{i+1}</div>
                <div className="text-4xl">{p.avatar}</div>
                <div className="font-fredoka text-xl text-left flex-1 truncate">{p.name}</div>
                <div className="font-bold text-game-green text-2xl">{p.score}</div>
              </motion.div>
            ))}
          </div>
          <button 
            onClick={() => router.push('/')}
            className="mt-8 bg-game-purple text-white font-fredoka px-8 py-4 rounded-xl text-xl w-full border-b-4 border-black/30 active:border-b-0 active:translate-y-1"
          >
            MAIN LAGI DONG
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
      {/* Top Bar -> Timer & Players */}
      <div className="p-4 flex gap-4 w-full">
        {gameState === 'playing' && (
          <div className="flex-1 bg-black/40 rounded-full h-8 overflow-hidden relative border-2 border-white/20">
            <motion.div 
              className={`h-full ${timeLeft <= 5 ? 'bg-game-pink' : 'bg-game-yellow'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 20) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-fredoka text-sm drop-shadow-md pb-[2px]">
              {timeLeft} DIMENSI WAKTU
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 relative w-full gap-8">
        <AnimatePresence mode="wait">
          {renderMiniGame()}
        </AnimatePresence>

        {gameState === 'results' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1 }}
            className="w-full max-w-2xl bg-black/40 rounded-3xl p-6 border-2 border-white/10"
          >
            <h3 className="text-2xl font-fredoka text-center mb-4 text-gray-400">LEADERBOARD SEMENTARA</h3>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 bg-game-surface border-2 border-white/5 rounded-xl p-3">
                  <div className="text-xl font-bold w-6 text-gray-500">#{i+1}</div>
                  <div className="text-2xl">{p.avatar}</div>
                  <div className="font-fredoka text-lg flex-1 truncate">{p.name}</div>
                  <div className="font-bold text-game-yellow text-xl">{p.score} pts</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
