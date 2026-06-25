'use client';

import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const FinanceIntroScreen = () => {
    const { ceoName, budget, proceedToFinanceSelection } = useGame();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex justify-center mb-6"
                >
                    <Image src="/unicorn.png" alt="Pivot" width={140} height={140} className="drop-shadow-xl" />
                </motion.div>

                <div className="bg-white border-2 border-[#FF9600] rounded-3xl rounded-tl-sm p-6 shadow-sm mb-6">
                    <p className="text-xs font-black text-[#FF9600] uppercase tracking-widest mb-3">
                        Sermaye Uyarısı — ${budget.toLocaleString()}
                    </p>
                    <p className="text-[#3c3c3c] font-bold leading-relaxed mb-3">
                        {ceoName ? `${ceoName}, ` : ''}sermayen kritik seviyenin altına düştü!
                    </p>
                    <p className="text-[#3c3c3c] font-bold leading-relaxed mb-3">
                        Girişimcilik yolculuğunda para azaldığında alternatif kaynaklardan sermaye
                        elde edebilirsin — banka kredisi, melek yatırımcı, kitle fonlaması veya devlet
                        hibesi gibi.
                    </p>
                    <p className="text-[#777] font-semibold leading-relaxed mb-3">
                        Ama dikkat: Her seçeneğin kısa vadede getirisi kadar uzun vadeli riskleri de
                        vardır. Kredi faiz ödemesi gerektirir, yatırımcı hisse ister, hibeler raporlama
                        yükü getirir.
                    </p>
                    <p className="text-[#FF4B4B] font-black text-sm">
                        Oyun boyunca yalnızca bir finansman hakkın var. Dikkatli kullan!
                    </p>
                </div>

                <button
                    type="button"
                    onClick={proceedToFinanceSelection}
                    className="btn-green w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide"
                >
                    Finansman Seçeneklerini Gör
                </button>
            </motion.div>
        </div>
    );
};
