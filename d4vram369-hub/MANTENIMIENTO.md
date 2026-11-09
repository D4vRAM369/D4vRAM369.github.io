# Mantenimiento de la web

Qué hacer según lo que cambie. Regla general: si no aparece en esta tabla, probablemente necesitas regenerar `data.js`.

| Cambio | ¿Se actualiza solo? | Qué hacer |
|---|---|---|
| Editas la descripción (About) de un repo ya listado | ✅ Sí, al cargar la página | Nada |
| Cambian las stars o la URL de homepage de un repo ya listado | ✅ Sí | Nada |
| Publicas un repo público nuevo | ❌ No | Regenerar `data.js` |
| Subes/cambias la imagen de social preview o la primera imagen del README | ❌ No | Regenerar `data.js` |
| Renombras un repo | ❌ No | Regenerar `data.js` |
| Cambia el lenguaje principal detectado por GitHub | ❌ No | Regenerar `data.js` |
| Pones un repo en privado o lo borras | ❌ No | Regenerar `data.js` |
| Quieres excluir un repo de la web | ❌ No | Añadirlo a `EXCLUDE` en el script y regenerar |

## Regenerar `data.js`

```bash
cd /home/defcon/2026/Proyectos/Noviembre/D4vRAM-hub
python3 scripts/fetch_repos.py
```

Esto vuelve a consultar GitHub (`gh` debe estar logueado) y reescribe `data.js` con:
nombre, descripción, URL, lenguaje, color, stars, fechas, icono y banner (imagen de social preview → primera imagen del README → icono).

## Publicar el cambio

La web vive en dos repos con el mismo contenido (dos dominios, mismo sitio):

```bash
git add -A
git commit -m "Actualizar repos"
git push origin master       # https://d4vram369.github.io/d4vram369-hub/
git push root master:main    # https://d4vram369.github.io/
```

GitHub Pages reconstruye solo tras el push (tarda ~30-60s).

## Excluir un repo

Edita `scripts/fetch_repos.py`:

```python
EXCLUDE = {"vercel-trophy", "nombre-del-repo-a-excluir"}
```

Luego regenera y publica como arriba.

## Cambiar banner a mano

Si el banner elegido automáticamente (social preview o imagen del README) no te convence,
edita directamente el campo `"image"` de ese repo en `data.js` — pero se sobreescribirá
la próxima vez que ejecutes `fetch_repos.py`. Para que sea permanente, mejor pon la imagen
que quieras como social preview del repo en GitHub (Settings → Social preview) y regenera.

## Probar en local antes de publicar

```bash
python3 -m http.server 8000
```
Abre `http://localhost:8000`.

## Qué se sincroniza solo y por qué

`app.js` hace una llamada a `https://api.github.com/users/D4vRAM369/repos` al cargar la
página y pisa `description`, `stars` y `homepage` de los repos que ya están en `data.js`,
comparando por nombre. No toca nombre, lenguaje, fechas, imagen ni la lista de repos en sí
— eso sigue viniendo del snapshot estático. Es una sola llamada sin token, dentro del
límite de 60/hora por visitante; si falla, la web se queda con el snapshot y no rompe nada.
