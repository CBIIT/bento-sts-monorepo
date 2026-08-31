import { models, nodes, properties, terms, valueSets } from "./mock-data";

export const fixtureProvenance = {
  fixtureVersion: "1.0",
  purpose: "frontend-mockup",
  dataSource: "metamodel-informed-deterministic-mock",
  verifiedAgainstMdb: false,
} as const;

export type SearchEntity = {
  id: string;
  type: "Model" | "Node" | "Property";
  handle: string;
  definition: string;
  modelId: string;
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 120));

export async function listModels(includePrevious = false) {
  await wait();
  return models.filter((model) => includePrevious || model.current);
}

export async function searchEntities(query: string, includeDefinitions: boolean) {
  await wait();
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [] as SearchEntity[];
  const haystack: SearchEntity[] = [
    ...models.map((model) => ({ id: model.id, type: "Model" as const, handle: model.handle, definition: model.description, modelId: model.id })),
    ...nodes.map((node) => ({ id: node.id, type: "Node" as const, handle: node.handle, definition: node.definition ?? "", modelId: node.modelId })),
    ...properties.map((property) => ({ id: property.id, type: "Property" as const, handle: property.handle, definition: property.definition ?? "", modelId: property.modelId })),
  ];
  return haystack.filter((entity) =>
    entity.handle.toLocaleLowerCase().includes(needle) ||
    (includeDefinitions && entity.definition.toLocaleLowerCase().includes(needle)),
  );
}

export async function searchTerms(query: string, includeDefinitions: boolean, origin: string) {
  await wait();
  const needle = query.trim().toLocaleLowerCase();
  return terms.filter((term) => {
    const matchesQuery = !needle || term.value.toLocaleLowerCase().includes(needle) ||
      (includeDefinitions && term.definition.toLocaleLowerCase().includes(needle));
    return matchesQuery && (origin === "all" || term.origin === origin);
  });
}

export function normalizedHandle(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function jaccard(leftIds: string[], rightIds: string[]) {
  const left = new Set(leftIds);
  const right = new Set(rightIds);
  const intersection = [...left].filter((id) => right.has(id)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 1;
}

export const comparisonSummary = [
  { status: "shared", label: "Shared", count: 5 },
  { status: "changed", label: "Changed", count: 2 },
  { status: "left", label: "A only", count: 1 },
  { status: "right", label: "B only", count: 1 },
  { status: "ambiguous", label: "Ambiguous", count: 1 },
] as const;

export const graphRows = [
  { id: "study", type: "Node", status: "shared", left: "study", right: "study", reason: "Exact name" },
  { id: "participant", type: "Node", status: "shared", left: "participant", right: "participant", reason: "Exact name" },
  { id: "sample", type: "Node", status: "changed", left: "sample · has_sample 1:n · optional", right: "sample · has_sample 1:1 · required", reason: "Relationship fields changed" },
  { id: "sample_type", type: "Property", status: "changed", left: "sample-type · caDSR · 2 terms", right: "sample_type · NCIt · 3 terms", reason: "Normalized name · value set 67%" },
  { id: "sex", type: "Property", status: "shared", left: "birth_sex", right: "sex_at_birth", reason: "Same CDE CDE-000012345" },
  { id: "file", type: "Node", status: "shared", left: "file", right: "file", reason: "Exact name" },
  { id: "format", type: "Property", status: "shared", left: "file_type", right: "file_format", reason: "Same value set" },
  { id: "diagnosis", type: "Node", status: "left", left: "diagnosis", right: "Not available", reason: "A only" },
  { id: "response", type: "Node", status: "right", left: "Not available", right: "treatment_response", reason: "B only" },
  { id: "alias", type: "Property", status: "ambiguous", left: "sample.id", right: "sample_id · specimen_id", reason: "Two normalized candidates" },
] as const;

export type ComparisonGraphStatus = typeof graphRows[number]["status"];

export type ComparisonGraphNode = {
  id: typeof graphRows[number]["id"];
  label: string;
  entityType: "Node" | "Property";
  status: ComparisonGraphStatus;
  x: number;
  y: number;
};

export type ComparisonGraphEdge = {
  id: string;
  source: ComparisonGraphNode["id"];
  target: ComparisonGraphNode["id"];
  label: string;
  status: ComparisonGraphStatus;
};

// Fixed coordinates keep the comparison deterministic for screenshots, tests,
// and future API-backed adapters. They mirror the topology in the supplied
// standalone graph prototype while preserving model-specific entities.
export const comparisonGraphs: {
  left: { nodes: ComparisonGraphNode[]; edges: ComparisonGraphEdge[] };
  right: { nodes: ComparisonGraphNode[]; edges: ComparisonGraphEdge[] };
} = {
  left: {
    nodes: [
      { id: "study", label: "study", entityType: "Node", status: "shared", x: 260, y: 52 },
      { id: "participant", label: "participant", entityType: "Node", status: "shared", x: 260, y: 148 },
      { id: "sex", label: "birth_sex", entityType: "Property", status: "shared", x: 438, y: 148 },
      { id: "diagnosis", label: "diagnosis", entityType: "Node", status: "left", x: 92, y: 260 },
      { id: "sample", label: "sample", entityType: "Node", status: "changed", x: 260, y: 260 },
      { id: "sample_type", label: "sample-type", entityType: "Property", status: "changed", x: 92, y: 376 },
      { id: "file", label: "file", entityType: "Node", status: "shared", x: 260, y: 376 },
      { id: "alias", label: "sample.id", entityType: "Property", status: "ambiguous", x: 438, y: 376 },
      { id: "format", label: "file_type", entityType: "Property", status: "shared", x: 260, y: 486 },
    ],
    edges: [
      { id: "a-study-participant", source: "study", target: "participant", label: "has_participant", status: "shared" },
      { id: "a-participant-sex", source: "participant", target: "sex", label: "has_property", status: "shared" },
      { id: "a-participant-diagnosis", source: "participant", target: "diagnosis", label: "has_diagnosis", status: "left" },
      { id: "a-participant-sample", source: "participant", target: "sample", label: "has_sample 1:n", status: "changed" },
      { id: "a-sample-type", source: "sample", target: "sample_type", label: "has_property", status: "changed" },
      { id: "a-sample-file", source: "sample", target: "file", label: "has_file", status: "shared" },
      { id: "a-sample-alias", source: "sample", target: "alias", label: "identifier", status: "ambiguous" },
      { id: "a-file-format", source: "file", target: "format", label: "has_property", status: "shared" },
    ],
  },
  right: {
    nodes: [
      { id: "study", label: "study", entityType: "Node", status: "shared", x: 260, y: 52 },
      { id: "participant", label: "participant", entityType: "Node", status: "shared", x: 260, y: 148 },
      { id: "sex", label: "sex_at_birth", entityType: "Property", status: "shared", x: 438, y: 148 },
      { id: "response", label: "treatment_response", entityType: "Node", status: "right", x: 92, y: 260 },
      { id: "sample", label: "sample", entityType: "Node", status: "changed", x: 260, y: 260 },
      { id: "sample_type", label: "sample_type", entityType: "Property", status: "changed", x: 92, y: 376 },
      { id: "file", label: "file", entityType: "Node", status: "shared", x: 260, y: 376 },
      { id: "alias", label: "sample_id / specimen_id", entityType: "Property", status: "ambiguous", x: 438, y: 376 },
      { id: "format", label: "file_format", entityType: "Property", status: "shared", x: 260, y: 486 },
    ],
    edges: [
      { id: "b-study-participant", source: "study", target: "participant", label: "has_participant", status: "shared" },
      { id: "b-participant-sex", source: "participant", target: "sex", label: "has_property", status: "shared" },
      { id: "b-participant-response", source: "participant", target: "response", label: "has_response", status: "right" },
      { id: "b-participant-sample", source: "participant", target: "sample", label: "has_sample 1:1", status: "changed" },
      { id: "b-sample-type", source: "sample", target: "sample_type", label: "has_property", status: "changed" },
      { id: "b-sample-file", source: "sample", target: "file", label: "has_file", status: "shared" },
      { id: "b-sample-alias", source: "sample", target: "alias", label: "identifier", status: "ambiguous" },
      { id: "b-file-format", source: "file", target: "format", label: "has_property", status: "shared" },
    ],
  },
};

export type FreeformGraphNode = {
  id: typeof graphRows[number]["id"];
  label: string;
  entityType: "Node" | "Property";
  status: ComparisonGraphStatus;
  x: number;
  y: number;
};

export type FreeformGraphEdge = {
  id: string;
  source: FreeformGraphNode["id"];
  target: FreeformGraphNode["id"];
  label: string;
  status: ComparisonGraphStatus;
};

// Prototype-derived dual free-form comparison. Unlike the aligned graph, each
// model owns an independent irregular layout. Coordinates are fixed so the
// deliberately loose topology remains deterministic across runs.
const freeformPositions: Record<"left" | "right", Record<string, { x: number; y: number }>> = {
  left: {
    study: { x: 270, y: 54 }, participant: { x: 168, y: 150 }, sex: { x: 414, y: 120 },
    diagnosis: { x: 82, y: 282 }, sample: { x: 278, y: 270 }, sample_type: { x: 105, y: 420 },
    file: { x: 340, y: 390 }, alias: { x: 440, y: 292 }, format: { x: 332, y: 506 },
  },
  right: {
    study: { x: 245, y: 58 }, participant: { x: 340, y: 158 }, sex: { x: 92, y: 150 },
    response: { x: 432, y: 278 }, sample: { x: 230, y: 286 }, sample_type: { x: 420, y: 410 },
    file: { x: 155, y: 414 }, alias: { x: 68, y: 302 }, format: { x: 250, y: 510 },
  },
};

export const freeformComparisonGraphs: {
  left: { nodes: FreeformGraphNode[]; edges: FreeformGraphEdge[] };
  right: { nodes: FreeformGraphNode[]; edges: FreeformGraphEdge[] };
} = {
  left: {
    nodes: comparisonGraphs.left.nodes.map((node) => ({ ...node, ...freeformPositions.left[node.id] })),
    edges: comparisonGraphs.left.edges.map((edge) => ({ ...edge, id: `free-${edge.id}` })),
  },
  right: {
    nodes: comparisonGraphs.right.nodes.map((node) => ({ ...node, ...freeformPositions.right[node.id] })),
    edges: comparisonGraphs.right.edges.map((edge) => ({ ...edge, id: `free-${edge.id}` })),
  },
};

export const freeformOverlayGraph: { nodes: FreeformGraphNode[]; edges: FreeformGraphEdge[] } = {
  nodes: [
    { id: "study", label: "study", entityType: "Node", status: "shared", x: 470, y: 68 },
    { id: "participant", label: "participant", entityType: "Node", status: "shared", x: 430, y: 190 },
    { id: "diagnosis", label: "diagnosis", entityType: "Node", status: "left", x: 208, y: 305 },
    { id: "sample", label: "sample", entityType: "Node", status: "changed", x: 515, y: 315 },
    { id: "response", label: "treatment_response", entityType: "Node", status: "right", x: 798, y: 245 },
    { id: "file", label: "file", entityType: "Node", status: "shared", x: 615, y: 455 },
    { id: "format", label: "file_type / file_format", entityType: "Property", status: "shared", x: 842, y: 430 },
  ],
  edges: [
    { id: "overlay-study-participant", source: "study", target: "participant", label: "has_participant", status: "shared" },
    { id: "overlay-participant-diagnosis", source: "participant", target: "diagnosis", label: "has_diagnosis", status: "left" },
    { id: "overlay-participant-sample", source: "participant", target: "sample", label: "1:n → 1:1", status: "changed" },
    { id: "overlay-participant-response", source: "participant", target: "response", label: "has_response", status: "right" },
    { id: "overlay-sample-file", source: "sample", target: "file", label: "has_file", status: "shared" },
    { id: "overlay-file-format", source: "file", target: "format", label: "has_property", status: "shared" },
  ],
};

export const stackRows = [
  {
    id: "sample-stack",
    property: "sample_type",
    status: "changed",
    score: jaccard(valueSets.find((set) => set.id === "VS-SAMPLE-A")?.termIds ?? [], valueSets.find((set) => set.id === "VS-SAMPLE-B")?.termIds ?? []),
    reason: "Normalized name · overlapping value set",
    left: { origin: "caDSR", model: "Clinical Study v1.0", valueSet: "sample_type_v1", terms: ["Blood", "Tissue"] },
    right: { origin: "NCIt", model: "Clinical Study v2.0", valueSet: "sample_type_v2", terms: ["Blood", "Tissue", "Saliva"] },
  },
  {
    id: "file-stack",
    property: "file_format",
    status: "shared",
    score: 1,
    reason: "Same permissible value set",
    left: { origin: "NCIt", model: "Clinical Study v1.0", valueSet: "file_format_values", terms: ["FASTQ", "BAM", "CRAM"] },
    right: { origin: "NCIt", model: "Clinical Study v2.0", valueSet: "file_format_values", terms: ["FASTQ", "BAM", "CRAM"] },
  },
] as const;
