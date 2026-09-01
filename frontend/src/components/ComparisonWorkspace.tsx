"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { comparisonGraphs, freeformComparisonGraphs, freeformOverlayGraph, graphRows, stackRows } from "../data/adapter";
import type { ComparisonGraphEdge, ComparisonGraphNode, FreeformGraphNode } from "../data/adapter";
import { models } from "../data/mock-data";
import { replaceCompareRoute } from "../router";
import { Badge, Breadcrumbs, PageIntro } from "./EntityUi";

type View = "graph" | "freeform" | "stack";
type Strategy = "exact" | "normalized" | "cde" | "value-set" | "overlap";

const strategyHelp: Record<Strategy, string> = {
  exact: "Pairs entities whose handles match exactly.",
  normalized: "Lowercases handles and normalizes punctuation to underscores.",
  cde: "Pairs entities annotated by the same CDE identifier.",
  "value-set": "Pairs properties that reference the same permissible value set.",
  overlap: "Pairs properties when value-set Jaccard overlap meets the threshold.",
};

function statusLabel(status: string) {
  return status === "left" ? "A only" : status === "right" ? "B only" : `${status.slice(0, 1).toUpperCase()}${status.slice(1)}`;
}

export function ComparisonWorkspace({ initialLeftModel = "MODEL-CLINICAL-1", initialRightModel = "MODEL-CLINICAL-2", initialView = "graph", initialStrategy = "exact", initialStatus = "all", initialQuery = "", initialThreshold = 0.6, initialSelected = "sample" }: { initialLeftModel?: string; initialRightModel?: string; initialView?: View; initialStrategy?: Strategy; initialStatus?: string; initialQuery?: string; initialThreshold?: number; initialSelected?: string }) {
  const [leftModel, setLeftModel] = useState(initialLeftModel);
  const [rightModel, setRightModel] = useState(initialRightModel);
  const [view, setView] = useState<View>(initialView);
  const [strategy, setStrategy] = useState<Strategy>(initialStrategy);
  const [status] = useState(initialStatus);
  const [query] = useState(initialQuery);
  const [threshold, setThreshold] = useState(initialThreshold);
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    const params = new URLSearchParams({ leftModel, rightModel, view, strategy });
    if (status !== "all") params.set("status", status);
    if (query) params.set("query", query);
    if (strategy === "overlap") params.set("overlapThreshold", threshold.toFixed(2));
    if (selected) params.set("selectedEntity", selected);
    replaceCompareRoute(params);
  }, [leftModel, rightModel, view, strategy, status, query, threshold, selected]);

  const visibleRows = graphRows;
  const selectedRow = graphRows.find((row) => row.id === selected) ?? graphRows[0];
  const left = models.find((model) => model.id === leftModel) ?? models[1];
  const right = models.find((model) => model.id === rightModel) ?? models[0];

  function swapModels() {
    const previousLeft = leftModel;
    setLeftModel(rightModel);
    setRightModel(previousLeft);
  }

  return (
    <section className="comparison-page">
      <div className="site-width comparison-top">
        <Breadcrumbs items={[{ label: "Compare" }]} />
        <PageIntro eyebrow="Model comparison" title="See what changed between models" description="Line up graph entities or compare permissible value sets as layered stacks. This prototype uses deterministic, metamodel-informed mock results." />
        <div className="comparison-config" aria-label="Comparison configuration">
          <label>Model A<select value={leftModel} onChange={(event) => setLeftModel(event.target.value)}>{models.map((model) => <option value={model.id} key={`left-${model.id}`}>{model.name} · v{model.version}</option>)}</select></label>
          <button className="swap-button" onClick={swapModels} aria-label="Swap model A and model B"><span aria-hidden="true">⇄</span><span>Swap</span></button>
          <label>Model B<select value={rightModel} onChange={(event) => setRightModel(event.target.value)}>{models.map((model) => <option value={model.id} key={`right-${model.id}`}>{model.name} · v{model.version}</option>)}</select></label>
        </div>
        {leftModel === rightModel && <div className="warning-banner" role="status"><strong>Same model selected.</strong> The comparison remains available so you can verify an unchanged result.</div>}
      </div>

      <div className="comparison-toolbar-wrap">
        <div className="site-width comparison-toolbar">
          <div className="view-tabs" role="tablist" aria-label="Comparison view">
            <button role="tab" aria-selected={view === "graph"} onClick={() => setView("graph")}>Graph alignment</button>
            <button role="tab" aria-selected={view === "freeform"} onClick={() => setView("freeform")}>Free-form graph</button>
            <button role="tab" aria-selected={view === "stack"} onClick={() => setView("stack")}>Value-set stacks</button>
          </div>
          <label className="strategy-control">Match by<select value={strategy} onChange={(event) => setStrategy(event.target.value as Strategy)}><option value="exact">Exact handle</option><option value="normalized">Normalized handle</option><option value="cde">CDE ID</option><option value="value-set">Value set</option><option value="overlap">Value-set overlap</option></select></label>
          {strategy === "overlap" && <label className="threshold-control">Threshold <output>{Math.round(threshold * 100)}%</output><input type="range" min="0" max="1" step="0.05" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label>}
        </div>
      </div>

      <div className="site-width comparison-body">
        <p className="strategy-help"><strong>Active strategy:</strong> {strategyHelp[strategy]}</p>
        {view === "graph" && <GraphView rows={visibleRows} selected={selected} onSelect={setSelected} leftLabel={`${left.name} v${left.version}`} rightLabel={`${right.name} v${right.version}`} />}
        {view === "freeform" && <FreeformGraphView rows={visibleRows} selected={selected} onSelect={setSelected} leftLabel={`${left.name} v${left.version}`} rightLabel={`${right.name} v${right.version}`} />}
        {view === "stack" && <StackView />}

        <aside className="comparison-detail" aria-live="polite">
          <div><p className="eyebrow">Selected entity</p><h2>{selectedRow.type}: {selectedRow.id.replaceAll("_", " ")}</h2><p>{selectedRow.reason}</p></div>
          <Badge tone={selectedRow.status === "changed" ? "warning" : selectedRow.status === "ambiguous" ? "purple" : "neutral"}>{statusLabel(selectedRow.status)}</Badge>
          <dl><div><dt>Model A</dt><dd>{selectedRow.left}</dd></div><div><dt>Model B</dt><dd>{selectedRow.right}</dd></div><div><dt>Match reason</dt><dd>{selectedRow.reason}</dd></div></dl>
        </aside>
      </div>
    </section>
  );
}

function FreeformGraphView({ rows, selected, onSelect, leftLabel, rightLabel }: { rows: readonly typeof graphRows[number][]; selected: string; onSelect: (id: string) => void; leftLabel: string; rightLabel: string }) {
  type Display = "side" | "overlay" | "a" | "b";
  type Layout = "left" | "right" | "overlay";
  const [display, setDisplay] = useState<Display>("side");
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<{ side: Layout; id: string } | null>(null);
  const initialPositions = () => ({
    left: Object.fromEntries(freeformComparisonGraphs.left.nodes.map((node) => [node.id, { x: node.x, y: node.y }])),
    right: Object.fromEntries(freeformComparisonGraphs.right.nodes.map((node) => [node.id, { x: node.x, y: node.y }])),
    overlay: Object.fromEntries(freeformOverlayGraph.nodes.map((node) => [node.id, { x: node.x, y: node.y }])),
  });
  const [positions, setPositions] = useState<Record<Layout, Record<string, { x: number; y: number }>>>(initialPositions);
  const rowIds = new Set(rows.map((row) => row.id));
  const leftNodes = freeformComparisonGraphs.left.nodes.filter((node) => rowIds.has(node.id));
  const rightNodes = freeformComparisonGraphs.right.nodes.filter((node) => rowIds.has(node.id));
  const leftIds = new Set(leftNodes.map((node) => node.id));
  const rightIds = new Set(rightNodes.map((node) => node.id));
  const overlayNodes = freeformOverlayGraph.nodes.filter((node) => rowIds.has(node.id));
  const overlayIds = new Set(overlayNodes.map((node) => node.id));
  const leftEdges = freeformComparisonGraphs.left.edges.filter((edge) => leftIds.has(edge.source) && leftIds.has(edge.target));
  const rightEdges = freeformComparisonGraphs.right.edges.filter((edge) => rightIds.has(edge.source) && rightIds.has(edge.target));
  const overlayEdges = freeformOverlayGraph.edges.filter((edge) => overlayIds.has(edge.source) && overlayIds.has(edge.target));
  const visibleIds = display === "a" ? leftIds : display === "b" ? rightIds : display === "overlay" ? overlayIds : new Set([...leftIds, ...rightIds]);
  const activeRow = graphRows.find((row) => row.id === selected && visibleIds.has(row.id));

  function resetLayout() {
    setPositions(initialPositions());
    setZoom(1);
  }

  function moveNode(event: ReactPointerEvent<SVGSVGElement>, side: Layout) {
    if (!dragging || dragging.side !== side) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = side === "overlay" ? 1040 : 520;
    const height = side === "overlay" ? 560 : 540;
    const centerX = width / 2;
    const centerY = height / 2;
    const viewX = ((event.clientX - rect.left) / rect.width) * width;
    const viewY = ((event.clientY - rect.top) / rect.height) * height;
    const offsetX = centerX - (centerX * zoom);
    const offsetY = centerY - (centerY * zoom);
    const x = Math.max(side === "overlay" ? 78 : 70, Math.min(side === "overlay" ? 962 : 450, (viewX - offsetX) / zoom));
    const y = Math.max(50, Math.min(side === "overlay" ? 510 : 495, (viewY - offsetY) / zoom));
    setPositions((current) => ({ ...current, [side]: { ...current[side], [dragging.id]: { x, y } } }));
  }

  function changeDisplay(next: Display) {
    setDisplay(next);
    const current = graphRows.find((row) => row.id === selected);
    if ((next === "a" && current?.status === "right") || (next === "b" && current?.status === "left")) onSelect("study");
  }

  return <div className="freeform-graph-module" data-layout-state="ready">
    <div className="freeform-header">
      <div><p className="eyebrow">Prototype-style topology</p><h2>Free-form model graphs</h2><p>Compare two independent graphs, isolate either model, or merge both into one overlay.</p></div>
      <div className="freeform-mode-controls" role="group" aria-label="Free-form graph display">
        <button type="button" aria-pressed={display === "side"} onClick={() => changeDisplay("side")}>A/B side by side</button>
        <button type="button" aria-pressed={display === "overlay"} onClick={() => changeDisplay("overlay")}>Overlay</button>
        <button type="button" aria-pressed={display === "a"} onClick={() => changeDisplay("a")}>Model A</button>
        <button type="button" aria-pressed={display === "b"} onClick={() => changeDisplay("b")}>Model B</button>
      </div>
    </div>
    <div className="freeform-toolbar">
      <div className="freeform-legend" aria-label="Free-form graph legend"><span><i className="free-shared">A/B</i>Shared</span><span><i className="free-added" />B only</span><span><i className="free-removed" />A only</span><span><i className="free-changed" />Changed</span></div>
      <div className="graph-control-buttons"><span className="sync-indicator"><i aria-hidden="true">✓</i> Sync zoom</span><button type="button" onClick={() => setZoom((value) => Math.max(.7, value - .1))} aria-label="Zoom out both free-form graphs">−</button><output aria-live="polite">{Math.round(zoom * 100)}%</output><button type="button" onClick={() => setZoom((value) => Math.min(1.45, value + .1))} aria-label="Zoom in both free-form graphs">+</button><button type="button" onClick={resetLayout}>Reset layout</button></div>
    </div>
    {visibleIds.size ? <>
      {display === "side" && <div className="freeform-dual-canvas">
        <FreeformPane side="A" label={leftLabel} nodes={leftNodes} edges={leftEdges} positions={positions.left} zoom={zoom} selected={selected} onSelect={onSelect} onDragStart={(id) => setDragging({ side: "left", id })} onDragMove={(event) => moveNode(event, "left")} onDragEnd={() => setDragging(null)} />
        <FreeformPane side="B" label={rightLabel} nodes={rightNodes} edges={rightEdges} positions={positions.right} zoom={zoom} selected={selected} onSelect={onSelect} onDragStart={(id) => setDragging({ side: "right", id })} onDragMove={(event) => moveNode(event, "right")} onDragEnd={() => setDragging(null)} />
      </div>}
      {display === "a" && <div className="freeform-single-canvas"><FreeformPane side="A" label={leftLabel} nodes={leftNodes} edges={leftEdges} positions={positions.left} zoom={zoom} selected={selected} onSelect={onSelect} onDragStart={(id) => setDragging({ side: "left", id })} onDragMove={(event) => moveNode(event, "left")} onDragEnd={() => setDragging(null)} /></div>}
      {display === "b" && <div className="freeform-single-canvas"><FreeformPane side="B" label={rightLabel} nodes={rightNodes} edges={rightEdges} positions={positions.right} zoom={zoom} selected={selected} onSelect={onSelect} onDragStart={(id) => setDragging({ side: "right", id })} onDragMove={(event) => moveNode(event, "right")} onDragEnd={() => setDragging(null)} /></div>}
      {display === "overlay" && <FreeformOverlayPane leftLabel={leftLabel} rightLabel={rightLabel} nodes={overlayNodes} edges={overlayEdges} positions={positions.overlay} zoom={zoom} selected={selected} onSelect={onSelect} onDragStart={(id) => setDragging({ side: "overlay", id })} onDragMove={(event) => moveNode(event, "overlay")} onDragEnd={() => setDragging(null)} />}
    </> : <div className="empty-state"><h3>No entities match these filters</h3><p>Reset the comparison filter to restore the free-form graphs.</p></div>}
    <div className="freeform-detail" aria-live="polite"><strong>{activeRow ? `${activeRow.type} · ${activeRow.id.replaceAll("_", " ")}` : display === "overlay" ? "Model A + Model B overlay" : display === "a" ? "Model A" : display === "b" ? "Model B" : "Model A and Model B"}</strong><span>{activeRow ? activeRow.reason : display === "overlay" ? "Shared and model-specific entities are merged on one irregular graph." : display === "side" ? "Both models use independent, deliberately irregular graph layouts." : "This view isolates one model's topology."}</span></div>
    <details className="semantic-comparison"><summary>Accessible free-form graph table</summary><div className="term-table-wrap"><table><thead><tr><th scope="col">Entity</th><th scope="col">Model A</th><th scope="col">Status</th><th scope="col">Model B</th><th scope="col">Evidence</th></tr></thead><tbody>{rows.filter((row) => visibleIds.has(row.id)).map((row) => <tr key={`free-table-${row.id}`}><th scope="row">{row.id}</th><td>{row.left}</td><td>{statusLabel(row.status)}</td><td>{row.right}</td><td>{row.reason}</td></tr>)}</tbody></table></div></details>
  </div>;
}

function FreeformOverlayPane({ leftLabel, rightLabel, nodes, edges, positions, zoom, selected, onSelect, onDragStart, onDragMove, onDragEnd }: { leftLabel: string; rightLabel: string; nodes: FreeformGraphNode[]; edges: ComparisonGraphEdge[]; positions: Record<string, { x: number; y: number }>; zoom: number; selected: string; onSelect: (id: string) => void; onDragStart: (id: string) => void; onDragMove: (event: ReactPointerEvent<SVGSVGElement>) => void; onDragEnd: () => void }) {
  const positionedNodes = nodes.map((node) => ({ ...node, ...positions[node.id] }));
  const nodeMap = new Map(positionedNodes.map((node) => [node.id, node]));
  return <section className="freeform-overlay-pane" aria-label="Model A and Model B overlay graph"><header><div><span>A + B overlay</span><strong>{leftLabel} · {rightLabel}</strong></div><dl><div><dt>Entities</dt><dd>{nodes.length}</dd></div><div><dt>Relationships</dt><dd>{edges.length}</dd></div></dl></header><div className="freeform-stage freeform-overlay-stage"><svg viewBox="0 0 1040 560" role="img" aria-label={`Merged Model A and Model B free-form graph with ${nodes.length} entities and ${edges.length} relationships. Drag or select a node to inspect it.`} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerLeave={onDragEnd}><defs>{(["shared", "left", "right", "changed", "ambiguous"] as const).map((status) => <marker key={status} id={`free-overlay-arrow-${status}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path className={`free-arrow-${status}`} d="M0,0 L7,3.5 L0,7 z" /></marker>)}</defs><g transform={`translate(${520 - (520 * zoom)} ${280 - (280 * zoom)}) scale(${zoom})`}>{edges.map((edge) => { const source = nodeMap.get(edge.source); const target = nodeMap.get(edge.target); if (!source || !target) return null; return <g className={`freeform-edge freeform-${edge.status}`} key={edge.id}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} markerEnd={`url(#free-overlay-arrow-${edge.status})`} /><text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 8}>{edge.label}</text></g>; })}{positionedNodes.map((node) => <FreeformOverlayNode key={`overlay-${node.id}`} node={node} selected={selected === node.id} onSelect={onSelect} onDragStart={onDragStart} />)}</g></svg></div></section>;
}

function FreeformOverlayNode({ node, selected, onSelect, onDragStart }: { node: FreeformGraphNode; selected: boolean; onSelect: (id: string) => void; onDragStart: (id: string) => void }) {
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(node.id); } };
  const state = node.status === "shared" ? "Shared A/B" : statusLabel(node.status);
  const words = node.label.length > 20 ? [node.label.slice(0, 20), node.label.slice(20)] : [node.label];
  return <g className={`freeform-node freeform-${node.status} ${selected ? "is-selected" : ""}`} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} aria-label={`${node.entityType} ${node.label}, ${state}`} onClick={() => onSelect(node.id)} onKeyDown={onKeyDown} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onDragStart(node.id); onSelect(node.id); }}>
    {node.status === "shared" ? <><rect className="free-common" x={words.length > 1 ? -92 : -76} y="-38" width={words.length > 1 ? 184 : 152} height="76" rx="10" /><rect className="free-a-bar" x={words.length > 1 ? -92 : -76} y="-38" width="7" height="76" rx="3" /><rect className="free-b-bar" x={words.length > 1 ? 85 : 69} y="-38" width="7" height="76" rx="3" /></> : node.status === "changed" ? <polygon points="0,-48 62,0 0,48 -62,0" /> : <circle r="45" />}
    <text className="free-node-label" y={words.length > 1 ? -7 : -4}>{words.map((word, index) => <tspan key={`${node.id}-${word}`} x="0" dy={index ? 14 : 0}>{word}</tspan>)}</text><text className="free-node-state" y="20">{state}</text>
  </g>;
}

function FreeformPane({ side, label, nodes, edges, positions, zoom, selected, onSelect, onDragStart, onDragMove, onDragEnd }: { side: "A" | "B"; label: string; nodes: FreeformGraphNode[]; edges: ComparisonGraphEdge[]; positions: Record<string, { x: number; y: number }>; zoom: number; selected: string; onSelect: (id: string) => void; onDragStart: (id: string) => void; onDragMove: (event: ReactPointerEvent<SVGSVGElement>) => void; onDragEnd: () => void }) {
  const positionedNodes = nodes.map((node) => ({ ...node, ...positions[node.id] }));
  const nodeMap = new Map(positionedNodes.map((node) => [node.id, node]));
  return <section className={`freeform-pane freeform-pane-${side.toLocaleLowerCase()}`} aria-label={`Model ${side} free-form graph`}><header><div><span>Model {side}</span><strong>{label}</strong></div><dl><div><dt>Entities</dt><dd>{nodes.length}</dd></div><div><dt>Relationships</dt><dd>{edges.length}</dd></div></dl></header><div className="freeform-stage"><svg viewBox="0 0 520 540" role="img" aria-label={`Model ${side} free-form entity relationship graph with ${nodes.length} entities and ${edges.length} relationships. Drag or select a node to inspect it.`} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerLeave={onDragEnd}><defs>{(["shared", "left", "right", "changed", "ambiguous"] as const).map((status) => <marker key={status} id={`free-arrow-${side}-${status}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path className={`free-arrow-${status}`} d="M0,0 L7,3.5 L0,7 z" /></marker>)}</defs><g transform={`translate(${260 - (260 * zoom)} ${270 - (270 * zoom)}) scale(${zoom})`}>{edges.map((edge) => { const source = nodeMap.get(edge.source); const target = nodeMap.get(edge.target); if (!source || !target) return null; return <g className={`freeform-edge freeform-${edge.status}`} key={edge.id}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} markerEnd={`url(#free-arrow-${side}-${edge.status})`} /><text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 8}>{edge.label}</text></g>; })}{positionedNodes.map((node) => <FreeformNode key={`${side}-${node.id}`} node={node} side={side} selected={selected === node.id} onSelect={onSelect} onDragStart={onDragStart} />)}</g></svg></div></section>;
}

function FreeformNode({ node, side, selected, onSelect, onDragStart }: { node: FreeformGraphNode; side: "A" | "B"; selected: boolean; onSelect: (id: string) => void; onDragStart: (id: string) => void }) {
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(node.id); } };
  const state = node.status === "shared" ? `Shared · Model ${side}` : node.status === "left" ? "Model A only" : node.status === "right" ? "Model B only" : node.status === "changed" ? side === "A" ? "Before" : "After" : "Review candidates";
  const words = node.label.length > 17 ? [node.label.slice(0, 17), node.label.slice(17)] : [node.label];
  return <g className={`freeform-node freeform-${node.status} ${selected ? "is-selected" : ""}`} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} aria-label={`${node.entityType} ${node.label}, ${state}`} onClick={() => onSelect(node.id)} onKeyDown={onKeyDown} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onDragStart(node.id); onSelect(node.id); }}>
    {node.status === "shared" ? <rect className={`free-model-${side.toLocaleLowerCase()}`} x={words.length > 1 ? -78 : -68} y="-34" width={words.length > 1 ? 156 : 136} height="68" rx="10" /> : node.status === "changed" ? <polygon points="0,-48 58,0 0,48 -58,0" /> : node.status === "ambiguous" ? <><rect x="-72" y="-38" width="144" height="76" rx="10" /><rect className="free-ambiguous-inner" x="-66" y="-32" width="132" height="64" rx="8" /></> : <circle r="43" />}
    <text className="free-node-label" y={words.length > 1 ? -7 : -4}>{words.map((word, index) => <tspan key={`${node.id}-${word}`} x="0" dy={index ? 14 : 0}>{word}</tspan>)}</text><text className="free-node-state" y="20">{state}</text>
  </g>;
}

function GraphView({ rows, selected, onSelect, leftLabel, rightLabel }: { rows: readonly typeof graphRows[number][]; selected: string; onSelect: (id: string) => void; leftLabel: string; rightLabel: string }) {
  const [zoom, setZoom] = useState(1);
  const visibleIds = new Set(rows.map((row) => row.id));
  const leftNodes = comparisonGraphs.left.nodes.filter((node) => visibleIds.has(node.id));
  const rightNodes = comparisonGraphs.right.nodes.filter((node) => visibleIds.has(node.id));
  const leftEdges = comparisonGraphs.left.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const rightEdges = comparisonGraphs.right.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));

  return (
    <div className="graph-module" data-layout-state="ready">
      <div className="graph-controls" aria-label="Graph controls">
        <div className="graph-legend" aria-label="Graph status legend"><span><i className="legend-shared" />Shared</span><span><i className="legend-changed" />Changed</span><span><i className="legend-left" />A only</span><span><i className="legend-right" />B only</span><span><i className="legend-ambiguous" />Ambiguous</span></div>
        <div className="graph-control-buttons">
          <span className="sync-indicator" title="Both graph panes use the same zoom level"><i aria-hidden="true">✓</i> Sync zoom</span>
          <button type="button" onClick={() => setZoom((value) => Math.max(.75, value - .1))} aria-label="Zoom out both graphs">−</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.35, value + .1))} aria-label="Zoom in both graphs">+</button>
          <button type="button" onClick={() => setZoom(.9)}>Fit</button>
          <button type="button" onClick={() => setZoom(1)}>Reset</button>
        </div>
      </div>
      {rows.length ? <div className="dual-graph-canvas" aria-label="Side-by-side visual graph comparison">
        <GraphPane side="A" label={leftLabel} nodes={leftNodes} edges={leftEdges} zoom={zoom} selected={selected} onSelect={onSelect} />
        <div className="matching-gutter" aria-label="Matching evidence between model graphs">
          <strong>Matches</strong>
          {rows.filter((row) => row.status !== "left" && row.status !== "right").map((row) => {
            const node = comparisonGraphs.left.nodes.find((candidate) => candidate.id === row.id);
            const top = node ? `${78 + node.y}px` : "50%";
            return <button type="button" key={`match-${row.id}`} style={{ top }} className={`match-marker marker-${row.status} ${selected === row.id ? "is-selected" : ""}`} onClick={() => onSelect(row.id)} title={row.reason}><span aria-hidden="true">↔</span><small>{row.reason}</small></button>;
          })}
        </div>
        <GraphPane side="B" label={rightLabel} nodes={rightNodes} edges={rightEdges} zoom={zoom} selected={selected} onSelect={onSelect} />
      </div> : <div className="empty-state"><h3>No entities match these filters</h3><p>Reset the status or search filter to restore the comparison.</p></div>}
      <details className="semantic-comparison"><summary>Accessible comparison table</summary><div className="term-table-wrap"><table><thead><tr><th scope="col">Entity type</th><th scope="col">Model A</th><th scope="col">Status</th><th scope="col">Match reason</th><th scope="col">Model B</th></tr></thead><tbody>{rows.map((row) => <tr key={`table-${row.id}`}><td>{row.type}</td><td>{row.left}</td><td>{statusLabel(row.status)}</td><td>{row.reason}</td><td>{row.right}</td></tr>)}</tbody></table></div></details>
    </div>
  );
}

function GraphPane({ side, label, nodes, edges, zoom, selected, onSelect }: { side: "A" | "B"; label: string; nodes: ComparisonGraphNode[]; edges: ComparisonGraphEdge[]; zoom: number; selected: string; onSelect: (id: string) => void }) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const markerId = `arrow-${side.toLocaleLowerCase()}`;
  return <section className="model-graph-pane" aria-label={`Model ${side} graph`}>
    <header><div><span>Model {side}</span><strong>{label}</strong></div><dl><div><dt>Entities</dt><dd>{nodes.length}</dd></div><div><dt>Relationships</dt><dd>{edges.length}</dd></div></dl></header>
    <div className="graph-viewport">
      <svg viewBox="0 0 520 540" role="img" aria-label={`Model ${side} entity relationship graph with ${nodes.length} entities and ${edges.length} relationships. Select a node to inspect its comparison.`}>
        <defs><marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" /></marker></defs>
        <g transform={`translate(${260 - (260 * zoom)} ${270 - (270 * zoom)}) scale(${zoom})`}>
          {edges.map((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;
            const labelX = (source.x + target.x) / 2;
            const labelY = (source.y + target.y) / 2;
            return <g className={`graph-edge edge-${edge.status}`} key={edge.id}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} markerEnd={`url(#${markerId})`} /><text x={labelX} y={labelY - 7}>{edge.label}</text></g>;
          })}
          {nodes.map((node) => <GraphNode key={`${side}-${node.id}`} node={node} selected={selected === node.id} onSelect={onSelect} />)}
        </g>
      </svg>
    </div>
  </section>;
}

function GraphNode({ node, selected, onSelect }: { node: ComparisonGraphNode; selected: boolean; onSelect: (id: string) => void }) {
  const activate = () => onSelect(node.id);
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };
  const words = node.label.length > 17 ? [node.label.slice(0, 17), node.label.slice(17)] : [node.label];
  return <g className={`graph-node node-${node.status} ${selected ? "is-selected" : ""}`} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} onClick={activate} onKeyDown={onKeyDown} aria-label={`${node.entityType} ${node.label}, ${statusLabel(node.status)}`}>
    {node.status === "changed" ? <polygon points="0,-41 70,0 0,41 -70,0" /> : node.status === "left" || node.status === "right" ? <circle r="43" /> : <rect x="-72" y="-38" width="144" height="76" rx="11" />}
    {node.status === "ambiguous" && <rect className="node-inner" x="-66" y="-32" width="132" height="64" rx="8" />}
    <text className="node-type" y={words.length > 1 ? -12 : -8}>{node.entityType}</text>
    <text className="node-label" y={words.length > 1 ? 7 : 14}>{words.map((word, index) => <tspan key={`${node.id}-${index}`} x="0" dy={index ? 15 : 0}>{word}</tspan>)}</text>
  </g>;
}

function StackView() {
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [statusFirst, setStatusFirst] = useState<"changed" | "shared">("changed");
  const [page, setPage] = useState(1);
  const pageSize = 2;
  const rows = [...stackRows]
    .filter((row) => !queryA || `${row.property} ${row.left.valueSet} ${row.left.terms.join(" ")}`.toLocaleLowerCase().includes(queryA.toLocaleLowerCase()))
    .filter((row) => !queryB || `${row.property} ${row.right.valueSet} ${row.right.terms.join(" ")}`.toLocaleLowerCase().includes(queryB.toLocaleLowerCase()))
    .sort((left, right) => Number(right.status === statusFirst) - Number(left.status === statusFirst) || left.property.localeCompare(right.property));
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return <div className="stack-module">
    <div className="stack-header"><div><span>Model A stack</span><strong>Origin → Model → Value set</strong></div><div><span>Model B stack</span><strong>Origin → Model → Value set</strong></div></div>
    <div className="stack-tools">
      <label>Search Model A stack<input type="search" value={queryA} onChange={(event) => { setQueryA(event.target.value); setPage(1); }} placeholder="Property, value set, or term" /></label>
      <label>Search Model B stack<input type="search" value={queryB} onChange={(event) => { setQueryB(event.target.value); setPage(1); }} placeholder="Property, value set, or term" /></label>
      <div className="stack-status-sort" role="group" aria-label="Order value-set stacks by status"><span>Status first</span><button type="button" aria-pressed={statusFirst === "changed"} onClick={() => { setStatusFirst("changed"); setPage(1); }}>Changed</button><button type="button" aria-pressed={statusFirst === "shared"} onClick={() => { setStatusFirst("shared"); setPage(1); }}>Shared</button></div>
    </div>
    {visibleRows.length ? visibleRows.map((row, index) => <details className={`stack-comparison stack-${row.status}`} key={row.id} open={index === 0}><summary className="stack-title"><span><span className="entity-type">Property</span><strong>{row.property}</strong></span><span><Badge tone={row.status === "changed" ? "warning" : "success"}>{statusLabel(row.status)}</Badge><strong>{Math.round(row.score * 100)}% overlap</strong><span className="accordion-label">Open details</span></span></summary><div className="stack-accordion-body"><div className="stack-grid"><Stack side="A" stack={row.left} /><div className="stack-connector"><span aria-hidden="true">↔</span><strong>{row.reason}</strong><small>Jaccard {row.score.toFixed(2)}</small></div><Stack side="B" stack={row.right} /></div><div className="term-diff-grid"><div><strong>Shared terms</strong><p>{row.left.terms.filter((term) => includesTerm(row.right.terms, term)).join(", ") || "None"}</p></div><div><strong>Model A only</strong><p>{row.left.terms.filter((term) => !includesTerm(row.right.terms, term)).join(", ") || "None"}</p></div><div><strong>Model B only</strong><p>{row.right.terms.filter((term) => !includesTerm(row.left.terms, term)).join(", ") || "None"}</p></div></div></div></details>) : <div className="empty-state"><h3>No value-set stacks match</h3><p>Try a broader property, value set, or permissible term.</p></div>}
    <nav className="stack-pagination" aria-label="Value-set stack pagination"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button><span>Page {currentPage} of {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button></nav>
  </div>;
}

function includesTerm(terms: readonly string[], term: string) {
  return terms.includes(term);
}

function Stack({ side, stack }: { side: "A" | "B"; stack: { origin: string; model: string; valueSet: string; terms: readonly string[] } }) {
  return <div className={`data-stack stack-side-${side.toLocaleLowerCase()}`} aria-label={`Model ${side} value-set stack`}><div className="stack-layer stack-origin"><small>Origin</small><strong>{stack.origin}</strong></div><div className="stack-layer stack-model"><small>Model</small><strong>{stack.model}</strong></div><div className="stack-layer stack-values"><small>Value set</small><strong>{stack.valueSet}</strong><span>{stack.terms.length} permissible terms</span></div></div>;
}
