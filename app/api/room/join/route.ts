import { NextRequest, NextResponse } from 'next/server';
import { roomsStore } from '@/lib/room-store';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { code, name, avatar } = await req.json();

    if (!code || !name) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const room = roomsStore.get(upperCode);

    if (!room) {
      return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 });
    }

    if (room.gameState !== 'lobby') {
      return NextResponse.json({ error: 'Game sudah dimulai' }, { status: 403 });
    }

    if (room.players.size >= 8) {
      return NextResponse.json({ error: 'Room penuh (max 8)' }, { status: 403 });
    }

    const cookieStore = await cookies();
    let playerId = cookieStore.get('playerId')?.value;
    
    if (!playerId) {
      playerId = uuidv4();
    }

    cookieStore.set('playerId', playerId, { maxAge: 60 * 60 * 24 });
    cookieStore.set('playerName', name, { maxAge: 60 * 60 * 24 });
    cookieStore.set('playerAvatar', avatar || '😎', { maxAge: 60 * 60 * 24 });

    // Note: The actual player addition to the room store happens when they connect via Pusher (presence channel).
    // Or we could register them here if they are the host. If room.players is empty, they are host.
    const isHost = room.players.size === 0;

    return NextResponse.json({ success: true, code: upperCode, isHost });
  } catch (error) {
    return NextResponse.json({ error: 'Error join room' }, { status: 500 });
  }
}
