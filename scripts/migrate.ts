/**
 * Aplica las migraciones SQL en orden contra Supabase Postgres.
 * Uso: pnpm db:migrate
 * Requiere POSTGRES_URL_NON_POOLING en .env.local
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!url) {
    console.error("Falta POSTGRES_URL_NON_POOLING (o POSTGRES_URL) en .env.local");
    process.exit(1);
  }

  const sql = postgres(url, { ssl: "require", max: 1 });

  const dir = path.join(process.cwd(), "supabase", "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const full = path.join(dir, file);
    console.log(`\n--- aplicando ${file} ---`);
    const text = await readFile(full, "utf8");
    try {
      await sql.unsafe(text);
      console.log(`OK ${file}`);
    } catch (e) {
      console.error(`FALLO ${file}:`, e);
      await sql.end({ timeout: 5 });
      process.exit(1);
    }
  }

  await sql.end({ timeout: 5 });
  console.log("\nTodas las migraciones aplicadas.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
