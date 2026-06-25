'use client';

import { useGame } from '@/context/GameContext';
import { scenarios } from '@/data/scenarios';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const TipsScreen = () => {
    const { currentScenarioId, proceedToQuiz, history } = useGame();

    const scenario = scenarios.find(s => s.id === currentScenarioId);
    const latestFeedback = history[history.length - 1];

    if (!scenario) return null;

    return (
        <div className="flex flex-col h-screen bg-white w-full items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Label */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center text-xs font-black uppercase tracking-widest text-[#AFAFAF] mb-4"
                >
                    Harika bir karar!
                </motion.p>

                {/* Speech bubble */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#F0FFF0] border-2 border-[#58CC02] rounded-3xl p-6 mb-4 relative"
                >
                    {/* Bubble tail pointing down toward unicorn */}
                    <div className="bubble-tail-outer" />
                    <div className="bubble-tail-inner" />

                    <p className="text-base font-bold text-[#3c3c3c] leading-relaxed mb-3">
                        {latestFeedback}
                    </p>
                    <p className="text-sm font-semibold text-[#777] leading-relaxed border-t-2 border-[#58CC02]/30 pt-3">
                        {scenario.info}
                    </p>
                </motion.div>

                {/* Unicorn mascot */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex justify-start pl-4 mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
                    >
                        <Image
                            src="/unicorn.png"
                            alt="Pivot"
                            width={120}
                            height={120}
                            className="drop-shadow-lg"
                        />
                    </motion.div>
                </motion.div>

                {/* Continue button */}
                <motion.button
                    type="button"
                    onClick={proceedToQuiz}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="btn-green w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide"
                >
                    Devam Et — Quize Geç
                </motion.button>
            </motion.div>
        </div>
    );
};
