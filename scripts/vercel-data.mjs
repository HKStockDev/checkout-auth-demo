import { access, cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const BUNDLED = join(__dirname, "..", "data");
const FILES = ["users.csv", "sessions.csv", "purchase.csv", "result.csv"];

let prepared = false;

export async function prepareVercelData() {
  if (!process.env.VERCEL || prepared) return;

  const dir = "/tmp/data";
  process.env.DATA_DIR = dir;
  await mkdir(dir, { recursive: true });

  for (const file of FILES) {
    const dest = join(dir, file);
    try {
      await access(dest);
    } catch {
      try {
        await cp(join(BUNDLED, file), dest);
      } catch {
        // seed file missing — init scripts create empty tables
      }
    }
  }

  prepared = true;
}
