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
    dependencies=[Depends(paging_params)],
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
    stmt = " ".join([
        "MATCH (p:property)-[:has_value_set]->(v:value_set)",
        "<-[:specifies_value_set]-(edp:term {origin_name: $origin_name,",
        "origin_id: $origin_id, origin_version: $origin_version})",
        "RETURN DISTINCT p",
        f"SKIP {request.state.skip} " if request.state.skip else "",
        f"LIMIT {request.state.limit}" if request.state.limit else "",
    ])

    rows = request.state.mdb.get_with_statement(
        stmt,
        {
            "origin_name": originName,
            "origin_id": originId,
            "origin_version": originVersion,
        },
    )

    ret = []
    for row in rows:
        ret.append(neo_to_py(row["p"]))
    return ret


