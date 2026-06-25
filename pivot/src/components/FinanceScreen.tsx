'use client';

import { useGame } from '@/context/GameContext';
import { FINANCE_OPTIONS } from '@/data/finance';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Minus, AlertTriangle } from 'lucide-react';

export const FinanceScreen = () => {
    const { applyFinance, equity } = useGame();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="px-4 py-4 border-b-2 border-[#E5E5E5]">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <Image src="/unicorn.png" alt="Pivot" width={48} height={48} className="drop-shadow" />
                    <div>
                        <h2 className="text-lg font-black text-[#3c3c3c]">Finansman Seç</h2>
                        <p className="text-xs font-bold text-[#AFAFAF]">Mevcut hissen: %{equity}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-lg mx-auto w-full">
                <div className="flex flex-col gap-3">
                    {FINANCE_OPTIONS.map((opt) => (
                        <motion.button
                            type="button"
                            key={opt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => applyFinance(opt.id)}
                            className="border-2 border-[#E5E5E5] hover:border-[#FF9600] rounded-2xl p-4 text-left transition-all hover:shadow-sm active:scale-[0.99]"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="font-black text-[#3c3c3c] text-base">{opt.name}</p>
                                <span className="text-[#58CC02] font-black text-base shrink-0">
                                    +${opt.amount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-[#58CC02] font-bold mb-1">
                                <Plus size={12} className="mt-0.5 shrink-0" strokeWidth={3} />
                                <span>{opt.pros}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-[#FF4B4B] font-bold mb-2">
                                <Minus size={12} className="mt-0.5 shrink-0" strokeWidth={3} />
                                <span>{opt.cons}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-[#FF9600] font-bold bg-[#FFF3E0] rounded-xl p-2">
                                <AlertTriangle size={12} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                                <span>{opt.longTerm}</span>
                            </div>
                            {opt.equityCost > 0 && (
                                <p className="text-xs font-black text-[#1CB0F6] mt-2">
                                    Hisse etkisi: %{equity} → %{equity - opt.equityCost}
                                </p>
                            )}
                        </motion.button>
                    ))}
                </div>
            </main>
        </div>
    );
};
