'use client';

import { useGame } from '@/context/GameContext';
import { scenarios, getAllDefinitions, ScenarioOption } from '@/data/scenarios';
import { FINANCE_THRESHOLD } from '@/data/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Rocket, Lightbulb, Target, Gem, TrendingUp, Book, Plus, Minus, Landmark, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const DICTIONARY_TERMS = getAllDefinitions().map((d) => ({ term: d.term, def: d.description }));

const LOGO_ICONS: Record<string, typeof Rocket> = {
    rocket: Rocket,
    bulb: Lightbulb,
    target: Target,
    gem: Gem,
    chart: TrendingUp,
};

export const GameScreen = () => {
    const {
        companyName,
        logo,
        budget,
        equity,
        currentScenarioId,
        makeDecision,
        canAfford,
        openFinance,
        isFinanceAvailable,
        hasUsedFinance,
        score,
    } = useGame();

    const [showDictionary, setShowDictionary] = useState(false);
    const [pendingOption, setPendingOption] = useState<ScenarioOption | null>(null);
    const [insufficientOption, setInsufficientOption] = useState<ScenarioOption | null>(null);

    const scenario = scenarios.find((s) => s.id === currentScenarioId);
    const LogoIcon = LOGO_ICONS[logo] || Rocket;

    const totalScenarios = scenarios.length;
    const currentIndex = scenarios.findIndex((s) => s.id === currentScenarioId);
    const progress = Math.max(5, ((currentIndex + 1) / totalScenarios) * 100);

    const formatCost = (cost: number) => {
        if (cost < 0) return `-$${Math.abs(cost).toLocaleString()}`;
        if (cost > 0) return `+$${cost.toLocaleString()}`;
        return 'Ücretsiz';
    };

    const costColor = (cost: number) => {
        if (cost < 0) return 'text-[#FF4B4B]';
        if (cost > 0) return 'text-[#58CC02]';
        return 'text-[#AFAFAF]';
    };

    const riskLabel = (risk: ScenarioOption['risk']) => {
        if (risk === 'low') return 'Düşük Risk';
        if (risk === 'medium') return 'Orta Risk';
        if (risk === 'high') return 'Yüksek Risk';
        return 'Aşırı Risk';
    };

    const riskStyle = (risk: ScenarioOption['risk']) => {
        if (risk === 'low') return 'bg-[#D7FFB8] text-[#58A700]';
        if (risk === 'medium') return 'bg-[#FFF3CC] text-[#FF9600]';
        if (risk === 'high') return 'bg-[#FFE0E0] text-[#FF4B4B]';
        return 'bg-[#FF4B4B] text-white';
    };

    const handleOptionClick = (option: ScenarioOption) => {
        if (!canAfford(option.cost)) {
            setInsufficientOption(option);
            return;
        }
        setPendingOption(option);
    };

    const confirmDecision = () => {
        if (pendingOption && canAfford(pendingOption.cost)) {
            makeDecision(pendingOption.cost, pendingOption.nextScenarioId, pendingOption.feedback);
            setPendingOption(null);
        }
    };

    if (!scenario) return <div className="text-center p-10 font-black text-[#AFAFAF]">Yükleniyor...</div>;

    return (
        <div className="flex flex-col h-screen bg-white w-full mx-auto relative">
            <header className="bg-white sticky top-0 z-10 border-b-2 border-[#E5E5E5]">
                <div className={`px-4 py-2 flex items-center justify-center gap-4 border-b-2 ${budget < FINANCE_THRESHOLD ? 'bg-[#FFF3E0] border-[#FF9600]' : 'bg-[#F0FFF0] border-[#58CC02]'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-black uppercase tracking-wide ${budget < FINANCE_THRESHOLD ? 'text-[#FF9600]' : 'text-[#58A700]'}`}>Sermaye</span>
                        <span className={`text-2xl font-black ${budget < FINANCE_THRESHOLD ? 'text-[#FF9600]' : 'text-[#58CC02]'}`}>${budget.toLocaleString()}</span>
                    </div>
                    <div className="h-6 w-px bg-[#E5E5E5]" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black uppercase tracking-wide text-[#1CB0F6]">Hisse</span>
                        <span className="text-xl font-black text-[#1CB0F6]">%{equity}</span>
                    </div>
                </div>

                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#DDF4FF] rounded-xl flex items-center justify-center text-[#1CB0F6] border-2 border-[#1CB0F6]">
                            <LogoIcon size={16} strokeWidth={2.5} />
                        </div>
                        <p className="font-black text-[#3c3c3c] text-sm">{companyName}</p>
                    </div>

                    <div className="flex-1 mx-4">
                        <div className="h-3 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                            <div className="progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="font-black text-[#FFCC00] text-sm">Puan: {score}</span>
                        {isFinanceAvailable && (
                            <button
                                type="button"
                                onClick={openFinance}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#FF9600] text-[#FF9600] hover:bg-[#FFF3E0] text-xs font-black uppercase tracking-wide transition-all animate-pulse"
                            >
                                <Landmark size={13} strokeWidth={2.5} />
                                Finans
                            </button>
                        )}
                        {hasUsedFinance && budget < FINANCE_THRESHOLD && (
                            <span className="text-xs font-black text-[#AFAFAF] uppercase">Finans kullanıldı</span>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
                <button
                    type="button"
                    onClick={() => setShowDictionary(true)}
                    className="absolute top-4 right-4 bg-white border-2 border-[#E5E5E5] p-2.5 rounded-full shadow-sm hover:border-[#1CB0F6] transition-colors z-20 text-[#1CB0F6]"
                    title="Sözlük"
                >
                    <Book size={20} />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={scenario.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="flex items-end gap-3 mb-5">
                            <Image
                                src="/unicorn.png"
                                alt="Pivot"
                                width={96}
                                height={96}
                                className="drop-shadow-md shrink-0 mb-1"
                            />
                            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl rounded-bl-sm p-4 flex-1 shadow-sm">
                                <p className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest mb-1">{scenario.phase}</p>
                                <p className="text-base md:text-lg text-[#3c3c3c] font-bold leading-relaxed">
                                    {scenario.text}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {scenario.options.map((option) => {
                                const affordable = canAfford(option.cost);
                                return (
                                    <button
                                        type="button"
                                        key={option.id}
                                        onClick={() => handleOptionClick(option)}
                                        className={`border-2 p-6 rounded-2xl text-left transition-all flex flex-col justify-between min-h-[180px] ${
                                            affordable
                                                ? 'bg-white border-[#E5E5E5] hover:border-[#1CB0F6] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0'
                                                : 'bg-[#F7F7F7] border-[#E5E5E5] opacity-70 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="mb-4">
                                            <p className={`font-black text-lg leading-snug mb-3 ${affordable ? 'text-[#3c3c3c]' : 'text-[#AFAFAF]'}`}>
                                                {option.text}
                                            </p>
                                            {option.pros && (
                                                <div className="flex items-start gap-1.5 text-sm text-[#58CC02] font-bold mb-1.5">
                                                    <Plus size={14} className="mt-0.5 shrink-0" strokeWidth={3} />
                                                    <span>{option.pros}</span>
                                                </div>
                                            )}
                                            {option.cons && (
                                                <div className="flex items-start gap-1.5 text-sm text-[#FF4B4B] font-bold">
                                                    <Minus size={14} className="mt-0.5 shrink-0" strokeWidth={3} />
                                                    <span>{option.cons}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className={`text-base font-black ${costColor(option.cost)}`}>
                                                {formatCost(option.cost)}
                                            </div>
                                            {!affordable && (
                                                <span className="text-xs font-black text-[#FF4B4B] uppercase">Yetersiz sermaye</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Insufficient funds modal */}
            <AnimatePresence>
                {insufficientOption && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 bg-black/30">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden border-2 border-[#FF4B4B]"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#FFE0E0] rounded-2xl flex items-center justify-center">
                                        <AlertCircle size={24} className="text-[#FF4B4B]" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[#FF4B4B] font-black text-lg">Yeterince paran yok!</p>
                                        <p className="text-[#AFAFAF] text-sm font-bold">Bu seçeneği karşılayamazsın</p>
                                    </div>
                                </div>
                                <p className="text-[#777] font-bold text-sm mb-2">"{insufficientOption.text}"</p>
                                <p className="text-[#3c3c3c] font-black mb-1">
                                    Gerekli: {formatCost(insufficientOption.cost)}
                                </p>
                                <p className="text-[#AFAFAF] font-bold text-sm mb-6">
                                    Mevcut sermayen: ${budget.toLocaleString()}
                                </p>
                                {budget < FINANCE_THRESHOLD && !hasUsedFinance && (
                                    <p className="text-[#FF9600] font-bold text-sm mb-4 bg-[#FFF3E0] rounded-xl p-3">
                                        Finansman seçeneğini kullanarak sermaye sağlayabilirsin — ama yalnızca bir hakkın var!
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setInsufficientOption(null)}
                                    className="btn-red w-full font-black py-3 rounded-2xl uppercase text-sm tracking-wide"
                                >
                                    Anladım
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dictionary Modal */}
            <AnimatePresence>
                {showDictionary && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border-2 border-[#E5E5E5]"
                        >
                            <div className="p-5 border-b-2 border-[#E5E5E5] flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Image src="/unicorn.png" alt="Pivot" width={32} height={32} />
                                    <h3 className="text-lg font-black text-[#3c3c3c]">Girişimcilik Sözlüğü</h3>
                                </div>
                                <button type="button" onClick={() => setShowDictionary(false)} className="text-[#AFAFAF] hover:text-[#3c3c3c] font-black text-sm uppercase tracking-wide">Kapat</button>
                            </div>
                            <div className="p-5 overflow-y-auto">
                                <div className="space-y-4">
                                    {DICTIONARY_TERMS.map((item, idx) => (
                                        <div key={idx} className="border-b-2 border-[#E5E5E5] last:border-0 pb-4 last:pb-0">
                                            <h4 className="font-black text-[#1CB0F6] mb-1">{item.term}</h4>
                                            <p className="text-[#777] text-sm font-semibold">{item.def}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-t-2 border-[#E5E5E5] text-center">
                                <button type="button" onClick={() => setShowDictionary(false)} className="btn-green font-black py-3 px-8 rounded-2xl text-sm uppercase tracking-wide">Kapat</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Sheet */}
            <AnimatePresence>
                {pendingOption && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 bg-black/20">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden border-2 border-[#E5E5E5]"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Image src="/unicorn.png" alt="Pivot" width={48} height={48} className="drop-shadow" />
                                    <div>
                                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg ${riskStyle(pendingOption.risk)}`}>
                                            {riskLabel(pendingOption.risk)}
                                        </span>
                                        <p className="text-[#3c3c3c] font-black mt-1">Bu kararı onayla?</p>
                                    </div>
                                </div>

                                <p className="text-[#777] font-bold mb-1 text-sm">"{pendingOption.text}"</p>
                                <p className={`font-black text-base mb-2 ${costColor(pendingOption.cost)}`}>
                                    Maliyet: {formatCost(pendingOption.cost)}
                                </p>
                                <p className="text-[#AFAFAF] font-bold text-sm mb-6">
                                    Karar sonrası sermaye: ${(budget + pendingOption.cost).toLocaleString()}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPendingOption(null)}
                                        className="flex-1 py-3 px-4 rounded-2xl font-black text-[#AFAFAF] border-2 border-[#E5E5E5] hover:border-[#AFAFAF] transition-colors uppercase text-sm tracking-wide"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDecision}
                                        className={`flex-1 py-3 px-4 rounded-2xl font-black text-white uppercase text-sm tracking-wide ${
                                            pendingOption.risk === 'high' || pendingOption.risk === 'extreme' ? 'btn-red' : 'btn-green'
                                        }`}
                                    >
                                        ONAYLA
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
