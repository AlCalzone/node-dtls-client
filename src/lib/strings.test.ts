import { describe, expect, it } from "vitest";
import { padStart } from "./strings.js";

describe("lib/strings => padStart() =>", () => {
	it("should return a string padded to the given target length", () => {
		const targetLength = 6;
		const filler = " ";
		const result = padStart("1234", targetLength, filler);
		expect(result).toHaveLength(targetLength);
		expect(result.startsWith(filler)).toBe(true);
	});
	it("should default to a space as filler", () => {
		expect(padStart("1234", 6, " ")).toBe(padStart("1234", 6));
	});
	it("should not alter string longer than the target length", () => {
		expect(padStart("12345678", 6, " ")).toBe("12345678");
	});
	it("should throw on empty fillers", () => {
		expect(() => padStart("1234", 6, "")).toThrow("fill must be at least one char");
		expect(() => padStart("1234", 6, null)).toThrow("fill must be at least one char");
	});
	it("should truncate fillers whose length is not a multiple of the missing length", () => {
		expect(padStart("12345", 8, "ab")).toBe("aba12345");
	});
});
