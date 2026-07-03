'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted, playClick } from '@/lib/sounds';

/** Tüm ekranlarda görünen küçük ses aç/kapa düğmesi. */
export const SoundToggle = () => {
    const [muted, setMutedState] = useState(false);

    useEffect(() => {
        setMutedState(isMuted());
    }, []);

    const toggle = () => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (!next) playClick();
    };

    return (
        <button
            type="button"
            onClick={toggle}
            title={muted ? 'Sesi aç' : 'Sesi kapat'}
            className="fixed top-3 left-3 z-[90] w-9 h-9 rounded-full bg-white border-2 border-[#E5E5E5] text-[#AFAFAF] hover:text-[#1CB0F6] hover:border-[#1CB0F6] shadow-sm flex items-center justify-center transition-colors"
        >
            {muted ? <VolumeX size={16} strokeWidth={2.5} /> : <Volume2 size={16} strokeWidth={2.5} />}
        </button>
    );
};
