import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileJson2,
  Info,
  Layers3,
  Menu,
  Search,
  ServerCog,
  X,
} from "lucide-react";
import { API_BASE_URL, stsApi } from "./api";
import type { StsModel, StsProperty } from "./types";

const modelKey = (model: StsModel): string =>
  model.name ?? model.handle ?? "unnamed-model";

function App() {
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectedNode, setSelectedNode] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const modelsQuery = useQuery({
    queryKey: ["models"],
    queryFn: ({ signal }) => stsApi.getModels(signal),
  });

  const models = modelsQuery.data ?? [];
  const availableModels = useMemo(
    () =>
      Array.from(
        models.reduce((byName, model) => {
          const key = modelKey(model);
          const current = byName.get(key);
          if (!current || model.is_latest_version || !current.is_latest_version) {
            byName.set(key, model);
          }
          return byName;
        }, new Map<string, StsModel>()),
      ).map(([, model]) => model),
    [models],
  );
  const filteredModels = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return availableModels;
    return availableModels.filter((model) =>
      [model.handle, model.name, model.version]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalized)),
    );
  }, [availableModels, query]);

  const versionsQuery = useQuery({
    queryKey: ["versions", selectedModel],
    queryFn: ({ signal }) => stsApi.getVersions(selectedModel, signal),
    enabled: Boolean(selectedModel),
  });

  useEffect(() => {
    if (!selectedModel || !versionsQuery.data?.length) {
      setSelectedVersion("");
      return;
    }
    const latest =
      availableModels.find((model) => modelKey(model) === selectedModel)?.version ??
      versionsQuery.data.at(-1) ??
      "";
    setSelectedVersion((current) =>
      current && versionsQuery.data.includes(current) ? current : latest,
    );
  }, [availableModels, selectedModel, versionsQuery.data]);

  const nodesQuery = useQuery({
    queryKey: ["nodes", selectedModel, selectedVersion],
    queryFn: ({ signal }) =>
      stsApi.getNodes(selectedModel, selectedVersion, signal),
    enabled: Boolean(selectedModel && selectedVersion),
  });

  useEffect(() => {
    if (!nodesQuery.data?.some((node) => node.handle === selectedNode)) {
      setSelectedNode("");
    }
  }, [nodesQuery.data, selectedNode]);

  const propertiesQuery = useQuery({
    queryKey: ["properties", selectedModel, selectedVersion, selectedNode],
    queryFn: ({ signal }) =>
      stsApi.getProperties(
        selectedModel,
        selectedVersion,
        selectedNode,
        signal,
      ),
    enabled: Boolean(selectedModel && selectedVersion && selectedNode),
  });

  const apiDocsUrl = API_BASE_URL.startsWith("http")
    ? `${API_BASE_URL.replace(/\/v\d+$/, "")}/docs`
    : "http://localhost:8000/docs";

  return (
    <div className="app-shell">
      <div className="site-alert" role="region" aria-label="Demo notice">
        <div className="content-row site-alert__inner">
          <Info aria-hidden="true" size={20} />
          <p>
            This is a demonstration of the next STS interface. Data is read
            directly from the connected Simple Terminology Server API.
          </p>
        </div>
      </div>

      <header className="site-header">
        <div className="content-row brand-row">
          <a className="brand" href="#home" aria-label="STS Explorer home">
            <span className="brand__mark" aria-hidden="true">
              NCI
            </span>
            <span className="brand__copy">
              <span>National Cancer Institute</span>
              <strong>Simple Terminology Server</strong>
            </span>
          </a>
          <span className="demo-chip">API Explorer</span>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <div className="content-row primary-nav__inner">
            <a href="#home">Home</a>
            <a href="#explorer">Explore</a>
            <a href={apiDocsUrl} target="_blank" rel="noreferrer">
              API <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href="#about">About</a>
            <button
              className="nav-menu-button"
              type="button"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X /> : <Menu />}
              Menu
            </button>
          </div>
          {mobileNavOpen && (
            <div className="mobile-menu content-row" id="mobile-menu">
              <a href="#home" onClick={() => setMobileNavOpen(false)}>
                Home
              </a>
              <a href="#explorer" onClick={() => setMobileNavOpen(false)}>
                Explore
              </a>
              <a href="#about" onClick={() => setMobileNavOpen(false)}>
                About
              </a>
            </div>
          )}
        </nav>
      </header>

      <main id="main-content">
        <section className="hero network-pattern" id="home">
          <div className="hero__wedge">
            <p className="eyebrow">NCI data model vocabulary</p>
            <h1>Explore terminology across connected data models</h1>
            <p>
              Find a model, choose a version, and inspect its nodes and
              properties through one consistent STS interface.
            </p>
          </div>

          <div className="hero__search-panel">
            <label htmlFor="model-search">Search available models</label>
            <div className="search-box">
              <Search aria-hidden="true" />
              <input
                id="model-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by model name, handle, or version"
              />
            </div>
            <p className="search-meta" aria-live="polite">
              {modelsQuery.isLoading
                ? "Connecting to STS…"
                : modelsQuery.isError
                  ? "STS is not available. Start the backend to load models."
                : `${filteredModels.length} of ${availableModels.length} models shown`}
            </p>
            <div className="model-pills" aria-label="Available models">
              {filteredModels.slice(0, 8).map((model) => {
                const key = modelKey(model);
                return (
                  <button
                    key={`${key}-${model.version ?? "none"}`}
                    type="button"
                    className={selectedModel === key ? "is-selected" : ""}
                    aria-pressed={selectedModel === key}
                    onClick={() => setSelectedModel(key)}
                  >
                    <Database size={16} aria-hidden="true" />
                    <span>{model.name ?? key}</span>
                    {model.version && <small>v{model.version}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="explorer-section" id="explorer">
          <div className="content-row">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Live API workflow</p>
                <h2>Data model explorer</h2>
              </div>
              <span className="connection-badge">
                <span
                  className={
                    modelsQuery.isError
                      ? "connection-dot is-offline"
                      : "connection-dot"
                  }
                />
                {modelsQuery.isError ? "API offline" : "STS API"}
              </span>
            </div>

            {modelsQuery.isError ? (
              <ApiEmptyState onRetry={() => void modelsQuery.refetch()} />
            ) : (
              <div className="explorer-grid">
                <ExplorerStep
                  number="01"
                  title="Model"
                  description="Choose a model handle."
                  complete={Boolean(selectedModel)}
                >
                  <label htmlFor="model-select">Data model</label>
                  <select
                    id="model-select"
                    value={selectedModel}
                    onChange={(event) => setSelectedModel(event.target.value)}
                    disabled={modelsQuery.isLoading || !availableModels.length}
                  >
                    <option value="">Select a model</option>
                    {availableModels.map((model) => {
                      const key = modelKey(model);
                      return (
                        <option
                          key={`${key}-${model.version ?? "none"}`}
                          value={key}
                        >
                          {model.name ?? key}
                          {model.version ? ` — ${model.version}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </ExplorerStep>

                <ExplorerStep
                  number="02"
                  title="Version"
                  description="Select the schema version."
                  complete={Boolean(selectedVersion)}
                >
                  <label htmlFor="version-select">Model version</label>
                  <select
                    id="version-select"
                    value={selectedVersion}
                    onChange={(event) => setSelectedVersion(event.target.value)}
                    disabled={!selectedModel || versionsQuery.isLoading}
                  >
                    <option value="">
                      {versionsQuery.isLoading ? "Loading…" : "Select a version"}
                    </option>
                    {versionsQuery.data?.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </ExplorerStep>

                <ExplorerStep
                  number="03"
                  title="Node"
                  description="Open an entity definition."
                  complete={Boolean(selectedNode)}
                >
                  <label htmlFor="node-select">Model node</label>
                  <select
                    id="node-select"
                    value={selectedNode}
                    onChange={(event) => setSelectedNode(event.target.value)}
                    disabled={!selectedVersion || nodesQuery.isLoading}
                  >
                    <option value="">
                      {nodesQuery.isLoading ? "Loading…" : "Select a node"}
                    </option>
                    {nodesQuery.data?.map((node) => (
                      <option
                        key={node.nanoid ?? node.handle}
                        value={node.handle ?? ""}
                      >
                        {node.handle}
                      </option>
                    ))}
                  </select>
                </ExplorerStep>
              </div>
            )}

            <div className="result-panel">
              <div className="result-panel__header">
                <div>
                  <p className="eyebrow">Property results</p>
                  <h3>
                    {selectedNode || "Choose a node to inspect its properties"}
                  </h3>
                </div>
                {selectedNode && (
                  <span>{propertiesQuery.data?.length ?? 0} properties</span>
                )}
              </div>
              <PropertyResults
                properties={propertiesQuery.data}
                isLoading={propertiesQuery.isLoading}
                isError={propertiesQuery.isError}
                hasNode={Boolean(selectedNode)}
              />
            </div>
          </div>
        </section>

        <section className="feature-band" id="about">
          <div className="feature-band__visual" aria-hidden="true">
            <div className="orbit orbit--one">
              <span>Model</span>
            </div>
            <div className="orbit orbit--two">
              <span>Node</span>
            </div>
            <div className="orbit orbit--three">
              <span>Term</span>
            </div>
            <div className="connector connector--one" />
            <div className="connector connector--two" />
          </div>
          <div className="feature-band__copy">
            <p className="eyebrow">One API, consistent semantics</p>
            <h2>Built for discovery first, automation next.</h2>
            <p>
              STS exposes graph-based models as predictable HTTP resources. The
              UI makes that structure visible while keeping the API available
              for pipelines and downstream applications.
            </p>
            <div className="feature-list">
              <span>
                <Layers3 aria-hidden="true" /> Browse model structure
              </span>
              <span>
                <FileJson2 aria-hidden="true" /> Inspect typed responses
              </span>
              <span>
                <ServerCog aria-hidden="true" /> Deploy UI and API independently
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="content-row footer-grid">
          <div>
            <div className="brand brand--footer">
              <span className="brand__mark" aria-hidden="true">
                NCI
              </span>
              <span className="brand__copy">
                <span>National Cancer Institute</span>
                <strong>Simple Terminology Server</strong>
              </span>
            </div>
            <p>A demonstration interface for NCI data model terminology.</p>
          </div>
          <div>
            <h2>Resources</h2>
            <a href={apiDocsUrl}>API documentation</a>
            <a href="#explorer">Model explorer</a>
          </div>
          <div>
            <h2>Policies</h2>
            <a href="https://www.cancer.gov/policies/accessibility">
              Accessibility
            </a>
            <a href="https://www.cancer.gov/policies/disclaimer">Disclaimer</a>
          </div>
        </div>
        <div className="footer-government">
          <div className="content-row">
            National Institutes of Health · National Cancer Institute · USA.gov
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ExplorerStepProps {
  number: string;
  title: string;
  description: string;
  complete: boolean;
  children: React.ReactNode;
}

function ExplorerStep({
  number,
  title,
  description,
  complete,
  children,
}: ExplorerStepProps) {
  return (
    <div className="explorer-step">
      <div className="explorer-step__top">
        <span className="step-number">{complete ? <CheckCircle2 /> : number}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="explorer-step__control">{children}</div>
    </div>
  );
}

function ApiEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="api-empty-state" role="alert">
      <ServerCog aria-hidden="true" />
      <div>
        <h3>Start the STS backend to explore live data</h3>
        <p>
          The interface is ready, but it could not reach <code>{API_BASE_URL}</code>.
        </p>
      </div>
      <button type="button" onClick={onRetry}>
        Try again <ArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}

function PropertyResults({
  properties,
  isLoading,
  isError,
  hasNode,
}: {
  properties?: StsProperty[];
  isLoading: boolean;
  isError: boolean;
  hasNode: boolean;
}) {
  if (!hasNode) {
    return (
      <div className="result-placeholder">
        <Layers3 aria-hidden="true" />
        <p>The selected node’s fields, value domains, and requirements appear here.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="result-placeholder" aria-live="polite">
        <span className="spinner" />
        <p>Loading property definitions…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="result-placeholder" role="alert">
        <Info aria-hidden="true" />
        <p>Properties could not be loaded from the STS API.</p>
      </div>
    );
  }

  if (!properties?.length) {
    return (
      <div className="result-placeholder">
        <FileJson2 aria-hidden="true" />
        <p>This node does not expose any properties.</p>
      </div>
    );
  }

  return (
    <div className="property-table-wrap">
      <table>
        <caption className="sr-only">Properties for the selected model node</caption>
        <thead>
          <tr>
            <th scope="col">Property</th>
            <th scope="col">Value domain</th>
            <th scope="col">Required</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.nanoid ?? property.handle}>
              <th scope="row">{property.handle}</th>
              <td>
                <code>{property.value_domain}</code>
              </td>
              <td>{formatRequired(property.is_required)}</td>
              <td>{property.desc || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatRequired(value: StsProperty["is_required"]): string {
  if (value === true || value === "true" || value === "Yes") return "Yes";
  if (value === false || value === "false" || value === "No") return "No";
  return value ? String(value) : "—";
}

export default App;
