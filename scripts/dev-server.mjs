import { createServer } from "node:http";
import { access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureAuthTables } from "./auth-db.mjs";
import { ensureOrderTables, seedDemoOrders } from "./orders-db.mjs";
import { handleApiRequest } from "./api-handler.mjs";
import { loadEnv, projectRoot } from "./load-env.mjs";

loadEnv(projectRoot(import.meta.url));

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function serveStatic(pathname) {
  const safe = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(ROOT, safe.replace(/^\//, "").split("?")[0]);
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

await ensureAuthTables();
await ensureOrderTables();
await seedDemoOrders();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApiRequest(req, res);
    if (handled) return;
  }

  const filePath = serveStatic(url.pathname);
  if (!filePath) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const relative = filePath.slice(ROOT.length).replace(/\\/g, "/");
  if (
    relative === "/data/users.csv" ||
    relative === "/data/sessions.csv" ||
    relative === "/data/purchase.csv" ||
    relative === "/data/result.csv"
  ) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    await access(filePath);
    const ext = extname(filePath);
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    const stream = createReadStream(filePath);
    stream.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(404);
        res.end("Not found");
      } else {
        res.destroy();
      }
    });
    stream.pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`special product running at http://localhost:${PORT}`);
  console.log(`Auth: login.html | register.html | reset-password.html`);
});
