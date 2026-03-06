import { describe, it, expect } from "vitest";
import { calculateRiskScoreClient } from "@/hooks/useAiSystems";

/* ------------------------------------------------------------------ */
/*  Autonomy scoring (max 30)                                          */
/* ------------------------------------------------------------------ */

describe("calculateRiskScoreClient — Autonomy", () => {
  it("full_auto = 30 points", () => {
    const { score } = calculateRiskScoreClient({ autonomy_level: "full_auto" });
    expect(score).toBe(30);
  });

  it("human_in_command = 5 points", () => {
    const { score } = calculateRiskScoreClient({ autonomy_level: "human_in_command" });
    expect(score).toBe(5);
  });

  it("human_on_the_loop = 20 points", () => {
    const { score } = calculateRiskScoreClient({ autonomy_level: "human_on_the_loop" });
    expect(score).toBe(20);
  });

  it("human_in_the_loop = 10 points", () => {
    const { score } = calculateRiskScoreClient({ autonomy_level: "human_in_the_loop" });
    expect(score).toBe(10);
  });

  it("undefined autonomy = 0 points", () => {
    const { score } = calculateRiskScoreClient({});
    expect(score).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  Data types scoring (max 25, takes max)                             */
/* ------------------------------------------------------------------ */

describe("calculateRiskScoreClient — Data types", () => {
  it("sensitive_data = 25 points", () => {
    const { score } = calculateRiskScoreClient({ data_types: ["sensitive_data"] });
    expect(score).toBe(25);
  });

  it("takes the max when multiple types are provided", () => {
    const { score } = calculateRiskScoreClient({
      data_types: ["public_data", "personal_data", "synthetic_data"],
    });
    // max(5, 15, 2) = 15
    expect(score).toBe(15);
  });

  it("empty array = 0 points", () => {
    const { score } = calculateRiskScoreClient({ data_types: [] });
    expect(score).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  Population scoring (max 20, takes max)                             */
/* ------------------------------------------------------------------ */

describe("calculateRiskScoreClient — Population", () => {
  it("vulnerable = 20 points", () => {
    const { score } = calculateRiskScoreClient({ affected_population: ["vulnerable"] });
    expect(score).toBe(20);
  });

  it("minors = 20 points", () => {
    const { score } = calculateRiskScoreClient({ affected_population: ["minors"] });
    expect(score).toBe(20);
  });

  it("employees = 5 points", () => {
    const { score } = calculateRiskScoreClient({ affected_population: ["employees"] });
    expect(score).toBe(5);
  });
});

/* ------------------------------------------------------------------ */
/*  Sensitive domains scoring (max 25, takes max)                      */
/* ------------------------------------------------------------------ */

describe("calculateRiskScoreClient — Sensitive domains", () => {
  it("biometric_id = 25 points", () => {
    const { score } = calculateRiskScoreClient({ sensitive_domains: ["biometric_id"] });
    expect(score).toBe(25);
  });

  it("justice = 25 points", () => {
    const { score } = calculateRiskScoreClient({ sensitive_domains: ["justice"] });
    expect(score).toBe(25);
  });

  it("health = 20 points", () => {
    const { score } = calculateRiskScoreClient({ sensitive_domains: ["health"] });
    expect(score).toBe(20);
  });
});

/* ------------------------------------------------------------------ */
/*  Levels                                                             */
/* ------------------------------------------------------------------ */

describe("calculateRiskScoreClient — Levels", () => {
  it("critical when score >= 75", () => {
    // full_auto(30) + sensitive_data(25) + vulnerable(20) = 75
    const { level } = calculateRiskScoreClient({
      autonomy_level: "full_auto",
      data_types: ["sensitive_data"],
      affected_population: ["vulnerable"],
    });
    expect(level).toBe("critical");
  });

  it("high when score >= 50 and < 75", () => {
    // full_auto(30) + personal_data(15) + employees(5) = 50
    const { level } = calculateRiskScoreClient({
      autonomy_level: "full_auto",
      data_types: ["personal_data"],
      affected_population: ["employees"],
    });
    expect(level).toBe("high");
  });

  it("limited when score >= 25 and < 50", () => {
    // full_auto(30) = 30
    const { level } = calculateRiskScoreClient({
      autonomy_level: "full_auto",
    });
    expect(level).toBe("limited");
  });

  it("minimal when score < 25", () => {
    // human_in_the_loop(10) + public_data(5) = 15
    const { level } = calculateRiskScoreClient({
      autonomy_level: "human_in_the_loop",
      data_types: ["public_data"],
    });
    expect(level).toBe("minimal");
  });
});

/* ------------------------------------------------------------------ */
/*  Edge cases                                                         */
/* ------------------------------------------------------------------ */

describe("calculateRiskScoreClient — Edge cases", () => {
  it("empty object returns score 0, level minimal", () => {
    const result = calculateRiskScoreClient({});
    expect(result.score).toBe(0);
    expect(result.level).toBe("minimal");
  });

  it("caps score at 100", () => {
    // full_auto(30) + sensitive_data(25) + vulnerable(20) + biometric_id(25) = 100
    const result = calculateRiskScoreClient({
      autonomy_level: "full_auto",
      data_types: ["sensitive_data"],
      affected_population: ["vulnerable"],
      sensitive_domains: ["biometric_id"],
    });
    expect(result.score).toBe(100);
    expect(result.level).toBe("critical");
  });
});
