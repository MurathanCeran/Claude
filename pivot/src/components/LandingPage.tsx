'use client';

import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { bestScore, loadRuns } from '@/lib/storage';

export const LandingPage = () => {
    const { setGameStatus } = useGame();
    const [best, setBest] = useState(0);
    const [plays, setPlays] = useState(0);

    useEffect(() => {
        setBest(bestScore());
        setPlays(loadRuns().length);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                {/* Pivot Logo */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex justify-center mb-2"
                >
                    <Image
                        src="/pivot-logo.png"
                        alt="Pivot"
                        width={280}
                        height={280}
                        className="drop-shadow-xl"
                        priority
                    />
                </motion.div>

                <p className="text-lg text-[#777] font-bold mb-2">
                    Finansal Okuryazarlık Oyunu
                </p>
                <p className="text-base text-[#AFAFAF] mb-10 leading-relaxed font-semibold">
                    Şirketini kur, gerçek finans kararları ver; bütçe, faiz, risk ve
                    yatırımı oynayarak öğren!
                </p>

                <button
                    onClick={() => setGameStatus('ONBOARDING')}
                    className="btn-green w-full font-black py-4 px-10 rounded-2xl text-xl uppercase tracking-wide"
                >
                    OYUNA BAŞLA
                </button>

                <p className="mt-6 text-[#AFAFAF] text-sm font-bold">
                    Ücretsiz · Türkçe · 10 dakika
                </p>

                {best > 0 && (
                    <div className="mt-5 inline-flex items-center gap-4 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl px-5 py-3">
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-wide text-[#AFAFAF]">En İyi Skor</p>
                            <p className="text-lg font-black text-[#1CB0F6]">{best.toLocaleString()}</p>
                        </div>
                        <div className="h-8 w-px bg-[#E5E5E5]" />
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-wide text-[#AFAFAF]">Oynanış</p>
                            <p className="text-lg font-black text-[#58CC02]">{plays}</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
