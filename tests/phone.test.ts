import { describe, it, expect } from "vitest";
import { normalizePhone, validatePhones } from "../src/utils/phone";

describe("normalizePhone", () => {
  it("keeps a plain 10 digit number", () => {
    expect(normalizePhone("9841234567")).toBe("9841234567");
  });
  it("removes +977", () => {
    expect(normalizePhone("+9779801122334")).toBe("9801122334");
  });
  it("removes 977", () => {
    expect(normalizePhone("9779761234567")).toBe("9761234567");
  });
  it("ignores spaces and dashes", () => {
    expect(normalizePhone("+977 984-1234567")).toBe("9841234567");
  });
  it("does not strip 977 from a normal 10 digit number", () => {
    expect(normalizePhone("9771234567")).toBe("9771234567");
  });
  it("rejects numbers not starting with 97 or 98", () => {
    expect(normalizePhone("9612345678")).toBeNull();
  });
  it("rejects wrong length", () => {
    expect(normalizePhone("984123456")).toBeNull();
    expect(normalizePhone("98412345678")).toBeNull();
  });
  it("rejects letters and empty text", () => {
    expect(normalizePhone("98abc34567")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });
});

describe("validatePhones", () => {
  it("returns unique valid numbers and lists the invalid ones", () => {
    const result = validatePhones(["9841234567", "+9779841234567", "9612345678"]);
    expect(result.numbers).toEqual(["9841234567"]);
    expect(result.invalid.length).toBe(1);
    expect(result.invalid[0].number).toBe("9612345678");
  });
});