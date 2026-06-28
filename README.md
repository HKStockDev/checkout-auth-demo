# Checkout Demo

Portfolio demo for a fixed-price contract covering:

1. **Product categories & featured items** - Shop home with specialties and famous products
2. **Address autocomplete** - Full mock city database (English & Hebrew search)
3. **Stripe payment ID as order reference** - Customer-facing payment reference on success page and confirmation email
4. **CSV dashboard** - All CSV tables (`purchase`, `result`, `users`, `sessions`) on the dashboard page

## Quick start

```bash
cp .env.example .env   # optional — set JWT_SECRET for production
npm run init:auth      # create data/users.csv and data/sessions.csv
npm run init:orders    # create data/purchase.csv and data/result.csv with demo rows
npm run dev            # http://localhost:3000 - shop + auth + orders API
```

The dev server (`scripts/dev-server.mjs`) serves static files and exposes:

- `GET /api/dashboard` - all CSV tables (authenticated)
- `POST /api/orders` - save purchase + results (`sessionId`, `stripePaymentIntentId`, `results`)
- `POST /api/auth/register` - create account, issue JWT + httpOnly cookie
- `POST /api/auth/login` - sign in, issue JWT + httpOnly cookie
- `POST /api/auth/logout` - revoke server session and clear JWT cookie
- `GET /api/auth/me` - current user (Bearer token or cookie)
- `POST /api/auth/reset-password` - request password reset email (dev: logs link)
- `PUT /api/auth/reset-password` - confirm reset with token

### JWT authentication

Login and register return a JWT in the response body (`token`) and set an httpOnly `auth_token` cookie. The browser client also stores the token in `localStorage` and sends `Authorization: Bearer <token>` on API calls.

Each JWT is linked to a server-side session in `data/sessions.csv` (`sid` claim). Logout deletes that session, invalidating the JWT immediately even before expiry.

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | dev fallback | HMAC secret for signing (min 32 chars in production) |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime (`30m`, `24h`, `7d`, etc.) |
| `SESSION_TTL_MS` | `604800000` | Server session record TTL |
| `APP_URL` | `http://localhost:3000` | Base URL for password reset links |

Without the dev server (plain static hosting), orders fall back to `localStorage` + reading `data/purchase.csv` and `data/result.csv` for seed data.

## Demo flow

1. **Shop** (`index.html`) - Browse categories with product images; add to cart or buy now
2. **Cart** (`cart.html`) - Review items, adjust quantities, proceed to checkout
3. **Checkout** (`checkout.html`) - Contact, payment, place order
4. **Success** (`success.html`) - Stripe payment ID + link to dashboard
5. **Dashboard** (`dashboard.html`) - All CSV table data
6. **Auth** (`login.html`, `register.html`, `reset-password.html`) - JWT session sign in/out and password reset

## File map

| Area | File |
|------|------|
| Categories home | `index.html`, `js/categories.js`, `js/products.js`, `js/product-ui.js` |
| Shopping cart | `cart.html`, `js/cart.js`, `js/cart-page.js` |
| Checkout | `checkout.html`, `js/checkout.js` |
| Dashboard | `dashboard.html`, `js/dashboard.js`, `scripts/dashboard-db.mjs` |
| Orders API | `js/orders-api.js`, `scripts/orders-db.mjs` |
| CSV storage | `data/purchase.csv`, `data/result.csv`, `scripts/orders-db.mjs` |
| Authentication | `login.html`, `register.html`, `reset-password.html`, `js/auth-api.js`, `scripts/auth-db.mjs`, `scripts/jwt.mjs` |
| Address autocomplete | `js/mock-autocomplete.js`, `js/israel-address-data.js` |
| Stripe integration | `js/utils.js` → `createStripePayment()` |
| Success page | `success.html`, `js/success.js` |

## CSV format

**`data/purchase.csv`**

```csv
purchase_id,user_id,session_id,stripe_payment_intent_id,status,created_at,pdf_url
```

**`data/result.csv`** — up to 50 named numerical values per `session_id`

```csv
result_id,session_id,name,value
```

## License

Demo code for portfolio / client evaluation purposes.
