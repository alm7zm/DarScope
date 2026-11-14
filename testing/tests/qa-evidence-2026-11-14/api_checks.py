"""Black-box checks of the built DarScope jar on disposable local databases."""
import json
import os
import socket
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
JAR = next((ROOT / 'project/backend/target').glob('darscope-*.jar'))
JAVA = Path(subprocess.check_output(['/usr/libexec/java_home', '-v', '21'], text=True).strip()) / 'bin/java'
RESULTS = []
PAYMENT = {
    'city': 'Riyadh', 'district': 'حي الاختبار', 'front': None, 'propertyType': 'Villa',
    'sizeSqm': 350, 'propertyAgeYears': 2, 'bedrooms': 4, 'bathrooms': 3, 'livingRooms': 2,
    'yearlyRentSar': 120000, 'description': 'Synthetic QA property', 'status': 'Occupied',
    'tenantName': 'Test Tenant', 'leaseStart': '2026-11-01', 'leaseEnd': '2027-11-01',
    'kitchen': True, 'garage': False, 'driverRoom': False, 'maidRoom': False,
    'furnished': False, 'ac': True, 'roof': False, 'pool': False, 'frontyard': False,
    'basement': False, 'stairs': False, 'elevator': False, 'fireplace': False,
}

def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]

def request(port, path='', verb='GET', data=None):
    url = f'http://127.0.0.1:{port}/api/v1/properties{path}'
    raw = json.dumps(data).encode() if data is not None else None
    try:
        response = urlopen(Request(url, data=raw, method=verb,
                                   headers={'Content-Type': 'application/json'}), timeout=7)
    except HTTPError as error:
        response = error
    with response:
        body = response.read()
        return response.code, json.loads(body) if body else None, response.headers

def checked(port, path='', verb='GET', data=None, status=200):
    code, body, headers = request(port, path, verb, data)
    assert code == status, f'{verb} {path}: expected HTTP {status}, got {code}: {body}'
    return body, headers

def outcome(name, callback):
    try:
        callback()
    except Exception as error:
        RESULTS.append({'check': name, 'status': 'FAIL', 'detail': str(error)})
    else:
        RESULTS.append({'check': name, 'status': 'PASS'})
    print(RESULTS[-1], flush=True)

@contextmanager
def server(profile, tag, work=None):
    work = work or ROOT / ('runtime-' + profile)
    work.mkdir(exist_ok=True)
    port = free_port()
    args = [str(JAVA), '-Djava.io.tmpdir=' + str(ROOT / 'tmp'), '-jar', str(JAR),
            '--server.address=127.0.0.1', f'--server.port={port}']
    child_env = {k: v for k, v in os.environ.items() if not k.startswith(('DB_', 'SPRING_'))}
    if profile in {'local', 'supabase'}:
        args.append('--spring.profiles.active=' + profile)
    if profile == 'supabase':
        child_env.update(DB_URL=f'jdbc:postgresql://127.0.0.1:{(ROOT / "pg-port").read_text().strip()}/postgres',
                         DB_USER='postgres', DB_PASSWORD='')
    with (ROOT / 'evidence' / f'server-{tag}.log').open('w') as log:
        proc = subprocess.Popen(args, cwd=work, env=child_env, stdout=log, stderr=subprocess.STDOUT)
        try:
            for _ in range(200):
                if proc.poll() is not None:
                    raise AssertionError(f'Spring exited ({proc.returncode}). See server-{tag}.log.')
                try:
                    if request(port, '?size=1')[0] == 200:
                        break
                except (URLError, OSError):
                    pass
                time.sleep(0.1)
            else:
                raise AssertionError(f'Spring readiness failed. See server-{tag}.log.')
            yield port
        finally:
            if proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(timeout=12)
                except subprocess.TimeoutExpired:
                    proc.kill()
                    proc.wait()

def pagination(port):
    a = checked(port, '?page=0&size=5')[0]
    b = checked(port, '?page=1&size=5')[0]
    assert [x['id'] for x in a['content']] == [8, 7, 6, 5, 4]
    assert [x['id'] for x in b['content']] == [3, 2, 1]
    assert a['page'] == {'size': 5, 'number': 0, 'totalElements': 8, 'totalPages': 2}
    assert checked(port, '?page=2&size=5')[0]['content'] == []
    assert checked(port, '?page=-1&size=10000')[0]['page']['size'] == 1000
    assert checked(port, '?page=-1&size=0')[0]['page']['size'] == 1
    checked(port, '?page=oops', status=400)
    assert checked(port, '/2')[0]['district'] == 'النرجس'
    checked(port, '/9999999', status=404)

def lifecycle(port):
    created, headers = checked(port, verb='POST', data={**PAYMENT, 'id': 1,
        'createdAt': '2000-01-01T00:00:00Z', 'updatedAt': '2000-01-01T00:00:00Z'}, status=201)
    ident = created['id']
    assert ident > 8
    assert headers['Location'] == f'/api/v1/properties/{ident}'
    assert created['createdAt'] != '2000-01-01T00:00:00Z'
    assert created['createdAt'] == created['updatedAt']
    assert checked(port, f'/{ident}')[0] == created
    assert created['district'] == PAYMENT['district'] and created['leaseStart'] == PAYMENT['leaseStart']
    assert created['kitchen'] is True and created['garage'] is False and created['front'] is None
    time.sleep(0.02)
    updated = checked(port, f'/{ident}', 'PUT', {**PAYMENT, 'id': 2, 'status': 'Vacant'})[0]
    assert updated['id'] == ident and updated['createdAt'] == created['createdAt']
    assert updated['updatedAt'] != created['updatedAt']
    assert all(updated[key] is None for key in ('tenantName', 'leaseStart', 'leaseEnd'))
    checked(port, f'/{ident}', 'DELETE', status=204)
    checked(port, f'/{ident}', status=404)
    checked(port, f'/{ident}', 'DELETE', status=404)
    checked(port, f'/{ident}', 'PUT', PAYMENT, status=404)
    next_id = checked(port, verb='POST', data=PAYMENT, status=201)[0]['id']
    assert next_id > ident
    checked(port, f'/{next_id}', 'DELETE', status=204)

def validations(port):
    for changes, field, message in [
        ({'yearlyRentSar': 500}, 'yearlyRentSar', 'Yearly rent must be between 1,000 and 10,000,000 SAR.'),
        ({'tenantName': None}, 'tenantName', "Enter the tenant's name for an occupied property."),
        ({'leaseEnd': '2026-11-01'}, 'leaseEnd', 'Lease end must be after lease start.'),
        ({'city': 'Unsupported'}, 'city', 'Choose a city.'),
    ]:
        body = checked(port, verb='POST', data={**PAYMENT, **changes}, status=400)[0]
        assert body['errors'][field] == message
    checked(port, verb='POST', data='not a JSON property', status=400)
    assert checked(port)[0]['page']['totalElements'] == 8

def reject_fractional(port):
    code, body, _ = request(port, verb='POST', data={**PAYMENT, 'yearlyRentSar': 120000.75})
    if code == 201:
        checked(port, f"/{body['id']}", 'DELETE', status=204)
        raise AssertionError(f"Expected HTTP 400 for a non-integer rent. HTTP 201 saved {body['yearlyRentSar']} SAR.")
    assert code == 400, f'Unexpected response {code}'

def concurrent(port):
    def create(index):
        row = checked(port, verb='POST', data={**PAYMENT, 'district': f'QA Batch {index}'}, status=201)[0]
        return row['id']
    with ThreadPoolExecutor(8) as pool:
        ids = list(pool.map(create, range(24)))
    assert len(set(ids)) == 24
    records = []
    for page in range(5):
        records.extend(checked(port, f'?page={page}&size=5')[0]['content'])
    assert {r['id'] for r in records[:24]} == set(ids)
    assert records[:24] == sorted(records[:24], key=lambda r: (r['updatedAt'], r['id']), reverse=True)
    for ident in ids:
        checked(port, f'/{ident}', 'DELETE', status=204)
    assert checked(port)[0]['page']['totalElements'] == 8

def profile_checks(profile):
    with server(profile, profile + '-start') as port:
        outcome(profile + ' seeded pages, paging limits, Arabic, unknown ID', lambda: pagination(port))
        outcome(profile + ' CRUD, dates, tenant clearing, generated IDs', lambda: lifecycle(port))
        outcome(profile + ' validation and malformed input', lambda: validations(port))
        if profile == 'default':
            outcome('Whole-number API validation for fractional rent', lambda: reject_fractional(port))
            outcome('24 concurrent writes with stable readback pagination', lambda: concurrent(port))
        survivor = checked(port, verb='POST', data=PAYMENT, status=201)[0]['id']
        checked(port, '/8', 'DELETE', status=204)
    with server(profile, profile + '-restart') as port:
        if profile == 'default':
            def reset():
                pagination(port)
                checked(port, f'/{survivor}', status=404)
            outcome('Memory H2 resets to the eight seeds on restart', reset)
        else:
            def persist():
                assert checked(port, f'/{survivor}')[0]['district'] == PAYMENT['district']
                checked(port, '/8', status=404)
                assert checked(port)[0]['page']['totalElements'] == 8
            outcome(profile + ' persists edits and deletions without duplicate seeds', persist)
            first_ids = [row['id'] for row in checked(port)[0]['content']]
            for ident in first_ids:
                checked(port, f'/{ident}', 'DELETE', status=204)
            assert checked(port)[0]['page']['totalElements'] == 0
    if profile != 'default':
        with server(profile, profile + '-empty-restart') as port:
            def empty_restart():
                rows = checked(port)[0]['content']
                assert not rows, f'Expected the empty portfolio to stay empty. Restart inserted {len(rows)} demo rows.'
            outcome(profile + ' keeps a deliberately emptied portfolio empty on restart', empty_restart)

if __name__ == '__main__':
    for profile in ['default', 'local', 'supabase']:
        try:
            profile_checks(profile)
        except Exception as error:
            RESULTS.append({'check': f'{profile} test environment', 'status': 'BLOCKED', 'detail': str(error)})
            print(RESULTS[-1], flush=True)
    (ROOT / 'evidence/api-checks.json').write_text(json.dumps(RESULTS, indent=2) + '\n')
