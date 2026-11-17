import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInventory, deriveCatalog, getModelDetail, inputFromHash, inputToHash, safeExternalUrl } from './api/client';
import type { Card, CatalogInput } from './api/client';

function useLocation() {
  const [location, setLocation] = useState(window.location.hash);
  useEffect(() => { const change = () => setLocation(window.location.hash); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  return location;
}
function ErrorState({ retry }: { retry: () => void }) {
  return <div className="usa-alert usa-alert--error" role="alert"><div className="usa-alert__body"><h2 className="usa-alert__heading">Unable to load data</h2><p className="usa-alert__text">We could not reach the model data. Your selection has been preserved.</p><button className="usa-button" onClick={retry}>Retry</button></div></div>;
}
function ModelCard({ card, returnQuery }: { card: Card; returnQuery: string }) {
  const external = safeExternalUrl(card.external_url);
  return <article className="model-card" aria-label={`${card.short_name} version ${card.version}`}>
    <div className="card-top"><span className="entity-label">MODEL</span><span className="version">{card.is_current && <span>current · </span>}v{card.version}</span></div>
    <h2>{external ? <a href={external} target="_blank" rel="noopener noreferrer">{card.display_name}<span aria-label="opens in a new tab"> ↗</span></a> : card.display_name}</h2>
    <p className="model-key">Model: {card.short_name}</p>
    <div className="card-bottom"><dl className="statistics"><div><dt>Nodes</dt><dd>{card.counts.nodes}</dd></div><div><dt>Properties</dt><dd>{card.counts.properties}</dd></div><div><dt>Relationships</dt><dd>{card.counts.relationships}</dd></div></dl><a className="details-link" href={`#/model/${encodeURIComponent(card.model_id)}/${encodeURIComponent(card.version)}${returnQuery}`}>View Details <span aria-hidden="true">→</span></a></div>
  </article>;
}
function ModelDetail({ model, version, returnQuery }: { model: string; version: string; returnQuery: string }) {
  const query = useQuery({ queryKey: ['model-nodes', model, version], queryFn: ({ signal }) => getModelDetail(model, version, signal), retry: false });
  const card = query.data?.model;
  const external = safeExternalUrl(card?.external_url);
  return <div className="model-detail">
    <header className="page-header detail-header">
      <div className="detail-heading">
        <p className="entity-view">Entity View: <span>MODEL</span></p>
        <h1>{external ? <a href={external} target="_blank" rel="noopener noreferrer">{card?.display_name || model}<span aria-label="opens in a new tab"> ↗</span></a> : card?.display_name || model}</h1>
        <p className="detail-model-name">Model: {card?.short_name || model}</p>
        {card && <dl className="statistics detail-statistics" aria-label="Model statistics">
          <div><dt>Nodes</dt><dd>{card.counts.nodes}</dd></div>
          <div><dt>Properties</dt><dd>{card.counts.properties}</dd></div>
          <div><dt>Relationships</dt><dd>{card.counts.relationships}</dd></div>
        </dl>}
      </div>
      <p className="version detail-version">{card?.is_current && <span>current · </span>}<span>v{version}</span>{card?.release_date && <span> · release {card.release_date}</span>}</p>
    </header>
    <nav className="detail-breadcrumb" aria-label="Model detail navigation"><a href={`#/${returnQuery}`}>← Browse Models</a><span aria-hidden="true">/</span><span>{model}</span></nav>
    <section className="content detail-content" aria-labelledby="model-nodes-title">
      <h2 id="model-nodes-title" className="detail-section-title">Model nodes</h2>
      {query.isPending ? <p role="status">Loading model details…</p> : query.isError ? <ErrorState retry={() => void query.refetch()} /> : !card ? <div className="empty-state"><h2>Model version not found</h2><p>This model version is not in the available catalog.</p></div> : query.data.nodes.length === 0 ? <div className="empty-state"><h2>No nodes in this model version</h2><p>This model version exists but does not contain any nodes.</p></div> : <div className="table-scroll"><table className="usa-table detail-nodes"><caption>Nodes in {model}, version {version}</caption><thead><tr><th scope="col">Node</th><th scope="col">Version</th></tr></thead><tbody>{query.data.nodes.map((node, index) => <tr key={node.nanoid || `${node.handle}-${index}`}><th scope="row">{node.handle}</th><td>{node.version}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
function Browse() {
  const hash = useLocation();
  const [input, setLocalInput] = useState<CatalogInput>(() => inputFromHash(window.location.hash));
  useEffect(() => { setLocalInput(inputFromHash(hash)); }, [hash]);
  const setInput = (next: CatalogInput | ((previous: CatalogInput) => CatalogInput)) => {
    const resolved = typeof next === 'function' ? next(input) : next;
    setLocalInput(resolved);
    window.location.hash = inputToHash(resolved);
  };
  const [filterOpen, setFilterOpen] = useState(false);
  const inventoryQuery = useQuery({ queryKey: ['model-inventory'], queryFn: ({ signal }) => getInventory(signal), staleTime: 60_000 });
  const catalog = deriveCatalog(inventoryQuery.data || [], input);
  const query = { ...inventoryQuery, data: catalog };
  const catalogOptions = catalog.available_models;
  const update = (change: Partial<CatalogInput>) => setInput((previous) => ({ ...previous, ...change, skip: 0 }));
  const toggleModel = (model: string, enabled: boolean) => {
    const selected = new Set(input.models ?? catalogOptions.map((item) => item.model_id));
    if (enabled) selected.add(model); else selected.delete(model);
    update({ models: [...selected].sort() });
  };
  const options = catalogOptions;
  return <><header className="page-header"><div className="heading-line"><h1>Browse Models</h1><div className="result-summary" aria-live="polite" aria-atomic="true">{inventoryQuery.data && !query.isError && <><strong>{query.data.counts.models}</strong> models{input.all && <span> · <strong>{query.data.counts.model_versions}</strong> model versions</span>}</>}</div></div><div className="header-controls"><div className="model-search"><label htmlFor="model-filter-search">Find models</label><input id="model-filter-search" type="search" placeholder="Search model names" value={input.search ?? ''} onChange={(event) => update({ search: event.target.value })} /><button aria-expanded={filterOpen} aria-controls="model-filter" onClick={() => setFilterOpen(!filterOpen)}>Models <span aria-hidden="true">▾</span></button></div><label className="all-versions"><input type="checkbox" checked={input.all} onChange={(event) => update({ all: event.target.checked })} /><span>Include all versions</span><span className="default-hint" aria-hidden="true">Default shows current.</span></label></div></header>
    <section className="content" aria-label="Model catalog">
      {filterOpen && <fieldset id="model-filter" className="filter-panel"><legend>Include models</legend><div className="filter-actions"><button className="text-button" onClick={() => update({ models: null })}>Select all models</button><button className="text-button" onClick={() => update({ models: [] })}>Clear model selection</button></div><div className="filter-options">{options.map((option) => <label key={option.model_id}><input type="checkbox" checked={input.models === null || input.models.includes(option.model_id)} onChange={(event) => toggleModel(option.model_id, event.target.checked)} />{option.short_name}</label>)}{!options.length && <p>No model names match your search.</p>}</div></fieldset>}
      <div className="toolbar"><span>Sort by:</span><label className="usa-sr-only" htmlFor="sort">Sort models</label><select id="sort" value={input.sort} onChange={(event) => update({ sort: event.target.value as CatalogInput['sort'] })}><option value="short_name">Name</option><option value="version">Version</option></select><button className="sort-direction" aria-label={`Sort ${input.direction === 'asc' ? 'descending' : 'ascending'}`} onClick={() => update({ direction: input.direction === 'asc' ? 'desc' : 'asc' })}>{input.direction === 'asc' ? 'Ascending ↑' : 'Descending ↓'}</button></div>
      {query.isPending ? <div className="loading" role="status">Loading models…</div> : query.isError ? <ErrorState retry={() => void query.refetch()} /> : <><p className="usa-sr-only" role="status">{query.data.page.total} matching model versions</p>{query.data.items.length ? <div className="card-grid">{query.data.items.map((card) => <ModelCard key={card.version_id} card={card} returnQuery={hash.includes('?') ? `?${hash.split('?')[1]}` : ''} />)}</div> : <div className="empty-state"><h2>No models to display</h2><p>Change your search or model selection to see available models.</p><button className="usa-button" onClick={() => update({ models: null, search: '' })}>Show all models</button></div>}<nav className="pagination" aria-label="Model pages"><button disabled={input.skip === 0} onClick={() => setInput((previous) => ({ ...previous, skip: Math.max(0, previous.skip - previous.limit) }))}>Previous</button><span>{query.data.page.total ? `${input.skip + 1}–${Math.min(input.skip + input.limit, query.data.page.total)} of ${query.data.page.total}` : '0 results'}</span><button disabled={input.skip + input.limit >= query.data.page.total} onClick={() => setInput((previous) => ({ ...previous, skip: previous.skip + previous.limit }))}>Next</button></nav></>}
    </section></>;
}
export default function App() {
  const hash = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const detail = /^#\/model\/([^/?]+)\/([^/?]+)(?:\?.*)?$/.exec(hash);
  let model = ''; let version = '';
  try { model = detail ? decodeURIComponent(detail[1]) : ''; version = detail ? decodeURIComponent(detail[2]) : ''; } catch { /* Malformed navigation falls back to the catalog. */ }
  const returnQuery = hash.includes('?') ? `?${hash.split('?')[1]}` : '';
  return <><a className="usa-skipnav" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to main content</a><div className="app-layout"><aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}><div className="brand"><a href="#/" aria-label="MDB STS home"><span className="brand-symbol" aria-hidden="true">▰</span> MDB<span>STS</span></a><button className="mobile-menu" aria-expanded={sidebarOpen} aria-controls="main-navigation" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? 'Close menu' : 'Menu'}</button></div><nav id="main-navigation" aria-label="Main navigation"><p className="nav-caption">Explore</p><a className={!detail ? 'nav-item active' : 'nav-item'} href="#/" aria-current={!detail ? 'page' : undefined}><span aria-hidden="true">▦</span> Browse Models</a><span className="nav-item unavailable"><span aria-hidden="true">☷</span> Search Terms</span><span className="nav-item unavailable"><span aria-hidden="true">◫</span> Compare Models</span><span className="nav-item unavailable"><span aria-hidden="true">⌕</span> Global Search</span><p className="availability-note">Search Terms, Compare Models, and Global Search are coming soon.</p></nav><div className="sidebar-footer">National Cancer Institute<br /><span>Model Database</span></div></aside><main id="main" tabIndex={-1}>{detail && model && version ? <ModelDetail model={model} version={version} returnQuery={returnQuery} /> : <Browse />}</main></div></>;
}
