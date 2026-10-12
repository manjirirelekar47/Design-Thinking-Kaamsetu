# KaamSetu – Labour Platform (Design Thinking Phase 2 prototype)

Full-stack prototype: React + Vite + Tailwind frontend, Node + Express backend (JWT auth, JSON-file storage, no database setup).

## Run it (Node 18+)

Terminal 1 – backend:
    cd server
    npm install
    npm run dev          # http://localhost:5000

Terminal 2 – frontend:
    cd client
    npm install
    npm run dev          # http://localhost:5173

Open http://localhost:5173. Demo logins (OTP 1234 for all):
- Worker 9000000001 (Ramesh)
- Contractor 9000000002 (Patil Builders)
- Mukkadam 9000000003

## Demo flow (use two browser windows, one per role)
1. Contractor: Pre-fund wages after the worker accepts (site OTP is shown on the contractor's job card, seeded job uses 4821).
2. Worker: Jobs > Accept job; My work > enter the site OTP > Check in > End shift.
3. Contractor: Workers and pay > Approve and release (needs escrow + completed shift). Rate the worker.
4. Worker: wage shows Paid, Passport days increase by 1.
Extras: contractor cancel (₹150 compensation), wage claim, payout method, mukkadam crew attendance and wage split, QR passport (public verify endpoint).
Screens refresh every few seconds, so both windows stay in sync. "Reset demo" restores seed data.

## API summary
POST /api/auth/login · GET /api/me · GET/POST /api/jobs · POST /api/jobs/:id/accept
GET /api/bookings · POST /api/bookings/:id/{checkin,checkout,paymethod,claim,fund,release,cancel,rate}
GET /api/passport/:id · GET /api/crew · POST /api/crew/:id/toggle · POST /api/crew/split · POST /api/reset

## Simulated / not built
Real SMS OTP, UPI/escrow payments, GPS, WhatsApp/IVR alerts, full Hindi/Marathi translation (only a voice read-out button), real database, password/phone registration. Replace data.json with MongoDB/Postgres for production.

## Version 2 – all planned features
Worker: job matching %, naka availability check-in, GPS + OTP/QR attendance, wage tracker, UPI/bank/cash choice, cash acknowledgement, instant payout, wage claim, minimum wage check, Wage Passport (QR, badges, reviews), contractor trust ratings, safety checklist, SOS, rights helper with voice read-out, privacy consent, EN/HI/MR labels, offline cached data banner.
Mukkadam: crew (group profile), attendance, book jobs for the whole crew, wage split.
Contractor: verification, job posting with WhatsApp/SMS-style alerts to workers, site QR + OTP, escrow, approve and release, cancel with compensation, ratings and reviews, naka worker list, dashboard analytics.
Extra demo account: 9000000004 (unverified contractor). Old data.json files are upgraded automatically on start.
Still simulated: real SMS/WhatsApp, UPI/escrow, camera QR scanning, full translations, real database.
