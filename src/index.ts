import { BENCHMARK_METADATA, DECOY_NAV_CASES } from "./cases";
import { scoreAnswer } from "./score";
import { DECOY_NAV_LEVELS } from "./types";

export { BENCHMARK_METADATA, DECOY_NAV_CASES, DECOY_NAV_LEVELS, scoreAnswer };

export const runtimeBenchmark = {
  manifest: BENCHMARK_METADATA,
  cases: DECOY_NAV_CASES,
  scoreAnswer
} as const;

export function getBenchmarkInfo(): string {
  return "chimera-benchmark-decoy-nav exports static deterministic decoy-navigation runtime cases";
}
