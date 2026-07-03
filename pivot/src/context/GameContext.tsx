'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FINANCE_OPTIONS, FINANCE_THRESHOLD, FinanceId } from '../data/finance';
import { MarketEvent, rollMarketEvent, eventDelta } from '../data/events';

type GameStatus =
    | 'LANDING'
    | 'ONBOARDING'
    | 'PRETEST'
    | 'STORY'
    | 'PLAYING'
    | 'TIPS'
    | 'QUIZ'
    | 'EVENT'
    | 'FINANCE_INTRO'
    | 'FINANCE'
    | 'POSTTEST'
    | 'FINISHED'
    | 'BANKRUPT';

type GameState = {
    companyName: string;
    ceoName: string;
    logo: string;
    budget: number;
    equity: number;
    currentScenarioId: number;
    quizScenarioId: number | null;
    history: string[];
    score: number;
    hasUsedFinance: boolean;
    gameStatus: GameStatus;
    isLastScenario: boolean;
    canAfford: (cost: number) => boolean;
    isFinanceAvailable: boolean;
    pendingEvent: MarketEvent | null;
    eventCount: number;
    preTestCorrect: number | null;
    postTestCorrect: number | null;
    lastPointsEarned: number;
    scoreEventId: number;
    setCompanyName: (name: string) => void;
    setCeoName: (name: string) => void;
    setLogo: (logo: string) => void;
    makeDecision: (cost: number, nextId: number | null, feedback: string) => void;
    openFinance: () => void;
    proceedToFinanceSelection: () => void;
    applyFinance: (financeId: FinanceId) => void;
    proceedToQuiz: () => void;
    proceedFromQuiz: () => void;
    applyEventAndContinue: () => void;
    finishPreTest: (correct: number) => void;
    finishPostTest: (correct: number) => void;
    setGameStatus: (status: GameStatus) => void;
    resetGame: () => void;
};

const GameContext = createContext<GameState | undefined>(undefined);

const INITIAL_BUDGET = 50000;

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [companyName, setCompanyName] = useState('');
    const [ceoName, setCeoName] = useState('');
    const [logo, setLogo] = useState('rocket');
    const [budget, setBudget] = useState(INITIAL_BUDGET);
    const [equity, setEquity] = useState(100);
    const [currentScenarioId, setCurrentScenarioId] = useState(1);
    const [quizScenarioId, setQuizScenarioId] = useState<number | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [hasUsedFinance, setHasUsedFinance] = useState(false);
    const [financeType, setFinanceType] = useState<FinanceId | null>(null);
    const [decisionCount, setDecisionCount] = useState(0);
    const [grantFeeApplied, setGrantFeeApplied] = useState(false);
    const [gameStatus, setGameStatus] = useState<GameStatus>('LANDING');
    const [pendingNextId, setPendingNextId] = useState<number | null>(null);
    const [isLastScenario, setIsLastScenario] = useState(false);
    const [pendingEvent, setPendingEvent] = useState<MarketEvent | null>(null);
    const [eventCount, setEventCount] = useState(0);
    const [preTestCorrect, setPreTestCorrect] = useState<number | null>(null);
    const [postTestCorrect, setPostTestCorrect] = useState<number | null>(null);
    const [lastPointsEarned, setLastPointsEarned] = useState(0);
    const [scoreEventId, setScoreEventId] = useState(0);

    const canAfford = (cost: number) => budget + cost >= 0;

    const isFinanceAvailable =
        budget < FINANCE_THRESHOLD && !hasUsedFinance && gameStatus === 'PLAYING';

    const applyLongTermCosts = (newDecisionCount: number, currentBudget: number): number => {
        if (!financeType) return currentBudget;

        const option = FINANCE_OPTIONS.find((o) => o.id === financeType);
        if (!option) return currentBudget;

        let updated = currentBudget;

        if (option.recurring && newDecisionCount > 0 && newDecisionCount % option.recurring.every === 0) {
            updated += option.recurring.amount;
            setHistory((prev) => [...prev, `${option.recurring!.label}: ${formatMoney(option.recurring!.amount)}`]);
        }

        if (
            option.oneTime &&
            !grantFeeApplied &&
            newDecisionCount >= option.oneTime.afterDecisions
        ) {
            updated += option.oneTime.amount;
            setGrantFeeApplied(true);
            setHistory((prev) => [...prev, `${option.oneTime!.label}: ${formatMoney(option.oneTime!.amount)}`]);
        }

        return updated;
    };

    const makeDecision = (cost: number, nextId: number | null, feedback: string) => {
        if (!canAfford(cost)) return;

        const isExit = nextId === null;
        const effectiveCost = isExit && cost > 0 ? Math.round(cost * (equity / 100)) : cost;

        let newBudget = budget + effectiveCost;
        const newDecisionCount = decisionCount + 1;

        if (isExit && cost > 0 && equity < 100) {
            const investorShare = cost - effectiveCost;
            setHistory((prev) => [
                ...prev,
                feedback,
                `Exit geliri: $${cost.toLocaleString()} — Senin payın (%${equity}): $${effectiveCost.toLocaleString()}. Yatırımcı payı: $${investorShare.toLocaleString()}.`,
            ]);
        } else {
            setHistory((prev) => [...prev, feedback]);
        }

        const pointsEarned = 100 + (effectiveCost > 0 ? 500 : 0);
        setBudget(newBudget);
        setDecisionCount(newDecisionCount);
        setScore((prev) => prev + pointsEarned);
        setLastPointsEarned(pointsEarned);
        setScoreEventId((id) => id + 1);
        setQuizScenarioId(currentScenarioId);

        newBudget = applyLongTermCosts(newDecisionCount, newBudget);
        setBudget(newBudget);

        if (newBudget <= 0) {
            setGameStatus('BANKRUPT');
            return;
        }

        setPendingNextId(nextId);
        setIsLastScenario(nextId === null);
        setGameStatus('TIPS');
    };

    const openFinance = () => {
        if (!isFinanceAvailable) return;
        setGameStatus('FINANCE_INTRO');
    };

    const proceedToFinanceSelection = () => {
        setGameStatus('FINANCE');
    };

    const applyFinance = (financeId: FinanceId) => {
        const option = FINANCE_OPTIONS.find((o) => o.id === financeId);
        if (!option || hasUsedFinance) return;

        setBudget((prev) => prev + option.amount);
        setEquity((prev) => Math.max(0, prev - option.equityCost));
        setFinanceType(financeId);
        setHasUsedFinance(true);
        setHistory((prev) => [
            ...prev,
            `${option.name} seçildi: +$${option.amount.toLocaleString()}${option.equityCost > 0 ? `, hisse -%${option.equityCost}` : ''}.`,
        ]);
        setGameStatus('PLAYING');
    };

    const proceedToQuiz = () => {
        setGameStatus('QUIZ');
    };

    const proceedFromQuiz = () => {
        if (isLastScenario || pendingNextId === null) {
            // Oyun bitti — son-teste geç (ölçüm), oradan sonuç ekranına.
            setGameStatus('POSTTEST');
            setPendingNextId(null);
            setQuizScenarioId(null);
            setIsLastScenario(false);
            return;
        }

        setCurrentScenarioId(pendingNextId);
        setPendingNextId(null);
        setQuizScenarioId(null);
        setIsLastScenario(false);

        // Bir sonraki senaryoya geçmeden önce rastgele bir piyasa olayı tetiklenebilir.
        const event = rollMarketEvent();
        if (event) {
            setPendingEvent(event);
            setGameStatus('EVENT');
        } else {
            setGameStatus('PLAYING');
        }
    };

    const applyEventAndContinue = () => {
        if (!pendingEvent) {
            setGameStatus('PLAYING');
            return;
        }

        const delta = eventDelta(pendingEvent, budget);
        const newBudget = budget + delta;
        setBudget(newBudget);
        setEventCount((c) => c + 1);
        setHistory((prev) => [
            ...prev,
            `Piyasa olayı — ${pendingEvent.title}: ${formatMoney(delta)}`,
        ]);
        setPendingEvent(null);

        if (newBudget <= 0) {
            setGameStatus('BANKRUPT');
        } else {
            setGameStatus('PLAYING');
        }
    };

    const finishPreTest = (correct: number) => {
        setPreTestCorrect(correct);
        setGameStatus('STORY');
    };

    const finishPostTest = (correct: number) => {
        setPostTestCorrect(correct);
        setGameStatus('FINISHED');
    };

    const resetGame = () => {
        setCompanyName('');
        setCeoName('');
        setLogo('rocket');
        setBudget(INITIAL_BUDGET);
        setEquity(100);
        setCurrentScenarioId(1);
        setQuizScenarioId(null);
        setHistory([]);
        setScore(0);
        setHasUsedFinance(false);
        setFinanceType(null);
        setDecisionCount(0);
        setGrantFeeApplied(false);
        setPendingNextId(null);
        setIsLastScenario(false);
        setPendingEvent(null);
        setEventCount(0);
        setPreTestCorrect(null);
        setPostTestCorrect(null);
        setLastPointsEarned(0);
        setScoreEventId(0);
        setGameStatus('LANDING');
    };

    return (
        <GameContext.Provider
            value={{
                companyName,
                ceoName,
                logo,
                budget,
                equity,
                currentScenarioId,
                quizScenarioId,
                history,
                score,
                hasUsedFinance,
                gameStatus,
                isLastScenario,
                canAfford,
                isFinanceAvailable,
                pendingEvent,
                eventCount,
                preTestCorrect,
                postTestCorrect,
                lastPointsEarned,
                scoreEventId,
                setCompanyName: (name) => {
                    setCompanyName(name);
                    // Oyundan ÖNCE ön-test (baseline ölçüm).
                    setGameStatus('PRETEST');
                },
                setCeoName,
                setLogo,
                makeDecision,
                openFinance,
                proceedToFinanceSelection,
                applyFinance,
                proceedToQuiz,
                proceedFromQuiz,
                applyEventAndContinue,
                finishPreTest,
                finishPostTest,
                setGameStatus,
                resetGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

function formatMoney(amount: number): string {
    if (amount >= 0) return `+$${amount.toLocaleString()}`;
    return `-$${Math.abs(amount).toLocaleString()}`;
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
