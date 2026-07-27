import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            type: "Model",
            handle: "GDC",
            name: "Genomic Data Commons",
            version: "1.0",
            nanoid: "model-1",
            repository: null,
            is_latest_version: true,
          },
        ],
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the STS explorer and loaded models", async () => {
    renderApp();

    expect(
      screen.getByRole("heading", {
        name: "Explore terminology across connected data models",
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: /Genomic Data Commons/ }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Data model")).toBeEnabled();
  });
});
