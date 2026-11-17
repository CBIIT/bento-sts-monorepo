import { describe, expect, it, vi, afterEach } from 'vitest';
import { deriveCatalog, compareVersions, getInventory, getModelDetail, inventoryUrl, initialInput, inputFromHash, inputToHash, safeExternalUrl } from './client';
import type { Inventory } from './client';
afterEach(() => vi.unstubAllGlobals());
const record = (name: string, version: string, marked = false): Inventory[number] => ({ type: 'Model', name, version, nanoid: `${name}-${version}`, is_latest_version: marked, counts: { nodes: 0, properties: 2, relationships: 1 } });
const inventory = [record('A','1.9'),record('A','1.10'),record('A','TBD'),record('B','1.0.0',true),record('B','2.0.0',true),record('B','3.0.0'),record('TEST','1.0.0')];
describe('inventory adapter', () => {
  it('selects highest marked or highest available and includes TEST', () => {
    const result = deriveCatalog(inventory, initialInput);
    expect(result.items.map(m => [m.model_id,m.version])).toEqual([['A','1.10'],['B','2.0.0'],['TEST','1.0.0']]);
    expect(result.counts).toEqual({ models: 3, model_versions: 3 });
    expect(inventory[1].is_latest_version).toBe(false);
  });
  it('orders semantic and opaque versions deterministically', () => {
    expect(['TBD','1.10','1.9','2.0.0','2.0.0-rc.2','2.0.0-rc.10','unknown','2026'].sort(compareVersions)).toEqual(['2026','TBD','unknown','1.9','1.10','2.0.0-rc.2','2.0.0-rc.10','2.0.0']);
    expect(compareVersions('1.0.0+a','1.0.0+b')).toBeLessThan(0);
    expect(compareVersions('1.0.0-01','1.0.0-1')).toBeLessThan(0);
  });
  it('filters before paging and retains complete model options', () => {
    const result = deriveCatalog(inventory, { ...initialInput, all: true, search: ' b ', skip: 1, limit: 1 });
    expect(result.items[0].version).toBe('2.0.0');
    expect(result.counts).toEqual({ models: 1, model_versions: 3 });
    expect(result.available_models).toHaveLength(3);
    expect(deriveCatalog(inventory, { ...initialInput, models: [], search: 'B' }).items).toEqual([]);
    expect(deriveCatalog(inventory, { ...initialInput, models: ['A'], search: 'B' }).items).toEqual([]);
  });
  it('supports both sort directions and pages beyond 200', () => {
    expect(deriveCatalog(inventory, { ...initialInput, direction: 'desc' }).items.map(m => m.model_id)).toEqual(['TEST','B','A']);
    const all = Array.from({length: 223}, (_,i) => record('A', `1.0.${i}`));
    expect(deriveCatalog(all, { ...initialInput, all: true, sort: 'version', skip: 200 }).items).toHaveLength(23);
  });
  it('round-trips complete URL state', () => {
    const input = { ...initialInput, all: true, models: ['A'], search: 'a', sort: 'version' as const, direction: 'desc' as const, skip: 50 };
    expect(inputFromHash(inputToHash(input))).toEqual(input);
    expect(inputFromHash('#/?skip=bad').skip).toBe(0);
  });
  it('rejects unsafe links', () => {
    for (const value of ['javascript:alert(1)', 'https://user:pass@example.org', 'https://example.org/\n']) expect(safeExternalUrl(value)).toBeUndefined();
  });
});
describe('inventory transport and detail', () => {
  it('fetches the unbounded list and passes cancellation', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(inventory)));
    vi.stubGlobal('fetch', fetcher);
    const signal = new AbortController().signal;
    expect(await getInventory(signal)).toEqual(inventory);
    expect(fetcher).toHaveBeenCalledWith(inventoryUrl, expect.objectContaining({ signal }));
  });
  it('only treats the documented empty-list404 as empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"detail":"Not found."}', {status:404})).mockResolvedValueOnce(new Response('{"detail":"Not Found"}', {status:404})));
    expect(await getInventory()).toEqual([]);
    await expect(getInventory()).rejects.toThrow('404');
  });
  it('rejects missing counts and service failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('[{"name":"A"}]')).mockResolvedValueOnce(new Response('{}', {status:503})));
    await expect(getInventory()).rejects.toThrow('Invalid');
    await expect(getInventory()).rejects.toThrow('503');
  });
  it('distinguishes empty details from missing models without ambiguous node calls', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(inventory)))));
    expect((await getModelDetail('A','1.10')).model?.version).toBe('1.10');
    expect(await getModelDetail('A','missing')).toEqual({model:null,nodes:[]});
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('does not reinterpret a nodes404 as empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify([{...record('A','1.0.0'),counts:{nodes:1,properties:0,relationships:0}}]))).mockResolvedValueOnce(new Response('{}',{status:404})));
    await expect(getModelDetail('A','1.0.0')).rejects.toThrow('404');
  });
});
