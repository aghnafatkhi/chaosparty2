import type {Metadata} from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css'; // Global styles

const fredoka = Fredoka({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-fredoka' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'CHAOS PARTY',
  description: 'Multiplayer Web Party Game untuk anak SMA!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body suppressHydrationWarning className="font-nunito antialiased selection:bg-game-pink selection:text-white min-h-[100dvh] flex flex-col">{children}</body>
    </html>
  );
}
