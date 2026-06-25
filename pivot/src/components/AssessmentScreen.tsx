'use client';

import { useGame } from '@/context/GameContext';
import { ASSESSMENT_QUESTIONS, ASSESSMENT_COUNT } from '@/data/assessment';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';

type Mode = 'pre' | 'post';

/**
 * Ön-test ve son-test için ortak ekran.
 * - 'pre' modunda: anında doğru/yanlış geri bildirimi YOK (baseline ölçümü
 *   bozulmasın diye) ve açıklama gösterilmez.
 * - 'post' modunda: her sorudan sonra doğru cevap ve açıklama gösterilir
 *   (pekiştirme amaçlı).
 */
export const AssessmentScreen = ({ mode }: { mode: Mode }) => {
    const { ceoName, finishPreTest, finishPostTest } = useGame();
    const isPre = mode === 'pre';

    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    const q = ASSESSMENT_QUESTIONS[current];
    const progress = (current / ASSESSMENT_COUNT) * 100;
    const isLast = current === ASSESSMENT_COUNT - 1;

    const handleSelect = (index: number) => {
        if (selected !== null) return;
        setSelected(index);
        if (index === q.correctIndex) setCorrectCount((c) => c + 1);
        if (!isPre) {
            // Son-testte cevabı ve açıklamayı göster
            setRevealed(true);
        }
    };

    const handleNext = () => {
        const finalCorrect =
            correctCount; // doğru sayısı handleSelect içinde güncellendi

        if (isLast) {
            if (isPre) finishPreTest(finalCorrect);
            else finishPostTest(finalCorrect);
            return;
        }
        setCurrent((c) => c + 1);
        setSelected(null);
        setRevealed(false);
    };

    const canAdvance = selected !== null;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="px-4 py-4 border-b-2 border-[#E5E5E5]">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-wide shrink-0">
                        {current + 1} / {ASSESSMENT_COUNT}
                    </span>
                    <div className="flex-1 h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                    <ClipboardCheck size={13} className={isPre ? 'text-[#1CB0F6]' : 'text-[#58CC02]'} strokeWidth={2.5} />
                    <p className={`text-center text-xs font-black uppercase tracking-widest ${isPre ? 'text-[#1CB0F6]' : 'text-[#58CC02]'}`}>
                        {isPre ? 'Başlangıç Değerlendirmesi (Ön-Test)' : 'Bitiş Değerlendirmesi (Son-Test)'}
                    </p>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
                {isPre && current === 0 && (
                    <div className="bg-[#DDF4FF] border-2 border-[#1CB0F6] rounded-2xl p-4 mb-5">
                        <p className="text-sm font-bold text-[#3c3c3c] leading-relaxed">
                            {ceoName ? `${ceoName}, ` : ''}oyuna başlamadan önce kısa bir bilgi
                            ölçümü yapıyoruz. Bilmiyorsan tahmin et — önemli olan oyun sonunda ne
                            kadar geliştiğini görmek!
                        </p>
                    </div>
                )}

                <div className="flex items-end gap-3 mb-6">
                    <Image src="/unicorn.png" alt="Pivot" width={72} height={72} className="drop-shadow-md shrink-0" />
                    <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl rounded-bl-sm p-4 flex-1">
                        <p className="text-xs font-black text-[#AFAFAF] uppercase tracking-wide mb-1">{q.topic}</p>
                        <p className="text-base font-black text-[#3c3c3c] leading-snug">{q.question}</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-3"
                    >
                        {q.options.map((option, index) => {
                            const isSelected = selected === index;
                            const isCorrect = index === q.correctIndex;

                            let style = 'bg-white border-[#E5E5E5] text-[#3c3c3c]';
                            if (isPre) {
                                // Ön-testte sadece seçimi vurgula, doğruyu açıklama
                                if (isSelected) style = 'bg-[#DDF4FF] border-[#1CB0F6] text-[#3c3c3c]';
                            } else if (revealed) {
                                if (isCorrect) style = 'bg-[#D7FFB8] border-[#58CC02] text-[#3c3c3c]';
                                else if (isSelected) style = 'bg-[#FFE0E0] border-[#FF4B4B] text-[#3c3c3c]';
                            }

                            return (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => handleSelect(index)}
                                    disabled={selected !== null}
                                    className={`border-2 p-4 rounded-2xl text-left font-bold text-sm leading-snug transition-all flex items-center justify-between gap-2 ${style} ${selected === null ? 'hover:border-[#1CB0F6] hover:shadow-sm active:scale-[0.99]' : ''}`}
                                >
                                    <span>{option}</span>
                                    {!isPre && revealed && isCorrect && (
                                        <CheckCircle2 size={18} className="text-[#58CC02] shrink-0" strokeWidth={2.5} />
                                    )}
                                    {!isPre && revealed && isSelected && !isCorrect && (
                                        <XCircle size={18} className="text-[#FF4B4B] shrink-0" strokeWidth={2.5} />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Son-testte açıklama */}
                {!isPre && revealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-[#F0FFF0] border-2 border-[#58CC02] rounded-2xl p-4"
                    >
                        <p className="text-xs font-black text-[#58A700] uppercase tracking-wide mb-1">Açıklama</p>
                        <p className="text-sm font-semibold text-[#3c3c3c] leading-relaxed">{q.explanation}</p>
                    </motion.div>
                )}

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canAdvance}
                    className={`mt-6 w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide ${
                        canAdvance ? (isPre ? 'btn-blue' : 'btn-green') : 'btn-disabled'
                    }`}
                >
                    {isLast
                        ? isPre
                            ? 'Oyuna Başla'
                            : 'Sonuçları Gör'
                        : isPre
                            ? 'Sonraki'
                            : 'Devam Et'}
                </button>

                {isPre && (
                    <p className="text-center text-xs font-semibold text-[#AFAFAF] mt-3">
                        Cevabını seçince devam edebilirsin. Doğrular oyun sonunda ölçülecek.
                    </p>
                )}
            </main>
        </div>
    );
};
