from fastapi import APIRouter, Depends, Request
from typing import List
from ..dependencies import paging_params
from ..pymodels import Term, Property
from ..converters import neo_to_py

router = APIRouter(
    prefix="/edps",
    tags=["edps"],
    dependencies=[Depends(paging_params)],
)


@router.get(
    "/{originName}",
    summary="Get all extended definition property (EDP) defining terms, filtered by the origin (authority) of the terms (e.g., 'caDSR' for CDEs)",
    response_model=List[Term],
    responses={
        200: {"description": "Successful Response"},
        404: {"description": "Not found."},
        422: {"description": "Bad parameters (skip or limit?)"},
    },
)

def edp_terms_get(request: Request, originName: str):
    stmt = " ".join([
        "MATCH (t:term {origin_name: $origin_name})-[:specifies_value_set]->(:value_set)",
        "RETURN DISTINCT t",
        f"SKIP {request.state.skip} " if request.state.skip else "",
        f"LIMIT {request.state.limit}" if request.state.limit else ""])

    rows = request.state.mdb.get_with_statement(
        stmt,
        {"origin_name": originName}
    )
    ret = []
    for row in rows:
        ret.append(neo_to_py(row['t']))
    return ret


def edps_by_model_get(
    request: Request,
    model: str,
    version: str,
    property: str = "",
):
    """Return EDP terms grouped by property for a model version."""
    stmt = """
    MATCH (n:node {model: $model, version: $version})
      -[:has_property]->(p:property)
    WHERE $property = "" OR p.handle = $property
    OPTIONAL MATCH (p)-[:has_value_set]->(:value_set)
      <-[:specifies_value_set]-(edp:term)
    WITH p.handle AS property,
      collect(DISTINCT CASE WHEN edp IS NULL THEN null ELSE {
        type: "Term",
        value: edp.value,
        origin_name: edp.origin_name,
        handle: edp.handle,
        origin_version: edp.origin_version,
        origin_id: edp.origin_id,
        nanoid: edp.nanoid
      } END) AS collected_edps
    RETURN property,
      [edp IN collected_edps WHERE edp IS NOT NULL] AS edps
    ORDER BY property
    """

    rows = request.state.mdb.get_with_statement(
        stmt,
        {"model": model, "version": version, "property": property},
        raise_on_empty=False,
    )
    edps_by_property = {}
    for row in rows:
        edps = {}
        for edp_data in row["edps"]:
            edp = Term(**edp_data)
            identity = (
                edp.origin_name,
                edp.origin_id,
                edp.origin_version,
                edp.handle,
            )
            edps.setdefault(identity, edp)
        edps_by_property[row["property"]] = [
            edps[identity]
            for identity in sorted(
                edps,
                key=lambda values: tuple(value or "" for value in values),
            )
        ]
    return edps_by_property


@router.get(
    "/{originName}/{originId}/{originVersion}/properties",
    summary="Get model properties that use a given EDP as their permissible value list source.",
    response_model=List[Property],
    responses={
        200: {"description": "Successful Response"},
        404: {"description": "Not found."},
        422: {"description": "Bad parameters (origin, id, version, skip, or limit?)"},
    },
)

def edp_properties_get(
    request: Request,
    originName: str,
    originId: str,
    originVersion: str,
):
    stmt = "\n".join([
        "MATCH (edp:term {origin_name: $origin_name, origin_id: $origin_id,",
        "origin_version: $origin_version})",
        "-[:specifies_value_set]->(v:value_set)",
        "OPTIONAL MATCH (p:property)-[:has_value_set]->(v)",
        "WITH edp, collect(DISTINCT p) AS props",
        "RETURN [p IN props WHERE p IS NOT NULL] AS props",
    ])

    rows = request.state.mdb.get_with_statement(
        stmt,
        {
            "origin_name": originName,
            "origin_id": originId,
            "origin_version": originVersion,
        },
    )

    props = rows[0]["props"]

    skip = request.state.skip or 0
    limit = request.state.limit or 0

    if limit > 0:
        props = props[skip : skip + limit]
    elif skip:
        props = props[skip:]

    return [neo_to_py(p) for p in props]
