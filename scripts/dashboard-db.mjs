import {
  PURCHASE_HEADERS,
  readPurchases,
  readResults,
  RESULT_HEADERS,
} from "./orders-db.mjs";
import {
  readSessions,
  readUsers,
  SESSION_HEADERS,
  USER_HEADERS,
} from "./auth-db.mjs";

function maskSensitiveUserRow(row) {
  return {
    ...row,
    password_hash: row.password_hash ? "••••••" : "",
    reset_token: row.reset_token ? "••••••" : "",
  };
}

export async function readDashboardTables() {
  const [purchases, results, users, sessions] = await Promise.all([
    readPurchases(),
    readResults(),
    readUsers(),
    readSessions(),
  ]);

  return [
    {
      name: "purchase",
      file: "data/purchase.csv",
      headers: PURCHASE_HEADERS,
      rows: purchases,
    },
    {
      name: "result",
      file: "data/result.csv",
      headers: RESULT_HEADERS,
      rows: results,
    },
    {
      name: "users",
      file: "data/users.csv",
      headers: USER_HEADERS,
      rows: users.map(maskSensitiveUserRow),
    },
    {
      name: "sessions",
      file: "data/sessions.csv",
      headers: SESSION_HEADERS,
      rows: sessions,
    },
  ];
}
