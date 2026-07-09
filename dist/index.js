"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtimeBenchmark = exports.scoreAnswer = exports.DECOY_NAV_LEVELS = exports.DECOY_NAV_CASES = exports.BENCHMARK_METADATA = void 0;
exports.getBenchmarkInfo = getBenchmarkInfo;
const cases_1 = require("./cases");
Object.defineProperty(exports, "BENCHMARK_METADATA", { enumerable: true, get: function () { return cases_1.BENCHMARK_METADATA; } });
Object.defineProperty(exports, "DECOY_NAV_CASES", { enumerable: true, get: function () { return cases_1.DECOY_NAV_CASES; } });
const score_1 = require("./score");
Object.defineProperty(exports, "scoreAnswer", { enumerable: true, get: function () { return score_1.scoreAnswer; } });
const types_1 = require("./types");
Object.defineProperty(exports, "DECOY_NAV_LEVELS", { enumerable: true, get: function () { return types_1.DECOY_NAV_LEVELS; } });
exports.runtimeBenchmark = {
    manifest: cases_1.BENCHMARK_METADATA,
    cases: cases_1.DECOY_NAV_CASES,
    scoreAnswer: score_1.scoreAnswer
};
function getBenchmarkInfo() {
    return "chimera-benchmark-decoy-nav exports static deterministic decoy-navigation runtime cases";
}
