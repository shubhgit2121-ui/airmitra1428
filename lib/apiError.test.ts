import { describe, expect, it, vi } from "vitest";
import { errorResponse } from "./apiError";
import { ValidationError } from "./validate";

describe("errorResponse", () => {
  it("returns 400 for validation errors without logging", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse("/api/test", new ValidationError("bad input"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "bad input" });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("returns 500 and logs for unexpected errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse("/api/test", new Error("boom"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "boom" });
    expect(spy).toHaveBeenCalledWith("[/api/test]", expect.any(Error));
    spy.mockRestore();
  });

  it("falls back to a generic message for non-Error throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse("/api/test", "not an error object");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Something went wrong." });
    spy.mockRestore();
  });
});
