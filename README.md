# chimera-benchmark-decoy-nav

This repository is a minimal external Chimera benchmark for the **decoy-navigation** weakness category.

- It is a **safe synthetic benchmark** repository.
- It targets whether models stay on the correct task path when distractors/decoys are present.
- **Current status:** first deterministic benchmark content is implemented (no runner/harness yet).

## Included now

- `benchmark.manifest.json` (root manifest aligned to current Chimera Core contract)
- TypeScript package scaffold (`package.json`, `tsconfig.json`)
- Benchmark data/types/scoring exports (`src/index.ts`)
- Persistent handoff notes (`docs/roo-handoff.md`)

## Runtime contract (minimal)

This repo now exposes a minimal static runtime surface for Chimera Core manual execution:

- `cases`: deterministic plain objects with runtime fields (`id`, `levelId`, `title`, `prompt`, optional `metadata`)
- plain text answer scoring via `scoreAnswer(caseId, answerText)`
- score result shape: `correct`, `score`, `expectedAnswer`, `message`
- top-level runtime module export: `runtimeBenchmark` (with `manifest`, `cases`, `scoreAnswer`)

## Manifest identity (current)

- `id`: `decoy-nav`
- `name`: `Decoy Navigation`
- `owner`: `chimera-labs`
- `supportedModes`: `single-turn`, `multi-turn`

## Current levels

- `shallow-decoy` (`Shallow Decoy`)
- `medium-decoy` (`Medium Decoy`)
- `deep-decoy` (`Deep Decoy`)

Manifest `levels` now uses object entries (`id` + `name`) while benchmark cases remain the same.

Each level currently has one deterministic synthetic case.

## How decoy-nav is modeled

Each case is a plain TypeScript object that includes:

- a visible task objective
- a set of instructions containing both true and decoy paths
- one explicit correct path
- one expected final answer

The progression from shallow → medium → deep increases distractor complexity by adding more conflicting and nested decoy instructions.

## Current scoring scope

Scoring is intentionally simple for this step:

- plain-text final-answer based
- deterministic
- exact match after trimming surrounding whitespace

No advanced rubric, harness, randomization, or runner logic is included yet.
