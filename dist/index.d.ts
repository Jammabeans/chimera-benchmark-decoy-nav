import { BENCHMARK_METADATA, DECOY_NAV_CASES } from "./cases";
import { scoreAnswer } from "./score";
import { DECOY_NAV_LEVELS } from "./types";
export { BENCHMARK_METADATA, DECOY_NAV_CASES, DECOY_NAV_LEVELS, scoreAnswer };
export declare const runtimeBenchmark: {
    readonly manifest: import("./types").RuntimeBenchmarkManifest;
    readonly cases: import("./types").DecoyNavCase[];
    readonly scoreAnswer: typeof scoreAnswer;
};
export declare function getBenchmarkInfo(): string;
