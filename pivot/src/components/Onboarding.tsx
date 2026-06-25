'use client';

import { useGame } from '@/context/GameContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Lightbulb, Target, Gem, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const LOGO_OPTIONS = [
    { id: 'rocket', icon: Rocket, label: 'Hız' },
    { id: 'bulb', icon: Lightbulb, label: 'Yenilik' },
    { id: 'target', icon: Target, label: 'Hedef' },
    { id: 'gem', icon: Gem, label: 'Kalite' },
    { id: 'chart', icon: TrendingUp, label: 'Büyüme' },
];

export const Onboarding = () => {
    const { setCompanyName, setCeoName, setLogo } = useGame();
    const [name, setName] = useState('');
    const [ceo, setCeo] = useState('');
    const [selectedLogo, setSelectedLogo] = useState('rocket');

    const handleStart = () => {
        if (!name.trim() || !ceo.trim()) return;
        setLogo(selectedLogo);
        setCeoName(ceo);
        setCompanyName(name);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-6">
                    <Image src="/unicorn.png" alt="Pivot" width={120} height={120} className="drop-shadow-md" />
                </div>

                <h2 className="text-3xl font-black text-[#3c3c3c] mb-1 text-center">Şirketini Kur</h2>
                <p className="text-[#AFAFAF] font-bold text-center mb-8">Girişim yolculuğuna başla!</p>

                <div className="mb-4">
                    <label className="block text-[#3c3c3c] text-sm font-black mb-2 uppercase tracking-wide">
                        Şirket İsmi
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Örn: Gelecek Teknoloji"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#1CB0F6] focus:outline-none transition-colors text-lg text-[#3c3c3c] font-bold bg-white"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-[#3c3c3c] text-sm font-black mb-2 uppercase tracking-wide">
                        CEO Adı
                    </label>
                    <input
                        type="text"
                        value={ceo}
                        onChange={(e) => setCeo(e.target.value)}
                        placeholder="Adın ne?"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#1CB0F6] focus:outline-none transition-colors text-lg text-[#3c3c3c] font-bold bg-white"
                    />
                </div>

                <div className="mb-10">
                    <label className="block text-[#3c3c3c] text-sm font-black mb-3 uppercase tracking-wide">
                        Logo Seçimi
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                        {LOGO_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                title={opt.label}
                                onClick={() => setSelectedLogo(opt.id)}
                                className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all ${
                                    selectedLogo === opt.id
                                        ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6] scale-105'
                                        : 'bg-white border-[#E5E5E5] text-[#AFAFAF] hover:border-[#1CB0F6]'
                                }`}
                            >
                                <opt.icon size={28} strokeWidth={2} />
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleStart}
                    disabled={!name.trim() || !ceo.trim()}
                    className={`w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide ${
                        name.trim() && ceo.trim() ? 'btn-blue' : 'btn-disabled'
                    }`}
                >
                    Şirketi Kur
                </button>
            </motion.div>
        </div>
    );
};
