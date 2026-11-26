// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import { usePlan } from "./hooks/usePlan";
import type { PlanResponse } from "@/lib/types";

vi.mock("./hooks/usePlan", () => ({ usePlan: vi.fn() }));

const tip = { title: "Tip", action: "Do this", why: "Because", impact: "Helps a lot" };

const planResponse: PlanResponse = {
  aqi: {
    city: "Delhi",
    aqi: 150,
    category: "Unhealthy for Sensitive Groups",
    pm25: 90,
    dominantPollutant: "PM2.5",
    updatedAt: "2026-01-01T10:00:00.000Z",
    pollutants: [{ key: "pm25", label: "PM2.5", value: 90 }],
    forecast: [{ date: "2026-01-02", pm25Avg: 80 }],
  },
  plan: {
    headline: "Today's plan",
    aqiSummary: "Air is unhealthy for sensitive groups.",
    routines: [tip],
    indoor: [tip],
    sustainable: [tip],
  },
  impact: {
    cigarettesPerDay: 4.1,
    cigarettesNote: "note",
    co2SavedKg: 1.2,
    co2Note: "note",
  },
};

describe("Home", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading skeleton before the first plan arrives", () => {
    vi.mocked(usePlan).mockReturnValue({ result: null, loading: false, error: null });
    const { container } = render(<Home />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders the full dashboard once a plan is available", () => {
    vi.mocked(usePlan).mockReturnValue({ result: planResponse, loading: false, error: null });
    render(<Home />);
    expect(screen.getByText("Today's plan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask AirMitra" })).toBeInTheDocument();
  });

  it("shows the update indicator while refreshing an existing plan", () => {
    vi.mocked(usePlan).mockReturnValue({ result: planResponse, loading: true, error: null });
    render(<Home />);
    expect(screen.getByText("Updating your dashboard…")).toBeInTheDocument();
  });

  it("surfaces a fetch error", () => {
    vi.mocked(usePlan).mockReturnValue({
      result: null,
      loading: false,
      error: "Could not build your plan.",
    });
    render(<Home />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not build your plan.");
  });

  it("prompts for a city when the city field is cleared", async () => {
    vi.mocked(usePlan).mockReturnValue({ result: null, loading: false, error: null });
    const user = userEvent.setup();
    render(<Home />);
    await user.clear(screen.getByLabelText("City"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a city to see its air quality."
    );
  });
});
