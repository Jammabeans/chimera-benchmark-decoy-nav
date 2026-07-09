import { DECOY_NAV_CASES } from "./cases";
import { DECOY_NAV_LEVELS } from "./types";

declare const process: {
  argv: string[];
  stdin: {
    setEncoding(encoding: string): void;
    on(event: "data", listener: (chunk: string) => void): void;
    on(event: "end", listener: () => void): void;
    on(event: "error", listener: (error: unknown) => void): void;
    resume(): void;
  };
  stdout: {
    write(message: string): void;
  };
  stderr: {
    write(message: string): void;
  };
  exit(code: number): never;
};

const BENCHMARK_ID = "decoy-nav";
const CONTRACT_VERSION = "1";

type GenerateRequest = {
  benchmarkId: string;
  contractVersion: string;
  seed?: unknown;
  params?: {
    levelId?: unknown;
  };
};

type ScoreRequest = {
  benchmarkId: string;
  contractVersion: string;
  instance?: {
    expectedAnswer?: unknown;
    [key: string]: unknown;
  };
  response?: {
    text?: unknown;
  };
};

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function writeJson(payload: unknown): void {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function normalizeText(value: string): string {
  return value.trim();
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function formatLevelLabel(levelId: string): string {
  return levelId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isDecoyNavLevel(value: string): value is (typeof DECOY_NAV_LEVELS)[number] {
  return (DECOY_NAV_LEVELS as readonly string[]).includes(value);
}

function readStdin(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let raw = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      raw += chunk;
    });
    process.stdin.on("end", () => resolve(raw));
    process.stdin.on("error", (error: unknown) => reject(error));
    process.stdin.resume();
  });
}

function parseJsonRequest(raw: string): unknown {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    fail("Missing JSON request on stdin.");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    fail(`Invalid JSON request on stdin: ${reason}`);
  }
}

function assertEnvelope(
  request: { benchmarkId?: unknown; contractVersion?: unknown },
  commandName: string
): void {
  if (request.benchmarkId !== BENCHMARK_ID) {
    fail(
      `${commandName}: benchmarkId must be \"${BENCHMARK_ID}\" (received ${JSON.stringify(request.benchmarkId)}).`
    );
  }

  if (request.contractVersion !== CONTRACT_VERSION) {
    fail(
      `${commandName}: contractVersion must be \"${CONTRACT_VERSION}\" (received ${JSON.stringify(
        request.contractVersion
      )}).`
    );
  }
}

function handleDescribe(): void {
  writeJson({
    benchmarkId: BENCHMARK_ID,
    contractVersion: CONTRACT_VERSION,
    displayName: "Decoy Navigation",
    description:
      "Deterministic synthetic benchmark for resisting decoy navigation paths while following the objective.",
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
          options: DECOY_NAV_LEVELS.map((levelId) => ({
            value: levelId,
            label: formatLevelLabel(levelId)
          }))
        }
      ]
    }
  });
}

function handleGenerate(request: GenerateRequest): void {
  assertEnvelope(request, "generate");

  const seed = typeof request.seed === "string" ? request.seed : "1";
  const levelIdRaw = request.params?.levelId;
  let selectedLevelId: string | undefined;

  if (levelIdRaw !== undefined) {
    if (typeof levelIdRaw !== "string") {
      fail("generate: params.levelId must be a string when provided.");
    }

    if (!isDecoyNavLevel(levelIdRaw)) {
      fail(
        `generate: params.levelId must be one of ${DECOY_NAV_LEVELS.join(", ")} (received ${JSON.stringify(levelIdRaw)}).`
      );
    }

    selectedLevelId = levelIdRaw;
  }

  const candidateCases = selectedLevelId
    ? DECOY_NAV_CASES.filter((item) => item.levelId === selectedLevelId)
    : DECOY_NAV_CASES;

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

function handleScore(request: ScoreRequest): void {
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

async function main(): Promise<void> {
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
    handleGenerate(parsed as GenerateRequest);
    return;
  }

  if (command === "score") {
    handleScore(parsed as ScoreRequest);
    return;
  }

  fail(`Unknown command: ${command}. Use one of: describe, generate, score.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(`Unhandled CLI error: ${message}`);
});

