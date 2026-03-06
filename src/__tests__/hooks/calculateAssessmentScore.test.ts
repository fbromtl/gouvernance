import { describe, it, expect } from "vitest";
import { calculateAssessmentScore } from "@/hooks/useRiskAssessments";

/* ------------------------------------------------------------------ */
/*  Section A — Impact (max 25)                                        */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Section A (Impact)", () => {
  it("q1 oui_direct = 15 points", () => {
    const { score } = calculateAssessmentScore({ q1: "oui_direct" });
    expect(score).toBe(15);
  });

  it("q2 non (irreversible) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q2: "non" });
    expect(score).toBe(10);
  });

  it("q3 oui (fundamental rights) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q3: "oui" });
    expect(score).toBe(10);
  });

  it("q4 cumulative scoring for multiple rights", () => {
    // privacy(5) + non_discrimination(8) = 13
    const { score } = calculateAssessmentScore({ q4: ["privacy", "non_discrimination"] });
    expect(score).toBe(13);
  });

  it("q4 dignity = 10 points", () => {
    const { score } = calculateAssessmentScore({ q4: ["dignity"] });
    expect(score).toBe(10);
  });
});

/* ------------------------------------------------------------------ */
/*  Section B — EU AI Act (max 20)                                     */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Section B (EU AI Act)", () => {
  it("q5=oui flags system as prohibited", () => {
    const result = calculateAssessmentScore({ q5: "oui" });
    expect(result.isProhibited).toBe(true);
    expect(result.level).toBe("prohibited");
  });

  it("q5=non does not flag as prohibited", () => {
    const result = calculateAssessmentScore({ q5: "non" });
    expect(result.isProhibited).toBe(false);
  });

  it("q6 high-risk category (any selection) = 20 points", () => {
    const { score } = calculateAssessmentScore({ q6: ["biometric"] });
    expect(score).toBe(20);
  });

  it("q6 empty array = 0 points", () => {
    const { score } = calculateAssessmentScore({ q6: [] });
    expect(score).toBe(0);
  });

  it("q7 oui (limited risk) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q7: "oui" });
    expect(score).toBe(10);
  });
});

/* ------------------------------------------------------------------ */
/*  Section C — Data & Privacy (max 20)                                */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Section C (Data & Privacy)", () => {
  it("q8 oui_sensibles = 20 points", () => {
    const { score } = calculateAssessmentScore({ q8: "oui_sensibles" });
    expect(score).toBe(20);
  });

  it("q8 oui_standards = 10 points", () => {
    const { score } = calculateAssessmentScore({ q8: "oui_standards" });
    expect(score).toBe(10);
  });

  it("q9 oui_hors_canada (cross-border) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q9: "oui_hors_canada" });
    expect(score).toBe(10);
  });

  it("q10 non_requis (no PIA) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q10: "non_requis" });
    expect(score).toBe(10);
  });
});

/* ------------------------------------------------------------------ */
/*  Section D — Bias & Fairness (max 15)                               */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Section D (Bias & Fairness)", () => {
  it("q11 oui (bias risk) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q11: "oui" });
    expect(score).toBe(10);
  });

  it("q12 non (no testing) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q12: "non" });
    expect(score).toBe(10);
  });

  it("q13 oui (uses protected characteristics) = 15 points", () => {
    const { score } = calculateAssessmentScore({ q13: "oui" });
    expect(score).toBe(15);
  });
});

/* ------------------------------------------------------------------ */
/*  Section E — Transparency (max 10)                                  */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Section E (Transparency)", () => {
  it("q14 non (non-explainable) = 10 points", () => {
    const { score } = calculateAssessmentScore({ q14: "non" });
    expect(score).toBe(10);
  });

  it("q14 partiellement = 5 points", () => {
    const { score } = calculateAssessmentScore({ q14: "partiellement" });
    expect(score).toBe(5);
  });

  it("q15 non (users not informed) = 5 points", () => {
    const { score } = calculateAssessmentScore({ q15: "non" });
    expect(score).toBe(5);
  });
});

/* ------------------------------------------------------------------ */
/*  Section F — Human oversight (max 10)                               */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Section F (Human oversight)", () => {
  it("q16 jamais = 10 points", () => {
    const { score } = calculateAssessmentScore({ q16: "jamais" });
    expect(score).toBe(10);
  });

  it("q16 parfois = 5 points", () => {
    const { score } = calculateAssessmentScore({ q16: "parfois" });
    expect(score).toBe(5);
  });

  it("q17 non (no override mechanism) = 5 points", () => {
    const { score } = calculateAssessmentScore({ q17: "non" });
    expect(score).toBe(5);
  });
});

/* ------------------------------------------------------------------ */
/*  Levels                                                             */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Levels", () => {
  it("prohibited when q5 = oui (regardless of score)", () => {
    const result = calculateAssessmentScore({ q5: "oui" });
    expect(result.level).toBe("prohibited");
    expect(result.isProhibited).toBe(true);
  });

  it("critical when score >= 76", () => {
    // q1 oui_direct(15) + q2 non(10) + q6 high-risk(20) + q8 sensibles(20)
    // + q11 oui(10) + q14 non(10) + q16 jamais(10) = 95 -> capped if needed
    const { level, score } = calculateAssessmentScore({
      q1: "oui_direct",
      q2: "non",
      q6: ["high_risk_category"],
      q8: "oui_sensibles",
      q11: "oui",
      q14: "non",
      q16: "jamais",
    });
    expect(score).toBeGreaterThanOrEqual(76);
    expect(level).toBe("critical");
  });

  it("high when score >= 51 and < 76", () => {
    // q1 oui_direct(15) + q6 high-risk(20) + q8 oui_sensibles(20) = 55
    const { level, score } = calculateAssessmentScore({
      q1: "oui_direct",
      q6: ["some_category"],
      q8: "oui_sensibles",
    });
    expect(score).toBeGreaterThanOrEqual(51);
    expect(score).toBeLessThan(76);
    expect(level).toBe("high");
  });

  it("limited when score >= 26 and < 51", () => {
    // q1 oui_direct(15) + q2 non(10) + q11 oui(10) = 35
    const { level, score } = calculateAssessmentScore({
      q1: "oui_direct",
      q2: "non",
      q11: "oui",
    });
    expect(score).toBeGreaterThanOrEqual(26);
    expect(score).toBeLessThan(51);
    expect(level).toBe("limited");
  });

  it("minimal when score < 26", () => {
    // q1 oui_direct(15) + q15 non(5) = 20
    const { level, score } = calculateAssessmentScore({
      q1: "oui_direct",
      q15: "non",
    });
    expect(score).toBeLessThan(26);
    expect(level).toBe("minimal");
  });
});

/* ------------------------------------------------------------------ */
/*  Edge cases                                                         */
/* ------------------------------------------------------------------ */

describe("calculateAssessmentScore — Edge cases", () => {
  it("empty answers returns score 0, level minimal, not prohibited", () => {
    const result = calculateAssessmentScore({});
    expect(result.score).toBe(0);
    expect(result.level).toBe("minimal");
    expect(result.isProhibited).toBe(false);
  });

  it("caps score at 100", () => {
    // Max all sections: A(15+10+10+10+8+5) + B(20+10) + C(20+10+10) + D(10+10+15) + E(10+5) + F(10+5)
    // Way over 100
    const result = calculateAssessmentScore({
      q1: "oui_direct",
      q2: "non",
      q3: "oui",
      q4: ["privacy", "non_discrimination", "dignity", "employment", "access_services", "freedom_expression"],
      q6: ["cat1"],
      q7: "oui",
      q8: "oui_sensibles",
      q9: "oui_hors_canada",
      q10: "non_requis",
      q11: "oui",
      q12: "non",
      q13: "oui",
      q14: "non",
      q15: "non",
      q16: "jamais",
      q17: "non",
    });
    expect(result.score).toBe(100);
  });

  it("prohibited overrides any level even with low score", () => {
    const result = calculateAssessmentScore({ q5: "oui" });
    expect(result.score).toBe(0);
    expect(result.level).toBe("prohibited");
    expect(result.isProhibited).toBe(true);
  });
});
