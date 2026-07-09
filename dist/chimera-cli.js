"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cases_1 = require("./cases");
const types_1 = require("./types");
const BENCHMARK_ID = "decoy-nav";
const CONTRACT_VERSION = "1";
function fail(message) {
    process.stderr.write(`${message}\n`);
    process.exit(1);
}
function writeJson(payload) {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
}
function normalizeText(value) {
    return value.trim();
}
function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function formatLevelLabel(levelId) {
    return levelId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
function isDecoyNavLevel(value) {
    return types_1.DECOY_NAV_LEVELS.includes(value);
}
function readStdin() {
    return new Promise((resolve, reject) => {
        let raw = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => {
            raw += chunk;
        });
        process.stdin.on("end", () => resolve(raw));
        process.stdin.on("error", (error) => reject(error));
        process.stdin.resume();
    });
}
function parseJsonRequest(raw) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
        fail("Missing JSON request on stdin.");
    }
    try {
        return JSON.parse(trimmed);
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        fail(`Invalid JSON request on stdin: ${reason}`);
    }
}
function assertEnvelope(request, commandName) {
    if (request.benchmarkId !== BENCHMARK_ID) {
        fail(`${commandName}: benchmarkId must be \"${BENCHMARK_ID}\" (received ${JSON.stringify(request.benchmarkId)}).`);
    }
    if (request.contractVersion !== CONTRACT_VERSION) {
        fail(`${commandName}: contractVersion must be \"${CONTRACT_VERSION}\" (received ${JSON.stringify(request.contractVersion)}).`);
    }
}
function handleDescribe() {
    writeJson({
        benchmarkId: BENCHMARK_ID,
        contractVersion: CONTRACT_VERSION,
        displayName: "Decoy Navigation",
        description: "Deterministic synthetic benchmark for resisting decoy navigation paths while following the objective.",
        commands: ["describe", "generate", "score"],
        generate: {
            fields: [
                {
                    name: "seed",
                    type: "string",
                    required: true,
                    default: "1"
                },
                {
                    name: "levelId",
                    type: "select",
                    required: false,
                    options: types_1.DECOY_NAV_LEVELS.map((levelId) => ({
                        value: levelId,
                        label: formatLevelLabel(levelId)
                    }))
                }
            ]
        }
    });
}
function handleGenerate(request) {
    assertEnvelope(request, "generate");
    const seed = typeof request.seed === "string" ? request.seed : "1";
    const levelIdRaw = request.params?.levelId;
    let selectedLevelId;
    if (levelIdRaw !== undefined) {
        if (typeof levelIdRaw !== "string") {
            fail("generate: params.levelId must be a string when provided.");
        }
        if (!isDecoyNavLevel(levelIdRaw)) {
            fail(`generate: params.levelId must be one of ${types_1.DECOY_NAV_LEVELS.join(", ")} (received ${JSON.stringify(levelIdRaw)}).`);
        }
        selectedLevelId = levelIdRaw;
    }
    const candidateCases = selectedLevelId
        ? cases_1.DECOY_NAV_CASES.filter((item) => item.levelId === selectedLevelId)
        : cases_1.DECOY_NAV_CASES;
    if (candidateCases.length === 0) {
        fail("generate: no cases available for requested parameters.");
    }
    const pickSeed = `${seed}|${selectedLevelId ?? "all"}`;
    const pickHash = hashString(pickSeed);
    const chosenCase = candidateCases[pickHash % candidateCases.length];
    writeJson({
        benchmarkId: BENCHMARK_ID,
        contractVersion: CONTRACT_VERSION,
        instance: {
            instanceId: `decoy-nav-${chosenCase.id}-${pickHash.toString(16)}`,
            seed,
            params: selectedLevelId ? { levelId: selectedLevelId } : {},
            prompt: chosenCase.prompt,
            expectedAnswer: chosenCase.expectedAnswer,
            metadata: {
                caseId: chosenCase.id,
                levelId: chosenCase.levelId,
                title: chosenCase.title,
                ...(chosenCase.metadata ? { caseMetadata: chosenCase.metadata } : {})
            }
        }
    });
}
function handleScore(request) {
    assertEnvelope(request, "score");
    const responseText = request.response?.text;
    const expectedAnswer = request.instance?.expectedAnswer;
    if (typeof responseText !== "string") {
        fail("score: response.text must be a string.");
    }
    if (typeof expectedAnswer !== "string") {
        fail("score: instance.expectedAnswer must be a string.");
    }
    const normalizedResponse = normalizeText(responseText);
    const normalizedExpectedAnswer = normalizeText(expectedAnswer);
    const correct = normalizedExpectedAnswer === normalizedResponse;
    writeJson({
        benchmarkId: BENCHMARK_ID,
        contractVersion: CONTRACT_VERSION,
        score: {
            correct,
            score: correct ? 1 : 0,
            maxScore: 1,
            method: "exact-text",
            details: {
                expectedAnswer,
                normalizedResponse
            }
        }
    });
}
async function main() {
    const command = process.argv[2];
    if (!command) {
        fail("Missing command. Use one of: describe, generate, score.");
    }
    if (command === "describe") {
        handleDescribe();
        return;
    }
    const rawRequest = await readStdin();
    const parsed = parseJsonRequest(rawRequest);
    if (typeof parsed !== "object" || parsed === null) {
        fail("Request JSON must be an object.");
    }
    if (command === "generate") {
        handleGenerate(parsed);
        return;
    }
    if (command === "score") {
        handleScore(parsed);
        return;
    }
    fail(`Unknown command: ${command}. Use one of: describe, generate, score.`);
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Unhandled CLI error: ${message}`);
});
