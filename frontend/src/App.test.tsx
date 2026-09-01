import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v3/#/");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});

it("renders the Metadata Explorer v3 Home with the same navigation as v1", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Metadata Explorer" })).toBeInTheDocument();
  const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
  expect(within(navigation).getAllByRole("link").map((link) => link.textContent)).toEqual(["Home", "Search", "Models", "Terms", "Compare"]);
  expect(within(navigation).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
});

it("navigates to the model browser through the static hash router", async () => {
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "Open the model catalog" }));
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Browse data models" })).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("2 models found")).toBeInTheDocument());
  const navigation = screen.getByRole("navigation", { name: "Workspace navigation" });
  expect(within(navigation).queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
  expect(within(navigation).getAllByRole("link").map((link) => link.textContent)).toEqual(["Search", "Models", "Terms", "Compare"]);
  expect(within(navigation).getByRole("link", { name: "Models" })).toHaveAttribute("aria-current", "page");
});

it("keeps every comparison mode available", async () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v3/#/compare?view=freeform");
  render(<App />);
  expect(await screen.findByRole("tab", { name: "Graph alignment" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Free-form graph" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "Value-set stacks" })).toBeInTheDocument();
  const controls = screen.getByRole("group", { name: "Free-form graph display" });
  expect(within(controls).getAllByRole("button").map((button) => button.textContent)).toEqual(["A/B side by side", "Overlay", "Model A", "Model B"]);
  expect(screen.queryByText("Refine comparison results")).not.toBeInTheDocument();
});

it("searches value sets when the option is enabled and opens their detail page", async () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v3/#/search?q=response_values");
  render(<App />);
  const includeValueSets = screen.getByRole("checkbox", { name: "Include value sets" });
  fireEvent.click(includeValueSets);
  const result = await screen.findByRole("link", { name: /response_values/ });
  fireEvent.click(result);
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "response_values" })).toBeInTheDocument());
  expect(screen.getByRole("heading", { level: 2, name: "Permissible terms" })).toBeInTheDocument();
});

it("links the diagnosis property to its value-set detail page", async () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v3/#/models/MODEL-CLINICAL-1/properties/PROP-DIAGNOSIS-CODE");
  render(<App />);
  const valueSetLink = screen.getAllByRole("link", { name: "response_values" })[0];
  expect(valueSetLink).toHaveAttribute("href", "/value-sets/VS-RESPONSE");
});

it("provides searchable, sortable, paginated value-set accordions", () => {
  window.history.replaceState(null, "", "/bento-sts-monorepo/v3/#/compare?view=stack&selectedEntity=sample");
  render(<App />);
  expect(screen.getByRole("searchbox", { name: "Search by value-set property name" })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Value-set stack pagination" })).toHaveTextContent("Page 1 of 3");
  expect(screen.getByRole("group", { name: "Order value-set stacks by status" })).toBeInTheDocument();
  expect(document.querySelectorAll("details.stack-comparison")).toHaveLength(5);
  expect(screen.queryByText("Selected entity")).not.toBeInTheDocument();
  expect(window.location.hash).not.toContain("selectedEntity");

  fireEvent.change(screen.getByRole("searchbox", { name: "Search by value-set property name" }), { target: { value: "vital_status" } });
  expect(document.querySelectorAll("details.stack-comparison")).toHaveLength(1);
  expect(screen.getByText("vital_status")).toBeInTheDocument();
});
