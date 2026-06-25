'use client';

import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

export const StoryScreen = () => {
    const { ceoName, companyName, setGameStatus } = useGame();
    const [step, setStep] = useState(0);

    const slides = [
        {
            text: `Merhaba ${ceoName}! Ben Pivot.\n\nSenin girişimcilik yolculuğunda rehberin olacağım.`,
        },
        {
            text: `Bana neden "Unicorn" dediklerini merak ediyorsun, değil mi?\n\nGirişim dünyasında değeri 1 milyar doları aşan şirketlere "Unicorn" deniyor. Çünkü eskiden bu kadar değerli bir şirket kurmak, gerçekten bir tek boynuzlu at kadar nadir ve efsanevi görünüyordu.`,
        },
        {
            text: `Bugün ${companyName} ile o efsaneyi yazmaya başlıyoruz.\n\nAnca dikkat et — her büyük girişim, bir noktada yön değiştirmek zorunda kalmıştır. Buna "Pivot" diyoruz. Ben de adımı oradan aldım!`,
        },
        {
            text: `Sana 50.000$ melek yatırımı yapıldı, ${ceoName}.\n\nHer kararın bu parayı eritebilir — ya da katlayabilir. Yanlış seçimler seni iflasa sürükler. Doğru seçimler seni Unicorn yapar.\n\nHazır mısın?`,
        },
    ];

    const isLast = step === slides.length - 1;

    const lines = slides[step].text.split('\n').filter(Boolean);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <div className="w-full max-w-md flex flex-col items-center">

                {/* Unicorn */}
                <motion.div
                    key={`unicorn-${step}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                    className="mb-6"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Image
                            src="/unicorn.png"
                            alt="Pivot"
                            width={160}
                            height={160}
                            className="drop-shadow-xl"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* Speech bubble */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35 }}
                        className="w-full bg-white border-2 border-[#E5E5E5] rounded-3xl rounded-tl-sm p-5 shadow-sm mb-6 min-h-[120px]"
                    >
                        {lines.map((line, i) => (
                            <p
                                key={i}
                                className={`text-[#3c3c3c] font-bold leading-relaxed ${i > 0 ? 'mt-3' : ''} ${i === 0 ? 'text-lg' : 'text-base'}`}
                            >
                                {line}
                            </p>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-2 mb-6">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-300 ${
                                i === step
                                    ? 'w-6 h-3 bg-[#58CC02]'
                                    : i < step
                                    ? 'w-3 h-3 bg-[#58CC02] opacity-40'
                                    : 'w-3 h-3 bg-[#E5E5E5]'
                            }`}
                        />
                    ))}
                </div>

                {/* Button */}
                <button
                    type="button"
                    onClick={() => {
                        if (isLast) {
                            setGameStatus('PLAYING');
                        } else {
                            setStep(s => s + 1);
                        }
                    }}
                    className="btn-green w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide"
                >
                    {isLast ? `Haydi ${ceoName}!` : 'Devam Et'}
                </button>

                {/* Skip */}
                {!isLast && (
                    <button
                        type="button"
                        onClick={() => setGameStatus('PLAYING')}
                        className="mt-3 text-[#AFAFAF] text-sm font-black uppercase tracking-wide hover:text-[#3c3c3c] transition-colors"
                    >
                        Atla
                    </button>
                )}
            </div>
        </div>
    );
};
