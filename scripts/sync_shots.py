#!/usr/bin/env python3
"""Apply pending shot-log changes to the GitHub mirror, then commit and push.

Claude writes /home/claude/pending_shots.json, then always runs the same command:
    python3 /home/claude/coffee/scripts/sync_shots.py
so one "always allow" approval covers every future sync.

pending_shots.json: {"add": [shot, ...], "update": {"<n>": {field: value}}, "beans": {"<id>": {"left": 0, "status": "out"}}, "message": "..."}
"""
import csv, json, os, re, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PENDING = '/home/claude/pending_shots.json'


def git(*a, check=True):
    r = subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True)
    if check and r.returncode:
        sys.exit(f'git {" ".join(a)} failed: {r.stderr.strip()}')
    return r


def main():
    if not os.path.exists(PENDING):
        sys.exit('nothing pending')
    p = json.load(open(PENDING))
    git('pull', '-q', '--rebase', '--autostash', 'origin', 'main')

    jp = os.path.join(REPO, 'data/shots.json')
    raw = open(jp).read()
    shots = json.loads(raw)
    have = {s['n'] for s in shots}
    for s in p.get('add', []):
        if s['n'] not in have:
            shots.append(s)
    for n, fields in p.get('update', {}).items():
        for s in shots:
            if s['n'] == int(n):
                s.update(fields)
    shots.sort(key=lambda s: s['n'])
    open(jp, 'w').write(json.dumps(shots, indent=2, ensure_ascii=False) + ('\n' if raw.endswith('\n') else ''))

    sp = os.path.join(REPO, 'data/shots.js')
    js = open(sp).read()
    a = js.index('window.SHOTS = ') + len('window.SHOTS = ')
    b = js.index('window.BEANS')
    seg = js[a:b]
    end = seg.rindex(']') + 1
    open(sp, 'w').write(js[:a] + json.dumps(shots, sort_keys=True, ensure_ascii=seg.isascii()) + seg[end:] + js[b:])

    cp = os.path.join(REPO, 'data/shots.csv')
    hdr = open(cp, newline='').readline().strip().split(',')
    with open(cp, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(hdr)
        for s in shots:
            w.writerow(['' if s.get(k) is None else s.get(k, '') for k in hdr])

    dp = os.path.join(REPO, 'menu/data.js')
    d = open(dp).read()
    for bid, f in p.get('beans', {}).items():
        i = d.index(f'id: "{bid}"')
        j = d.index('\n    }', i)
        block = d[i:j]
        if 'left' in f:
            block = re.sub(r'left: -?\d+', f'left: {int(f["left"])}', block, count=1)
        if 'status' in f:
            block = re.sub(r'status: "[a-z]+"', f'status: "{f["status"]}"', block, count=1)
        d = d[:i] + block + d[j:]
    open(dp, 'w').write(d)

    git('add', 'data', 'menu/data.js', 'scripts')
    if not git('diff', '--cached', '--quiet', check=False).returncode:
        print('no changes')
    else:
        msg = p.get('message', 'Update shot log') + (
            '\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
            '\nClaude-Session: https://claude.ai/code/session_01GG1aF5qBzxrNKRopA54wvz')
        git('-c', 'user.name=Foreunder', '-c', 'user.email=noreply@anthropic.com', 'commit', '-q', '-m', msg)
        git('push', '-q', 'origin', 'HEAD:main')
        print('pushed', git('rev-parse', '--short', 'HEAD').stdout.strip())
    os.remove(PENDING)


if __name__ == '__main__':
    main()
