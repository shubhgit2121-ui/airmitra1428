// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileSidebar from "./ProfileSidebar";
import { DEFAULT_PROFILE } from "@/lib/constants";

describe("ProfileSidebar", () => {
  it("marks selected household tags with aria-pressed", () => {
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={() => {}} loading={false} updatedAt={null} />
    );
    expect(screen.getByRole("button", { name: "Young kids" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Elderly" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("adds a household tag on toggle", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={onChange} loading={false} updatedAt={null} />
    );
    await user.click(screen.getByRole("button", { name: "Elderly" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ household: expect.arrayContaining(["young_kids", "elderly"]) })
    );
  });

  it("edits the city field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileSidebar
        profile={{ ...DEFAULT_PROFILE, city: "" }}
        onChange={onChange}
        loading={false}
        updatedAt={null}
      />
    );
    await user.type(screen.getByLabelText("City"), "M");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ city: "M" }));
  });

  it("shows the loading status while a plan is being fetched", () => {
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={() => {}} loading={true} updatedAt={null} />
    );
    expect(screen.getByText(/Reading today's air/i)).toBeInTheDocument();
  });
});
