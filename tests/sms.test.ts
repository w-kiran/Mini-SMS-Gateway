import { describe, it, expect } from "vitest";
import { analyzeMessage } from "../src/utils/sms";

describe("GSM-7 segments", () => {
  it("160 characters is 1 segment, 161 is 2", () => {
    expect(analyzeMessage("a".repeat(160)).segments).toBe(1);
    expect(analyzeMessage("a".repeat(161)).segments).toBe(2);
  });
  it("306 characters is 2 segments, 307 is 3", () => {
    expect(analyzeMessage("a".repeat(306)).segments).toBe(2);
    expect(analyzeMessage("a".repeat(307)).segments).toBe(3);
  });
  it("a 200 character message uses 2 segments", () => {
    const info = analyzeMessage("a".repeat(200));
    expect(info.encoding).toBe("GSM7");
    expect(info.segments).toBe(2);
  });
  it("newline counts as one septet", () => {
    expect(analyzeMessage("a\nb").length).toBe(3);
  });
});

describe("GSM-7 extension characters", () => {
  it("each extension character counts as 2 septets", () => {
    expect(analyzeMessage("{").length).toBe(2);
    expect(analyzeMessage("€").length).toBe(2);
  });
  it("80 extension chars fit in 1 segment, 81 need 2", () => {
    expect(analyzeMessage("{".repeat(80)).segments).toBe(1); // 160 septets
    expect(analyzeMessage("{".repeat(81)).segments).toBe(2); // 162 septets
  });
  it("a message with extension characters is still GSM7", () => {
    expect(analyzeMessage("price 5€").encoding).toBe("GSM7");
  });
});

describe("Unicode segments", () => {
  it("70 characters is 1 segment, 71 is 2", () => {
    expect(analyzeMessage("न".repeat(70)).segments).toBe(1);
    expect(analyzeMessage("न".repeat(71)).segments).toBe(2);
  });
  it("134 characters is 2 segments, 135 is 3", () => {
    expect(analyzeMessage("न".repeat(134)).segments).toBe(2);
    expect(analyzeMessage("न".repeat(135)).segments).toBe(3);
  });
  it("a 100 character Unicode message uses 2 segments", () => {
    const info = analyzeMessage("न".repeat(100));
    expect(info.encoding).toBe("UNICODE");
    expect(info.segments).toBe(2);
  });
  it("Nepali text is Unicode", () => {
    expect(analyzeMessage("नमस्ते").encoding).toBe("UNICODE");
  });
  it("an emoji counts as 2 units", () => {
    expect(analyzeMessage("😀").length).toBe(2);
    expect(analyzeMessage("😀".repeat(35)).segments).toBe(1); // 70 units
    expect(analyzeMessage("😀".repeat(36)).segments).toBe(2); // 72 units
  });
});

describe("mixed messages", () => {
  it("one unsupported character makes the whole message Unicode", () => {
    const info = analyzeMessage("hello 😀");
    expect(info.encoding).toBe("UNICODE");
    expect(info.length).toBe(8);
  });
  it("a long English message with one Nepali letter becomes Unicode", () => {
    const info = analyzeMessage("a".repeat(100) + "न");
    expect(info.encoding).toBe("UNICODE");
    expect(info.segments).toBe(2);
  });
});