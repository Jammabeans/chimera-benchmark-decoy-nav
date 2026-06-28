export const DECOY_NAV_LEVELS = ["shallow-decoy", "medium-decoy", "deep-decoy"] as const;

export type DecoyNavLevel = (typeof DECOY_NAV_LEVELS)[number];

export interface DecoyInstruction {
  id: string;
  text: string;
  hintedPath: string;
  isDecoy: boolean;
}

export interface DecoyNavCase {
  id: string;
  title: string;
  level: DecoyNavLevel;
  objective: string;
  instructions: DecoyInstruction[];
  correctPath: string[];
  expectedFinalAnswer: string;
}

export interface ScoreResult {
  caseId: string;
  isCorrect: boolean;
  expectedFinalAnswer: string;
  submittedFinalAnswer: string;
}

