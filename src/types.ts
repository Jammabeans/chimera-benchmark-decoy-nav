export const DECOY_NAV_LEVELS = ["shallow-decoy", "medium-decoy", "deep-decoy"] as const;

export type DecoyNavLevel = (typeof DECOY_NAV_LEVELS)[number];

export interface RuntimeBenchmarkManifest {
  id: string;
  name: string;
  owner: string;
  weaknessCategory: string;
  deterministic: true;
  answerFormat: "plain-text";
  scoring: "exact-match-trimmed";
}

export interface DecoyInstruction {
  id: string;
  text: string;
  hintedPath: string;
  isDecoy: boolean;
}

export interface DecoyNavCase {
  id: string;
  levelId: DecoyNavLevel;
  title: string;
  prompt: string;
  expectedAnswer: string;
  metadata?: {
    objective: string;
    instructions: DecoyInstruction[];
    correctPath: string[];
  };
}

export interface RuntimeScoreResult {
  correct: boolean;
  score: number;
  expectedAnswer: string;
  message: string;
}

