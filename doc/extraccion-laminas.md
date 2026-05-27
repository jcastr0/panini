# Extracción de láminas Panini del PDF → `public/laminas/`

Guía completa y autosuficiente para extraer las 994 láminas del álbum
**Mundial 2026** desde los PDFs en `doc/`, recortarlas con precisión y
ubicarlas en `public/laminas/<CODE>/<code><N>.jpg` para que la app las
renderice cuando JD pega un cromo.

> Si llegas a esto en un chat nuevo: este `.md` te dice TODO. Léelo entero,
> después abrí el PDF objetivo y empezá por un solo equipo para validar
> tu pipeline antes de procesar más.

---

## 1. Mapa mental — qué cromos existen, dónde viven, cómo se ven

### El seed manda

La fuente de verdad del catálogo es el seed SQL en
`supabase/migrations/0008_seed_group_a.sql` … `0021_seed_group_l.sql`
más los intro/historia/Coca-Cola (`0006`, `0022`, `0023`).

Cada cromo tiene **`code` único por álbum** y campos `name`, `team`,
`group_code`, `type` (`normal`|`shiny`|`special`|`legend`), `page`.

- **Equipos**: cada uno tiene 20 cromos → `XXX1` … `XXX20`. `XXX1` siempre
  es el escudo (`type='shiny'`), `XXX13` siempre es el **team photo**
  (`type='special'`). Los demás son jugadores `type='normal'`.
- **Apertura** (intro): codes `"00"`, `"1"`..`"8"` (numeric strings). Trofeo,
  logo FIFA, sedes, balón, póster.
- **Historia**: codes `"9"`..`"19"`. Cromos shiny de campeones pasados.
- **Coca-Cola**: codes `"CC1"`..`"CC14"`. Cromos sponsor "Premium Picks".

Total: **994 cromos** (12 grupos × 80 + 9 intro + 11 historia + 14 CC).

Antes de procesar un país, **mirá su seed para conocer el orden numérico
correcto**:

```bash
grep "'MEX" ~/Docker/paninijd/supabase/migrations/0008_seed_group_a.sql
```

El orden numérico del seed (MEX1, MEX2…) **NO coincide** con el orden
visual en el PDF. Por eso el mapeo es el paso crítico y manual.

### El wire genérico ya está hecho

En `src/app/(app)/album/_components/sticker-card.tsx` y
`src/app/u/[username]/_components/sticker-tile-readonly.tsx` hay un
helper `stickerImageFromCode(code, owned)` que detecta:

- `^[A-Z]{3}\d+$` → `/laminas/<CODE>/<code><N>.jpg` (equipos)
- `^CC\d+$` → `/cocacola/cc<N>.jpg`
- `^\d+$` → `/laminas/FWC/fwc<N>.jpg` (apertura/historia)

**Si dropeás los archivos con el nombre correcto, salen automáticamente.
No hace falta tocar código.** Si `<img>` falla (no existe el archivo),
hay `onError` que vuelve al placeholder con el nombre del jugador.

---

## 2. Herramientas y setup

### Python con PyMuPDF + Pillow (no requiere brew)

```bash
pip3 install --user pymupdf pillow
```

- **PyMuPDF (`fitz`)**: lee el PDF y rasteriza páginas o extrae imágenes
  embebidas. No necesita poppler ni `brew`.
- **Pillow (`PIL`)**: recorta, rota, comprime y exporta JPEG.
- **`sips`** (built-in macOS): para previews rápidos `sips -Z 1100 in.jpg --out out.jpg`.

### Por qué NO usamos `pdftoppm` / poppler

El Mac no tiene Homebrew configurado. PyMuPDF cubre todo lo que poppler
hace y más, sin dependencias nativas extras.

### Patrón opcional: extraer un PDF temporal cuando el original pesa mucho

No es el estándar — sólo se justifica cuando el PDF es grande (e.g.
álbum 101 páginas = 244 MB). Para PDFs menores trabajá directo sobre
el original, abrir el PDF grande para procesar 2 páginas es lento y
toca memoria innecesariamente. El patrón:

1. Extraer las páginas del país a un PDF temporal (`~3-5 MB`) en `/tmp/`.
2. Aplicar la pipeline al PDF chico.
3. Borrar el temporal cuando termina (los JPGs ya están en `public/laminas/`).

```python
import fitz
src = fitz.open('doc/álbum 101 paginas completo.pdf')
tmp = fitz.open()
tmp.insert_pdf(src, from_page=2, to_page=3)   # pages 3-4 (0-indexed)
tmp.save('/tmp/rsa-only.pdf', deflate=True)
tmp.close(); src.close()
# Ahora trabajás con /tmp/rsa-only.pdf (~3-5 MB) en vez del de 244 MB.
```

El PDF chico hereda calidad original (no re-render, son las páginas
extraídas), `Matrix(3,3)` da el mismo resultado pero mucho más rápido.

**Limpieza al terminar**:

```python
import os
os.remove('/tmp/rsa-only.pdf')
```

Funciona para cualquier PDF voluminoso, no solo el de 244 MB.

### Por qué NO usamos OCR (Tesseract)

Los nombres del jugador en cada cromo aparecen rotados 90° verticalmente
sobre el costado lateral del cromo. El OCR fracasa en muchos. **Es más
confiable usar visión multimodal (Claude reads thumbnails)** que setup
de OCR.

### Estructura de carpetas

```
public/laminas/
├── MEX/mex1.jpg ... mex20.jpg
├── RSA/rsa1.jpg ... rsa20.jpg
├── ... (48 países, 3 letras código FIFA)
├── FWC/fwc1.jpg ...           # Apertura/intro
└── (sin /historia/ ni /cocacola/ — Coca-Cola va en public/cocacola/)
```

El código de país es el **`paniniCode` del `src/lib/album-config.ts`**
(3 letras FIFA en mayúsculas: MEX, RSA, KOR, BIH, etc.).

---

## 3. PDFs disponibles (orden de prioridad)

| PDF en `doc/` | Tamaño | Cobertura | Calidad |
|---|---|---|---|
| `álbum 101 paginas completo.pdf` | 244 MB | 101 pages = TODOS los 994 cromos del álbum oficial | ⭐⭐⭐ alta, 1 sprite-sheet por página |
| `Figuritas Holográficas Mundial 2026_copia.pdf` | 37 MB | 42 escudos `XX1` holo (shiny) + 6 cromos apertura FWC | ⭐⭐⭐ versión oficial holográfica |
| `48 selecciones.pdf` | 85 MB | Casi todos los jugadores pero NO completo. Algunos países parciales (RSA solo 11/20). Sirve para rescatar cromos sueltos cuando el album 101 falla en alguna página | ⭐⭐ |
| `LÁMINAS COCA COLA.pdf` | 4.7 MB | Los 14 cromos CC en grid 4×4 (2 últimas celdas son panels decorativos) | ⭐⭐⭐ |

**Recomendación**: el **álbum 101 páginas** es la única fuente completa.
Procesalo página por página. Los otros PDFs sirven como cross-check o
para fallback si una página del 101 está corrupta/incompleta.

---

## 4. Estructura del álbum 101 páginas

### Orden por país (CONFIRMADO por el usuario)

Cada equipo ocupa **2 páginas consecutivas**. El orden sigue el seed:

```
Pages  1- 2  → MEX (Grupo A.1)
Pages  3- 4  → RSA (Grupo A.2)
Pages  5- 6  → KOR (Grupo A.3)
Pages  7- 8  → CZE (Grupo A.4)
Pages  9-10  → CAN (Grupo B.1)
Pages 11-12  → BIH (Grupo B.2)
Pages 13-14  → QAT (Grupo B.3)
Pages 15-16  → SUI (Grupo B.4)
... (12 grupos × 4 países × 2 pages = 96 pages para equipos)
Pages 97-101 → Apertura/Historia/Coca-Cola (5 pages especiales)
```

Helper Python:

```python
order = ['MEX','RSA','KOR','CZE','CAN','BIH','QAT','SUI',
         'BRA','MAR','HAI','SCO','USA','PAR','AUS','TUR',
         'GER','CUW','CIV','ECU','NED','JPN','SWE','TUN',
         'BEL','EGY','IRN','NZL','ESP','CPV','KSA','URU',
         'FRA','SEN','IRQ','NOR','ARG','ALG','AUT','JOR',
         'POR','COD','UZB','COL','ENG','CRO','GHA','PAN']

def pages_for(code: str) -> tuple[int, int]:
    """Devuelve (page_a_1indexed, page_b_1indexed) para un país."""
    i = order.index(code)
    return (2*i + 1, 2*i + 2)

pages_for('MEX')   # (1, 2)
pages_for('QAT')   # (13, 14)
pages_for('CRO')   # (91, 92)
```

### Layout DENTRO de cada página (atención al detalle)

El layout **NO es uniforme** entre equipos. Hay dos variantes principales:

#### Variante A (ej. RSA en P3): `Page A trae el escudo`

- **Page A (impar, P3, P5…)**: grid 4×4 (16 slots) **CON** escudo,
  team poster vertical rotado, portero y 13 jugadores.
- **Page B (par, P4, P6…)**: tira horizontal de 1 fila × 4 columnas =
  3 cromos individuales + 1 team photo horizontal (que ocupa 1 celda
  pero la imagen del team photo se ve rotada 90° dentro del cromo).

#### Variante B (ej. QAT en P13): `Page A solo jugadores`

- **Page A**: grid 4×4 con 16 jugadores. **Sin escudo, sin team photo.**
- **Page B**: tira horizontal con 4 elementos = 2 jugadores + escudo XX1
  + team photo XX13.

#### Cómo distinguir cuál variante usar

Mirá el render de la `Page A`:

- Si fila 1 columna 1 muestra un **escudo grande** (no una cara): variante A.
- Si fila 1 columna 1 muestra **una cara de jugador**: variante B → el
  escudo está en `Page B` (en una de las 4 celdas, generalmente col 3 o 4).

México (P1) y Sudáfrica (P3) son variante A. Qatar (P13) es variante B.
**Confirmá visualmente antes de recortar** — no asumas.

---

## 5. Pipeline de extracción (paso a paso, por equipo)

### Paso 5.1 — Render de la página completa

NO uses `page.get_images()` directo. Las páginas pueden tener varios
embeds (mask PNG + sprite JPEG + decoración) o un solo mega-sprite,
inconsistente. **Renderizar la página entera con `Matrix(3, 3)` es la
forma más robusta**.

```python
import fitz
from PIL import Image, ImageChops

doc = fitz.open('doc/álbum 101 paginas completo.pdf')
pg_idx = 2  # P3 = índice 2 (0-indexed)
p = doc.load_page(pg_idx)
pix = p.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
```

Resolution: `Matrix(3, 3)` da ~1836×2577 px para una página 612×859 pts,
suficiente para imagen final 385×511 después del recorte. Más zoom no
suma nitidez perceptible y aumenta peso.

### Paso 5.2 — Recortar márgenes blancos

El render incluye el margen de la hoja A4. Recortar el bbox no-blanco
con `ImageChops.difference`:

```python
bg = Image.new('RGB', img.size, (255, 255, 255))
bbox = ImageChops.difference(img, bg).getbbox()
content = img.crop(bbox) if bbox else img
```

Después de esto, `content.size` es solo el área con cromos (~1670×2570
para Page A, ~1670×550 para Page B).

### Paso 5.2b — Detectar BORDES REALES del grid (no asumir W/4 × H/4)

**Error común grave**: dividir `content` en celdas uniformes
`(W/4, H/4)` corta cromos por la mitad porque el grid tiene márgenes
internos. Hay que detectar los separadores blancos reales:

```python
import numpy as np
arr = np.asarray(content)
brightness = arr.mean(axis=2)
row_min = brightness.min(axis=1)  # min de brillo por fila

# Separadores horizontales: filas con brillo casi-blanco promedio
inner_row_avg = brightness.mean(axis=1)
sep_threshold = 245
y_seps = np.where(inner_row_avg > sep_threshold)[0]
# Agrupar runs consecutivos y tomar el punto medio de cada run interno
# (descartar el primer/último run que son los márgenes de la página).
```

Para el álbum 101 (Page A típica de 1836×2577 px), los bordes reales son:
- Filas: `y = 183, 740, 1302, 1865, 2425` (4 filas de ~557 px)
- Cols: `x = 80, 498, 917, 1335, 1754` (4 cols de ~417 px)

Los cromos miden ~417×557 (proporción 3:4 ≈ 0.74 ✓), NO 459×644 que
sería `W/4 × H/4`. Asumir uniforme corta el cromo y deja ver el margen
inferior + el header del siguiente cromo.

**Regla**: SIEMPRE detectar bordes reales con análisis de brillo antes
de recortar. Hardcodear coordenadas SOLO después de verificar
visualmente que un cromo queda completo.

### Paso 5.3 — Generar grid etiquetado para identificación

Antes de recortar a producción, **siempre** genero un grid 4×4 (Page A)
o 1×4 (Page B) con etiquetas `(row,col)` para confirmar visualmente qué
hay en cada celda.

```python
from PIL import ImageDraw, ImageFont
def make_grid_overview(content, rows, cols, out_path):
    CW, CH = content.size
    cw, rh = CW/cols, CH/rows
    sw, sh = 280, 380
    canvas = Image.new('RGB', (cols*286, rows*410), (240,240,245))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18)
    for r in range(rows):
        for c in range(cols):
            crop = content.crop((int(c*cw), int(r*rh), int((c+1)*cw), int((r+1)*rh)))
            crop.thumbnail((sw, sh))
            x, y = c*286, r*410
            draw.text((x+4, y+2), f'({r+1},{c+1})', fill=(20,20,30), font=font)
            canvas.paste(crop, (x, y+26))
    canvas.save(out_path, 'JPEG', quality=85)

make_grid_overview(content, 4, 4, '/tmp/rsa-grid.jpg')   # Page A
```

**Abrí ese JPG y leelo con visión multimodal**. Anotá qué jugador hay
en cada `(r,c)`.

### Paso 5.4 — Mapear posición → código del seed

Compará la lista de jugadores del grid con el seed:

```bash
grep "'RSA" supabase/migrations/0008_seed_group_a.sql
```

Construí el mapping `(r,c) → RSA#` a mano. Ejemplo para Sudáfrica P3
(hipotético, hay que verificar):

```python
rsa_p3_map = {
    (1,1): 1,    # Escudo
    (1,2): None, # Team poster (rotated, usaremos el horizontal de P4)
    (1,3): 2,    # Portero Ronwen Williams
    (1,4): 3,    # Sipho Chaine
    (2,1): 4,    # Aubrey Modiba
    ...
}
```

Si una celda muestra un jugador que **no está en el seed**, es bleed-over
de otro país. Descártalo o asignalo a su país correcto (sucede en pages
mezcla como P5 y P21).

### Paso 5.5 — Recortar y exportar

```python
import os
dst = f'/Users/jhonatan/Docker/paninijd/public/laminas/RSA'
os.makedirs(dst, exist_ok=True)

CW, CH = content.size
cw, rh = CW/4, CH/4
for (r, c), n in rsa_p3_map.items():
    if n is None: continue
    crop = content.crop((int((c-1)*cw), int((r-1)*rh), int(c*cw), int(r*rh)))
    if crop.mode != 'RGB': crop = crop.convert('RGB')
    crop.save(f'{dst}/rsa{n}.jpg', 'JPEG', quality=85, optimize=True, progressive=True)
```

**Parámetros JPEG críticos**:

- `quality=85`: balance perfecto (~40-60 KB por cromo). `quality=90`
  triplica el peso sin mejora visible.
- `optimize=True`: re-procesa Huffman tables, ahorra ~10%.
- `progressive=True`: el cromo se ve progresivamente en mobile cuando
  carga (mejor UX que aparición abrupta).

Tamaño objetivo por cromo: **30-60 KB**. Si pasa de 80 KB es exceso.

### Paso 5.6 — Team photo (XX13) en Page B

El team photo en page B suele estar **rotado 90° antihorario** dentro
de su celda (la cinta lateral "WE ARE [COUNTRY]" queda vertical). Hay
que rotarlo de vuelta 90° en sentido horario:

```python
team = content.crop(team_bbox)  # bbox de la celda team photo en page B
team = team.rotate(-90, expand=True)  # -90 = sentido horario, expand=True ajusta tamaño
team.save(f'{dst}/xxx13.jpg', 'JPEG', quality=85, optimize=True, progressive=True)
```

Después de rotar queda horizontal (~700×500) con "WE ARE COUNTRY" abajo
y los 11+ jugadores en formación arriba. Si sale al revés (head-down),
usar `rotate(90)` (positivo).

---

## 6. Validación y cross-check

Después de cada equipo, **verificá visualmente** que cada cromo
extraído coincide con su `XX#` esperado.

```python
"""Composite de los 20 cromos de un país para validar."""
from PIL import Image, ImageDraw, ImageFont
import os
code = 'RSA'
dst = f'/Users/jhonatan/Docker/paninijd/public/laminas/{code}'
files = sorted([f for f in os.listdir(dst) if f.endswith('.jpg')],
               key=lambda f: int(f.replace(code.lower(),'').replace('.jpg','')))
cols, rows = 5, 4
sw, sh = 200, 270
canvas = Image.new('RGB', (cols*206, rows*298), (240,240,245))
draw = ImageDraw.Draw(canvas)
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 14)
for i, fn in enumerate(files):
    img = Image.open(f'{dst}/{fn}')
    r, c = divmod(i, cols)
    draw.text((c*206+4, r*298+2), fn.replace('.jpg',''), fill=(20,20,30), font=font)
    img.thumbnail((sw, sh))
    canvas.paste(img, (c*206, r*298+22))
canvas.save(f'/tmp/{code}-validacion.jpg', 'JPEG', quality=85)
```

Comparar con el seed:

```bash
grep "'RSA" supabase/migrations/0008_seed_group_a.sql
```

Si Ronwen Williams (`RSA2` en seed) aparece como `rsa2.jpg`, ✓. Si
aparece como `rsa3.jpg`, hay que renombrar.

---

## 7. Errores comunes (y cómo evitarlos)

### ❌ Asumir que slot (1,1) siempre es escudo

**Falso para muchos equipos**. Confirmá variante A vs B antes de recortar.

### ❌ Usar `page.get_images()` para extraer

Funciona en algunos PDFs (Coca-Cola), pero falla en otros (álbum 101
fragmenta páginas en múltiples imágenes). **Renderizá la página entera
y recortá**.

### ❌ Recortar a partir de coordenadas hardcodeadas

Cada página puede tener bbox de contenido distinto. **Usá
`ImageChops.difference` para encontrar el bbox no-blanco antes de
recortar el grid**.

### ❌ Recortar el team photo sin rotar

El sticker queda rotado 90° y se ve cabeza-abajo. Siempre `rotate(-90,
expand=True)` después de recortar la celda del team photo en page B.

### ❌ Mapear por orden alfabético del jugador

El PDF tiene un orden visual específico (probablemente por posición en
cancha). Construí el mapping celda a celda manualmente, no algorítmicamente.

### ❌ Procesar 50 equipos en bulk sin validar

Procesá **un equipo, validá visualmente, ajustá**. Después podés
extender el script a más. Si arrancás bulk y todo sale corrido, vas a
limpiar 950 archivos a mano.

### ❌ Calidad JPEG demasiado alta

`quality=95` da archivos 150+ KB por cromo. Multiplicá por 994 cromos y
son **150 MB en el repo**. `quality=85` produce 40-60 KB con calidad
indistinguible. **Si pesa mucho, bajá a quality=80** sin miedo.

---

## 8. Estado actual de la extracción (snapshot)

A la fecha del último commit:

- **9 países completos (20/20)**: 🇲🇽 MEX · 🇧🇷 BRA · 🇪🇨 ECU · 🇳🇱 NED ·
  🇪🇸 ESP · 🇫🇷 FRA · 🇦🇷 ARG · 🇵🇹 POR · 🇨🇴 COL
- **Resto (39 países)**: entre 10/20 y 19/20, total ~782 cromos sobre 960
  posibles de equipos.
- **6 cromos de apertura** en `public/laminas/FWC/` (trofeo, logo,
  balón, mascotas).
- **14 cromos Coca-Cola** completos en `public/cocacola/`.

Para continuar: el PDF **álbum 101 páginas completo** tiene TODO, solo
hay que procesar país por país siguiendo este doc.

---

## 9. Script base reutilizable

Guardalo en `test/extract-country.py` (ya hay gitignore para `test/`):

```python
"""
Uso: python3 test/extract-country.py RSA
Procesa páginas A y B de un país, genera grid etiquetado y deja todo
listo para que ajustes el mapping y exportes.

Después de correr, abrí /tmp/<code>-pageA-grid.jpg y
/tmp/<code>-pageB-grid.jpg, identificá cada celda, y editá el
mapping XX# abajo. Re-corré para exportar definitivo.
"""
import sys, os, fitz
from PIL import Image, ImageChops, ImageDraw, ImageFont

PDF = '/Users/jhonatan/Docker/paninijd/doc/álbum 101 paginas completo.pdf'
ORDER = ['MEX','RSA','KOR','CZE','CAN','BIH','QAT','SUI',
         'BRA','MAR','HAI','SCO','USA','PAR','AUS','TUR',
         'GER','CUW','CIV','ECU','NED','JPN','SWE','TUN',
         'BEL','EGY','IRN','NZL','ESP','CPV','KSA','URU',
         'FRA','SEN','IRQ','NOR','ARG','ALG','AUT','JOR',
         'POR','COD','UZB','COL','ENG','CRO','GHA','PAN']

code = sys.argv[1].upper()
i = ORDER.index(code)
pages = (2*i, 2*i + 1)  # 0-indexed page indices

doc = fitz.open(PDF)
os.makedirs(f'/tmp/{code.lower()}-extract', exist_ok=True)

def render_and_overview(pg_idx, label, cols, rows):
    p = doc.load_page(pg_idx)
    pix = p.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    bbox = ImageChops.difference(img, Image.new('RGB', img.size, (255,255,255))).getbbox()
    content = img.crop(bbox) if bbox else img
    content.save(f'/tmp/{code.lower()}-extract/{label}.jpg', 'JPEG', quality=90)

    CW, CH = content.size
    cw, rh = CW/cols, CH/rows
    sw, sh = 280, 380
    canvas = Image.new('RGB', (cols*286, rows*410), (240,240,245))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18)
    for r in range(rows):
        for c in range(cols):
            crop = content.crop((int(c*cw), int(r*rh), int((c+1)*cw), int((r+1)*rh)))
            crop.thumbnail((sw, sh))
            x, y = c*286, r*410
            draw.text((x+4, y+2), f'({r+1},{c+1})', fill=(20,20,30), font=font)
            canvas.paste(crop, (x, y+26))
    canvas.save(f'/tmp/{code.lower()}-extract/{label}-grid.jpg', 'JPEG', quality=82)
    print(f'{label}: {content.size}, grid {cols}x{rows} → /tmp/{code.lower()}-extract/{label}-grid.jpg')
    return content

content_a = render_and_overview(pages[0], 'pageA', 4, 4)
content_b = render_and_overview(pages[1], 'pageB', 4, 1)

print('\nAhora abrí los grid JPG, identificá cada celda, y editá el mapping abajo.')
print('Luego comentá las llamadas a `render_and_overview` y descomenta el bloque de export.')
```

---

## 10. Flujo recomendado por equipo (resumen ejecutivo)

1. `python3 test/extract-country.py RSA` → genera grids en `/tmp/rsa-extract/`.
2. Mirá `pageA-grid.jpg` y `pageB-grid.jpg`. Notá qué cromo hay en cada `(r,c)`.
3. `grep "'RSA" supabase/migrations/0008_seed_group_a.sql` → lista de los 20 cromos esperados.
4. Construí el mapping `(r,c) → XX#` a mano en un dict Python.
5. Corré el bloque de export → 20 archivos `rsa1.jpg` … `rsa20.jpg`.
6. Generá composite de validación con los 20, mirá que coincida con el seed.
7. Si algo no cuadra, ajustá mapping y re-corré (es idempotente).
8. `git add public/laminas/RSA/` → commit con mensaje claro → push.
9. Pasá al siguiente país.

**Tiempo estimado por país**: 5-10 minutos si el layout es estándar,
15-20 si tiene bleed-overs o variante B con escudo en page B.

---

## 11. Decisiones de diseño tomadas

- **Sprite sheets se renderizan, no se extraen**: más uniforme entre páginas.
- **Naming en lowercase**: `mex1.jpg` no `MEX1.jpg`. iOS/Linux case-sensitive.
- **Sin metadata Exif**: `optimize=True` la quita, pesa menos.
- **Wire detección automática**: regex en `stickerImageFromCode`, no hace
  falta tabla de mapping en código (el filesystem es la tabla).
- **`/laminas/FWC/`** para apertura: códigos numéricos `"1"`..`"19"` van
  ahí, evitando colisión con códigos de equipo.
- **Coca-Cola en `/cocacola/`** (no `/laminas/CC/`) por compatibilidad
  histórica con la primera extracción que hicimos.
