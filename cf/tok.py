import sys, re
t = sys.stdin.read()
m = re.search(r"Bearer\s+([A-Za-z0-9_-]{20,})", t)
if m: print(m.group(1)); sys.exit()
L = [x for x in re.findall(r"[A-Za-z0-9_-]{30,}", t) if not x.startswith("http")]
print(max(L, key=len) if L else t.strip())
