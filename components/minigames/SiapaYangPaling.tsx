'use client';
import { Player } from '@/types/game';
import { motion } from 'framer-motion';

export default function SiapaYangPaling({ data, players, socketId, onAction, state }: { data: any, players: Player[], socketId: string, onAction: any, state: string }) {
  const isVoted = data?.voters?.includes(socketId);

  if (state === 'results') {
    return (
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center w-full max-w-xl">
        <h2 className="text-3xl font-fredoka text-game-yellow mb-8 drop-shadow-md">HASIL KARYA NETIZEN</h2>
        <div className="bg-game-surface border-4 border-game-purple rounded-3xl p-8 mb-8 relative">
           <h3 className="text-xl mb-4 text-gray-300 font-nunito leading-relaxed">{data.question}</h3>
           {data.winner ? (
             <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
               <div className="text-6xl mb-2">{players.find(p => p.id === data.winner)?.avatar}</div>
               <div className="text-4xl font-fredoka text-game-pink">{players.find(p => p.id === data.winner)?.name}</div>
               <div className="text-game-green font-bold text-xl mt-2">+200 POINT BUAT SI PALING!</div>
             </motion.div>
           ) : (
             <div className="text-2xl font-fredoka text-gray-400">Gak ada yang ngevote woy!</div>
           )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl flex flex-col items-center">
      <div className="bg-game-surface border-4 border-game-yellow rounded-3xl p-8 mb-8 text-center shadow-xl w-full">
        <h2 className="text-2xl text-game-pink font-bold uppercase tracking-widest mb-4">PILIH TARGETMU</h2>
        <h1 className="text-3xl md:text-5xl font-fredoka text-white leading-tight">{data?.question}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {players.map(p => {
          if (p.id === socketId) return null; // Can't vote yourself? Or maybe you can? Let's hide self for fun.
          
          return (
            <button
              key={p.id}
              disabled={isVoted}
              onClick={() => onAction('vote-siapa-paling', { targetId: p.id })}
              className={`bg-black/40 border-4 border-white/10 rounded-2xl p-4 flex flex-col items-center transition-all ${isVoted ? 'opacity-50' : 'hover:border-game-purple hover:scale-105 active:scale-95'}`}
            >
              <div className="text-5xl mb-2">{p.avatar}</div>
              <div className="font-fredoka text-xl truncate w-full text-center">{p.name}</div>
            </button>
          )
        })}
      </div>

      {isVoted && <p className="mt-8 text-xl font-bold text-game-green animate-pulse">Suara diamankan. Nunggu yang lain...</p>}
    </motion.div>
  );
}
