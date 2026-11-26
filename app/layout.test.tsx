// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout, { metadata } from "./layout";

vi.mock("next/font/google", () => ({
  Archivo: () => ({ variable: "--font-archivo" }),
}));

describe("metadata", () => {
  it("sets the page title and description", () => {
    expect(metadata.title).toMatch(/AirMitra/);
    expect(metadata.description).toMatch(/air-quality/i);
  });
});

describe("RootLayout", () => {
  it("renders a skip-to-content link ahead of the page content", () => {
    render(
      <RootLayout>
        <p>Dashboard</p>
      </RootLayout>
    );

    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
