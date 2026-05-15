'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AVATARS = ['😎', '👽', '🤠', '🤡', '👻', '💩', '🦄', '🦖'];

export default function Home() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateMenu = async () => {
    if (!name.trim()) return alert('Isi nama dulu bos!');
    setIsLoading(true);
    const res = await fetch('/api/room/create', { method: 'POST' });
    const data = await res.json();
    
    if (data.code) {
      await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, name, avatar })
      });
      router.push(`/room/${data.code}`);
    } else {
      setIsLoading(false);
      alert('Gagal bikin room');
    }
  };

  const handleJoinMenu = async () => {
    if (!name.trim()) return alert('Isi nama dulu bos!');
    if (roomCode.length !== 6) return alert('Kode room 6 huruf!');
    
    setIsLoading(true);
    const res = await fetch('/api/room/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: roomCode, name, avatar })
    });
    
    const data = await res.json();
    if (data.success) {
      router.push(`/room/${data.code}`);
    } else {
      setIsLoading(false);
      alert(data.error || 'Gagal join room');
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-game-surface border-4 border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-game-pink via-game-purple to-game-green" />
        
        <h1 className="text-4xl sm:text-6xl font-fredoka text-center mb-2 font-bold tracking-wider text-game-yellow drop-shadow-md flex justify-center items-center gap-2">
          <span>CHAOS</span> <span>PARTY</span>
        </h1>
        <p className="text-center text-gray-400 mb-8 font-nunito font-semibold">
          Kumpul, Main, Rusuh.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-widest text-center">Pilih Avatar</label>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATARS.map(a => (
                <button 
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-4xl p-2 rounded-xl border-4 transition-all ${avatar === a ? 'border-game-pink scale-110 bg-white/10 rotate-3' : 'border-transparent hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-widest text-center">Namamu</label>
            <input 
              type="text" 
              maxLength={12}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Si Paling..." 
              className="w-full bg-black/40 border-2 border-white/20 rounded-xl px-4 py-3 text-2xl font-fredoka text-center focus:border-game-pink focus:outline-none transition-colors placeholder:text-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <button 
              onClick={handleCreateMenu}
              disabled={isLoading}
              className="bg-game-purple hover:bg-game-purple/80 text-white font-fredoka text-xl py-4 rounded-xl border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
            >
              Bikin Room
            </button>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                maxLength={6}
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="KODE" 
                className="w-full bg-black/40 border-2 border-white/20 rounded-xl px-4 py-3 text-2xl font-fredoka text-center uppercase tracking-widest focus:border-game-green focus:outline-none transition-colors"
              />
              <button 
                onClick={handleJoinMenu}
                disabled={isLoading || roomCode.length !== 6}
                className="bg-game-green hover:bg-game-green/80 text-black font-fredoka text-xl py-3 rounded-xl border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
              >
                Join!
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
