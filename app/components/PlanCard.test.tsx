// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanCard from "./PlanCard";
import type { SmogPlan } from "@/lib/types";

const plan: SmogPlan = {
  headline: "Protect the kids today",
  aqiSummary: "Air is unhealthy.",
  routines: [{ title: "Skip the jog", action: "Stay in", why: "Traffic peaks", impact: "Less dose" }],
  indoor: [{ title: "DIY HEPA", action: "Build a box fan", why: "Filters PM2.5", impact: "Cleaner room" }],
  sustainable: [],
};

describe("PlanCard", () => {
  it("renders the headline and only the non-empty category tabs", () => {
    render(<PlanCard plan={plan} />);
    expect(screen.getByText("Protect the kids today")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Daily routines" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Indoor air hacks" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Sustainable swaps" })).not.toBeInTheDocument();
  });

  it("shows the first tab's tips by default with aria-selected set", () => {
    render(<PlanCard plan={plan} />);
    expect(screen.getByRole("tab", { name: "Daily routines" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Skip the jog")).toBeInTheDocument();
  });

  it("switches tabs on click", async () => {
    const user = userEvent.setup();
    render(<PlanCard plan={plan} />);
    await user.click(screen.getByRole("tab", { name: "Indoor air hacks" }));
    expect(screen.getByText("DIY HEPA")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Indoor air hacks" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("renders nothing when every category is empty", () => {
    const { container } = render(
      <PlanCard plan={{ ...plan, routines: [], indoor: [], sustainable: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
