import { DECOY_NAV_CASES } from "./cases";
import { RuntimeScoreResult } from "./types";

function normalizeAnswer(value: string): string {
  return value.trim();
}

export function scoreAnswer(caseId: string, answerText: string): RuntimeScoreResult {
  const targetCase = DECOY_NAV_CASES.find((item) => item.id === caseId);

  if (!targetCase) {
    throw new Error(`Unknown decoy-nav case id: ${caseId}`);
  }

  const normalizedExpected = normalizeAnswer(targetCase.expectedAnswer);
  const normalizedSubmitted = normalizeAnswer(answerText);
  const correct = normalizedExpected === normalizedSubmitted;

  return {
    correct,
    score: correct ? 1 : 0,
    expectedAnswer: targetCase.expectedAnswer,
    message: correct ? "Exact match after trim." : "Answer did not match expected text."
  };
}

