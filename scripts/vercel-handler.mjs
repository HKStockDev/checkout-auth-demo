import { prepareVercelData } from "./vercel-data.mjs";
import { handleApiRequest } from "./api-handler.mjs";
import { ensureAuthTables } from "./auth-db.mjs";
import { ensureOrderTables, seedDemoOrders } from "./orders-db.mjs";

let initialized = false;

async function init() {
  if (initialized) return;
  await prepareVercelData();
  await ensureAuthTables();
  await ensureOrderTables();
  await seedDemoOrders();
  initialized = true;
}

export default async function vercelApiHandler(req, res) {
  await init();
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.status(404).json({ error: "Not found" });
  }
}
