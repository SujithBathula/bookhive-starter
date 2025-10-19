# BookHive – Full‑Stack Starter (React + Node/Express + MySQL)

## What’s inside
- `/db/schema.sql` and `/db/seed.sql`
- `/server` Node/Express API (JWT auth, catalog, cart, orders, mock payment, admin reports)
- `/client` React (Vite) app with basic pages

## Quick start
1) **MySQL**
```sql
SOURCE db/schema.sql;
SOURCE db/seed.sql;
```
2) **Server**
```bash
cd server
cp .env.example .env   # set your DB creds
npm i
npm run start          # starts on http://localhost:4000
```
3) **Client**
```bash
cd client
npm i
echo 'VITE_API=http://localhost:4000/api' > .env
npm run dev            # http://localhost:5173
```

## Demo flow
- Register or login via API:
  - `POST /api/auth/register` → { email, password, full_name }
  - `POST /api/auth/login` → returns JWT; set in `localStorage.token` (client does this)
- Browse `/books`, open a book, add to cart
- Go to Cart → Checkout → Place Order (calls stored procedure + mock pay)

## Notes
- Admin endpoints require a token with role `admin` (you can mint one manually for demo).
- Payment is mocked; it marks order as `paid`.
- Stock checks & decrements are enforced by triggers.
