import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom doesn't implement Element.scrollTo; components call it harmlessly.
if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// Unmount React trees between tests so DOM queries don't leak across cases.
afterEach(() => {
  cleanup();
});
