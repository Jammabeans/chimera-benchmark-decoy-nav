# chimera-benchmark-decoy-nav

This repository is a minimal external Chimera benchmark for the **decoy-navigation** weakness category.

- It is a **safe synthetic benchmark** repository.
- It targets whether models stay on the correct task path when distractors/decoys are present.
- **Current status:** deterministic benchmark content plus a local benchmark CLI (`describe`, `generate`, `score`).

## Included now

- `benchmark.manifest.json` (root manifest aligned to current Chimera Core contract)
- `runtime-benchmark.json` (root static runtime benchmark artifact for Chimera Core manual execution)
- TypeScript package scaffold (`package.json`, `tsconfig.json`)
- Benchmark data/types/scoring exports (`src/index.ts`)
- Benchmark CLI entrypoint (`src/chimera-cli.ts` → `dist/chimera-cli.js`)
- Persistent handoff notes (`docs/roo-handoff.md`)

## Local benchmark CLI (shared contract)

This benchmark repo exposes a local CLI aligned to the Chimera benchmark CLI contract.

- Built entrypoint: `dist/chimera-cli.js`
- Commands: `describe`, `generate`, `score`
- Transport:
  - positional command arg
  - JSON request from `stdin` for `generate`/`score`
  - JSON response on `stdout`
  - readable errors on `stderr`
  - non-zero exit on failures

### Build

```bash
npm run build
```

TypeScript output includes:

- `dist/index.js`
- `dist/chimera-cli.js`

### Describe

```bash
node dist/chimera-cli.js describe
```

### Generate (stdin JSON)

```bash
printf '{"benchmarkId":"decoy-nav","contractVersion":"1","seed":"1","params":{"levelId":"shallow-decoy"}}' | node dist/chimera-cli.js generate
```

### Score (stdin JSON)

```bash
printf '{"benchmarkId":"decoy-nav","contractVersion":"1","instance":{"instanceId":"example","seed":"1","params":{"levelId":"shallow-decoy"},"prompt":"...","expectedAnswer":"TOKEN-ALPHA-42","metadata":{}},"response":{"text":"TOKEN-ALPHA-42"}}' | node dist/chimera-cli.js score
```

Notes:

- `generate` is deterministic for the same `seed` + `params`.
- If `params.levelId` is provided, selection is deterministic within that level.
- If omitted, selection is deterministic across all static cases.
- `instance.expectedAnswer` is currently included to match the practical contract used by Core integrations.

## Static runtime artifact for Core

This repo now publishes `runtime-benchmark.json` at the repository root.

- It is the static runtime artifact for Chimera Core manual execution.
- It contains deterministic plain-text cases and exact-text expected answers.

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
