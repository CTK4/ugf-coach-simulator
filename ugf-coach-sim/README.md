# UGF Coach Sim (Mobile-first)

A mobile-first Next.js app implementing the core playable loop for your UGF head coach + front office simulator.

## What’s implemented in this export

### Playable right now
- **Week Hub** (Mon–Sat timeline) with always-visible context chips (record, opponent, media tone, locker room mood).
- **Film Room UI** + **Monday film tasks** wired from Week Hub Monday.
- **Game Day**: **Play selection (alias → expand)** → **Run Snap** → collision/grade stub → **Film log** entry.
- **Front Office Hub** with tabs: Roster Moves, Free Agency (scaffold), Cap & Contracts (contract rows + actions scaffold), Trade Center (anti-cheese state surfaced).
- **USNN** wire (no ESPN references).

### Systems wired at engine level (initial implementation)
- Install Load → injury risk (PLS/tolerance model).
- Media narratives (momentum/state) affecting tone and owner patience.
- Ownership patience + spending tolerance.
- Relocation threats (market pressure → threat level → USNN leak).
- Difficulty scaling (multi-axis: opponent IQ, staff friction, media volatility, owner patience, player psychology) as tunable multipliers.
- Age regression model core (implemented in `/lib/sim.ts` as `agingTick`; ready to be called in offseason advances).

### UGF canonical structure
- Full 32-team league with conferences/divisions and **ownership archetype assignments** in `/lib/ugf.ts`.

## Run locally (or on Replit)

```bash
npm install
npm run dev
```

### Initialize a fresh save
This app persists state in `data/state.json`.

```bash
curl -X POST http://localhost:3000/api/init
```

Then open: `http://localhost:3000`

## GitHub export
This folder is ready to commit as-is.

```bash
git init
git add .
git commit -m "Initial UGF Coach Sim scaffold"
git remote add origin <your repo>
git push -u origin main
```

## Next build targets (already designed, not yet coded in this scaffold)
- Full Free Agency market + offer builder + tampering outcomes.
- Trade Center negotiation UI + deadline psychology + agent wars.
- Draft module: RAS live combine, workouts/interviews, GM biases, legend rarity tiers and board reactions.
- Special teams as first-class (unit assignments + fatigue/discipline + coaching impact).
- Full contracts negotiation flows (promises, agents, and fallout).
