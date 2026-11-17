"""Read-only HTTP contract checks against the isolated Browse Models fixture."""
import json
import os
import urllib.request
import urllib.error

BASE = os.environ.get('QA_API_URL', 'http://127.0.0.1:28000')


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=15) as response:
        assert response.status == 200
        return json.load(response)


def main():
    rows = get('/v2/models/?include_counts=true')
    assert [(m['name'], m['version']) for m in rows] == [
        ('A', '1.0.0'), ('A', '2.0.0'), ('A', '3.0.0'), ('B', '1.0.0'), ('B', '2.0.0')]
    for row in rows:
        assert row.pop('counts') == {'nodes': 2, 'properties': 3, 'relationships': 1}
    assert rows == get('/v2/models/') == get('/v2/models/?include_counts=false')
    assert len(get('/v2/models/?include_counts=true&limit=0')) == 5
    assert get('/v2/models/?include_counts=true&skip=1&limit=1')[0]['version'] == '2.0.0'
    assert get('/v2/models/count') == 5
    assert len(get('/v2/models/')) == 5
    assert get('/v2/model/A/versions') == ['1.0.0', '2.0.0', '3.0.0']
    assert get('/v2/model/A/latest-version')['version'] == '3.0.0'
    assert get('/v2/model/A/version/3.0.0/nodes/count') == 2
    assert get('/v2/model/A/version/3.0.0/node/node_0/properties/count') == 2
    assert get('/v2/id/qa-A-3.0.0')['name'] == 'A'
    for query in ['skip=-1', 'limit=-1', 'include_counts=invalid']:
        try:
            get('/v2/models/?' + query)
        except urllib.error.HTTPError as error:
            assert error.code == 422
        else:
            raise AssertionError('Expected validation failure: ' + query)
    print('PASS: real HTTP/Neo4j optional-count compatibility and pagination checks, 3 validation cases, and 7 legacy route checks.')


if __name__ == '__main__':
    main()
