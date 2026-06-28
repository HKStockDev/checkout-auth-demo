import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function getDataDir() {
  return process.env.DATA_DIR || join(__dirname, "..", "data");
}
