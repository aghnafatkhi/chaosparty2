'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function KetikSecepatKilat({ data, onAction, state, socketId }: { data: any, onAction: any, state: string, socketId: string }) {
  const [input, setInput] = useState('');
  const isWinner = data?.winners?.includes(socketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWinner) return;
    onAction('ketik-cepat-answer', { word: input });
  };

  if (state === 'results') {
    return (
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center w-full max-w-xl">
        <h2 className="text-3xl font-fredoka text-game-yellow mb-8 drop-shadow-md">YANG JARINYA KERITING</h2>
        <div className="bg-game-surface border-4 border-game-green rounded-3xl p-8 mb-8 space-y-4">
          {data.winners.length > 0 ? data.winners.map((wid: string, index: number) => (
            <div key={wid} className="text-left font-fredoka flex gap-4 text-2xl items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
               <span className="text-game-pink">#{index + 1}</span> 
               <span className="flex-1 opacity-50 text-sm">Socket: {wid.slice(0,5)}...</span>
               <span className="text-game-green">+{index === 0 ? 300 : index === 1 ? 200 : 100} PTS</span>
            </div>
          )) : (
            <div className="text-2xl font-fredoka text-gray-400">Gak ada yang ngetik bener! Cupu banget!</div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl flex flex-col items-center">
      <div className="bg-game-surface border-4 border-game-pink rounded-3xl p-8 mb-8 text-center shadow-xl w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-xs bg-game-pink font-bold rounded-bl-xl">CEPETAN KETIK!</div>
        <h2 className="text-2xl text-game-yellow font-bold uppercase tracking-widest mb-4">FRASA MISTERI</h2>
        <motion.h1 
          animate={{ x: [-2, 2, -2] }} 
          transition={{ repeat: Infinity, duration: 0.2 }}
          className="text-4xl md:text-6xl font-fredoka text-white tracking-widest py-4 select-none"
        >
          {data?.word}
        </motion.h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <input 
          autoFocus
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isWinner}
          placeholder={isWinner ? "Udah masukin!" : "Ketik disini..."} 
          className="w-full bg-black/60 border-4 border-white/20 rounded-2xl px-6 py-6 text-3xl font-fredoka text-center focus:border-game-green focus:outline-none transition-colors placeholder:text-gray-600 disabled:opacity-50"
        />
      </form>

      {isWinner && <p className="mt-8 text-2xl font-bold font-fredoka text-game-green animate-bounce">BENAR! Mantap bosku!</p>}
    </motion.div>
  );
}
