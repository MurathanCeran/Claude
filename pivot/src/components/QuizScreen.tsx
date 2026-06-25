'use client';

import { useGame } from '@/context/GameContext';
import { scenarios, getAllDefinitions, Definition } from '@/data/scenarios';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(definitions: Definition[]) {
    const count = Math.min(3, Math.max(2, definitions.length));
    const selected = shuffle(definitions).slice(0, count);
    const allDescriptions = getAllDefinitions().map((d) => d.description);

    return selected.map((def) => {
        const wrongPool = allDescriptions.filter((desc) => desc !== def.description);
        const wrong = shuffle(wrongPool).slice(0, 3);
        return {
            term: def.term,
            correct: def.description,
            options: shuffle([def.description, ...wrong]),
        };
    });
}

type AnswerState = 'idle' | 'correct' | 'wrong';

export const QuizScreen = () => {
    const { quizScenarioId, proceedFromQuiz, isLastScenario, ceoName } = useGame();

    const scenario = scenarios.find((s) => s.id === quizScenarioId);
    const questions = useMemo(
        () => (scenario ? buildQuestions(scenario.definitions) : []),
        [scenario]
    );

    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [answerState, setAnswerState] = useState<AnswerState>('idle');
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        setCurrent(0);
        setSelected(null);
        setAnswerState('idle');
        setCorrectCount(0);
        setDone(false);
    }, [quizScenarioId]);

    if (!scenario || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
                <button
                    type="button"
                    onClick={proceedFromQuiz}
                    className="btn-green font-black py-4 px-8 rounded-2xl text-lg uppercase tracking-wide"
                >
                    Devam Et
                </button>
            </div>
        );
    }

    const handleSelect = (option: string) => {
        if (answerState !== 'idle') return;
        setSelected(option);
        const isCorrect = option === questions[current].correct;
        setAnswerState(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setCorrectCount((c) => c + 1);

        setTimeout(() => {
            if (current + 1 >= questions.length) {
                setDone(true);
            } else {
                setCurrent((c) => c + 1);
                setSelected(null);
                setAnswerState('idle');
            }
        }, 900);
    };

    const progress = ((current + (answerState !== 'idle' ? 1 : 0)) / questions.length) * 100;

    if (done) {
        const allCorrect = correctCount === questions.length;
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex justify-center mb-6"
                    >
                        <Image src="/unicorn.png" alt="Pivot" width={120} height={120} className="drop-shadow-xl" />
                    </motion.div>

                    <h2 className="text-2xl font-black text-[#3c3c3c] mb-2">
                        {allCorrect ? 'Mükemmel!' : 'Güzel!'}
                    </h2>
                    <p className="text-[#AFAFAF] font-bold mb-6">
                        {ceoName ? `${ceoName}, ` : ''}{questions.length} kelimeden {correctCount} tanesini doğru bildin.
                    </p>

                    <div className="flex justify-center gap-3 mb-8">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < correctCount ? 'bg-[#58CC02]' : 'bg-[#FF4B4B]'}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={proceedFromQuiz}
                        className="btn-green w-full font-black py-4 rounded-2xl text-lg uppercase tracking-wide"
                    >
                        {isLastScenario ? 'Sonuçlara Git' : 'Sonraki Soru'}
                    </button>
                </motion.div>
            </div>
        );
    }

    const q = questions[current];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="px-4 py-4 border-b-2 border-[#E5E5E5]">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <span className="text-xs font-black text-[#AFAFAF] uppercase tracking-wide shrink-0">
                        {current + 1} / {questions.length}
                    </span>
                    <div className="flex-1 h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <p className="text-center text-xs font-black text-[#1CB0F6] uppercase tracking-widest mt-2">
                    {scenario.phase} — Kelime Quizi
                </p>
            </header>

            <main className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
                <div className="flex items-end gap-3 mb-8">
                    <Image src="/unicorn.png" alt="Pivot" width={80} height={80} className="drop-shadow-md shrink-0" />
                    <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl rounded-bl-sm p-4 flex-1">
                        <p className="text-xs font-black text-[#AFAFAF] uppercase tracking-wide mb-1">Doğru tanımı seç</p>
                        <p className="text-xl font-black text-[#3c3c3c]">{q.term}</p>
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
                        {q.options.map((option) => {
                            const isSelected = selected === option;
                            const isCorrect = option === q.correct;

                            let style = 'bg-white border-[#E5E5E5] text-[#3c3c3c]';
                            if (isSelected && answerState === 'correct') {
                                style = 'bg-[#D7FFB8] border-[#58CC02] text-[#3c3c3c]';
                            } else if (isSelected && answerState === 'wrong') {
                                style = 'bg-[#FFE0E0] border-[#FF4B4B] text-[#3c3c3c]';
                            } else if (!isSelected && answerState === 'wrong' && isCorrect) {
                                style = 'bg-[#D7FFB8] border-[#58CC02] text-[#3c3c3c]';
                            }

                            return (
                                <button
                                    type="button"
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    disabled={answerState !== 'idle'}
                                    className={`border-2 p-4 rounded-2xl text-left font-bold text-sm leading-snug transition-all ${style} ${answerState === 'idle' ? 'hover:border-[#1CB0F6] hover:shadow-sm active:scale-[0.99]' : ''}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
