'use client';

import { useGame } from '@/context/GameContext';
import { CertificatePreview } from '@/components/CertificatePreview';
import { downloadCertificatePdf } from '@/lib/downloadCertificate';
import { Confetti } from '@/components/Confetti';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RotateCcw, CheckCircle2, TrendingUp, Trophy } from 'lucide-react';
import { toPercent, normalizedGain, gainLevel, ASSESSMENT_COUNT } from '@/data/assessment';
import { saveRun, topRuns, GameRun, loadUnlockedBadges, unlockBadges } from '@/lib/storage';
import { BADGES, computeEarnedBadgeIds } from '@/data/badges';
import { playFanfare } from '@/lib/sounds';

function ScoreGauge({ score, maxScore }: { score: number; maxScore: number }) {
    const pct = Math.min(100, Math.round((score / maxScore) * 100));
    const rotation = -90 + (pct / 100) * 180;

    return (
        <div className="relative w-36 h-20 mx-auto">
            <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 w-36 h-36 rounded-full border-[10px] border-[#E5E5E5] border-b-0 border-l-0 border-r-0 box-border" />
                <div
                    className="absolute inset-x-0 bottom-0 w-36 h-36 rounded-full border-[10px] border-[#58CC02] border-b-0 border-l-0 border-r-0 box-border origin-bottom transition-transform duration-700"
                    style={{ transform: `rotate(${rotation}deg)` }}
                />
            </div>
            <div className="absolute inset-x-0 bottom-0 text-center">
                <span className="text-4xl font-black text-[#3c3c3c]">{score}</span>
            </div>
        </div>
    );
}

function getSuccessLevel(score: number, budget: number, equity: number) {
    const total = score + budget / 1000 + equity;
    if (total >= 8000) return { label: 'Unicorn Adayı', desc: 'Stratejik kararlar, güçlü sermaye yönetimi ve yüksek hisse payı.' };
    if (total >= 5000) return { label: 'Başarılı Girişimci', desc: 'Simülasyonu dengeli kararlarla tamamladın ve değer yarattın.' };
    if (total >= 2500) return { label: 'Gelişen Kurucu', desc: 'Temel girişimcilik becerilerini uyguladın, gelişim alanların var.' };
    return { label: 'Öğrenme Yolculuğu', desc: 'Zorlu kararlar seni denedi; deneyim kazandın ve tekrar deneyebilirsin.' };
}

export const ResultScreen = () => {
    const { companyName, ceoName, budget, equity, score, history, resetGame, preTestCorrect, postTestCorrect, hasUsedFinance, eventCount } = useGame();
    const [downloading, setDownloading] = useState(false);
    const [confettiTrigger, setConfettiTrigger] = useState(0);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

    const prePercent = preTestCorrect !== null ? toPercent(preTestCorrect) : null;
    const postPercent = postTestCorrect !== null ? toPercent(postTestCorrect) : null;
    const gain =
        prePercent !== null && postPercent !== null
            ? normalizedGain(prePercent, postPercent)
            : null;
    const success = useMemo(() => getSuccessLevel(score, budget, equity), [score, budget, equity]);

    // Oyunu kalıcı kayda yaz (bir kez), skor tablosunu ve rozetleri hazırla.
    const savedRef = useRef(false);
    const [leaderboard, setLeaderboard] = useState<GameRun[]>([]);
    useEffect(() => {
        if (savedRef.current) return;
        savedRef.current = true;
        const runs = saveRun({
            ceoName,
            companyName,
            score,
            budget,
            equity,
            outcome: 'FINISHED',
            decisions: history.length,
            preTestPercent: prePercent,
            postTestPercent: postPercent,
            learningGain: gain,
            date: new Date().toISOString(),
        });
        setLeaderboard(topRuns(5));

        const earnedIds = computeEarnedBadgeIds({
            outcome: 'FINISHED',
            successLabel: success.label,
            budget,
            hasUsedFinance,
            postTestCorrect,
            postTestTotal: ASSESSMENT_COUNT,
            learningGain: gain,
            hadMarketEvent: eventCount > 0,
            totalPlays: runs.length,
        });
        const fresh = unlockBadges(earnedIds);
        setNewlyUnlocked(fresh);
        setUnlockedIds(loadUnlockedBadges());

        setConfettiTrigger(Date.now());
        playFanfare();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const maxScore = useMemo(() => Math.max(5000, Math.ceil(score / 500) * 500), [score]);
    const completedAt = useMemo(
        () => new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        []
    );
    const certificateId = useMemo(
        () => `PIVOT-${ceoName.slice(0, 3).toUpperCase()}${Date.now().toString(36).slice(-6).toUpperCase()}`,
        [ceoName]
    );

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const safeName = ceoName.replace(/\s+/g, '-').toLowerCase();
            await downloadCertificatePdf('pivot-certificate', `pivot-sertifika-${safeName}.pdf`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
            <Confetti trigger={confettiTrigger} />
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-6"
            >
                {/* Duolingo-style header card */}
                <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#F0FFF0] border-2 border-[#58CC02] flex items-center justify-center shrink-0">
                                <Image src="/unicorn.png" alt="Pivot" width={48} height={48} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-[#3c3c3c]">{ceoName}</h1>
                                <p className="text-sm font-bold text-[#777]">{companyName}</p>
                                <p className="text-xs font-semibold text-[#AFAFAF] mt-1">Tamamlanma: {completedAt}</p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs font-black uppercase tracking-wider text-[#AFAFAF]">Sertifika ID</p>
                            <p className="text-sm font-bold text-[#1CB0F6]">{certificateId}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 items-center border-t-2 border-[#F0F0F0] pt-6">
                        <ScoreGauge score={score} maxScore={maxScore} />
                        <div>
                            <p className="text-lg font-black text-[#3c3c3c] mb-2">{success.label}</p>
                            <ul className="space-y-2">
                                {[success.desc, `${history.length} stratejik karar verdin.`, `Final sermaye: $${budget.toLocaleString()}.`].map((line) => (
                                    <li key={line} className="flex items-start gap-2 text-sm font-semibold text-[#777]">
                                        <CheckCircle2 size={16} className="text-[#58CC02] shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Subscores */}
                <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-[#AFAFAF] mb-4">Performans Özeti</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Puan', value: score.toLocaleString() },
                            { label: 'Sermaye', value: `$${budget.toLocaleString()}` },
                            { label: 'Hisse Payı', value: `%${equity}` },
                            { label: 'Karar Sayısı', value: history.length.toString() },
                        ].map((item) => (
                            <div key={item.label} className="text-center bg-[#FAFAFA] rounded-xl border-2 border-[#E5E5E5] py-4 px-2">
                                <p className="text-xs font-black uppercase tracking-wider text-[#AFAFAF] mb-1">{item.label}</p>
                                <p className="text-2xl font-black text-[#3c3c3c]">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Öğrenme Kazanımı (ön-test → son-test) */}
                {prePercent !== null && postPercent !== null && gain !== null && (
                    <div className="bg-white rounded-2xl border-2 border-[#58CC02] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-[#58CC02]" strokeWidth={2.5} />
                            <p className="text-xs font-black uppercase tracking-widest text-[#58A700]">Öğrenme Kazanımı</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center bg-[#FAFAFA] rounded-xl border-2 border-[#E5E5E5] py-4">
                                <p className="text-xs font-black uppercase tracking-wide text-[#AFAFAF] mb-1">Ön-Test</p>
                                <p className="text-2xl font-black text-[#1CB0F6]">%{prePercent}</p>
                            </div>
                            <div className="text-center bg-[#FAFAFA] rounded-xl border-2 border-[#E5E5E5] py-4">
                                <p className="text-xs font-black uppercase tracking-wide text-[#AFAFAF] mb-1">Son-Test</p>
                                <p className="text-2xl font-black text-[#58CC02]">%{postPercent}</p>
                            </div>
                            <div className="text-center bg-[#F0FFF0] rounded-xl border-2 border-[#58CC02] py-4">
                                <p className="text-xs font-black uppercase tracking-wide text-[#58A700] mb-1">Kazanç</p>
                                <p className={`text-2xl font-black ${postPercent - prePercent >= 0 ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                                    {postPercent - prePercent >= 0 ? '+' : ''}{postPercent - prePercent}p
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#F0FFF0] rounded-xl p-4">
                            <p className="text-sm font-black text-[#3c3c3c] mb-1">
                                {gainLevel(gain).label}
                                <span className="text-[#58A700] font-bold"> · Normalize kazanç (g) = {gain.toFixed(2)}</span>
                            </p>
                            <p className="text-sm font-semibold text-[#777] leading-relaxed">{gainLevel(gain).desc}</p>
                        </div>
                    </div>
                )}

                {/* Rozetler */}
                <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🏅</span>
                        <p className="text-xs font-black uppercase tracking-widest text-[#AFAFAF]">Rozet Koleksiyonu</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {BADGES.map((badge) => {
                            const earned = unlockedIds.includes(badge.id);
                            const isNew = newlyUnlocked.includes(badge.id);
                            return (
                                <motion.div
                                    key={badge.id}
                                    initial={isNew ? { scale: 0.7, opacity: 0 } : false}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                    title={badge.desc}
                                    className={`relative text-center rounded-xl border-2 py-4 px-2 ${
                                        earned
                                            ? 'bg-[#FFF8E7] border-[#FFCC00]'
                                            : 'bg-[#FAFAFA] border-[#E5E5E5] opacity-40 grayscale'
                                    }`}
                                >
                                    {isNew && (
                                        <span className="absolute -top-2 -right-2 bg-[#FF4B4B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                            Yeni
                                        </span>
                                    )}
                                    <div className="text-2xl mb-1">{badge.emoji}</div>
                                    <p className="text-xs font-black text-[#3c3c3c] leading-tight">{badge.title}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Skor Tablosu */}
                {leaderboard.length > 0 && (
                    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy size={18} className="text-[#FFCC00]" strokeWidth={2.5} />
                            <p className="text-xs font-black uppercase tracking-widest text-[#AFAFAF]">En İyi Oyunlar</p>
                        </div>
                        <div className="space-y-2">
                            {leaderboard.map((run, i) => (
                                <div key={i} className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl border-2 border-[#E5E5E5] p-3">
                                    <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-[#FFCC00] text-white' : 'bg-[#E5E5E5] text-[#777]'}`}>{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-[#3c3c3c] truncate">{run.ceoName || 'Anonim'} — {run.companyName || '—'}</p>
                                        <p className="text-xs font-semibold text-[#AFAFAF]">
                                            {run.outcome === 'FINISHED' ? 'Tamamladı' : 'İflas'}
                                            {run.learningGain !== null ? ` · kazanç g=${run.learningGain.toFixed(2)}` : ''}
                                        </p>
                                    </div>
                                    <span className="font-black text-sm text-[#1CB0F6] shrink-0">{run.score.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certificate */}
                <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[#AFAFAF] mb-1">Başarı Sertifikası</p>
                            <h2 className="text-lg font-black text-[#3c3c3c]">Pivot Girişimcilik Sertifikası</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#5C1A1A] text-white font-black text-sm uppercase tracking-wide hover:bg-[#4a1414] transition-colors disabled:opacity-60"
                        >
                            <Download size={16} strokeWidth={2.5} />
                            {downloading ? 'Hazırlanıyor...' : 'PDF İndir'}
                        </button>
                    </div>

                    <div className="rounded-xl border-2 border-[#E5E5E5] overflow-hidden bg-[#F8F4EB] [container-type:inline-size]">
                        <CertificatePreview ceoName={ceoName} />
                    </div>
                    <p className="text-xs font-semibold text-[#AFAFAF] mt-3 text-center">
                        Sertifikada adın otomatik olarak yer alır.
                    </p>
                </div>

                {/* Feedback history */}
                <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-[#AFAFAF] mb-4">Karar Geçmişi</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {history.map((item, i) => (
                            <div key={i} className="flex gap-2 text-sm text-[#777] bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5] font-semibold">
                                <span className="text-[#1CB0F6] font-black shrink-0">{i + 1}.</span>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={resetGame}
                    className="w-full inline-flex items-center justify-center gap-2 btn-green font-black py-4 rounded-2xl text-lg uppercase tracking-wide"
                >
                    <RotateCcw size={18} strokeWidth={2.5} />
                    Tekrar Oyna
                </button>
            </motion.div>
        </div>
    );
};
