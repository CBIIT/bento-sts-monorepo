import Link from "next/link";
import { models, terms } from "./data/mock-data";

const currentModels = models.filter((model) => model.current);
const totals = currentModels.reduce((sum, model) => ({
  nodes: sum.nodes + model.counts.nodes,
  properties: sum.properties + model.counts.properties,
}), { nodes: 0, properties: 0 });

const journeys = [
  { href: "/models", title: "Browse data models", description: "Review model versions, nodes, relationships, and properties in one connected catalog.", className: "journey-models" },
  { href: "/terms", title: "Browse terminology", description: "Trace controlled terms to origins, value sets, and the entities they define.", className: "journey-terms" },
  { href: "/compare", title: "Compare models", description: "Inspect topology and value set differences across models or versions.", className: "journey-compare" },
] as const;

export function HomeView() {
  return <div className="reference-home">
    <section className="reference-hero" aria-labelledby="home-title">
      <div className="site-width reference-hero-grid">
        <div className="reference-hero-copy">
          <h1 id="home-title">Metadata Explorer</h1>
          <p>Search, browse, and compare connected biomedical data models.</p>
        </div>
        <div className="reference-search-panel">
          <form action="/search" method="get" role="search">
            <label htmlFor="home-entity-query">Search models, nodes, and properties</label>
            <div className="reference-search-line">
              <input id="home-entity-query" name="q" type="search" placeholder="Enter a handle, name, or concept" />
              <button type="submit">Search</button>
            </div>
          </form>
          <dl className="reference-source-summary" aria-label="Available sample metadata">
            <div><dt>Models</dt><dd>{currentModels.length}</dd></div>
            <div><dt>Nodes</dt><dd>{totals.nodes}</dd></div>
            <div><dt>Properties</dt><dd>{totals.properties}</dd></div>
            <div><dt>Terms</dt><dd>{terms.length}</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section className="reference-intro" aria-labelledby="reference-intro-title">
      <div className="reference-intro-visual" aria-hidden="true" />
      <div className="reference-intro-copy"><div>
        <h2 id="reference-intro-title">A focused workspace for metadata review</h2>
        <p>Follow model structure, terminology, and comparison evidence without leaving the entity context.</p>
        <Link href="/models">Open the model catalog</Link>
      </div></div>
    </section>

    <section className="reference-journeys site-width" aria-labelledby="journeys-title">
      <div className="reference-section-heading"><h2 id="journeys-title">Explore metadata</h2><p>Choose a task to begin with the deterministic sample catalog.</p></div>
      <div className="reference-journey-grid">
        {journeys.map((journey) => <Link className={`reference-journey ${journey.className}`} href={journey.href} key={journey.href}><span>{journey.title}</span><p>{journey.description}</p><strong>Open workspace</strong></Link>)}
      </div>
    </section>
  </div>;
}
