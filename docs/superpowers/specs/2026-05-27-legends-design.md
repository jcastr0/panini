# Spec — Legends (FWC2026)

**Fecha:** 2026-05-27
**Estado:** Diseño completo — pendiente review final del usuario antes de pasar a writing-plans
**Autor:** JD + Claude (brainstorming skill)

## Contexto

Páginas 100 y 101 del álbum Panini Mundial 2026 contienen ~27 cromos
"Legends" doradas: jugadores destacados con diseño dorado/EXTRA.
Algunos jugadores tienen lámina normal en su equipo (Messi en ARG17)
**y** legend en p100-101 — el usuario debe poder coleccionar ambas y
elegir cuál "pegar" en el slot del jugador.

## Decisiones validadas

1. **Toggle explícito** (no auto-supersede): el usuario escoge por slot
   si quiere ver Normal o Legend.
2. **Sección dedicada `/album/legends`** además del toggle por slot —
   replica la estructura física del álbum (Legends viven en p100-101).
3. **Toggle persistido en DB** — la elección sobrevive a sesiones y se
   refleja cuando un amigo visita el álbum.
4. **Enfoque A**: `linked_sticker_id` en `stickers` + `display_variant`
   en `user_stickers`. Mínimo cambio de schema, máxima limpieza.

---

## Sección 1 — Schema DB

Una migración `0029_legends.sql` que **solo agrega** (zero data-loss,
ver [[feedback-no-data-loss]]):

```sql
alter table public.stickers
  add column if not exists linked_sticker_id uuid
  references public.stickers(id) on delete restrict;

create index if not exists stickers_linked_idx
  on public.stickers(linked_sticker_id)
  where linked_sticker_id is not null;

alter table public.user_stickers
  add column if not exists display_variant text
  check (display_variant in ('normal', 'legend'));
```

- `linked_sticker_id`: solo poblada para legends — apunta al slot normal
  del jugador (ej. legend de Messi → ARG17.id). NULL para todos los demás.
- `on delete restrict`: borrar un slot normal con legend que apunte falla
  loud, no cascadea silenciosamente.
- `display_variant`: NULL = default (muestra normal); `'legend'` = el
  usuario decidió "pegar legend encima" en este slot. Solo se setea en
  el row del sticker NORMAL del jugador con legend.
- RLS existente de `user_stickers` ya cubre UPDATE por user_id.

---

## Sección 2 — Seeds + códigos

### Convención de códigos

`LEG<TEAM><N>` donde TEAM+N es el code del slot normal al que apunta.
- `LEGARG17` = Messi (slot ARG17)
- `LEGPOR15` = Cristiano (slot POR15)
- `LEGBRA0`, `LEGMEX0` = stand-alone (Neymar, Gilberto Mora — no están
  en su roster del álbum). El `0` señala "sin slot vinculado", consistente
  con `FWC0` (Panini chilena).

### Mapeo final (27 legends — validado contra DB)

| Legend | País | Slot | Notas |
|---|---|---|---|
| Arda Güler | Turquía | TUR14 | DB sin umlaut "Guler" |
| Sadio Mané | Senegal | SEN15 | DB sin acento "Mane" |
| Christian Pulisic | USA | USA16 | EXTRA vertical |
| Federico Valverde | Uruguay | URU10 | |
| Luka Modrić | Croacia | CRO9 | DB con diacrítico ć |
| Luis Díaz | Colombia | COL20 | DB sin acento "Diaz" |
| Thibaut Courtois | Bélgica | BEL2 | |
| Lionel Messi | Argentina | ARG17 | EXTRA vertical |
| Mohamed Salah | Egipto | EGY17 | |
| Cristiano Ronaldo | Portugal | POR15 | |
| Mathew Ryan | Australia | AUS2 | EXTRA vertical |
| Neymar | Brasil | (LEGBRA0) | **stand-alone** |
| Erling Haaland | Noruega | NOR15 | |
| Virgil van Dijk | Países Bajos | NED3 | EXTRA vertical |
| Jamal Musiala | Alemania | GER15 | |
| Brahim Díaz | Marruecos | MAR19 | DB sin acento "Diaz" |
| Lamine Yamal | España | ESP15 | |
| Leandro Bacuna | Curazao | CUW12 | |
| Takefusa Kubo | Japón | JPN12 | EXTRA vertical |
| Riyad Mahrez | Argelia | ALG15 | |
| Moisés Caicedo | Ecuador | ECU9 | DB sin acento "Moises" |
| Viktor Gyökeres | Suecia | SWE20 | EXTRA vertical |
| Kylian Mbappé | Francia | FRA20 | DB sin acento "Mbappe" |
| Diego Gómez | Paraguay | PAR10 | DB sin acento "Gomez" |
| Cole Palmer | Inglaterra | ENG12 | EXTRA vertical |
| Gilberto Mora | México | (LEGMEX0) | **stand-alone** |
| Son Heung-min | Corea del Sur | KOR18 | DB "Heung-min Son" orden invertido |

**Total**: 27 legends. 25 con `linked_sticker_id` + 2 stand-alone (NULL).

Verificación: `test/legends-final-lookup.ts` (gitignored).

### Migración (estructura)

```sql
do $$
declare
  v_album_id uuid;
  v_arg17 uuid;
  v_por15 uuid;
  -- ... resto
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  select id into v_arg17 from public.stickers
    where album_id = v_album_id and code = 'ARG17';
  -- ... resto

  insert into public.stickers
    (album_id, code, number, name, team, group_code, type, rarity, page, linked_sticker_id)
  values
    (v_album_id, 'LEGARG17', 1, 'Lionel Messi', 'Argentina', null, 'legend', 5, 100, v_arg17),
    (v_album_id, 'LEGPOR15', 2, 'Cristiano Ronaldo', 'Portugal', null, 'legend', 5, 100, v_por15),
    -- ... 23 más con linked_sticker_id no-NULL
    (v_album_id, 'LEGBRA0', 26, 'Neymar Jr', 'Brasil', null, 'legend', 5, 100, null),
    (v_album_id, 'LEGMEX0', 27, 'Gilberto Mora', 'México', null, 'legend', 5, 101, null)
  on conflict (album_id, code) where code is not null
  do update set
    number             = excluded.number,
    name               = excluded.name,
    team               = excluded.team,
    type               = excluded.type,
    rarity             = excluded.rarity,
    page               = excluded.page,
    linked_sticker_id  = excluded.linked_sticker_id;

  update public.albums a
    set total_stickers = (select count(*) from public.stickers where album_id = a.id)
    where a.id = v_album_id;
end $$;
```

- `rarity = 5` (las más raras)
- `number` sigue una **convención de orientación**: 1..N horizontales doradas
  primero, N+1..27 EXTRA verticales después. El threshold exacto se fija
  cuando el script de extracción cuenta cuántos de cada tipo hay
  (estimación: ~16-18 horizontales + ~8-10 verticales = 27).
- `page` = 100 o 101 según orientación visual
- UPSERT preservativo (`on conflict do update`)
- Tras la migración, `total_stickers` sube de 994 → 1021

---

## Sección 3 — Extracción de imágenes

### Pipeline (`test/leg-extract.py`)

1. Rasterizar p100 y p101 de `doc/álbum 101 paginas completo.pdf` a
   `Matrix(5, 5)` (similar a `fwc-build.py`).
2. Detectar bordes de cromos con `ImageChops.difference` para separar
   slots. Cada página tiene grid mixto: 2 cols horizontales + 1 col
   vertical EXTRA.
3. Clasificar slot por aspect ratio:
   - `w/h > 1.1` → horizontal dorado → 560×420
   - `w/h < 0.8` → vertical EXTRA → 385×511
4. Generar archivos en `/public/laminas/LEG/leg<team><n>.jpg`
   (lowercase, mismo patrón que MEX/mex1.jpg).
5. Para stand-alones: `legbra0.jpg`, `legmex0.jpg`.

### Mapeo legend → slot

Ya resuelto en `test/legends-final-lookup.ts` con normalización de
acentos (Postgres "Diaz" matchea "Díaz" del PDF). 25 exact + 2
stand-alone identificados.

### Extensión de `stickerImageFromCode` (sticker-card.tsx)

```tsx
// Regex actual:
const teamMatch = code.match(/^([A-Z]{3})(\d+)$/);

// Nuevo: detectar legends ANTES del teamMatch para evitar que LEGARG17
// se parsee como "LEG" prefix + 17 number.
const legMatch = code.match(/^LEG([A-Z]{3})(\d+)$/);
if (legMatch) {
  const [, team, n] = legMatch;
  return `/laminas/LEG/leg${team.toLowerCase()}${n}.jpg`;
}
```

---

## Sección 4 — UI `/album/legends`

### Archivos nuevos

```
src/app/(app)/album/legends/page.tsx        ← propietario
src/app/u/[username]/legends/page.tsx       ← amigo (readOnly)
```

Ambos reusan `SpecialSectionPage` (mismo patrón que historia).

### Cambios en `album-config.ts`

```ts
export type SpecialKey = "apertura" | "historia" | "coca-cola" | "legends";

SPECIAL_SECTIONS.legends = {
  accent: "var(--gold)",
  tint: "color-mix(in oklab, var(--gold) 8%, var(--card))",
  label: "Legends",
  href: "/album/legends",
};

// SECTION_ORDER: ... 'historia', 'legends', 'coca-cola'
```

### Cambios en `getStickersBySection` (queries.ts)

⚠ Legends y Historia comparten rango de page (100-109). Estrechar:

```ts
const filter = {
  apertura:   { pageGte: 0,   pageLt: 100, type: null,     groupNull: true },
  historia:   { pageGte: 106, pageLt: 110, type: null,     groupNull: true },
  legends:    { pageGte: 100, pageLt: 102, type: 'legend', groupNull: true },
  "coca-cola":{ pageGte: 110, pageLt: 120, type: null,     groupNull: true },
};
```

Verificado: legends están en pages 100-101, historia en 106-109. Sin
overlap. El filtro `type='legend'` da un extra de robustez.

### Layout en SpecialSection

```tsx
const isLegends = sectionKey === "legends";
// Threshold definido en el seed (sección 2). Exporta como constante
// desde album-config.ts para que SpecialSection y el seed concuerden.
const LEGEND_HORIZONTAL_THRESHOLD = 18; // tentativo; fijar tras extracción

{isLegends ? (
  <div className="grid grid-cols-3 gap-2 sm:gap-3">
    {list.map((s) => {
      const isVert = s.number > LEGEND_HORIZONTAL_THRESHOLD;
      return (
        <div key={s.id} className={isVert ? "row-span-2" : ""}>
          <StickerCard
            ...
            horizontal={!isVert}
            tall={!isVert}
          />
        </div>
      );
    })}
  </div>
) : ...}
```

**Nota de implementación**: durante el script `test/leg-extract.py`
(sección 3), contar exact cuántas horizontales hay → escribir
`LEGEND_HORIZONTAL_THRESHOLD = <count>` en `album-config.ts`. El seed
asigna number 1..count a horizontales y count+1..27 a verticales.

### Tile en `/album`

Card más entre Historia y Coca-Cola con accent dorado. `SectionTile` ya
es reutilizable — solo necesita la entrada en `SECTION_ORDER`.

### Estética

- `type='legend'` ya activa `sticker-slot--shiny` (sticker-card.tsx:128)
- Sin cambios extra necesarios; el efecto holográfico se aplica solo

---

## Sección 5 — Toggle por slot en equipo

### Dónde aparece

En `Page1Grid` y `Page2Grid` (`team-block.tsx`) — solo si:
- El slot tiene una legend linkeada (`stickers.linked_sticker_id` apunta inversamente al slot), Y
- El usuario posee la legend (`quantity ≥ 1`)
- No estamos en modo `readOnly`

Ejemplo: en Argentina, solo ARG17 (Messi) muestra toggle si user tiene LEGARG17.

### Datos que necesita el grid

Se extiende `SectionSticker` con campos opcionales:

```ts
type SectionSticker = {
  // ...existentes
  legendStickerId?: string | null;
  legendCode?: string | null;
  displayVariant?: "normal" | "legend" | null;
  hasLegend?: boolean;          // qty ≥ 1 de la legend
};
```

### Lookup en query del equipo

Extender `getStickersByGroup` (queries.ts) con JOIN inverso al sticker legend:

```ts
const { data: stickers } = await supabase
  .from("stickers")
  .select(`
    id, code, number, name, team, group_code, type, page,
    legend:stickers!stickers_linked_sticker_id_fkey (id, code)
  `)
  .eq("album_id", albumId)
  .eq("group_code", groupCode.toUpperCase())
  .order("page", { ascending: true })
  .order("number", { ascending: true });
```

**⚠ Validar nombre del FK**: el alias `stickers!stickers_linked_sticker_id_fkey`
asume el nombre auto-generado por Postgres. Tras correr la migración,
verificar con un script `test/legend-join-verify.ts` que el nombre real
del constraint coincide; si no, ajustar al nombre real (típicamente
`stickers_linked_sticker_id_fkey` pero podría diferir).

Luego enriquecer en el server component (donde se conoce el user):

```ts
const legendIds = stickers.flatMap(s => s.legend ? [s.legend.id] : []);
const slotIds = stickers.map(s => s.id);

const [ownedLegendsRes, variantsRes, allUserStickersRes] = await Promise.all([
  supabase.from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", user.id)
    .in("sticker_id", legendIds)
    .gt("quantity", 0),
  supabase.from("user_stickers")
    .select("sticker_id, display_variant")
    .eq("user_id", user.id)
    .in("sticker_id", slotIds),
  // Cargar también las qty de las legends — se usan en legendQtyMap
  supabase.from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", user.id)
    .in("sticker_id", legendIds),
]);

const ownedLegendSet = new Set(ownedLegendsRes.data?.map(r => r.sticker_id));
const variantMap = new Map(variantsRes.data?.map(r => [r.sticker_id, r.display_variant]));
const legendQtyMap = new Map(
  allUserStickersRes.data?.map(r => [r.sticker_id, r.quantity ?? 0]),
);

stickers.forEach(s => {
  s.legendStickerId = s.legend?.id ?? null;
  s.legendCode = s.legend?.code ?? null;
  s.hasLegend = s.legend ? ownedLegendSet.has(s.legend.id) : false;
  s.displayVariant = variantMap.get(s.id) ?? null;
});

// legendQtyMap se pasa como prop a Page1Grid/Page2Grid → StickerCardSlot
```

### Componente `LegendToggle`

Nuevo `src/app/(app)/album/_components/legend-toggle.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Sparkles, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { setDisplayVariant } from "../actions";

export function LegendToggle({
  slotId,
  legendCode,
  initialVariant,
}: {
  slotId: string;
  legendCode: string;
  initialVariant: "normal" | "legend" | null;
}) {
  const [variant, setVariant] = useState<"normal" | "legend">(
    initialVariant === "legend" ? "legend" : "normal",
  );
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = variant === "normal" ? "legend" : "normal";
    setVariant(next);
    startTransition(async () => {
      const res = await setDisplayVariant(slotId, next);
      if ("error" in res && res.error) setVariant(variant);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={
        variant === "normal"
          ? `Pegar Legend (${legendCode}) sobre este slot`
          : `Volver a la lámina normal`
      }
      className={cn(
        "absolute top-1 right-1 z-20 size-7 rounded-full grid place-items-center transition-all",
        "border border-[var(--gold)]/40 shadow-md",
        variant === "legend"
          ? "bg-[var(--gold)] text-foreground"
          : "bg-card/90 text-muted-foreground hover:bg-[var(--gold)]/20",
        pending && "opacity-60",
      )}
      title={variant === "legend" ? "Mostrando Legend" : "Mostrando Normal"}
    >
      {variant === "legend" ? (
        <Sparkles className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Shirt className="size-3.5" strokeWidth={2} />
      )}
    </button>
  );
}
```

### Integración en `StickerCardSlot` (team-block.tsx)

```tsx
function StickerCardSlot({ s, qtyMap, horizontal, readOnly, legendQtyMap }) {
  // Render rule defensiva: solo respeta variant='legend' SI user posee la legend
  const effectiveVariant =
    s.displayVariant === "legend" && s.hasLegend ? "legend" : "normal";
  const showToggle = !readOnly && s.hasLegend && s.legendCode;

  const renderCode = effectiveVariant === "legend" ? s.legendCode : s.code;
  const renderId = effectiveVariant === "legend" ? s.legendStickerId : s.id;
  const renderQty =
    effectiveVariant === "legend"
      ? legendQtyMap.get(s.legendStickerId!) ?? 0
      : qtyMap.get(s.id) ?? 0;
  const renderType = effectiveVariant === "legend" ? "legend" : s.type;

  return (
    <div className="relative">
      {showToggle && (
        <LegendToggle
          slotId={s.id}
          legendCode={s.legendCode!}
          initialVariant={s.displayVariant}
        />
      )}
      <StickerCard
        id={renderId!}
        code={renderCode}
        number={s.number}
        name={s.name}
        team={s.team}
        type={renderType}
        initialQuantity={renderQty}
        horizontal={horizontal}
        readOnly={readOnly}
      />
    </div>
  );
}
```

**Importante**: cuando `variant='legend'`, el `StickerCard` recibe el `id` de la LEGEND (no del slot). Los +/- editan la legend. `stickerImageFromCode` ya resolverá la imagen `/laminas/LEG/leg...jpg` por el nuevo regex.

### Modo readOnly (álbum de amigo)

- El JOIN debe traer el `display_variant` del dueño del álbum, no del visitante
- El componente recibe `readOnly=true` → no muestra `<LegendToggle>` ni botones +/-
- Pero respeta el `effectiveVariant` del dueño — visitante VE su elección

### Vista en `/album/legends`

No tiene toggle. Cada legend es un sticker independiente con sus +/- normales.

---

## Sección 6 — Server actions + RLS + trades + edge cases

### `setDisplayVariant` (album/actions.ts)

```ts
export async function setDisplayVariant(
  slotStickerId: string,
  variant: "normal" | "legend" | null,
) {
  if (variant !== null && variant !== "normal" && variant !== "legend") {
    return { error: "Variante inválida" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // 1) Slot existe y no es legend
  const { data: slot } = await supabase
    .from("stickers")
    .select("id, type")
    .eq("id", slotStickerId)
    .maybeSingle();
  if (!slot) return { error: "Slot no existe" };
  if (slot.type === "legend") return { error: "El slot no puede ser una legend" };

  // 2) Si va a 'legend': legend existe Y user la posee
  if (variant === "legend") {
    const { data: legend } = await supabase
      .from("stickers")
      .select("id")
      .eq("linked_sticker_id", slotStickerId)
      .eq("type", "legend")
      .maybeSingle();
    if (!legend) return { error: "Este slot no tiene legend asociada" };

    const { data: owned } = await supabase
      .from("user_stickers")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("sticker_id", legend.id)
      .maybeSingle();
    if (!owned || (owned.quantity ?? 0) < 1) {
      return { error: "No posees esta legend" };
    }
  }

  // 3) UPSERT preservativo de quantity
  const { data: existing } = await supabase
    .from("user_stickers")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("sticker_id", slotStickerId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("user_stickers")
      .update({ display_variant: variant })
      .eq("user_id", user.id)
      .eq("sticker_id", slotStickerId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("user_stickers")
      .insert({
        user_id: user.id,
        sticker_id: slotStickerId,
        quantity: 0,
        display_variant: variant,
      });
    if (error) return { error: error.message };
  }

  revalidatePath("/album", "layout");
  return { success: true };
}
```

### RLS — sin cambios

Las policies existentes de `user_stickers` ya cubren:
- `user_stickers_update_self` — UPDATE solo en propia fila
- `user_stickers_insert_self` — INSERT con auth.uid()=user_id

El nuevo `display_variant` viaja con la fila. RLS lo protege automáticamente.

### Trades — legends son stickers regulares

`trade_items.sticker_id` referencia `stickers`. Las legends (`type='legend'`)
son stickers con su propio UUID — se intercambian como cualquier otro.

**Sin cambios** en el sistema de trades. Asegurarse de que la UI de
trades muestre legends con `Sparkles` (ya aplica vía `type === 'legend'`
en sticker-card.tsx:128).

### Render rule defensiva

```ts
const effectiveVariant =
  s.displayVariant === "legend" && s.hasLegend ? "legend" : "normal";
```

**Por qué**: si el usuario tenía `display_variant='legend'` y luego intercambió
su legend (qty→0), la regla cae a normal y NO muestra spoiler. La fila
`display_variant='legend'` queda en DB pero ignorada hasta que el usuario
vuelva a poseer la legend.

**Sin trigger ni cleanup**. Fallback en render = solución limpia.

### Edge cases

| Caso | Comportamiento |
|---|---|
| Tiene legend, NO el normal, variant=legend | Imagen legend ✓ |
| Tiene legend, NO el normal, variant=null | Placeholder ✓ |
| Tiene normal, NO la legend | Toggle no aparece ✓ |
| Tiene ambas, variant=normal | Imagen normal ✓ |
| Tiene ambas, variant=legend | Imagen legend, +/- editan la legend ✓ |
| Intercambia legend (qty→0), variant=legend | Fallback a normal ✓ |
| Intercambia normal (qty→0), tiene legend, variant=legend | Sigue legend ✓ |
| Amigo ve mi álbum (readOnly) | Respeta MI variant, sin toggle ✓ |

---

## Implementación — orden propuesto

1. **DB**: migración 0029_legends.sql (sólo schema, sin seeds aún)
2. **Test verify**: script en `test/` confirma que las columnas existen y el FK funciona
3. **Extracción imágenes**: script `test/leg-extract.py` → `/public/laminas/LEG/`
4. **Seed legends**: migración 0030_seed_legends.sql con los 27 INSERT
5. **album-config + queries**: extender `SpecialKey`, `getStickersBySection`, `getStickersByGroup`
6. **stickerImageFromCode**: regex de LEG en sticker-card.tsx
7. **SpecialSection layout legends**: grid mixto horizontal/vertical
8. **/album/legends page + /u/[username]/legends**: rutas nuevas
9. **Server action setDisplayVariant**: en album/actions.ts
10. **LegendToggle component**: nuevo
11. **StickerCardSlot integration**: render rule + toggle
12. **Tile en /album**: SectionTile entry
13. **Smoke test manual**: marcar/desmarcar/toggle/trades

Cada paso commit individual. Total estimado: ~12-15 commits.

---

## Reglas siempre respetadas

Ver memorias:
- `feedback-no-data-loss` — UPSERT, FK RESTRICT, jamás DELETE de catálogo
- `feedback-verify-not-assume` — scripts de verificación ante duda
- `feedback-test-folder` — scripts ad-hoc en `test/` (gitignored)
- `feedback-push-default` — push directo en cambios UI/UX
