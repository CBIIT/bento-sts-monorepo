import asyncio
from threading import Barrier
from types import SimpleNamespace

from bento_sts.routers import edps, terms


class FakeMDB:
    def get_with_statement(self, stmt, params, raise_on_empty=True):
        assert "[:specifies_value_set]" in stmt
        assert "toFloat(equivalent_edp.origin_version)" in stmt
        assert "(related_edp:term)" in stmt
        assert "anchor_value_sets + related_value_sets" in stmt
        assert "candidate.url IS NULL" in stmt
        assert "size(candidate.pvs) > 0" in stmt
        assert raise_on_empty is False
        return [
            {
                "CDECode": params["p0"],
                "CDEVersion": params["p1"],
                "CDEFullName": "Example CDE",
                "permissibleValues": [],
            }
        ]


class FakeModelMDB:
    def __init__(self, barrier):
        self.barrier = barrier

    def get_with_statement(self, stmt, params, raise_on_empty=True):
        assert "MATCH (n0:node {model:$p0})" in stmt
        assert "{{model:$p0}}" not in stmt
        self.barrier.wait(timeout=1)
        return [
            {
                "model": params["p0"],
                "version": params["p1"],
                "property": params["p2"],
                "permissibleValues": [
                    {"value": "Regular value", "synonyms": []}
                ],
            }
        ]


def make_request(mdb):
    return SimpleNamespace(
        state=SimpleNamespace(mdb=mdb, skip=0, limit=0),
    )


def test_cde_pvs_uses_specified_value_set_without_models():
    request = make_request(FakeMDB())

    result = terms.cde_pvs_by_id_with_version_get(request, "11253427", "1")

    assert "models" not in result[0]


def test_model_pvs_runs_model_edps_query_in_parallel(monkeypatch):
    barrier = Barrier(2)
    request = make_request(FakeModelMDB(barrier))

    def fake_edps_by_model_get(request, model, version, property):
        barrier.wait(timeout=1)
        assert model == "TEST"
        assert version == "1.2.0"
        assert property == "anatomic_site"
        return {
            "anatomic_site": [
                {
                    "type": "Term",
                    "value": "Obib Value Set Reference",
                    "origin_name": "CRDC",
                    "origin_id": "CRDC0002",
                    "origin_version": "1",
                }
            ]
        }

    monkeypatch.setattr(terms, "edps_by_model_get", fake_edps_by_model_get)

    result = asyncio.run(
        terms.pvs_synonyms_model_version_get(
            request,
            "TEST",
            "anatomic_site",
            "1.2.0",
        )
    )

    edp = result[0]["permissibleValues"][0]
    assert edp["type"] == "Term"
    assert edp["origin_id"] == "CRDC0002"
    assert result[0]["permissibleValues"][1]["value"] == "Regular value"


def test_model_edps_are_grouped_and_deduplicated():
    class FakeEdpMDB:
        def get_with_statement(self, stmt, params, raise_on_empty=True):
            assert "(p)-[:has_concept]->(:concept)<-[:represents]-(cde:term)" in stmt
            assert "(cde:term)\n      -[:specifies_value_set]->(:value_set)" in stmt
            assert "(p)-[:has_value_set]" not in stmt
            assert params == {
                "model": "TEST",
                "version": "1.2.0",
                "property": "race",
            }
            assert raise_on_empty is False
            return [
                {
                    "property": "race",
                    "edps": [
                        {
                            "value": "Race Category Text",
                            "origin_name": "caDSR",
                            "origin_id": "2192199",
                            "origin_version": "1",
                            "handle": "subject_race",
                            "nanoid": "first",
                        },
                        {
                            "value": "Race Category Text",
                            "origin_name": "caDSR",
                            "origin_id": "2192199",
                            "origin_version": "1",
                            "handle": "subject_race",
                            "nanoid": "duplicate",
                        },
                    ],
                }
            ]

    result = edps.edps_by_model_get(
        make_request(FakeEdpMDB()),
        "TEST",
        "1.2.0",
        "race",
    )

    assert len(result["race"]) == 1
    assert result["race"][0].origin_id == "2192199"
