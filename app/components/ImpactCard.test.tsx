// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ImpactCard from "./ImpactCard";
import type { ImpactMeter } from "@/lib/types";

const impact: ImpactMeter = {
  cigarettesPerDay: 7.5,
  cigarettesNote: "Breathing today's air is like smoking a few cigarettes.",
  co2SavedKg: 3.4,
  co2Note: "Switching to transit would cut CO2.",
};

describe("ImpactCard", () => {
  it("renders both headline numbers and their notes", () => {
    render(<ImpactCard impact={impact} />);
    expect(screen.getByText("7.5")).toBeInTheDocument();
    expect(screen.getByText("3.4")).toBeInTheDocument();
    expect(screen.getByText(impact.cigarettesNote)).toBeInTheDocument();
    expect(screen.getByText(impact.co2Note)).toBeInTheDocument();
  });
});
