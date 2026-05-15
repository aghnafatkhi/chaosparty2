import { NextRequest, NextResponse } from 'next/server';
import { roomsStore } from '@/lib/room-store';
import { cookies } from 'next/headers';
import { pusherServer } from '@/lib/pusher';
import { EVENTS } from '@/lib/pusher-events';

export async function POST(req: NextRequest) {
  try {
    const { code, socketId } = await req.json();
    const room = roomsStore.get(code);

    if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const cookieStore = await cookies();
    const playerId = cookieStore.get('playerId')?.value;
    const name = cookieStore.get('playerName')?.value || 'Anonim';
    const avatar = cookieStore.get('playerAvatar')?.value || '😎';

    if (!playerId) return NextResponse.json({ error: 'No player id' }, { status: 400 });

    const isHost = Array.from(room.players.values()).filter(p => p.isHost).length === 0;

    room.players.set(socketId, {
      id: socketId,
      name,
      avatar,
      score: 0,
      isHost
    });

    // Notify others
    await pusherServer.trigger(`presence-room-${code}`, EVENTS.PLAYER_JOINED, {
      players: Array.from(room.players.values())
    });

    return NextResponse.json({ success: true, room: { ...room, players: Array.from(room.players.values()) } });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
