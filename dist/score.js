"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreAnswer = scoreAnswer;
const cases_1 = require("./cases");
function normalizeAnswer(value) {
    return value.trim();
}
function scoreAnswer(caseId, answerText) {
    const targetCase = cases_1.DECOY_NAV_CASES.find((item) => item.id === caseId);
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
