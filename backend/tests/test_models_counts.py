"""Legacy list compatibility and opt-in counts; no shared database fixtures."""
import pytest
from neo4j.graph import Graph, Node
from bento_sts.catalog import CATALOG_QUERY

class Reader:
    def __init__(self):
        self.models = [dict(name='A', version=v, nanoid='A-'+v, is_latest_version=v=='2.0.0') for v in ['2.0.0','1.0.0']]
        self.calls = []
        self.count = 3
    def get_with_statement(self, query, params, raise_on_empty=True):
        self.calls.append(query)
        if query == CATALOG_QUERY:
            return [dict(models=self.models, nodes=[dict(model='A',version='2.0.0',count=self.count)], properties=[], relationships=[])]
        if 'count(n0)' in query: return [{'count':len(self.models)}]
        return [{'model': Node(Graph(), str(i), i, ['model'], m)} for i,m in enumerate(self.models)]

@pytest.fixture
def context():
    from fastapi.testclient import TestClient
    from fastapi import Request
    from bento_sts.sts import app
    from bento_sts.dependencies import get_mdb
    reader = Reader()
    def override(request: Request): request.state.mdb = reader
    app.dependency_overrides[get_mdb] = override
    try:
        with TestClient(app) as client: yield client, reader
    finally: app.dependency_overrides.pop(get_mdb, None)

def test_default_exact_legacy_shape_and_no_aggregation(context):
    c,r=context
    expected=[dict(type='Model',handle=None,version=v,nanoid='A-'+v,name='A',repository=None,is_latest_version=v=='2.0.0') for v in ['1.0.0','2.0.0']]
    assert c.get('/v2/models/').json()==expected
    assert c.get('/v2/models/?include_counts=false').json()==expected
    assert CATALOG_QUERY not in r.calls
    assert c.get('/v2/models/count').json()==2

def test_counts_single_snapshot_and_same_metadata(context):
    c,r=context
    legacy=c.get('/v2/models/').json(); r.calls.clear()
    response=c.get('/v2/models/?include_counts=true')
    assert response.status_code==200
    rows=response.json()
    assert [m.pop('counts') for m in rows]==[dict(nodes=0,properties=0,relationships=0),dict(nodes=3,properties=0,relationships=0)]
    assert rows==legacy
    assert r.calls==[CATALOG_QUERY]

@pytest.mark.parametrize('suffix',['','&include_counts=true'])
def test_legacy_pagination_and_empty_status(context,suffix):
    c,r=context
    assert len(c.get('/v2/models/?limit=0'+suffix).json())==2
    assert len(c.get('/v2/models/?limit=201'+suffix).json())==2
    assert c.get('/v2/models/?skip=1&limit=1'+suffix).json()[0]['version']=='2.0.0'
    assert c.get('/v2/models/?skip=2'+suffix).status_code==404
    r.models=[]
    assert c.get('/v2/models/?limit=0'+suffix).json()=={'detail':'Not found.'}

@pytest.mark.parametrize('query',['include_counts=maybe','skip=-1','limit=-1'])
def test_invalid_parameters(context,query):
    assert context[0].get('/v2/models/?'+query).status_code==422

@pytest.mark.parametrize('bad',['duplicate','missing','count','outage'])
def test_optin_failure_generic_503(context,bad):
    c,r=context
    if bad=='duplicate': r.models.append(r.models[0])
    elif bad=='missing': r.models[0]['nanoid']=None
    elif bad=='count': r.count=-1
    else:
        def fail(*args,**kwargs): raise RuntimeError('sensitive credentials')
        r.get_with_statement=fail
    response=c.get('/v2/models/?include_counts=true')
    assert response.status_code==503
    assert response.json()=={'detail':'The model inventory is temporarily unavailable.'}

def test_retired_route_and_generated_contract(context):
    c,_=context
    schema=c.get('/openapi.json').json()
    assert '/v2/model-cards' not in schema['paths']
    assert c.get('/v2/model-cards').status_code==404
    assert 'ModelWithCounts' in schema['components']['schemas']
    assert 'counts' not in schema['components']['schemas']['Model']['properties']
