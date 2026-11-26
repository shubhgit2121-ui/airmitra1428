// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatDock from "./ChatDock";
import { DEFAULT_PROFILE } from "@/lib/constants";
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

describe("ChatDock", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Better to stay indoors today." }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is collapsed by default and opens on click", async () => {
    const user = userEvent.setup();
    render(<ChatDock profile={DEFAULT_PROFILE} aqi={aqi} />);

    const toggle = screen.getByRole("button", { name: "Ask AirMitra" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByRole("dialog", { name: "Ask AirMitra" })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("closes when Escape is pressed inside the dialog", async () => {
    const user = userEvent.setup();
    render(<ChatDock profile={DEFAULT_PROFILE} aqi={aqi} />);
    await user.click(screen.getByRole("button", { name: "Ask AirMitra" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sends a suggestion and renders the model's reply", async () => {
    const user = userEvent.setup();
    render(<ChatDock profile={DEFAULT_PROFILE} aqi={aqi} />);
    await user.click(screen.getByRole("button", { name: "Ask AirMitra" }));

    await user.click(screen.getByRole("button", { name: "Should I wear a mask today?" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({ method: "POST" })
    );
    await waitFor(() =>
      expect(screen.getByText("Better to stay indoors today.")).toBeInTheDocument()
    );
  });

  it("sends a typed message when the form is submitted", async () => {
    const user = userEvent.setup();
    render(<ChatDock profile={DEFAULT_PROFILE} aqi={aqi} />);
    await user.click(screen.getByRole("button", { name: "Ask AirMitra" }));

    const input = screen.getByLabelText("Type your question for AirMitra");
    await user.type(input, "Should I run the purifier?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({ method: "POST" })
    );
    await waitFor(() =>
      expect(screen.getByText("Better to stay indoors today.")).toBeInTheDocument()
    );
  });

  it("shows a friendly message when the network fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<ChatDock profile={DEFAULT_PROFILE} aqi={aqi} />);
    await user.click(screen.getByRole("button", { name: "Ask AirMitra" }));
    await user.click(screen.getByRole("button", { name: "Should I wear a mask today?" }));

    await waitFor(() =>
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    );
  });
});
