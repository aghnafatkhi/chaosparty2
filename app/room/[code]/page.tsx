'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { EVENTS } from '@/lib/pusher-events';
import { motion } from 'framer-motion';
import { Player } from '@/types/game';

export default function LobbyScreen({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = resolvedParams.code.toUpperCase();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [socketId, setSocketId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const pusher = getPusherClient();
    
    // We should get socket_id before syncing
    const handleConnected = () => {
      const sId = pusher.connection.socket_id;
      setSocketId(sId);
      
      // Sync to room
      fetch('/api/room/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, socketId: sId })
      }).then(res => res.json()).then(data => {
        if (!data.success) {
          setError(data.error || 'Failed to sync');
        } else {
          setPlayers(data.room.players);
          const me = data.room.players.find((p: Player) => p.id === sId);
          if (me) setIsHost(me.isHost);
          
          if (data.room.gameState !== 'lobby') {
            router.push(`/game/${code}`);
          }
        }
      });
    };

    if (pusher.connection.state === 'connected') {
      setTimeout(handleConnected, 0);
    } else {
      pusher.connection.bind('connected', handleConnected);
    }

    const channel = pusher.subscribe(`presence-room-${code}`);
    
    channel.bind(EVENTS.PLAYER_JOINED, (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    channel.bind(EVENTS.PLAYER_LEFT, (data: { players: Player[] }) => {
      setPlayers(data.players);
      const me = data.players.find((p: Player) => p.id === pusher.connection.socket_id);
      if (me) setIsHost(me.isHost);
    });

    channel.bind(EVENTS.MINIGAME_BEGIN, (data: any) => {
      router.push(`/game/${code}`);
    });

    // Cleanup
    return () => {
      const sId = pusher.connection.socket_id;
      if (sId) {
        fetch('/api/room/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, socketId: sId })
        });
      }
      pusher.unsubscribe(`presence-room-${code}`);
      // pusher.disconnect(); // Do not disconnect if we want to keep it alive for game
    };
  }, [code, router]);

  const handleStart = async () => {
    await fetch('/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-fredoka text-game-pink mb-4">Error</h1>
        <p className="text-xl">{error}</p>
        <button onClick={() => router.push('/')} className="mt-8 bg-game-surface px-6 py-3 rounded-xl border-2 border-white/20">Kembali</button>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="bg-game-surface border-4 border-white/10 rounded-3xl w-full p-6 text-center shadow-2xl relative overflow-hidden mb-8 mt-12 md:mt-24">
        <div className="absolute top-0 left-0 w-full h-8 bg-black/20 flex items-center justify-center text-xs tracking-widest font-bold uppercase text-gray-400">
          Room Code
        </div>
        <h1 className="text-5xl sm:text-7xl font-fredoka mt-6 text-white tracking-widest drop-shadow-lg">
          {code}
        </h1>
        <p className="mt-2 text-game-yellow font-bold">Kasih kode ini ke temenmu!</p>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-fredoka text-white">Lobby ({players.length}/8)</h2>
          {isHost && (
            <button 
              onClick={handleStart}
              disabled={players.length < 2}
              className="bg-game-green hover:bg-game-green/80 text-black font-fredoka text-xl px-8 py-3 rounded-xl border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
            >
              Mulai Game!
            </button>
          )}
        </div>
        {players.length < 2 && isHost && (
          <p className="text-game-pink text-sm mb-4">Minimal 2 orang buat main bos!</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {players.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-black/40 border-2 rounded-2xl p-4 flex flex-col items-center justify-center relative ${p.id === socketId ? 'border-game-yellow' : 'border-white/10'}`}
            >
              {p.isHost && (
                <div className="absolute -top-3 -right-3 bg-game-purple text-xs px-2 py-1 rounded-full font-bold border-2 border-white">
                  HOST
                </div>
              )}
              <div className="text-5xl mb-2 animate-bounce">{p.avatar}</div>
              <div className="font-fredoka text-center w-full truncate">{p.name}</div>
            </motion.div>
          ))}
          {Array.from({ length: 8 - players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-black/20 border-2 border-white/5 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center opacity-30">
              <div className="text-5xl mb-2">👤</div>
              <div className="font-fredoka text-center w-full">Kosong</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
