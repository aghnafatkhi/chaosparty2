import { pusherServer } from '@/lib/pusher';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;

    const cookieStore = await cookies();
    const playerId = cookieStore.get('playerId')?.value || 'guest-' + Math.random().toString(36).substring(7);
    const playerName = cookieStore.get('playerName')?.value || 'Anonim';
    const playerAvatar = cookieStore.get('playerAvatar')?.value || '👽';

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: playerId,
      user_info: { name: playerName, avatar: playerAvatar }
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
