#!/usr/bin/env python3
"""Regenera data.js con el snapshot de repos públicos de GitHub.
Uso: python3 scripts/fetch_repos.py
Requiere `gh` autenticado. ponytail: snapshot estático, no fetch en vivo
(evita rate-limit/latencia en la web) — re-ejecutar cuando publiques algo nuevo.
"""
import base64
import json
import re
import subprocess
import sys

USER = "D4vRAM369"
EXCLUDE = {"vercel-trophy"}

LANG_COLORS = {
    "Python": "#3572A5", "Kotlin": "#A97BFF", "TypeScript": "#3178C6",
    "JavaScript": "#F1E05A", "Rust": "#DEA584", "Dart": "#00B4AB",
    "Svelte": "#FF3E00", "HTML": "#E34C26", "Go": "#00ADD8",
}
DEFAULT_COLOR = "#8b949e"

ICON_RULES = [
    (r"encrypt|cifr|privacy|privaci|pin|biometr", "🔒"),
    (r"\bAI\b|skill|LLM|agent|profesor|teach", "🤖"),
    (r"android|kotlin|APK", "📱"),
    (r"desktop|electron|svelte|tauri", "🖥️"),
    (r"bot de|telegram|bot\b", "💬"),
    (r"CLI|userscript|script", "⌨️"),
    (r"vault|archive|bóveda|backup", "🗄️"),
    (r"LSPosed|module|root", "🔧"),
]
DEFAULT_ICON = "📦"


def pick_icon(name: str, desc: str) -> str:
    text = f"{name} {desc}"
    for pattern, icon in ICON_RULES:
        if re.search(pattern, text, re.IGNORECASE):
            return icon
    return DEFAULT_ICON


BADGE_HOSTS = (
    "shields.io", "img.shields.io", "visitorbadge.io", "visitor-badge",
    "readme-typing-svg", "github-readme-stats", "counter.", "badge.fury.io",
    "readme-stats.vercel.app", "deepwiki.com", "/badge.svg", "badge?",
)

IMG_MD_RE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)")
IMG_HTML_RE = re.compile(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', re.IGNORECASE)


def is_badge(url: str) -> bool:
    return any(h in url.lower() for h in BADGE_HOSTS)


def resolve_relative(url: str, repo: str, branch: str) -> str:
    if url.startswith("http://") or url.startswith("https://"):
        return url
    path = url.lstrip("./")
    return f"https://raw.githubusercontent.com/{USER}/{repo}/{branch}/{path}"


def readme_banner(repo: str, branch: str) -> str:
    result = subprocess.run(
        ["gh", "api", f"repos/{USER}/{repo}/readme"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return ""
    try:
        b64 = json.loads(result.stdout)["content"]
    except (KeyError, json.JSONDecodeError):
        return ""
    text = base64.b64decode(b64).decode("utf-8", errors="ignore")

    matches = sorted(
        [(m.start(), m.group(1)) for m in IMG_MD_RE.finditer(text)]
        + [(m.start(), m.group(1)) for m in IMG_HTML_RE.finditer(text)]
    )
    for _, url in matches:
        if not is_badge(url):
            return resolve_relative(url, repo, branch)
    return ""


def fetch_social_previews() -> dict:
    """True para repos con imagen de social preview subida a mano en GitHub."""
    query = """
    query {
      user(login: "%s") {
        repositories(first: 100, privacy: PUBLIC, isFork: false) {
          nodes { name usesCustomOpenGraphImage openGraphImageUrl }
        }
      }
    }
    """ % USER
    raw = subprocess.run(
        ["gh", "api", "graphql", "-f", f"query={query}"],
        capture_output=True, text=True, check=True,
    ).stdout
    nodes = json.loads(raw)["data"]["user"]["repositories"]["nodes"]
    return {n["name"]: n["openGraphImageUrl"] for n in nodes if n["usesCustomOpenGraphImage"]}


def main() -> None:
    raw = subprocess.run(
        ["gh", "repo", "list", USER, "--no-archived", "--source", "-L", "200",
         "--json", "name,description,url,primaryLanguage,stargazerCount,"
                   "updatedAt,createdAt,isPrivate,homepageUrl,isFork,defaultBranchRef"],
        capture_output=True, text=True, check=True,
    ).stdout
    repos = json.loads(raw)
    social_previews = fetch_social_previews()

    public = [
        r for r in repos
        if not r["isPrivate"] and not r["isFork"] and r["name"] != USER and r["name"] not in EXCLUDE
    ]
    public.sort(key=lambda r: r["createdAt"])

    out = []
    for r in public:
        lang = (r["primaryLanguage"] or {}).get("name")
        branch = (r["defaultBranchRef"] or {}).get("name", "main")
        image = social_previews.get(r["name"], "") or readme_banner(r["name"], branch)
        out.append({
            "name": r["name"],
            "description": r["description"] or "",
            "url": r["url"],
            "homepage": r["homepageUrl"] or "",
            "language": lang,
            "color": LANG_COLORS.get(lang, DEFAULT_COLOR),
            "stars": r["stargazerCount"],
            "created": r["createdAt"][:10],
            "updated": r["updatedAt"][:10],
            "icon": pick_icon(r["name"], r["description"] or ""),
            "image": image,
        })

    with open("data.js", "w", encoding="utf-8") as f:
        f.write("// Generado por scripts/fetch_repos.py — no editar a mano.\n")
        f.write("const REPOS = ")
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"{len(out)} repos escritos en data.js")


if __name__ == "__main__":
    main()
