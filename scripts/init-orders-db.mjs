import { ensureOrderTables, seedDemoOrders } from "./orders-db.mjs";

await ensureOrderTables();
await seedDemoOrders();
console.log("Order CSV tables ready: data/purchase.csv, data/result.csv");
