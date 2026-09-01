# Metadata Explorer v3

Mock-first React/TypeScript interface for browsing, searching, and comparing biomedical metadata models, nodes, properties, terms, and permissible value sets.

## Included routes

- Home search and task entry
- Model browsing and entity detail views
- Cross-entity metadata search
- Terminology browsing and term detail views
- Graph alignment, free-form graph, overlay, and value-set stack comparison

The GitHub Pages build uses hash routing so every route remains reload-safe under `/bento-sts-monorepo/v3/`. Version 3 keeps the compact dashboard navigation while sharing the Version 1 browsing and comparison workflows.

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

The fixtures are deterministic and metamodel-informed, but remain `Mock-only · Unverified against MDB`.
