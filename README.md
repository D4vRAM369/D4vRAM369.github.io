# portfolio

Web estática con mis proyectos públicos de GitHub, en timeline. Vista en vivo: https://d4vram369.github.io/portfolio/

## Stack
HTML/CSS/JS plano, sin build. `data.js` es un snapshot estático generado con `scripts/fetch_repos.py` (requiere `gh` autenticado).

## Actualizar los repos mostrados
```bash
python3 scripts/fetch_repos.py
```
Regenera `data.js` con tus repos públicos actuales y haz commit.

## Local
```bash
python3 -m http.server 8000
```
