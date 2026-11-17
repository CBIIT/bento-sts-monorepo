"""Optional model inventory counts from a single database snapshot."""
from pydantic import BaseModel, Field
from .pymodels import Model

class CardCounts(BaseModel):
    nodes: int = Field(ge=0)
    properties: int = Field(ge=0)
    relationships: int = Field(ge=0)

class ModelWithCounts(Model):
    counts: CardCounts

class CatalogDataError(ValueError):
    """Invalid stored model inventory."""

# Four grouped scans in one read statement, rather than a driver query per card.
# Each subquery returns one collection, avoiding join multiplication.
CATALOG_QUERY = '''
CALL {
    MATCH (m:model)
    RETURN collect(properties(m)) AS models
}
CALL {
    MATCH (n:node)
    WITH n.model AS model, n.version AS version, count(DISTINCT n) AS count
    RETURN collect({model:model, version:version, count:count}) AS nodes
}
CALL {
    MATCH (p:property)
    WITH p.model AS model, p.version AS version, count(DISTINCT p) AS count
    RETURN collect({model:model, version:version, count:count}) AS properties
}
CALL {
    MATCH (r:relationship)
    WITH r.model AS model, r.version AS version, count(DISTINCT r) AS count
    RETURN collect({model:model, version:version, count:count}) AS relationships
}
RETURN models, nodes, properties, relationships
'''


def _read_catalog(reader):
    rows = reader.get_with_statement(CATALOG_QUERY, {}, raise_on_empty=False)
    if len(rows) != 1:
        raise CatalogDataError('Missing catalog snapshot')
    snapshot = rows[0]
    models = snapshot['models']
    seen_pairs, seen_ids = set(), set()
    for model in models:
        values = [model.get(field) for field in ('name', 'version', 'nanoid')]
        if any(not isinstance(value, str) or not value.strip() for value in values):
            raise CatalogDataError('Missing model identity')
        name, version, nanoid = values
        if (name, version) in seen_pairs or nanoid in seen_ids:
            raise CatalogDataError('Duplicate model identity')
        seen_pairs.add((name, version))
        seen_ids.add(nanoid)
    aggregates = {}
    for label in ('nodes', 'properties', 'relationships'):
        aggregates[label] = {}
        for group in snapshot[label]:
            count = group['count']
            if not isinstance(count, int) or isinstance(count, bool) or count < 0:
                raise CatalogDataError('Invalid entity count')
            aggregates[label][(group['model'], group['version'])] = count
    return models, aggregates


def get_models_with_counts(reader):
    models, aggregates = _read_catalog(reader)
    return [ModelWithCounts(**model, counts=CardCounts(**{
        label: counts.get((model['name'], model['version']), 0)
        for label, counts in aggregates.items()
    })) for model in models]
