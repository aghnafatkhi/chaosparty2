import { NextRequest, NextResponse } from 'next/server';
import { roomsStore, generateRoomCode } from '@/lib/room-store';

export async function POST(req: NextRequest) {
  try {
    let code = generateRoomCode();
    while (roomsStore.has(code)) {
      code = generateRoomCode();
    }

    roomsStore.set(code, {
      code,
      players: new Map(),
      gameState: 'lobby',
      currentMiniGame: null,
      round: 0,
      maxRounds: 3,
    });

    return NextResponse.json({ code });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
