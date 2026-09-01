import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v1/#/");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});

it("renders the Metadata Explorer v1 Home", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Metadata Explorer" })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Search" })).toBeInTheDocument();
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
  const controls = screen.getByRole("group", { name: "Free-form graph display" });
  expect(within(controls).getAllByRole("button").map((button) => button.textContent)).toEqual(["A/B side by side", "Overlay", "Model A", "Model B"]);
  expect(screen.queryByText("Refine comparison results")).not.toBeInTheDocument();
});

it("searches value sets when the option is enabled and opens their detail page", async () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v1/#/search?q=response_values");
  render(<App />);
  const includeValueSets = screen.getByRole("checkbox", { name: "Include value sets" });
  fireEvent.click(includeValueSets);
  const result = await screen.findByRole("link", { name: /response_values/ });
  fireEvent.click(result);
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "response_values" })).toBeInTheDocument());
  expect(screen.getByRole("heading", { level: 2, name: "Permissible terms" })).toBeInTheDocument();
});

it("links the diagnosis property to its value-set detail page", async () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v1/#/models/MODEL-CLINICAL-1/properties/PROP-DIAGNOSIS-CODE");
  render(<App />);
  const valueSetLink = screen.getAllByRole("link", { name: "response_values" })[0];
  expect(valueSetLink).toHaveAttribute("href", "/value-sets/VS-RESPONSE");
});

it("provides searchable, sortable, paginated value-set accordions", () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v1/#/compare?view=stack");
  render(<App />);
  expect(screen.getByRole("searchbox", { name: "Search Model A stack" })).toBeInTheDocument();
  expect(screen.getByRole("searchbox", { name: "Search Model B stack" })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Value-set stack pagination" })).toHaveTextContent("Page 1 of 3");
  expect(screen.getByRole("group", { name: "Order value-set stacks by status" })).toBeInTheDocument();
  expect(document.querySelector("details.stack-comparison")).toBeInTheDocument();
});
