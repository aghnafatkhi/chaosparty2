import { NextRequest, NextResponse } from 'next/server';
import { roomsStore } from '@/lib/room-store';
import { advanceMiniGame } from '@/lib/game-logic';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const room = roomsStore.get(code);

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.gameState !== 'lobby') return NextResponse.json({ error: 'Game already started' }, { status: 400 });

    room.round = 0;
    
    // reset scores
    room.players.forEach(p => p.score = 0);

    advanceMiniGame(code); // Starts sequence

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
