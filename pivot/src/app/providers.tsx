'use client';

import { GameProvider } from '@/context/GameContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <GameProvider>
            {children}
        </GameProvider>
    );
}
