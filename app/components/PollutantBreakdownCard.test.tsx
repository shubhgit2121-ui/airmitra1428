// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PollutantBreakdownCard from "./PollutantBreakdownCard";
import type { PollutantReading } from "@/lib/types";

const pollutants: PollutantReading[] = [
  { key: "pm25", label: "PM2.5", value: 120 },
  { key: "pm10", label: "PM10", value: 80 },
];

describe("PollutantBreakdownCard", () => {
  it("labels the dominant pollutant", () => {
    render(<PollutantBreakdownCard pollutants={pollutants} dominant="PM2.5" />);
    expect(screen.getByLabelText("PM2.5: 120, main pollutant")).toBeInTheDocument();
    expect(screen.getByLabelText("PM10: 80")).toBeInTheDocument();
  });

  it("renders nothing when there are no pollutant readings", () => {
    const { container } = render(
      <PollutantBreakdownCard pollutants={[]} dominant={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
