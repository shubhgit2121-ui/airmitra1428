// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardShell from "./DashboardShell";

describe("DashboardShell", () => {
  it("renders the sidebar and main content in labeled landmarks", () => {
    render(
      <DashboardShell sidebar={<p>Sidebar content</p>}>
        <p>Main content</p>
      </DashboardShell>
    );

    expect(
      screen.getByRole("complementary", { name: "Household profile" })
    ).toHaveTextContent("Sidebar content");

    const main = screen.getByText("Main content").closest("main");
    expect(main).toHaveAttribute("id", "main-content");
  });
});
