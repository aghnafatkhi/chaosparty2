export type Player = {
  id: string; // Pusher socket_id
  name: string;
  avatar: string; // emoji or SVG id
  score: number;
  isHost: boolean;
};

export type MiniGameType = 'siapa-paling' | 'ketik-cepat' | 'pilih-menyesal';

export type Room = {
  code: string;
  players: Map<string, Player>; // Key is socket id
  gameState: 'lobby' | 'countdown' | 'playing' | 'results' | 'final';
  currentMiniGame: MiniGameType | null;
  round: number;
  maxRounds: number;
  minigameData?: any; // To store question, votes, etc
};
