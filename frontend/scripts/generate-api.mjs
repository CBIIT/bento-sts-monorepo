import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const python = process.env.STS_PYTHON || path.join(root, 'backend/.venv/bin/python');
const source = process.argv[2];
const exported = source ? { status: 0, stdout: readFileSync(path.resolve(source), 'utf8'), stderr: '', error: undefined } : spawnSync(python, ['-c', 'import json; from bento_sts.sts import app; print(json.dumps(app.openapi(), sort_keys=True))'], {
  cwd: path.join(root, 'backend'), encoding: 'utf8',
  env: { ...process.env, NEO4J_MDB_URI: 'bolt://127.0.0.1:1', NEO4J_MDB_USER: 'schema-export', NEO4J_MDB_PASS: 'unused' },
});
if (exported.status !== 0) throw new Error(exported.stderr || exported.error?.message || 'OpenAPI export failed');
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
const schema = JSON.stringify(canonical(JSON.parse(exported.stdout)), null, 2) + '\n';
mkdirSync(path.join(root, 'frontend/src/api'), { recursive: true });
writeFileSync(path.join(root, 'frontend/src/api/openapi.json'), schema);
const generated = spawnSync(path.join(root, 'frontend/node_modules/.bin/openapi-typescript'), ['src/api/openapi.json', '-o', 'src/api/schema.d.ts'], { cwd: path.join(root, 'frontend'), stdio: 'inherit' });
process.exit(generated.status ?? 1);
