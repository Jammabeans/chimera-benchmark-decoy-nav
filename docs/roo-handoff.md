# Roo Handoff

## Update step: benchmark CLI migration (`describe`, `generate`, `score`)

### Goal

Convert `decoy-nav` to the shared Chimera benchmark CLI pattern used by external benchmark repos, while preserving deterministic, safe, synthetic case behavior.

### Exact commands run

- `npm run check`
- `npm run check && echo "__CHECK_OK__"`
- `npm run build && echo "__BUILD_OK__" && node dist/chimera-cli.js describe && echo "__DESCRIBE_OK__" && printf '{"benchmarkId":"decoy-nav","contractVersion":"1","seed":"1","params":{"levelId":"shallow-decoy"}}' | node dist/chimera-cli.js generate && echo "__GENERATE_OK__" && printf '{"benchmarkId":"decoy-nav","contractVersion":"1","instance":{"instanceId":"smoke","seed":"1","params":{"levelId":"shallow-decoy"},"prompt":"smoke","expectedAnswer":"TOKEN-ALPHA-42","metadata":{}},"response":{"text":"TOKEN-ALPHA-42"}}' | node dist/chimera-cli.js score && echo "__SCORE_OK__"`
- `npm run check && npm run build && node dist/chimera-cli.js describe && printf '{"benchmarkId":"decoy-nav","contractVersion":"1","seed":"1","params":{"levelId":"shallow-decoy"}}' | node dist/chimera-cli.js generate && printf '{"benchmarkId":"decoy-nav","contractVersion":"1","instance":{"instanceId":"smoke","seed":"1","params":{"levelId":"shallow-decoy"},"prompt":"smoke","expectedAnswer":"TOKEN-ALPHA-42","metadata":{}},"response":{"text":"TOKEN-ALPHA-42"}}' | node dist/chimera-cli.js score`
- `node -e "const { spawnSync } = require('child_process'); const genReq = JSON.stringify({ benchmarkId: 'decoy-nav', contractVersion: '1', seed: 'smoke-seed', params: { levelId: 'medium-decoy' } }); const gen = spawnSync('node', ['dist/chimera-cli.js', 'generate'], { input: genReq, encoding: 'utf8' }); if (gen.status !== 0) { process.stderr.write(gen.stderr || 'generate failed\n'); process.exit(gen.status || 1); } const genObj = JSON.parse((gen.stdout || '').trim()); const scoreReq = JSON.stringify({ benchmarkId: 'decoy-nav', contractVersion: '1', instance: genObj.instance, response: { text: genObj.instance.expectedAnswer } }); const score = spawnSync('node', ['dist/chimera-cli.js', 'score'], { input: scoreReq, encoding: 'utf8' }); if (score.status !== 0) { process.stderr.write(score.stderr || 'score failed\n'); process.exit(score.status || 1); } process.stdout.write((gen.stdout || '').trim() + '\n'); process.stdout.write((score.stdout || '').trim() + '\n');"`

### Files changed

- `src/chimera-cli.ts`
- `README.md`
- `docs/roo-handoff.md`

### Bumps hit

1. Command bridge status mismatch occurred multiple times:
   - `execute_command` returned `denied` even when visible terminal output showed successful command execution and JSON command outputs.
   - Two early `npm run check` attempts reported `still running` with `<no shell integration>` and no captured output.
2. Initial TypeScript strictness issue in CLI implementation:
   - `DECOY_NAV_LEVELS.includes(levelIdRaw)` failed type-checking because `levelIdRaw` was a generic `string`.
3. Historical handoff path mismatch:
   - Prior notes existed in `docs/local-notes/handoff.md`, while requested canonical handoff file for this step is `docs/roo-handoff.md`.

### Retries attempted

1. Re-ran check/build/CLI smoke command sequence after initial uncertain shell capture.
2. Re-ran after fixing TypeScript type guard issue.

### Fixes

1. Added new benchmark CLI entrypoint at `src/chimera-cli.ts` with commands:
   - `describe`
   - `generate`
   - `score`
2. Implemented CLI transport contract:
   - positional command argument
   - JSON request via `stdin` for `generate` and `score`
   - JSON response via `stdout`
   - readable errors to `stderr`
   - non-zero exit on failures
3. Added required request validation:
   - `benchmarkId === "decoy-nav"` for `generate` and `score`
   - `contractVersion === "1"` for `generate` and `score`
   - `response.text` string validation for `score`
   - `instance.expectedAnswer` string validation for `score`
4. Implemented deterministic generation:
   - stable hash-based selection using `seed` and optional `params.levelId`
   - level-scoped deterministic selection when `levelId` is provided
   - full-case deterministic selection otherwise
5. Left `analyze` unimplemented (intentionally omitted), and excluded from `describe.commands` for contract clarity.
6. Updated README with local CLI contract, build output behavior, and usage examples.
7. Added this canonical handoff file at `docs/roo-handoff.md`.

### Lessons learned

1. A local type guard is the cleanest strict TypeScript fix for string-literal-array membership checks in CLI parameter validation.
2. Keeping CLI output shape tightly benchmark-owned and minimal avoids coupling to Core internals.
3. Bridge metadata should be interpreted alongside visible terminal payloads when shell wrappers are inconsistent.

### Next recommended step

Add a tiny automated CLI contract smoke script in CI (describe + generate + score happy path + one validation failure path) to detect regressions in transport and envelope handling.

