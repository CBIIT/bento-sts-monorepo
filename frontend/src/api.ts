import type { StsModel, StsNode, StsProperty } from "./types";

export const API_BASE_URL =
  import.meta.env.VITE_STS_API_BASE_URL?.replace(/\/$/, "") ?? "/api/v2";

export class StsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "StsApiError";
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      // Preserve the HTTP status text when the response is not JSON.
    }
    throw new StsApiError(detail || "The STS API request failed.", response.status);
  }

  return response.json() as Promise<T>;
}

function encodePath(value: string): string {
  return encodeURIComponent(value);
}

export const stsApi = {
  getModels: (signal?: AbortSignal) =>
    getJson<StsModel[]>("/models/?limit=100", signal),

  getVersions: (model: string, signal?: AbortSignal) =>
    getJson<string[]>(`/model/${encodePath(model)}/versions?limit=100`, signal),

  getNodes: (model: string, version: string, signal?: AbortSignal) =>
    getJson<StsNode[]>(
      `/model/${encodePath(model)}/version/${encodePath(version)}/nodes?limit=250`,
      signal,
    ),

  getProperties: (
    model: string,
    version: string,
    node: string,
    signal?: AbortSignal,
  ) =>
    getJson<StsProperty[]>(
      `/model/${encodePath(model)}/version/${encodePath(version)}/node/${encodePath(node)}/properties?limit=250`,
      signal,
    ),
};
