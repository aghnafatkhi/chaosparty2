import { NextRequest, NextResponse } from 'next/server';
import { roomsStore } from '@/lib/room-store';
import { pusherServer } from '@/lib/pusher';
import { EVENTS } from '@/lib/pusher-events';

export async function POST(req: NextRequest) {
  try {
    const { code, socketId } = await req.json();
    const room = roomsStore.get(code);

    if (room && room.players.has(socketId)) {
      room.players.delete(socketId);
      
      // If no players left, cleanup room
      if (room.players.size === 0) {
        roomsStore.delete(code);
      } else {
        // If host left, assign new host
        const playersArr = Array.from(room.players.values());
        if (!playersArr.some(p => p.isHost)) {
          playersArr[0].isHost = true;
          room.players.set(playersArr[0].id, playersArr[0]);
        }
        await pusherServer.trigger(`presence-room-${code}`, EVENTS.PLAYER_LEFT, {
          players: Array.from(room.players.values())
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
