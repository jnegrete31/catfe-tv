import { describe, it, expect } from "vitest";

// Test the milestone detection logic (same logic as in ScreenRenderer)
function getMilestoneInfo(count: number): { isMilestone: boolean; label: string; tier: 'bronze' | 'silver' | 'gold' | 'diamond' } {
  if (count > 0 && count % 100 === 0) return { isMilestone: true, label: `${count} Forever Homes!`, tier: 'diamond' };
  if (count > 0 && count % 50 === 0) return { isMilestone: true, label: `${count} Milestone!`, tier: 'gold' };
  if (count > 0 && count % 25 === 0) return { isMilestone: true, label: `${count} and Counting!`, tier: 'silver' };
  if (count > 0 && count % 10 === 0) return { isMilestone: true, label: `${count} Cats Loved!`, tier: 'bronze' };
  return { isMilestone: false, label: '', tier: 'bronze' };
}

describe("getMilestoneInfo", () => {
  it("returns no milestone for 0", () => {
    const result = getMilestoneInfo(0);
    expect(result.isMilestone).toBe(false);
  });

  it("returns no milestone for non-round numbers", () => {
    expect(getMilestoneInfo(1).isMilestone).toBe(false);
    expect(getMilestoneInfo(7).isMilestone).toBe(false);
    expect(getMilestoneInfo(13).isMilestone).toBe(false);
    expect(getMilestoneInfo(99).isMilestone).toBe(false);
  });

  it("returns bronze tier for multiples of 10", () => {
    const result = getMilestoneInfo(10);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("bronze");
    expect(result.label).toBe("10 Cats Loved!");
  });

  it("returns bronze for 30 (multiple of 10 but not 25/50/100)", () => {
    const result = getMilestoneInfo(30);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("bronze");
    expect(result.label).toBe("30 Cats Loved!");
  });

  it("returns silver tier for multiples of 25", () => {
    const result = getMilestoneInfo(25);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("silver");
    expect(result.label).toBe("25 and Counting!");
  });

  it("returns silver for 75 (multiple of 25 but not 50/100)", () => {
    const result = getMilestoneInfo(75);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("silver");
    expect(result.label).toBe("75 and Counting!");
  });

  it("returns gold tier for multiples of 50", () => {
    const result = getMilestoneInfo(50);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("gold");
    expect(result.label).toBe("50 Milestone!");
  });

  it("returns gold for 150 (multiple of 50 but not 100)", () => {
    const result = getMilestoneInfo(150);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("gold");
    expect(result.label).toBe("150 Milestone!");
  });

  it("returns diamond tier for multiples of 100", () => {
    const result = getMilestoneInfo(100);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("diamond");
    expect(result.label).toBe("100 Forever Homes!");
  });

  it("returns diamond for 200", () => {
    const result = getMilestoneInfo(200);
    expect(result.isMilestone).toBe(true);
    expect(result.tier).toBe("diamond");
    expect(result.label).toBe("200 Forever Homes!");
  });

  it("diamond takes priority over gold/silver/bronze at 100", () => {
    // 100 is divisible by 100, 50, 25, and 10 — diamond should win
    const result = getMilestoneInfo(100);
    expect(result.tier).toBe("diamond");
  });

  it("gold takes priority over silver/bronze at 50", () => {
    // 50 is divisible by 50, 25, and 10 — gold should win
    const result = getMilestoneInfo(50);
    expect(result.tier).toBe("gold");
  });

  it("silver takes priority over bronze at 25", () => {
    // 25 is divisible by 25 but not 10 — silver should win
    const result = getMilestoneInfo(25);
    expect(result.tier).toBe("silver");
  });
});
