import type { components } from './schema';
export type Inventory = components['schemas']['ModelWithCounts'][];
export type Card = { model_id: string; version_id: string; short_name: string; display_name: string; version: string; is_current: boolean; release_date: null; external_url?: string; counts: Inventory[number]['counts'] };
export type Catalog = { items: Card[]; counts: { models: number; model_versions: number }; page: { skip: number; limit: number; total: number }; available_models: { model_id: string; short_name: string }[] };
export type CatalogInput = { search?: string; all: boolean; models: string[] | null; sort: 'short_name' | 'version'; direction: 'asc' | 'desc'; skip: number; limit: number };
export const initialInput: CatalogInput = { all: false, models: null, sort: 'short_name', direction: 'asc', skip: 0, limit: 50 };
export const inventoryUrl = '/api/v2/models/?include_counts=true';
export async function getInventory(signal?: AbortSignal): Promise<Inventory> {
  const response = await fetch(inventoryUrl, { signal, headers: { Accept: 'application/json' } });
  if (response.status === 404) {
    const body = await response.json();
    if (body.detail === 'Not found.') return [];
  }
  if (!response.ok) throw new Error(`The request could not be completed (${response.status}). Please try again.`);
  const rows: Inventory = await response.json();
  if (!Array.isArray(rows) || rows.some(row => !row.name || !row.version || !row.nanoid ||
    !row.counts || ['nodes', 'properties', 'relationships'].some(key => {
      const value = row.counts[key as keyof typeof row.counts];
      return !Number.isSafeInteger(value) || value < 0;
    }))) throw new Error('Invalid model inventory response.');
  return rows;
}
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`The request could not be completed (${response.status}). Please try again.`);
  return response.json() as Promise<T>;
}

export function safeExternalUrl(value: string | null | undefined): string | undefined {
  if (!value || [...value].some(c => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127)) return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
const lexical = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const names = (a: string, b: string) => lexical(a.toLowerCase(), b.toLowerCase()) || lexical(a, b);
// SemVer precedence with two-part normalization and deterministic opaque-label ties.
export function compareVersions(a: string, b: string): number {
  const parse = (value: string) => {
    const m = /^(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value);
    if (!m || m[4]?.split('.').some(x => /^0\d+$/.test(x))) return null;
    return { core: [BigInt(m[1]), BigInt(m[2]), BigInt(m[3] || '0')], pre: m[4]?.split('.') };
  };
  const left = parse(a), right = parse(b);
  if (left && right) {
    for (let i = 0; i < 3; i++) if (left.core[i] !== right.core[i]) return left.core[i] < right.core[i] ? -1 : 1;
    if (!left.pre !== !right.pre) return left.pre ? -1 : 1;
    if (left.pre && right.pre) {
      for (let i = 0; i < Math.max(left.pre.length, right.pre.length); i++) {
        const x = left.pre[i], y = right.pre[i];
        if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
        if (x === y) continue;
        const nx = /^\d+$/.test(x), ny = /^\d+$/.test(y);
        if (nx && ny) return BigInt(x) < BigInt(y) ? -1 : 1;
        return nx !== ny ? (nx ? -1 : 1) : lexical(x, y);
      }
    }
  } else if (!!left !== !!right) return left ? 1 : -1;
  return names(a, b);
}
export function deriveCatalog(inventory: Inventory, input: CatalogInput): Catalog {
  const grouped = new Map<string, Inventory>();
  for (const model of inventory) grouped.set(model.name!, [...(grouped.get(model.name!) || []), model]);
  const current = new Set<string>();
  for (const versions of grouped.values()) {
    const marked = versions.filter(m => m.is_latest_version);
    const candidates = marked.length ? marked : versions;
    const selected = [...candidates].sort((a, b) => compareVersions(a.version!, b.version!) || lexical(a.nanoid!, b.nanoid!)).at(-1)!;
    current.add(selected.nanoid!);
  }
  const options = [...grouped.keys()].sort(names).map(name => ({ model_id: name, short_name: name }));
  const selected = applyModelSearch(input, options).models;
  const eligible = inventory.filter(m => (selected === null || selected.includes(m.name!)) && (input.all || current.has(m.nanoid!)));
  const direction = input.direction === 'asc' ? 1 : -1;
  eligible.sort((a, b) => input.sort === 'version'
    ? compareVersions(a.version!, b.version!) * direction || names(a.name!, b.name!) || lexical(a.nanoid!, b.nanoid!)
    : names(a.name!, b.name!) * direction || -compareVersions(a.version!, b.version!) || -lexical(a.nanoid!, b.nanoid!));
  return {
    items: eligible.slice(input.skip, input.skip + input.limit).map(m => ({ model_id: m.name!, version_id: m.nanoid!, short_name: m.name!, display_name: m.name!, version: m.version!, is_current: current.has(m.nanoid!), release_date: null, external_url: safeExternalUrl(m.repository), counts: m.counts })),
    counts: { models: new Set(eligible.map(m => m.name)).size, model_versions: eligible.length },
    page: { skip: input.skip, limit: input.limit, total: eligible.length }, available_models: options,
  };
}
export function inputFromHash(hash: string): CatalogInput {
  const params = new URLSearchParams(hash.split('?')[1] || '');
  const offset = Number(params.get('skip') || 0);
  return {
    ...initialInput,
    all: params.get('all') === 'true',
    ...(params.get('q') ? { search: params.get('q')! } : {}),
    models: params.get('none') === 'true' ? [] : params.has('model') ? [...new Set(params.getAll('model'))].sort() : null,
    sort: params.get('sort') === 'version' ? 'version' : 'short_name',
    direction: params.get('direction') === 'desc' ? 'desc' : 'asc',
    skip: Number.isSafeInteger(offset) && offset >= 0 ? offset : 0,
  };
}
export function inputToHash(input: CatalogInput): string {
  const params = new URLSearchParams();
  if (input.search) params.set('q', input.search);
  if (input.all) params.set('all', 'true');
  if (input.models?.length === 0) params.set('none', 'true');
  [...new Set(input.models || [])].sort().forEach((value) => params.append('model', value));
  if (input.sort !== initialInput.sort) params.set('sort', input.sort);
  if (input.direction !== initialInput.direction) params.set('direction', input.direction);
  if (input.skip) params.set('skip', String(input.skip));
  return `#/${params.size ? `?${params}` : ''}`;
}
export type ModelDetailResult = { model: Card | null; nodes: components['schemas']['Node'][] };
export async function getModelDetail(model: string, version: string, signal?: AbortSignal): Promise<ModelDetailResult> {
  const inventory = await getInventory(signal);
  const catalog = deriveCatalog(inventory, { ...initialInput, all: true, models: [model], limit: inventory.length });
  const selected = catalog.items.find(item => item.version === version);
  if (!selected) return { model: null, nodes: [] };
  if (selected.counts.nodes === 0) return { model: selected, nodes: [] };
  const nodes = await getJson<components['schemas']['Node'][]>(`/api/v2/model/${encodeURIComponent(model)}/version/${encodeURIComponent(version)}/nodes`, signal);
  return { model: selected, nodes };
}

// Resolve names against the complete catalog options, before client pagination.
// Keep manual model selection independent so clearing search restores it.
export function applyModelSearch(input: CatalogInput, options: { model_id: string; short_name: string }[]): CatalogInput {
  const term = input.search?.trim().toLocaleLowerCase();
  if (!term) return input;
  return { ...input, models: options.filter(option =>
    (input.models === null || input.models.includes(option.model_id)) &&
    [option.model_id, option.short_name].some(name => name.toLocaleLowerCase().includes(term))
  ).map(option => option.model_id) };
}
