// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AqiHeroCard from "./AqiHeroCard";
import type { AqiData } from "@/lib/types";

const aqi: AqiData = {
  city: "Delhi",
  aqi: 164,
  category: "Unhealthy",
  pm25: 164,
  dominantPollutant: "PM2.5",
  updatedAt: null,
  pollutants: [],
  forecast: [],
};

describe("AqiHeroCard", () => {
  it("exposes an accessible label combining the index and category", () => {
    render(<AqiHeroCard aqi={aqi} summary="Air is unhealthy." loading={false} />);
    expect(screen.getByLabelText("US AQI 164, Unhealthy")).toBeInTheDocument();
  });

  it("renders the summary and PM2.5 reading", () => {
    render(<AqiHeroCard aqi={aqi} summary="Air is unhealthy." loading={false} />);
    expect(screen.getByText("Air is unhealthy.")).toBeInTheDocument();
    expect(screen.getByText("164 µg/m³")).toBeInTheDocument();
  });

  it("omits the PM2.5 row when the station doesn't report it", () => {
    render(<AqiHeroCard aqi={{ ...aqi, pm25: null }} loading={false} />);
    expect(screen.queryByText(/µg\/m³/)).not.toBeInTheDocument();
  });
});
