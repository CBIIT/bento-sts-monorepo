"""Seed only the disposable Compose Neo4j created for Browse Models QA."""
import argparse
import subprocess
from pathlib import Path
from neo4j import GraphDatabase

COMPOSE = Path(__file__).with_name('compose.yaml')
URI = 'bolt://127.0.0.1:27687'
AUTH = ('neo4j', 'mdb-local-qa-only')
MARKER = 'browse-models-v1'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--include-empty", action="store_true", help="Add empty model C for a separate detail QA phase")
    group.add_argument("--pagination", action="store_true", help="Use 51 versions of A for a separate browser pagination phase")
    args = parser.parse_args()
    # Resolve only our Compose service; never accept an arbitrary connection URI.
    cid = subprocess.check_output(
        ['docker', 'compose', '-f', str(COMPOSE), 'ps', '-q', 'neo4j'], text=True
    ).strip()
    if not cid:
        raise SystemExit('Start the isolated QA Compose Neo4j first.')
    label = subprocess.check_output(
        ['docker', 'inspect', '--format', '{{ index .Config.Labels "org.mdb.purpose" }}', cid], text=True
    ).strip()
    if label != 'isolated-browse-models-qa':
        raise SystemExit('Refusing to seed an unowned database.')
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        driver.verify_connectivity()
        with driver.session() as session:
            foreign = session.run(
                'MATCH (n) WHERE n.qa_fixture IS NULL OR n.qa_fixture <> $marker RETURN count(n) AS n',
                marker=MARKER,
            ).single()['n']
            if foreign:
                raise SystemExit('Refusing to reset a database containing non-fixture records.')
            def seed(tx):
                tx.run('MATCH (n {qa_fixture:$marker}) DETACH DELETE n', marker=MARKER).consume()
                a_versions = [f'{i}.0.0' for i in range(1, 52)] if args.pagination else ['1.0.0', '2.0.0', '3.0.0']
                for name, versions in [('A', a_versions), ('B', ['1.0.0', '2.0.0'])]:
                    for version in versions:
                        prefix = f'qa-{name}-{version}'
                        tx.run('CREATE (:model {name:$name,handle:$name,version:$version,nanoid:$id,is_latest_version:$current,qa_fixture:$marker})',
                               name=name,version=version,id=prefix,current=version==versions[-1],marker=MARKER).consume()
                        for i in range(2):
                            tx.run('CREATE (:node {model:$name,handle:$handle,version:$version,nanoid:$id,qa_fixture:$marker})',
                                   name=name,handle=f'node_{i}',version=version,id=f'{prefix}-n{i}',marker=MARKER).consume()
                        for i in range(3):
                            tx.run('MATCH (n:node {nanoid:$node}) CREATE (p:property {model:$name,handle:$handle,version:$version,nanoid:$id,value_domain:"string",qa_fixture:$marker}) CREATE (n)-[:has_property]->(p)',
                                   node=f'{prefix}-n{i%2}',name=name,handle=f'property_{i}',version=version,id=f'{prefix}-p{i}',marker=MARKER).consume()
                        tx.run('MATCH (s:node {nanoid:$src}),(d:node {nanoid:$dst}) CREATE (r:relationship {model:$name,handle:"links_to",version:$version,nanoid:$id,qa_fixture:$marker}) CREATE (r)-[:has_src]->(s) CREATE (r)-[:has_dst]->(d)',
                               src=f'{prefix}-n0',dst=f'{prefix}-n1',name=name,version=version,id=f'{prefix}-r0',marker=MARKER).consume()
                if args.include_empty:
                    tx.run('CREATE (:model {name:"C",handle:"C",version:"1.0.0",nanoid:"qa-C-1.0.0",is_latest_version:true,qa_fixture:$marker})', marker=MARKER).consume()
            session.execute_write(seed)
    print(f'Seeded {51 if args.pagination else 3} versions of A and 2 versions of B; each card has 2 nodes, 3 properties, 1 relationship.')
    if args.include_empty:
        print('Added C1.0.0 with zero nodes, properties, and relationships for empty-detail QA.')


if __name__ == '__main__':
    main()
