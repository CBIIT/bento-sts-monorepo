import type { ReactNode } from "react";
import Link from "next/link";
import { getModel, getNode, getProperty, getValueSet, properties, relationships, terms } from "../data/mock-data";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}</li>)}</ol>
    </nav>
  );
}

export function PageIntro({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="page-intro">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="lede">{description}</p></div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "purple" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function AttributeGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="attribute-grid">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value || "Not available"}</dd></div>)}</dl>;
}

export function EntityNotFound({ entity }: { entity: string }) {
  return <section className="site-width page-section"><PageIntro title={`${entity} not found`} description="The requested record is not available in this deterministic prototype." /><Link className="button button-primary" href="/models">Return to models</Link></section>;
}

export function ModelEntityView({ modelId }: { modelId: string }) {
  const model = getModel(modelId);
  if (!model) return <EntityNotFound entity="Model" />;
  const modelNodes = model.current ? ["NODE-STUDY", "NODE-PARTICIPANT", "NODE-SAMPLE", "NODE-FILE", "NODE-RESPONSE"].map(getNode).filter(Boolean) : [getNode("NODE-DIAGNOSIS")].filter(Boolean);
  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Models", href: "/models" }, { label: model.name }]} />
      <PageIntro eyebrow="Model" title={model.name} description={model.description} actions={<><Badge tone={model.current ? "success" : "neutral"}>{model.current ? "Current" : "Previous"}</Badge><span className="version-chip">Version {model.version}</span></>} />
      <AttributeGrid items={[{ label: "Handle", value: <code>{model.handle}</code> }, { label: "Technical ID", value: <code>{model.id}</code> }, { label: "Repository", value: <a href={model.repositoryUrl} target="_blank" rel="noreferrer">View source repository</a> }, { label: "Verification", value: "Mock-only · Unverified against MDB" }]} />
      <div className="metric-grid" aria-label="Model entity counts">
        {Object.entries(model.counts).map(([key, value]) => <div className="metric-card" key={key}><strong>{value}</strong><span>{key}</span></div>)}
      </div>
      <div className="section-heading"><div><p className="eyebrow">Entity inventory</p><h2>Nodes in this model</h2></div></div>
      <div className="entity-card-grid">
        {modelNodes.map((node) => node && <a className="entity-card" key={node.id} href={`/models/${model.id}/nodes/${node.id}`}><span className="entity-type">Node</span><strong>{node.handle}</strong><p>{node.definition}</p><span>{node.properties.length} properties <span aria-hidden="true">→</span></span></a>)}
      </div>
    </section>
  );
}

export function NodeEntityView({ modelId, nodeId }: { modelId: string; nodeId: string }) {
  const node = getNode(nodeId);
  const model = getModel(modelId);
  if (!node || !model) return <EntityNotFound entity="Node" />;
  const nodeProperties = node.properties.map(getProperty).filter(Boolean);
  const nodeRelationships = relationships.filter((relationship) => relationship.sourceNodeId === node.id || relationship.targetNodeId === node.id);
  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Models", href: "/models" }, { label: model.name, href: `/models/${model.id}` }, { label: node.handle }]} />
      <PageIntro eyebrow="Node" title={node.handle} description={node.definition ?? "No definition available."} actions={<Badge>Version {model.version}</Badge>} />
      <AttributeGrid items={[{ label: "Model", value: <a href={`/models/${model.id}`}>{model.name}</a> }, { label: "Handle", value: <code>{node.handle}</code> }, { label: "Technical ID", value: <code>{node.id}</code> }, { label: "Definition", value: node.definition }]} />
      <div className="two-column-content">
        <div className="content-panel"><h2>Properties</h2>{nodeProperties.length ? nodeProperties.map((property) => property && <a className="list-row" key={property.id} href={`/models/${model.id}/properties/${property.id}`}><span><strong>{property.handle}</strong><small>{property.valueType}</small></span><span aria-hidden="true">→</span></a>) : <p className="muted">No properties are assigned.</p>}</div>
        <div className="content-panel"><h2>Relationships</h2>{nodeRelationships.length ? nodeRelationships.map((relationship) => <div className="list-row static" key={relationship.id}><span><strong>{relationship.handle}</strong><small>{getNode(relationship.sourceNodeId)?.handle} → {getNode(relationship.targetNodeId)?.handle}</small></span><span>{relationship.multiplicity}</span></div>) : <p className="muted">No relationships are assigned.</p>}</div>
      </div>
    </section>
  );
}

export function PropertyEntityView({ modelId, propertyId }: { modelId: string; propertyId: string }) {
  const property = getProperty(propertyId);
  const model = getModel(modelId);
  if (!property || !model) return <EntityNotFound entity="Property" />;
  const parent = getNode(property.nodeId);
  const valueSet = getValueSet(property.valueSetId);
  const allowedTerms = valueSet?.termIds.map((id) => terms.find((term) => term.id === id)).filter(Boolean) ?? [];
  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Models", href: "/models" }, { label: model.name, href: `/models/${model.id}` }, { label: parent?.handle ?? "Node", href: `/models/${model.id}/nodes/${parent?.id}` }, { label: property.handle }]} />
      <PageIntro eyebrow="Property" title={property.handle} description={property.definition ?? "No definition available."} actions={<Badge tone={property.required ? "warning" : "neutral"}>{property.required ? "Required" : "Optional"}</Badge>} />
      <AttributeGrid items={[{ label: "Model", value: model.name }, { label: "Parent node", value: parent ? <a href={`/models/${model.id}/nodes/${parent.id}`}>{parent.handle}</a> : "Not available" }, { label: "Value type", value: property.valueType }, { label: "CDE ID", value: property.cdeId ?? "Not available" }, { label: "Technical ID", value: <code>{property.id}</code> }, { label: "Value set", value: valueSet ? <a href={`/value-sets/${valueSet.id}`}>{valueSet.handle}</a> : "Not available" }]} />
      {valueSet && <div className="content-panel standalone"><div className="section-heading compact"><div><p className="eyebrow">Permissible values</p><h2><a href={`/value-sets/${valueSet.id}`}>{valueSet.handle}</a></h2></div><a href={valueSet.originUrl} target="_blank" rel="noreferrer">{valueSet.origin} source</a></div><div className="term-chip-list">{allowedTerms.map((term) => term && <a key={term.id} href={`/terms/${term.id}`}>{term.value}</a>)}</div></div>}
    </section>
  );
}

export function TermEntityView({ termId }: { termId: string }) {
  const term = terms.find((item) => item.id === termId);
  if (!term) return <EntityNotFound entity="Term" />;
  const termSets = term.valueSetIds.map((id) => getValueSet(id)).filter(Boolean);
  const definedProperties = term.defines.map(getProperty).filter(Boolean);
  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Terms", href: "/terms" }, { label: term.value }]} />
      <PageIntro eyebrow="Term" title={term.value} description={term.definition} actions={<Badge tone="purple">{term.origin}</Badge>} />
      <AttributeGrid items={[{ label: "Origin", value: term.origin }, { label: "Origin ID", value: <code>{term.originId}</code> }, { label: "Technical ID", value: <code>{term.id}</code> }, { label: "Origin resource", value: <a href={term.originUrl} target="_blank" rel="noreferrer">Open {term.origin} record</a> }]} />
      <div className="two-column-content">
        <div className="content-panel"><h2>Permissible value sets</h2>{termSets.map((set) => set && <a className="list-row" href={`/value-sets/${set.id}`} key={set.id}><span><strong>{set.handle}</strong><small>{set.origin}</small></span><span aria-hidden="true">→</span></a>)}</div>
        <div className="content-panel"><h2>Defines these entities</h2>{definedProperties.map((property) => property && <a className="list-row" key={property.id} href={`/models/${property.modelId}/properties/${property.id}`}><span><strong>{property.handle}</strong><small>Property</small></span><span aria-hidden="true">→</span></a>)}</div>
      </div>
    </section>
  );
}

export function ValueSetEntityView({ valueSetId }: { valueSetId: string }) {
  const valueSet = getValueSet(valueSetId);
  if (!valueSet) return <EntityNotFound entity="Value set" />;
  const allowedTerms = valueSet.termIds.map((id) => terms.find((term) => term.id === id)).filter(Boolean);
  const linkedProperties = properties.filter((property) => property.valueSetId === valueSet.id);
  return (
    <section className="site-width page-section">
      <Breadcrumbs items={[{ label: "Search", href: "/search" }, { label: "Value sets" }, { label: valueSet.handle }]} />
      <PageIntro eyebrow="Value set" title={valueSet.handle} description="A permissible set of controlled terminology values linked to model properties." actions={<Badge tone="purple">{valueSet.origin}</Badge>} />
      <AttributeGrid items={[{ label: "Origin", value: valueSet.origin }, { label: "Technical ID", value: <code>{valueSet.id}</code> }, { label: "Permissible terms", value: valueSet.termIds.length }, { label: "Origin resource", value: <a href={valueSet.originUrl} target="_blank" rel="noreferrer">Open {valueSet.origin} resource</a> }]} />
      <div className="two-column-content">
        <div className="content-panel"><h2>Permissible terms</h2>{allowedTerms.map((term) => term && <a className="list-row" key={term.id} href={`/terms/${term.id}`}><span><strong>{term.value}</strong><small>{term.originId}</small></span><span aria-hidden="true">→</span></a>)}</div>
        <div className="content-panel"><h2>Linked properties</h2>{linkedProperties.length ? linkedProperties.map((property) => <a className="list-row" key={property.id} href={`/models/${property.modelId}/properties/${property.id}`}><span><strong>{property.handle}</strong><small>{getModel(property.modelId)?.name}</small></span><span aria-hidden="true">→</span></a>) : <p className="muted">No linked properties are available.</p>}</div>
      </div>
    </section>
  );
}
