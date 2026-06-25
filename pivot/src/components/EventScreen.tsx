'use client';

import { useGame } from '@/context/GameContext';
import { eventDelta } from '@/data/events';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';

export const EventScreen = () => {
    const { pendingEvent, budget, applyEventAndContinue } = useGame();

    if (!pendingEvent) {
        // Güvenlik: olay yoksa oyuna geri dön
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
                <button
                    type="button"
                    onClick={applyEventAndContinue}
                    className="btn-green font-black py-4 px-8 rounded-2xl text-lg uppercase tracking-wide"
                >
                    Devam Et
                </button>
            </div>
        );
    }

    const delta = eventDelta(pendingEvent, budget);
    const isGain = delta > 0;
    const isLoss = delta < 0;

    const accent = isGain ? '#58CC02' : isLoss ? '#FF4B4B' : '#AFAFAF';
    const accentBg = isGain ? '#F0FFF0' : isLoss ? '#FFF3F3' : '#F7F7F7';

    const deltaText =
        delta === 0
            ? 'Etki yok'
            : `${delta > 0 ? '+' : '-'}$${Math.abs(delta).toLocaleString()}`;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs font-black uppercase tracking-widest text-[#AFAFAF] mb-4"
                >
                    Beklenmedik Piyasa Olayı!
                </motion.p>

                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-4"
                >
                    <Image src="/unicorn.png" alt="Pivot" width={120} height={120} className="drop-shadow-xl" />
                </motion.div>

                <div
                    className="rounded-3xl p-6 mb-6 border-2"
                    style={{ backgroundColor: accentBg, borderColor: accent }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        {isGain ? (
                            <TrendingUp size={20} style={{ color: accent }} strokeWidth={2.5} />
                        ) : isLoss ? (
                            <TrendingDown size={20} style={{ color: accent }} strokeWidth={2.5} />
                        ) : (
                            <Minus size={20} style={{ color: accent }} strokeWidth={2.5} />
                        )}
                        <h2 className="text-lg font-black text-[#3c3c3c]">{pendingEvent.title}</h2>
                    </div>

                    <p className="text-sm font-bold text-[#3c3c3c] leading-relaxed mb-4">
                        {pendingEvent.text}
                    </p>

                    <div className="flex items-center justify-between bg-white rounded-2xl border-2 px-4 py-3" style={{ borderColor: accent }}>
                        <span className="text-xs font-black uppercase tracking-wide text-[#AFAFAF]">Sermayeye etki</span>
                        <span className="text-xl font-black" style={{ color: accent }}>{deltaText}</span>
                    </div>
                </div>

                <div className="bg-[#FFF8E7] border-2 border-[#FFCC00] rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <Lightbulb size={16} className="text-[#FF9600] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <div>
                            <p className="text-xs font-black text-[#FF9600] uppercase tracking-wide mb-1">Finansal Ders</p>
                            <p className="text-sm font-semibold text-[#3c3c3c] leading-relaxed">{pendingEvent.lesson}</p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={applyEventAndContinue}
                    className="btn-green w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide"
                >
                    Devam Et
                </button>
            </motion.div>
        </div>
    );
};
