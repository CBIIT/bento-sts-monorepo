import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v1/#/");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});

it("renders the Metadata Explorer v1 Home", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Metadata Explorer" })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
});

it("navigates to the model browser through the static hash router", async () => {
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "Models" }));
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Browse data models" })).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("2 models found")).toBeInTheDocument());
});

it("keeps every comparison mode available", async () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v1/#/compare?view=freeform");
  render(<App />);
  expect(await screen.findByRole("tab", { name: "Graph alignment" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Free-form graph" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "Value-set stacks" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Overlay" })).toBeInTheDocument();
});
