'use client';

import { useGame } from '@/context/GameContext';
import { LandingPage } from '@/components/LandingPage';
import { Onboarding } from '@/components/Onboarding';
import { StoryScreen } from '@/components/StoryScreen';
import { GameScreen } from '@/components/GameScreen';
import { ResultScreen } from '@/components/ResultScreen';
import { TipsScreen } from '@/components/TipsScreen';
import { BankruptScreen } from '@/components/BankruptScreen';
import { QuizScreen } from '@/components/QuizScreen';
import { FinanceIntroScreen } from '@/components/FinanceIntroScreen';
import { FinanceScreen } from '@/components/FinanceScreen';
import { AssessmentScreen } from '@/components/AssessmentScreen';
import { EventScreen } from '@/components/EventScreen';
import { SoundToggle } from '@/components/SoundToggle';

export default function Home() {
  const { gameStatus } = useGame();

  return (
    <>
      <SoundToggle />
      {renderScreen(gameStatus)}
    </>
  );
}

function renderScreen(gameStatus: string) {
  switch (gameStatus) {
    case 'LANDING':
      return <LandingPage />;
    case 'ONBOARDING':
      return <Onboarding />;
    case 'PRETEST':
      return <AssessmentScreen mode="pre" />;
    case 'STORY':
      return <StoryScreen />;
    case 'PLAYING':
      return <GameScreen />;
    case 'TIPS':
      return <TipsScreen />;
    case 'QUIZ':
      return <QuizScreen />;
    case 'EVENT':
      return <EventScreen />;
    case 'FINANCE_INTRO':
      return <FinanceIntroScreen />;
    case 'FINANCE':
      return <FinanceScreen />;
    case 'POSTTEST':
      return <AssessmentScreen mode="post" />;
    case 'FINISHED':
      return <ResultScreen />;
    case 'BANKRUPT':
      return <BankruptScreen />;
    default:
      return <LandingPage />;
  }
}
