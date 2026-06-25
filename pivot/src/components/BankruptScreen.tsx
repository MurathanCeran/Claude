'use client';

import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { toPercent } from '@/data/assessment';
import { saveRun } from '@/lib/storage';

export const BankruptScreen = () => {
    const { companyName, ceoName, history, resetGame, budget, equity, score, preTestCorrect } = useGame();

    // İflas eden oyunu da araştırma kaydına yaz (son-test yapılmadı).
    const savedRef = useRef(false);
    useEffect(() => {
        if (savedRef.current) return;
        savedRef.current = true;
        saveRun({
            ceoName,
            companyName,
            score,
            budget,
            equity,
            outcome: 'BANKRUPT',
            decisions: history.length,
            preTestPercent: preTestCorrect !== null ? toPercent(preTestCorrect) : null,
            postTestPercent: null,
            learningGain: null,
            date: new Date().toISOString(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-lg rounded-3xl overflow-hidden border-2 border-[#E5E5E5] shadow-xl"
            >
                {/* Header */}
                <div className="bg-[#FF4B4B] p-8 text-center">
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex justify-center mb-4"
                    >
                        <Image
                            src="/unicorn.png"
                            alt="Pivot"
                            width={140}
                            height={140}
                            className="drop-shadow-xl opacity-80"
                            style={{ filter: 'grayscale(40%)' }}
                        />
                    </motion.div>

                    <h2 className="text-2xl font-black text-white mb-1">İFLAS!</h2>
                    <p className="text-red-100 font-bold text-sm">
                        {ceoName ? `${ceoName}, ` : ''}{companyName} sermayesiz kaldı.
                    </p>
                    <div className="mt-4 inline-block bg-white/20 rounded-2xl px-6 py-3">
                        <div className="text-3xl font-black text-white">$0</div>
                        <div className="text-red-100 text-xs font-black uppercase tracking-wider mt-1">Kalan Sermaye</div>
                    </div>
                </div>

                {/* Message */}
                <div className="px-6 pt-6 pb-2">
                    <div className="bg-[#FFF3F3] border-2 border-[#FF4B4B] rounded-2xl p-4 mb-4">
                        <p className="text-[#3c3c3c] font-bold text-sm leading-relaxed">
                            <span className="font-black">Ne öğrendik?</span> Her başarısızlık bir ders. Burn rate'i kontrol etmek, tasarruflu kararlar almak ve sermayeni korumak girişimciliğin temelidir. Tekrar dene!
                        </p>
                    </div>

                    {history.length > 0 && (
                        <>
                            <h3 className="text-[#3c3c3c] font-black text-sm mb-3 uppercase tracking-wide">Aldığın Kararlar</h3>
                            <div className="space-y-2 mb-6 max-h-44 overflow-y-auto pr-1">
                                {history.map((item, i) => (
                                    <div key={i} className="flex gap-2 text-sm text-[#777] bg-[#F7F7F7] p-3 rounded-xl border-2 border-[#E5E5E5] font-semibold">
                                        <span className="text-[#FF4B4B] font-black shrink-0">{i + 1}.</span> {item}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={resetGame}
                        className="btn-green w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide mb-6"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
