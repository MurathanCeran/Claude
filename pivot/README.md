# Pivot - Finansal Okuryazarlık Oyunu (Entrepreneurship Simulation)

Pivot is an interactive scenario-based financial-literacy game built with Next.js.
Players found a startup, name their CEO, make high-impact business decisions, manage budget and equity pressure, survive random market events, and navigate multiple outcomes such as a successful exit, bankruptcy, or finishing the journey with a downloadable certificate.

Unlike a plain game, Pivot **measures learning**: a pre-test runs before play and a post-test after, and the app reports the **normalized learning gain (Hake gain)** — making it a measurable educational intervention suitable for a TÜBİTAK research project.

> Rekabet analizi ve özgünlük raporu için bkz. [`docs/REKABET-ANALIZI.md`](docs/REKABET-ANALIZI.md).

## Features

- Multi-screen game flow: Landing → Onboarding → **Pre-Test** → Story → Gameplay → (Market Event) → Tips → Quiz → … → **Post-Test** → Result
- **Pre-test / post-test learning measurement** with normalized Hake gain `g = (post% − pre%) / (100% − pre%)`
- **Random market events** (inflation, FX shock, viral growth, regulation, churn…) that add uncertainty and teach risk/cash-buffer management
- **Persistence (localStorage)**: best score, play count, leaderboard, and research records survive refresh
- Branching startup scenarios with decision consequences
- Budget, equity, score, and decision history tracking
- Funding system: raise capital when cash runs low by choosing between a bank loan, angel investor, crowdfunding, or a government grant — each with its own trade-offs
- Long-term funding consequences: recurring interest/operating costs and one-time audit fees that hit your budget as you keep playing
- Equity dilution that reduces your share of exit proceeds when you take investment
- Per-decision quiz checkpoints to reinforce business concepts
- Bankruptcy fail state when cash reaches zero
- Personalized completion certificate, downloadable as a PDF

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- html2canvas + jsPDF (certificate export)

## Project Structure

- `src/app`: App entry (`page.tsx` screen router), layout, providers, and global styles
- `src/components`: Game screens (`LandingPage`, `Onboarding`, `StoryScreen`, `GameScreen`, `TipsScreen`, `QuizScreen`, `FinanceIntroScreen`, `FinanceScreen`, `ResultScreen`, `BankruptScreen`, `CertificatePreview`)
- `src/context/GameContext.tsx`: Central game state, progression, and finance logic
- `src/data/scenarios.ts`: Scenario tree, options, costs, and educational info
- `src/data/finance.ts`: Funding options, equity costs, and long-term cost rules
- `src/lib/downloadCertificate.ts`: Renders the certificate element to a downloadable PDF
- `public`: Static assets

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run the app

```bash
npm run dev
```

If your environment has host/network interface issues, run:

```bash
npm run dev -- --hostname 127.0.0.1
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Core Gameplay Logic

- Initial budget starts at `$50,000` with `100%` equity
- Every decision changes budget and score, and is recorded in history
- When budget drops below the funding threshold (`$10,000`), a one-time funding round becomes available
- Funding options add cash but carry consequences: equity dilution (angel), recurring costs (bank loan, crowdfunding), or a one-time fee (government grant)
- Taking equity-based funding reduces your share of exit proceeds — investors take their cut on exit
- Reaching an `END` scenario (exit) leads to the quiz, then the `FINISHED` result screen
- If budget reaches `0` or below at any point, the game switches to the `BANKRUPT` screen
- The result screen issues a personalized certificate that can be downloaded as a PDF
- `resetGame()` resets all progression and returns the user to `LANDING`

## Notes

- Scenario and finance content is currently authored in Turkish in `src/data/scenarios.ts` and `src/data/finance.ts`
- The game can be expanded by adding more scenario nodes, funding options, and screen-level UX polish

## License

This project is currently private and has no explicit license file.
