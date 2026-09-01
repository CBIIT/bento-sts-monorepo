"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { listModels, searchEntities, searchTerms, type SearchEntity } from "../data/adapter";
import { getModel, getNode, getValueSet, type Model, type Term } from "../data/mock-data";
import { replaceRouteQuery } from "../router";
import { Badge, Breadcrumbs, PageIntro } from "./EntityUi";

function replaceQuery(values: Record<string, string | boolean>) {
  replaceRouteQuery(values);
}

export function ModelsExplorer({ initialIncludePrevious = false }: { initialIncludePrevious?: boolean }) {
  const [includePrevious, setIncludePrevious] = useState(initialIncludePrevious);
  const [items, setItems] = useState<Model[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    listModels(includePrevious).then((data) => { setItems(data); setStatus("success"); }).catch(() => setStatus("error"));
    replaceQuery({ previous: includePrevious });
  }, [includePrevious]);

  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Models" }]} />
      <PageIntro eyebrow="Metadata catalog" title="Browse data models" description="Explore current biomedical data models and follow their nodes and properties down to permissible terminology." actions={<a className="button button-primary" href="/compare">Compare models</a>} />
      <div className="filter-bar"><div><strong>Model versions</strong><span>Current versions are shown by default.</span></div><label className="switch-label"><input type="checkbox" checked={includePrevious} onChange={(event) => { setStatus("loading"); setIncludePrevious(event.target.checked); }} /><span>Include previous versions</span></label></div>
      <div className="results-heading"><p role="status" aria-live="polite">{status === "success" ? `${items.length} models found` : status === "loading" ? "Loading models…" : "Models could not be loaded."}</p><span>Sorted by name and version</span></div>
      {status === "loading" && <div className="loading-panel" role="status">Loading model catalog…</div>}
      {status === "error" && <div className="error-panel" role="alert"><h2>We could not load the model catalog</h2><button className="button button-secondary" onClick={() => setIncludePrevious((value) => !value)}>Retry</button></div>}
      {status === "success" && <div className="model-list" aria-label="Available biomedical data models">{items.map((model) => <article className="model-card" key={model.id}><div className="model-card-main"><div className="card-kicker"><span>Data model</span><Badge tone={model.current ? "success" : "neutral"}>{model.current ? "Current" : "Previous"}</Badge></div><h2><a href={`/models/${model.id}`}>{model.name}</a></h2><p>{model.description}</p><div className="handle-row"><code>{model.handle}</code><span>Version {model.version}</span></div></div><dl className="count-list"><div><dt>Nodes</dt><dd>{model.counts.nodes}</dd></div><div><dt>Relationships</dt><dd>{model.counts.relationships}</dd></div><div><dt>Properties</dt><dd>{model.counts.properties}</dd></div></dl></article>)}</div>}
      <nav className="pagination" aria-label="Pagination"><button disabled aria-current="page">1</button></nav>
    </section>
  );
}

export function SearchExplorer({ initialQuery = "", initialDefinitions = false, initialType = "All" }: { initialQuery?: string; initialDefinitions?: boolean; initialType?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [includeDefinitions, setIncludeDefinitions] = useState(initialDefinitions);
  const [type, setType] = useState(initialType);
  const [results, setResults] = useState<SearchEntity[]>([]);
  const [searched, setSearched] = useState(Boolean(initialQuery));
  const [loading, setLoading] = useState(Boolean(initialQuery));

  useEffect(() => {
    if (!initialQuery) return;
    searchEntities(initialQuery, initialDefinitions).then((data) => {
      setResults(initialType === "All" ? data : data.filter((item) => item.type === initialType));
      setLoading(false);
    });
  }, [initialDefinitions, initialQuery, initialType]);

  async function runSearch(nextQuery = query, definitions = includeDefinitions, selectedType = type) {
    if (!nextQuery.trim()) {
      setLoading(false); setSearched(false); setResults([]);
      replaceQuery({});
      return;
    }
    setLoading(true); setSearched(true);
    const data = await searchEntities(nextQuery, definitions);
    setResults(selectedType === "All" ? data : data.filter((item) => item.type === selectedType));
    setLoading(false);
    replaceQuery({ q: nextQuery, definitions, type: selectedType === "All" ? "" : selectedType });
  }

  const grouped = useMemo(() => results.reduce((groups, result) => {
    const existing = groups.get(result.modelId) ?? [];
    existing.push(result);
    groups.set(result.modelId, existing);
    return groups;
  }, new Map<string, SearchEntity[]>()), [results]);

  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <PageIntro eyebrow="Catalog search" title="Search metadata entities" description="Search handles across models, nodes, and properties. Add definitions when you need a broader conceptual match." />
      <form className="search-workspace" onSubmit={(event: FormEvent) => { event.preventDefault(); void runSearch(); }}>
        <label htmlFor="entity-query">Search models, nodes, and properties</label>
        <div className="search-line"><input id="entity-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try sample, participant, or response" /><button className="button button-primary" type="submit">Search</button></div>
        <div className="search-options"><label><input type="checkbox" checked={includeDefinitions} onChange={(event) => setIncludeDefinitions(event.target.checked)} /> Include definitions</label><label>Entity type<select value={type} onChange={(event) => setType(event.target.value)}><option>All</option><option>Model</option><option>Node</option><option>Property</option></select></label><span className="default-note">Current versions only</span></div>
      </form>
      <div className="results-panel">
        <div className="results-panel-header"><div><p className="eyebrow">Search results</p><h2>{searched ? `${results.length} entities` : "Start with a handle or concept"}</h2></div>{searched && <button className="text-button" onClick={() => { setQuery(""); setResults([]); setSearched(false); replaceQuery({}); }}>Clear search</button>}</div>
        {loading && <div className="loading-panel" role="status">Searching metadata…</div>}
        {!loading && searched && results.length === 0 && <div className="empty-state"><h3>No matching entities</h3><p>Check the spelling or include definitions for a broader result.</p></div>}
        {!loading && [...grouped.entries()].map(([modelId, entities]) => { const model = getModel(modelId); return <section className="result-group" key={modelId}><div className="result-group-title"><div><span>Model</span><h3>{model?.name ?? modelId}</h3></div><span>Version {model?.version ?? "Not available"}</span></div><div>{entities.map((entity) => { const href = entity.type === "Model" ? `/models/${entity.id}` : entity.type === "Node" ? `/models/${entity.modelId}/nodes/${entity.id}` : `/models/${entity.modelId}/properties/${entity.id}`; return <a className="search-result" key={entity.id} href={href}><span className="result-icon" aria-hidden="true">{entity.type.slice(0, 1)}</span><span><strong>{entity.handle}</strong><small>{entity.type} · {entity.definition || "No definition available"}</small></span><span aria-hidden="true">→</span></a>; })}</div></section>; })}
      </div>
    </section>
  );
}

export function TermsExplorer({ initialQuery = "", initialOrigin = "all", initialDefinitions = false }: { initialQuery?: string; initialOrigin?: string; initialDefinitions?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [origin, setOrigin] = useState(initialOrigin);
  const [includeDefinitions, setIncludeDefinitions] = useState(initialDefinitions);
  const [results, setResults] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchTerms(initialQuery, initialDefinitions, initialOrigin).then((data) => { setResults(data); setLoading(false); });
  }, [initialDefinitions, initialOrigin, initialQuery]);

  async function runSearch(nextQuery = query, definitions = includeDefinitions, nextOrigin = origin) {
    setLoading(true);
    const data = await searchTerms(nextQuery, definitions, nextOrigin);
    setResults(data); setLoading(false);
    replaceQuery({ q: nextQuery, definitions, origin: nextOrigin === "all" ? "" : nextOrigin });
  }

  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Terms" }]} />
      <PageIntro eyebrow="Terminology" title="Browse permissible terms" description="Find controlled terms, inspect their origins, and see which value sets and model properties they define." />
      <form className="search-workspace compact-search" onSubmit={(event) => { event.preventDefault(); void runSearch(); }}><label htmlFor="term-query">Search term values</label><div className="search-line"><input id="term-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Blood or Complete Response" /><button className="button button-primary">Search terms</button></div><div className="search-options"><label><input type="checkbox" checked={includeDefinitions} onChange={(event) => setIncludeDefinitions(event.target.checked)} /> Include definitions</label><label>Origin<select value={origin} onChange={(event) => { setOrigin(event.target.value); void runSearch(query, includeDefinitions, event.target.value); }}><option value="all">All origins</option><option value="caDSR">caDSR</option><option value="NCIt">NCIt</option></select></label></div></form>
      <div className="results-heading"><p role="status" aria-live="polite">{loading ? "Loading terms…" : `${results.length} terms found`}</p><span>Sorted by term value</span></div>
      {loading ? <div className="loading-panel" role="status">Loading terminology…</div> : <div className="term-table-wrap"><table><thead><tr><th scope="col">Term</th><th scope="col">Origin</th><th scope="col">Value sets</th><th scope="col">Defines</th></tr></thead><tbody>{results.map((term) => <tr key={term.id}><th scope="row"><a href={`/terms/${term.id}`}>{term.value}</a><small>{term.definition}</small></th><td><Badge tone="purple">{term.origin}</Badge><code>{term.originId}</code></td><td>{term.valueSetIds.map((id) => getValueSet(id)?.handle).join(", ")}</td><td>{term.defines.map((id) => getNode(id)?.handle ?? id.replace("PROP-", "").toLocaleLowerCase()).join(", ")}</td></tr>)}</tbody></table></div>}
    </section>
  );
}
