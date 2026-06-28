import { BENCHMARK_METADATA, DECOY_NAV_CASES } from "./cases";
import { scoreFinalAnswer } from "./score";
import { DECOY_NAV_LEVELS } from "./types";

export { BENCHMARK_METADATA, DECOY_NAV_CASES, DECOY_NAV_LEVELS, scoreFinalAnswer };

export function getBenchmarkInfo(): string {
  return "chimera-benchmark-decoy-nav contains deterministic synthetic decoy-nav cases";
}
