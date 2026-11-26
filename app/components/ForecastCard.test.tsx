// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ForecastCard from "./ForecastCard";
import type { ForecastDay } from "@/lib/types";

describe("ForecastCard", () => {
  it("renders a labeled bar per forecast day with a PM2.5 reading", () => {
    const forecast: ForecastDay[] = [
      { date: "2026-01-01", pm25Avg: 40 },
      { date: "2026-01-02", pm25Avg: 80 },
    ];
    render(<ForecastCard forecast={forecast} />);
    expect(screen.getByText("PM2.5 forecast")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("ignores days without a PM2.5 reading", () => {
    const forecast: ForecastDay[] = [
      { date: "2026-01-01", pm25Avg: null },
      { date: "2026-01-02", pm25Avg: 50 },
    ];
    render(<ForecastCard forecast={forecast} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders nothing when there is no usable forecast data", () => {
    const { container } = render(
      <ForecastCard forecast={[{ date: "2026-01-01", pm25Avg: null }]} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
