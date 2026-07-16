from logging import getLogger
from fastapi import HTTPException, Request
from pydantic import AfterValidator, Field
from pydantic_core import PydanticCustomError
from typing import Annotated
from .mdb import MDBReader


logger = getLogger(__name__)
mdb = MDBReader()
# Neo4j uses signed 64-bit integers, so larger paging values must be rejected.
MAX_PAGING_VALUE = 2**63 - 1


def validate_paging_value(value: int) -> int:
    if value > MAX_PAGING_VALUE:
        raise PydanticCustomError(
            "value_too_large", "Requested pagination value is too large."
        )
    return value


PagingValue = Annotated[
    int, Field(ge=0), AfterValidator(validate_paging_value)
]


def make_paging_params(default_limit: int = 0):
    def paging_params(
        request: Request,
        skip: PagingValue = 0,
        limit: PagingValue = default_limit,
    ):
        errors = [
            {
                "type": "value_too_large",
                "loc": ["query", parameter],
                "msg": "Requested pagination value is too large.",
                "input": str(value),
            }
            for parameter, value in (("skip", skip), ("limit", limit))
            if value > MAX_PAGING_VALUE
        ]
        if errors:
            raise HTTPException(status_code=422, detail=errors)

        # treat limit=0 as "use default_limit" when a default is set,
        effective_limit = limit if limit > 0 else default_limit
        request.state.skip = skip
        request.state.limit = effective_limit
        return {"skip": skip, "limit": effective_limit}
    return paging_params


paging_params = make_paging_params(default_limit=0)
paging_params_tags = make_paging_params(default_limit=100)


def get_mdb(request: Request):
    request.state.mdb = mdb
    return mdb
