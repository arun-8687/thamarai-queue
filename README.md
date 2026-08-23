# Thamarai Queue

Walk-in waitlist and table seating for busy South Indian vegetarian halls.

Guests scan an entrance QR, take a three-digit token, and wait at their own pace. Staff seat from a floor board. A TV display calls the next party — EN · தமிழ் · हिन्दी.

## What you can do

| Role | Path | What it does |
| --- | --- | --- |
| Guest | `/` | Pick a hall, join the queue, get a token |
| Guest | `/request` | QR-gated registration (name, last-4 of phone, party size) |
| Guest | `/status` | Look up a token and see wait position |
| Staff | `/admin` | Live queue, hall floor map, seat / split / notify / complete |
| Hall TV | `/display` | Full-screen call board with spoken announcements |

Demo hall: **Ashok Nagar**. Seventeen Chennai-area branches ship seeded with a two-hall floor plan (2 / 4 / 6 tops).

## Stack

- React 19 + TanStack Start / Router / Query
- Tailwind v4
- PGLite (local WASM Postgres) with a Neon-ready path when `DATABASE_URL` is set
- Zod-validated server functions
- Web Speech API on the TV board

No accounts. Queue rows are unowned operational data (guest label + last 4 digits of phone only).

## Run locally

```bash
npm install
npm run dev
```

Then open the app and:

1. Pick **Ashok Nagar** and take a token.
2. Open **Staff** → seat that party on a table.
3. Open **Display** to see the call-out on the TV board.

```bash
npm run typecheck
npm run build
```

Set `DATABASE_URL` to a Postgres URL in production. Without it, the app uses PGLite.

## Project layout

```
src/routes/          Guest, staff, and TV pages
src/lib/queue/       Tokens, seating, branches, i18n
migrations/          Queue schema (and unused auth template)
public/              Favicon + share card
```

## License

Source is published as-is for your own halls. Not affiliated with any existing restaurant brand.
