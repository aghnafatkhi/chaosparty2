import { Room } from '../types/game';

// To ensure it survives HMR if occasionally triggered
const globalObj = global as typeof global & {
  __roomsData?: Map<string, Room>;
};

if (!globalObj.__roomsData) {
  globalObj.__roomsData = new Map<string, Room>();
}

export const roomsStore: Map<string, Room> = globalObj.__roomsData;

export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
