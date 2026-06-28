import { prepareVercelData } from "../scripts/vercel-data.mjs";
import { handleApiRequest } from "../scripts/api-handler.mjs";
import {
  ensureAuthTables,
} from "../scripts/auth-db.mjs";
import {
  ensureOrderTables,
  seedDemoOrders,
} from "../scripts/orders-db.mjs";

let initialized = false;

async function init() {
  if (initialized) return;
  await prepareVercelData();
  await ensureAuthTables();
  await ensureOrderTables();
  await seedDemoOrders();
  initialized = true;
}

export default async function handler(req, res) {
  await init();
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.status(404).json({ error: "Not found" });
  }
}
