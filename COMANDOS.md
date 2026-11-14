# Cómo actualizar la web cuando publicas un repo nuevo

## Automático (lo normal)

El workflow **Actualizar repos** (`.github/workflows/update-repos.yml`) lo hace solo:

- Se ejecuta **cada 2 horas**: regenera `data.js` con `scripts/fetch_repos.py`, y si algo cambió (repo nuevo, banner, icono, estrellas…) hace commit y push. El push publica la web en GitHub Pages.
- Si no quieres esperar, lánzalo a mano:
  ```bash
  gh workflow run update-repos.yml -R D4vRAM369/D4vRAM369.github.io
  ```
  o en GitHub: **Actions → Actualizar repos → Run workflow**.
- Ver cómo fue:
  ```bash
  gh run list -R D4vRAM369/D4vRAM369.github.io -L 3
  ```

> Como el bot hace commits en `main`, antes de tocar algo en local haz siempre `git pull root main` (paso 2).

## Manual (si el workflow falla o quieres probar un cambio del script)

### Pasos (copiar y pegar, uno a uno)

**1. Entrar en la carpeta de la web**
```bash
cd ~/2026/Proyectos/Noviembre/D4vRAM-hub
```

**2. Traer lo último de GitHub** (por si cambiaste algo desde otro sitio)
```bash
git pull root main
```

**3. Regenerar la lista de repos** (consulta GitHub; necesita `gh` con sesión iniciada)
```bash
python3 scripts/fetch_repos.py
```
Debe decir algo como `25 repos escritos en data.js`.

**4. Copiar a la subcarpeta** (la web también se sirve en `/d4vram369-hub/` y lleva su propia copia)
```bash
cp data.js d4vram369-hub/data.js
```

**5. Ver qué ha cambiado** (comprueba que aparece el repo nuevo)
```bash
git diff --stat
```

**6. Guardar y publicar**
```bash
git add data.js d4vram369-hub/data.js && git commit -m "Actualizar repos" && git push root master:main
```

**7. Esperar** de 1 a 5 minutos (a veces más si GitHub tiene cola) y recargar la web con `Ctrl+Shift+R`.

## Si algo no sale

| Síntoma | Qué pasa | Qué hacer |
|---|---|---|
| `gh: To get started with GitHub CLI, please run: gh auth login` | `gh` sin sesión | `gh auth login` |
| El repo nuevo no aparece en `data.js` | Es privado, es un fork, está archivado o está en `EXCLUDE` | Revisa en GitHub que sea público; mira `EXCLUDE` en `scripts/fetch_repos.py` |
| No quieres que salga un repo | — | Añádelo a `EXCLUDE` en `scripts/fetch_repos.py` y en `d4vram369-hub/scripts/fetch_repos.py`, y repite los pasos 3–6 |
| Icono que no te gusta | Se elige por palabras de la descripción (`ICON_RULES`) | Cambia la descripción del repo en GitHub (p. ej. que empiece por "Script…" → ⌨️) y repite los pasos 3–6 |
| La web no cambia tras el push | GitHub Pages aún está desplegando | `gh run list -R D4vRAM369/D4vRAM369.github.io -L 3` y esperar a `completed success` |
| `git push origin master` da *Repository not found* | El repo `d4vram369-hub` ya no existe en GitHub | Usa solo `git push root master:main` (el paso 6) |

## Probar en local antes de publicar

```bash
python3 -m http.server 8000
```
Abre http://localhost:8000 y para con `Ctrl+C`.
