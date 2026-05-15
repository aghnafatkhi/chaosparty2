import { NextRequest, NextResponse } from 'next/server';
import { roomsStore } from '@/lib/room-store';
import { pusherServer } from '@/lib/pusher';
import { EVENTS } from '@/lib/pusher-events';

export async function POST(req: NextRequest) {
  try {
    const { code, socketId, action, payload } = await req.json();
    const room = roomsStore.get(code);

    if (!room || room.gameState !== 'playing') {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    if (action === 'vote-siapa-paling') {
      const targetId = payload.targetId;
      if (!room.minigameData.voters.includes(socketId)) {
        room.minigameData.voters.push(socketId);
        if (!room.minigameData.votes[targetId]) room.minigameData.votes[targetId] = 0;
        room.minigameData.votes[targetId]++;
      }
    } else if (action === 'ketik-cepat-answer') {
      const isCorrect = payload.word.toLowerCase() === room.minigameData.word.toLowerCase();
      if (isCorrect && !room.minigameData.winners.includes(socketId)) {
        room.minigameData.winners.push(socketId);
        const position = room.minigameData.winners.length;
        const player = room.players.get(socketId);
        if (player) {
          if (position === 1) player.score += 300;
          else if (position === 2) player.score += 200;
          else player.score += 100;
        }
      }
    } else if (action === 'vote-pilih-menyesal') {
      const choice = payload.choice; // 'A' or 'B'
      if (!room.minigameData.voters.includes(socketId)) {
        room.minigameData.voters.push(socketId);
        if (!room.minigameData.votersDict) room.minigameData.votersDict = {};
        room.minigameData.votersDict[socketId] = choice;
        room.minigameData.votes[choice]++;
      }
    }

    await pusherServer.trigger(`presence-room-${code}`, EVENTS.ANSWER_RECEIVED, {
      playerAction: socketId,
      action
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
