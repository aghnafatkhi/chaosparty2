'use client';
import { motion } from 'framer-motion';

export default function PilihAtauMenyesal({ data, onAction, state, socketId }: { data: any, onAction: any, state: string, socketId: string }) {
  const isVoted = data?.voters?.includes(socketId);

  if (state === 'results') {
    return (
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center w-full max-w-2xl">
        <h2 className="text-3xl font-fredoka text-game-yellow mb-8 drop-shadow-md">YANG MINORITAS KENA ROASTING</h2>
        <div className="grid grid-cols-2 gap-4">
          {['A', 'B'].map((choice) => (
             <div key={choice} className={`bg-game-surface border-4 rounded-3xl p-6 ${data.majority === choice ? 'border-game-green scale-105' : 'border-game-pink opacity-70 grayscale'}`}>
               <h3 className="text-2xl font-fredoka mb-4">Tim {choice}</h3>
               <p className="text-lg opacity-80 mb-4 h-16">{choice === 'A' ? data.options.q : data.options.a}</p>
               <div className="text-4xl font-bold">{data.votes[choice]} SUARA</div>
               {data.majority === choice && <div className="mt-4 text-game-green font-bold text-xl">+150 POINT!</div>}
               {data.majority !== choice && <div className="mt-4 text-game-pink font-bold text-lg">CUPU LU!</div>}
             </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-3xl flex flex-col items-center">
      <h2 className="text-2xl text-game-pink font-bold uppercase tracking-widest mb-8 text-center bg-black/40 px-6 py-2 rounded-full border-2 border-game-pink">Ikut Mayoritas = Poin</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <button
          disabled={isVoted}
          onClick={() => onAction('vote-pilih-menyesal', { choice: 'A' })}
          className={`group bg-game-purple/20 border-4 border-game-purple rounded-3xl p-8 flex flex-col items-center justify-center transition-all min-h-[250px] ${isVoted ? 'opacity-50' : 'hover:bg-game-purple hover:scale-105 active:scale-95'}`}
        >
          <div className="text-2xl opacity-50 mb-4 font-bold">PILIHAN A</div>
          <div className="text-3xl font-fredoka text-center group-hover:text-white">{data?.options?.q}</div>
        </button>

        <button
          disabled={isVoted}
          onClick={() => onAction('vote-pilih-menyesal', { choice: 'B' })}
          className={`group bg-game-yellow/20 border-4 border-game-yellow rounded-3xl p-8 flex flex-col items-center justify-center transition-all min-h-[250px] ${isVoted ? 'opacity-50' : 'hover:bg-game-yellow hover:text-black hover:scale-105 active:scale-95'}`}
        >
          <div className="text-2xl opacity-50 mb-4 font-bold group-hover:text-black">PILIHAN B</div>
          <div className="text-3xl font-fredoka text-center group-hover:text-black">{data?.options?.a}</div>
        </button>
      </div>

      {isVoted && <p className="mt-12 text-xl font-bold text-game-green animate-pulse">Menunggu kaum mendang-mending milih...</p>}
    </motion.div>
  );
}
