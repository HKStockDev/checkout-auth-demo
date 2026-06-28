import { ensureAuthTables } from "./auth-db.mjs";

await ensureAuthTables();
console.log("Auth CSV tables ready: data/users.csv, data/sessions.csv");
