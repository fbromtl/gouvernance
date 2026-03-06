import { describe, it, expect } from "vitest";
import {
  FRAMEWORK_CODES,
  FRAMEWORK_META,
  REQUIREMENTS_BY_FRAMEWORK,
  computeFrameworkScore,
  computeGlobalScore,
  getScoreColor,
  getScoreLabel,
  type FrameworkCode,
  type ComplianceStatus,
} from "@/lib/compliance-frameworks";

/* ------------------------------------------------------------------ */
/*  FRAMEWORK_CODES                                                    */
/* ------------------------------------------------------------------ */

describe("FRAMEWORK_CODES", () => {
  it("contains exactly 5 framework codes", () => {
    expect(FRAMEWORK_CODES).toHaveLength(5);
  });

  it("includes all expected codes", () => {
    expect(FRAMEWORK_CODES).toEqual(["loi25", "euai", "nist_ai_rmf", "iso42001", "rgpd"]);
  });
});

/* ------------------------------------------------------------------ */
/*  FRAMEWORK_META                                                     */
/* ------------------------------------------------------------------ */

describe("FRAMEWORK_META", () => {
  it("has metadata for every framework code", () => {
    for (const code of FRAMEWORK_CODES) {
      expect(FRAMEWORK_META[code]).toBeDefined();
      expect(FRAMEWORK_META[code].code).toBe(code);
      expect(FRAMEWORK_META[code].labelFr).toBeTruthy();
      expect(FRAMEWORK_META[code].labelEn).toBeTruthy();
    }
  });
});

/* ------------------------------------------------------------------ */
/*  REQUIREMENTS_BY_FRAMEWORK                                          */
/* ------------------------------------------------------------------ */

describe("REQUIREMENTS_BY_FRAMEWORK", () => {
  it("has requirements for every framework code", () => {
    for (const code of FRAMEWORK_CODES) {
      expect(REQUIREMENTS_BY_FRAMEWORK[code]).toBeDefined();
      expect(REQUIREMENTS_BY_FRAMEWORK[code].length).toBeGreaterThan(0);
    }
  });

  it("each requirement has a unique code within its framework", () => {
    for (const code of FRAMEWORK_CODES) {
      const reqs = REQUIREMENTS_BY_FRAMEWORK[code];
      const codes = reqs.map((r) => r.code);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it("each requirement references its parent framework", () => {
    for (const code of FRAMEWORK_CODES) {
      for (const req of REQUIREMENTS_BY_FRAMEWORK[code]) {
        expect(req.framework).toBe(code);
      }
    }
  });
});

/* ------------------------------------------------------------------ */
/*  computeFrameworkScore                                               */
/* ------------------------------------------------------------------ */

describe("computeFrameworkScore", () => {
  it("returns 100% when all items are compliant", () => {
    const statuses: ComplianceStatus[] = ["compliant", "compliant", "compliant"];
    const result = computeFrameworkScore(statuses);
    expect(result.score).toBe(100);
    expect(result.compliant).toBe(3);
    expect(result.total).toBe(3);
  });

  it("returns 50% when all items are partially_compliant", () => {
    const statuses: ComplianceStatus[] = ["partially_compliant", "partially_compliant"];
    const result = computeFrameworkScore(statuses);
    expect(result.score).toBe(50);
    expect(result.partial).toBe(2);
  });

  it("returns 0% when all items are non_compliant", () => {
    const statuses: ComplianceStatus[] = ["non_compliant", "non_compliant"];
    const result = computeFrameworkScore(statuses);
    expect(result.score).toBe(0);
    expect(result.nonCompliant).toBe(2);
  });

  it("excludes not_applicable items from score computation", () => {
    const statuses: ComplianceStatus[] = ["compliant", "not_applicable", "not_applicable"];
    const result = computeFrameworkScore(statuses);
    // 1 compliant / 1 applicable = 100%
    expect(result.score).toBe(100);
    expect(result.notApplicable).toBe(2);
  });

  it("handles mixed statuses correctly", () => {
    // 1 compliant + 1 partial + 1 non_compliant + 1 not_applicable
    // applicable = 3, score = (1 + 0.5) / 3 = 0.5 => 50%
    const statuses: ComplianceStatus[] = [
      "compliant",
      "partially_compliant",
      "non_compliant",
      "not_applicable",
    ];
    const result = computeFrameworkScore(statuses);
    expect(result.score).toBe(50);
    expect(result.compliant).toBe(1);
    expect(result.partial).toBe(1);
    expect(result.nonCompliant).toBe(1);
    expect(result.notApplicable).toBe(1);
    expect(result.total).toBe(4);
  });

  it("returns 0 when all items are not_applicable", () => {
    const statuses: ComplianceStatus[] = ["not_applicable", "not_applicable"];
    const result = computeFrameworkScore(statuses);
    expect(result.score).toBe(0);
  });

  it("returns 0 for empty array", () => {
    const result = computeFrameworkScore([]);
    expect(result.score).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  computeGlobalScore                                                 */
/* ------------------------------------------------------------------ */

describe("computeGlobalScore", () => {
  it("returns average of framework scores", () => {
    const scores = [
      { framework: "loi25" as FrameworkCode, score: 80, total: 5, compliant: 4, partial: 0, nonCompliant: 1, notApplicable: 0 },
      { framework: "euai" as FrameworkCode, score: 60, total: 5, compliant: 3, partial: 0, nonCompliant: 2, notApplicable: 0 },
    ];
    expect(computeGlobalScore(scores)).toBe(70);
  });

  it("returns 0 for empty array", () => {
    expect(computeGlobalScore([])).toBe(0);
  });

  it("excludes frameworks with total = 0", () => {
    const scores = [
      { framework: "loi25" as FrameworkCode, score: 80, total: 5, compliant: 4, partial: 0, nonCompliant: 1, notApplicable: 0 },
      { framework: "euai" as FrameworkCode, score: 0, total: 0, compliant: 0, partial: 0, nonCompliant: 0, notApplicable: 0 },
    ];
    expect(computeGlobalScore(scores)).toBe(80);
  });
});

/* ------------------------------------------------------------------ */
/*  getScoreColor                                                      */
/* ------------------------------------------------------------------ */

describe("getScoreColor", () => {
  it("returns green for score >= 80", () => {
    expect(getScoreColor(80)).toBe("#22c55e");
    expect(getScoreColor(100)).toBe("#22c55e");
  });

  it("returns yellow for score 50-79", () => {
    expect(getScoreColor(50)).toBe("#eab308");
    expect(getScoreColor(79)).toBe("#eab308");
  });

  it("returns red for score < 50", () => {
    expect(getScoreColor(0)).toBe("#ef4444");
    expect(getScoreColor(49)).toBe("#ef4444");
  });
});

/* ------------------------------------------------------------------ */
/*  getScoreLabel                                                      */
/* ------------------------------------------------------------------ */

describe("getScoreLabel", () => {
  it("returns French labels by default", () => {
    expect(getScoreLabel(85)).toBe("Conforme");
    expect(getScoreLabel(60)).toBe("À améliorer");
    expect(getScoreLabel(30)).toBe("Critique");
  });

  it("returns English labels when lang = en", () => {
    expect(getScoreLabel(85, "en")).toBe("Compliant");
    expect(getScoreLabel(60, "en")).toBe("Needs improvement");
    expect(getScoreLabel(30, "en")).toBe("Critical");
  });

  it("uses correct boundary values", () => {
    // 80 boundary
    expect(getScoreLabel(80)).toBe("Conforme");
    expect(getScoreLabel(79)).toBe("À améliorer");
    // 50 boundary
    expect(getScoreLabel(50)).toBe("À améliorer");
    expect(getScoreLabel(49)).toBe("Critique");
  });
});
