// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("shows the last-updated time once a reading has come back", () => {
    render(
      <ProfileSidebar
        profile={DEFAULT_PROFILE}
        onChange={() => {}}
        loading={false}
        updatedAt="2026-01-01T10:00:00.000Z"
      />
    );
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it("removes a household tag on toggle-off", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={onChange} loading={false} updatedAt={null} />
    );
    await user.click(screen.getByRole("button", { name: "Young kids" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ household: ["none"] }));
  });

  it("changes the commute mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={onChange} loading={false} updatedAt={null} />
    );
    await user.selectOptions(screen.getByLabelText("Commute"), "transit");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ commute: "transit" }));
  });

  it("changes outdoor exercise habit and cooking fuel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={onChange} loading={false} updatedAt={null} />
    );
    await user.selectOptions(screen.getByLabelText("Outdoor exercise"), "evening");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ exercise: "evening" }));

    await user.selectOptions(screen.getByLabelText("Cooking fuel"), "electric");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cooking: "electric" }));
  });

  it("updates commuteKm from the number input and falls back to 0 for invalid input", () => {
    const onChange = vi.fn();
    render(
      <ProfileSidebar profile={DEFAULT_PROFILE} onChange={onChange} loading={false} updatedAt={null} />
    );
    const kmInput = screen.getByLabelText(/km one-way/i);

    fireEvent.change(kmInput, { target: { value: "25" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ commuteKm: 25 }));

    fireEvent.change(kmInput, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ commuteKm: 0 }));
  });
});
