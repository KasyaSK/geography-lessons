from pathlib import Path
import subprocess

# The previous commit contains the one-time patch payload in the workflow file.
raw = subprocess.check_output(
    ['git', 'show', 'HEAD^:.github/workflows/practicalize-professions.yml'],
    text=True,
    encoding='utf-8'
)
start = "python - <<'PY'\n"
end = "\n          PY\n"
if start not in raw or end not in raw:
    raise SystemExit('Patch payload not found in previous workflow revision')
code = raw.split(start, 1)[1].split(end, 1)[0]
# YAML had ten spaces of block indentation on Python code, while the contents of
# Python triple-quoted HTML strings intentionally started at column 0.
lines = []
for line in code.splitlines():
    if line.startswith('          '):
        line = line[10:]
    lines.append(line)
code = '\n'.join(lines) + '\n'
exec(compile(code, '<practicalize-professions>', 'exec'), {'__name__': '__main__'})
