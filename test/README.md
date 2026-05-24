# test/

Carpeta para scripts y archivos de prueba/exploración (queries ad-hoc, sanity checks, scratch).

**Esta carpeta está en `.gitignore`** — solo `.gitkeep` y este README se commitean. Cualquier archivo aquí (`.ts`, `.tsx`, `.sql`, `.json`, etc.) no se sube al repo.

Útil para:
- Probar queries contra Supabase sin contaminar el código de producción
- Verificar conexión a DB, sembrar datos de prueba, etc.
- Scripts one-off

Para ejecutar un script TS aquí:

```bash
pnpm tsx --env-file=.env.local test/mi-script.ts
```
