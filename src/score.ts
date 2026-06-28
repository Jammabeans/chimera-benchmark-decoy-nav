import { DECOY_NAV_CASES } from "./cases";
import { ScoreResult } from "./types";

function normalizeAnswer(value: string): string {
  return value.trim();
}

export function scoreFinalAnswer(caseId: string, submittedFinalAnswer: string): ScoreResult {
  const targetCase = DECOY_NAV_CASES.find((item) => item.id === caseId);

  if (!targetCase) {
    throw new Error(`Unknown decoy-nav case id: ${caseId}`);
  }

  const normalizedExpected = normalizeAnswer(targetCase.expectedFinalAnswer);
  const normalizedSubmitted = normalizeAnswer(submittedFinalAnswer);

  return {
    caseId,
    isCorrect: normalizedExpected === normalizedSubmitted,
    expectedFinalAnswer: targetCase.expectedFinalAnswer,
    submittedFinalAnswer
  };
}

