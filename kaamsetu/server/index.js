import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PORT = process.env.PORT || 5000;
const FILE = new URL('./data.json', import.meta.url);
const DEMO_OTP = '1234'; // simulated SMS OTP for login

const seed = () => ({
  users: [
    {
      id: 'u1',
      name: 'Ramesh Ahirwar',
      phone: '9000000001',
      role: 'worker',
      skill: 'Mason',
      days: 187,
      rating: 4.6,
      onTimePct: 96,
      consent: true,
      available: true,
      area: 'Baner, Pune',
      baseEarnings: 130900,
    },
    {
      id: 'u2',
      name: 'Patil Builders',
      phone: '9000000002',
      role: 'contractor',
      verified: true,
      rating: 4.2,
      onTimePct: 92,
      escrowBalance: 25000,
    },
    {
      id: 'u3',
      name: 'Sunil (Mukkadam)',
      phone: '9000000003',
      role: 'mukkadam',
    },
    {
      id: 'u4',
      name: 'Shree Infra',
      phone: '9000000004',
      role: 'contractor',
      verified: false,
      rating: 3.9,
      onTimePct: 74,
      escrowBalance: 5000,
    },
  ],
  jobs: [
    {
      id: 'j1',
      contractorId: 'u2',
      title: 'Mason crew',
      site: 'Baner site',
      wage: 700,
      workersNeeded: 4,
      duration: '2 days',
      otp: '4821',
      escrowFunded: true,
    },
    {
      id: 'j2',
      contractorId: 'u4',
      title: 'Plastering helper',
      site: 'Wakad site',
      wage: 550,
      workersNeeded: 2,
      duration: '1 day',
      otp: '7310',
      escrowFunded: false,
    },
  ],
  bookings: [],
  notifs: [],
  crewJobs: [],
  version: 3,
  crew: [
    { id: 'c1', name: 'Ramesh Ahirwar', role: 'Mason', days: 6, present: true, phone: '9000000001' },
    { id: 'c2', name: 'Sunil Shinde', role: 'Helper', days: 5, present: true, phone: '9822011223' },
    { id: 'c3', name: 'Dilip Gaikwad', role: 'Helper', days: 4, present: false, phone: '9822011224' },
    { id: 'c4', name: 'Kiran Jadhav', role: 'Mason', days: 6, present: true, phone: '9822011225' },
  ],
});

let db;
try {
  if (fs.existsSync(FILE)) {
    db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (db.version !== 3) db = seed();
  } else {
    db = seed();
  }
} catch {
  db = seed();
}

// Safe atomic file write
const save = () => {
  try {
    const payload = JSON.stringify(db, null, 2);
    fs.writeFileSync(FILE, payload);
  } catch (err) {
    console.error('Failed to save data.json:', err);
  }
};

const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const pub = (u) =>
  u && {
    id: u.id,
    name: u.name,
    phone: u.phone,
    skill: u.skill,
    days: u.days,
    rating: u.rating,
    onTimePct: u.onTimePct,
    verified: u.verified,
    available: u.available,
    escrowBalance: u.escrowBalance,
  };

const app = express();
app.use(cors());
app.use(express.json());

// ---- Notification Helper ----
const notify = (to, text, jobId = null, ch = 'SMS') => {
  db.notifs = db.notifs || [];
  db.notifs.push({ id: uid('n'), to, text, jobId, ch, at: Date.now() });
};

const badges = (w) => [
  `${w.skill || 'Worker'} ${Number(w.days) >= 365 ? Math.floor(w.days / 365) + '+ yrs' : (w.days || 0) + ' days'}`,
  'Verified ID',
  ...(Number(w.onTimePct) >= 95 ? ['Trusted by contractors'] : []),
  ...(Number(w.rating) >= 4.5 ? ['Top rated'] : []),
  'e-Shram Verified',
  'Safety Certified',
];

// ---- Auth Middleware ----
const auth = (roles) => (req, res, next) => {
  try {
    const rawHeader = req.headers.authorization || '';
    const token = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim();
    if (!token) return res.status(401).json({ error: 'Authentication token missing. Please log in.' });

    const { id } = jwt.verify(token, SECRET);
    req.user = db.users.find((u) => u.id === id);
    if (!req.user) return res.status(401).json({ error: 'User no longer exists. Please log in again.' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  if (roles && !roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied: role '${req.user.role}' is not authorized for this resource.` });
  }
  next();
};

// ---- Auth Routes ----
app.post('/api/auth/login', (req, res) => {
  const { phone, otp } = req.body || {};
  const user = db.users.find((u) => u.phone === phone);
  if (!user) return res.status(404).json({ error: 'Phone number not registered. Please use a demo account.' });
  if (otp !== DEMO_OTP) return res.status(401).json({ error: 'Wrong OTP. Enter demo OTP 1234.' });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '24h' });
  res.json({ token, user });
});

// Voice-first registration / onboarding
app.post('/api/auth/voice-onboard', (req, res) => {
  const { name, skill, phone, area, language } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Spoken worker name is required.' });

  const p = phone?.trim() || `900000000${db.users.length + 1}`;
  let user = db.users.find((u) => u.phone === p);
  if (!user) {
    user = {
      id: uid('u'),
      name: name.trim(),
      phone: p,
      role: 'worker',
      skill: skill?.trim() || 'Mason',
      area: area?.trim() || 'Baner, Pune',
      language: language || 'hi',
      days: 0,
      rating: 5.0,
      onTimePct: 100,
      consent: true,
      available: true,
      baseEarnings: 0,
    };
    db.users.push(user);
    save();
  } else {
    if (skill) user.skill = skill.trim();
    if (area) user.area = area.trim();
    save();
  }

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '24h' });
  res.json({ token, user, message: 'Voice onboarding complete' });
});

app.get('/api/me', auth(), (req, res) => res.json(req.user));

// ---- Jobs Routes ----
app.get('/api/jobs', auth(['worker', 'contractor', 'mukkadam']), (req, res) => {
  if (req.user.role === 'contractor') {
    return res.json(db.jobs.filter((j) => j.contractorId === req.user.id));
  }
  // Worker & Mukkadam view
  res.json(
    db.jobs.map((j, i) => {
      const match = j.title.toLowerCase().includes((req.user.skill || '').toLowerCase()) ? 95 : 74;
      return {
        ...j,
        otp: undefined, // Hidden from worker before accepting
        match,
        km: 2.5 + i * 3.5,
        contractor: pub(db.users.find((u) => u.id === j.contractorId)),
      };
    })
  );
});

// Contractor posts a job (Escrow verified)
app.post('/api/jobs', auth(['contractor']), (req, res) => {
  const { title, site, duration, workersNeeded, escrowFunded } = req.body || {};
  const wage = Number(req.body?.wage);

  if (!title?.trim() || !site?.trim() || !(wage > 0)) {
    return res.status(400).json({ error: 'Title, site, and a valid wage (> 0) are required.' });
  }

  const workers = Number(workersNeeded) || 1;
  const totalWageRequirement = wage * workers;

  // Contractor escrow balance management
  const contractor = req.user;
  contractor.escrowBalance = contractor.escrowBalance ?? 20000;

  let isFunded = !!escrowFunded;
  if (isFunded) {
    if (contractor.escrowBalance < totalWageRequirement) {
      return res.status(400).json({
        error: `Insufficient escrow balance (₹${contractor.escrowBalance}). Pre-funding requires ₹${totalWageRequirement}. Please top up escrow first.`,
      });
    }
    contractor.escrowBalance -= totalWageRequirement;
  }

  const job = {
    id: uid('j'),
    contractorId: contractor.id,
    title: title.trim(),
    site: site.trim(),
    wage,
    duration: duration?.trim() || '1 day',
    workersNeeded: workers,
    otp: String(1000 + Math.floor(Math.random() * 9000)),
    escrowFunded: isFunded,
    createdAt: Date.now(),
  };

  db.jobs.push(job);
  notify('workers', `New job: ${job.title} at ${job.site}, ₹${job.wage}/day`, job.id, 'WhatsApp');
  save();

  res.status(201).json(job);
});

// Worker accepts a job
app.post('/api/jobs/:id/accept', auth(['worker']), (req, res) => {
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  const active = db.bookings.some(
    (b) => b.jobId === job.id && b.workerId === req.user.id && !['paid', 'cancelled'].includes(b.status)
  );
  if (active) return res.status(400).json({ error: 'You have already accepted this job.' });

  const b = {
    id: uid('b'),
    jobId: job.id,
    workerId: req.user.id,
    status: 'accepted',
    funded: !!job.escrowFunded,
    payMethod: 'UPI',
    claim: false,
    compensation: 0,
    rating: null,
    createdAt: Date.now(),
    wageDueAt: Date.now() + 8 * 3600 * 1000,
  };

  db.bookings.push(b);
  notify(job.contractorId, `${req.user.name} accepted ${job.title}`);
  save();

  res.status(201).json(b);
});

// Missed-call / WhatsApp one-tap quick accept
app.post('/api/jobs/:id/quick-accept', (req, res) => {
  const { phone } = req.body || {};
  const user = db.users.find((u) => u.phone === phone && u.role === 'worker');
  if (!user) return res.status(404).json({ error: 'Worker phone not registered.' });

  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  const active = db.bookings.some(
    (b) => b.jobId === job.id && b.workerId === user.id && !['paid', 'cancelled'].includes(b.status)
  );
  if (active) return res.status(400).json({ error: 'Job already accepted.' });

  const b = {
    id: uid('b'),
    jobId: job.id,
    workerId: user.id,
    status: 'accepted',
    funded: !!job.escrowFunded,
    payMethod: 'UPI',
    claim: false,
    compensation: 0,
    rating: null,
    createdAt: Date.now(),
    wageDueAt: Date.now() + 8 * 3600 * 1000,
  };

  db.bookings.push(b);
  notify(job.contractorId, `${user.name} accepted ${job.title} via Missed-Call / WhatsApp`);
  save();

  res.status(201).json({ ok: true, booking: b });
});

// ---- Bookings View Helper ----
const view = (b, showOtp) => {
  const job = db.jobs.find((j) => j.id === b.jobId) || { id: b.jobId, title: 'Job', site: 'Site', wage: 0, otp: '' };
  const contractor = job.contractorId ? db.users.find((u) => u.id === job.contractorId) : null;
  const worker = db.users.find((u) => u.id === b.workerId);
  return {
    ...b,
    job: { ...job, otp: showOtp ? job.otp : undefined },
    worker: pub(worker),
    contractor: pub(contractor),
  };
};

// GET /api/bookings with strict role & ownership segregation
app.get('/api/bookings', auth(['worker', 'contractor']), (req, res) => {
  const isC = req.user.role === 'contractor';
  const mine = db.bookings.filter((b) => {
    if (isC) {
      const job = db.jobs.find((j) => j.id === b.jobId);
      return job && job.contractorId === req.user.id;
    }
    return b.workerId === req.user.id;
  });

  res.json(mine.sort((a, b) => b.createdAt - a.createdAt).map((b) => view(b, isC)));
});

// ---- State Machine & Ownership Enforcement ----
// Valid transitions:
// accepted -> checked_in (worker checkin)
// checked_in -> completed (worker checkout)
// completed -> paid (contractor release, must be funded)
// accepted | checked_in -> cancelled (contractor cancel)
const act = (path, role, validFromStatus, fn) =>
  app.post(`/api/bookings/:id/${path}`, auth([role]), (req, res) => {
    const b = db.bookings.find((x) => x.id === req.params.id);
    if (!b) return res.status(404).json({ error: 'Booking not found.' });

    const job = db.jobs.find((j) => j.id === b.jobId);
    if (!job) return res.status(404).json({ error: 'Associated job not found.' });

    // Strict ownership verification
    if (role === 'worker' && b.workerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this booking.' });
    }
    if (role === 'contractor' && job.contractorId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own the job for this booking.' });
    }

    // Strict State Machine verification
    if (validFromStatus) {
      const allowed = Array.isArray(validFromStatus) ? validFromStatus : [validFromStatus];
      if (!allowed.includes(b.status)) {
        return res.status(400).json({
          error: `Invalid transition: cannot perform "${path}" while booking status is "${b.status}". Required state: ${allowed.join(' or ')}.`,
        });
      }
    }

    const err = fn(b, job, req);
    if (err) return res.status(400).json({ error: err });

    hook(path, b, job, req);
    save();

    res.json(view(b, role === 'contractor'));
  });

const hook = (p, b, job, req) => {
  const w = db.users.find((u) => u.id === b.workerId);
  if (!w || !job) return;
  if (p === 'checkin') notify(job.contractorId, `${w.name} checked in at ${job.site}`);
  if (p === 'fund') notify(b.workerId, `₹${job.wage} locked in escrow for ${job.title}`);
  if (p === 'release') notify(b.workerId, `₹${job.wage} paid via ${b.payMethod} for ${job.title}`, null, 'WhatsApp');
  if (p === 'cancel') notify(b.workerId, `${job.title} cancelled late. ₹150 compensation credited`);
  if (p === 'claim') notify(job.contractorId, `${w.name} raised a wage claim for ${job.title}`);
};

// 1. Worker Check-in: accepted -> checked_in
act('checkin', 'worker', 'accepted', (b, job, req) => {
  const inputOtp = String(req.body?.otp || '').replace(/^kaamsetu:site:/i, '').trim();
  if (inputOtp !== String(job.otp).trim()) {
    return 'Wrong site OTP. Ask contractor or scan site QR code.';
  }
  b.status = 'checked_in';
  b.checkInAt = Date.now();
  b.gps = req.body?.gps || { lat: 18.559, lng: 73.7868, site: job.site, verified: true };
});

// 2. Worker Checkout (End Shift): checked_in -> completed
act('checkout', 'worker', 'checked_in', (b) => {
  b.status = 'completed';
  b.checkOutAt = Date.now();
});

// 3. Worker set payout method: allowed anytime before payment
act('paymethod', 'worker', null, (b, j, req) => {
  if (['paid', 'cancelled'].includes(b.status)) {
    return 'Cannot change payout method after wage release or cancellation.';
  }
  if (!['UPI', 'Bank transfer', 'Cash'].includes(req.body?.method)) {
    return 'Invalid payout method. Choose UPI, Bank transfer, or Cash.';
  }
  b.payMethod = req.body.method;
});

// 4. Worker wage claim: allowed anytime
act('claim', 'worker', null, (b, j, req) => {
  b.claim = true;
  b.claimReason = req.body?.reason || 'Wage overdue. Digital attendance logs attached.';
  b.claimAt = Date.now();
});

// 5. Contractor Pre-funds escrow: allowed on accepted, checked_in, completed
act('fund', 'contractor', ['accepted', 'checked_in', 'completed'], (b, job, req) => {
  if (b.funded) return 'Booking is already funded in escrow.';

  const contractor = req.user;
  contractor.escrowBalance = contractor.escrowBalance ?? 20000;

  if (contractor.escrowBalance < job.wage) {
    return `Insufficient escrow balance (₹${contractor.escrowBalance}). Need ₹${job.wage}. Please deposit funds into escrow.`;
  }

  contractor.escrowBalance -= job.wage;
  b.funded = true;
  b.fundedAt = Date.now();
  b.escrowLocked = job.wage;
});

// 6. Contractor approves and releases payment: completed -> paid (Requires funded escrow)
act('release', 'contractor', 'completed', (b, job) => {
  if (!b.funded) {
    return 'Pre-fund the wage into escrow before releasing payment.';
  }
  b.status = 'paid';
  b.paidAt = Date.now();

  const w = db.users.find((u) => u.id === b.workerId);
  if (w) {
    w.days = (Number(w.days) || 0) + 1;
    w.totalEarned = (Number(w.totalEarned) || 0) + (job.wage || 0);
  }
});

// 7. Contractor cancel: accepted or checked_in -> cancelled (₹150 compensation)
act('cancel', 'contractor', ['accepted', 'checked_in'], (b, job) => {
  b.status = 'cancelled';
  b.funded = false;
  b.compensation = 150;
  b.cancelledAt = Date.now();

  // If escrow was already locked, return difference back to contractor
  if (b.escrowLocked) {
    req.user.escrowBalance = (req.user.escrowBalance || 0) + (b.escrowLocked - 150);
  }
});

// 8. Contractor rates worker: allowed after payment
act('rate', 'contractor', 'paid', (b, j, req) => {
  const s = Number(req.body?.stars);
  if (!(s >= 1 && s <= 5)) return 'Rating must be between 1 and 5 stars.';
  b.rating = s;
  b.comment = String(req.body?.comment || '').slice(0, 140);

  const w = db.users.find((u) => u.id === b.workerId);
  if (w) {
    w.rating = w.rating ? +(w.rating * 0.9 + s * 0.1).toFixed(2) : s;
  }
});

// 9. Worker rates contractor: allowed after payment
act('rate-contractor', 'worker', 'paid', (b, job, req) => {
  const s = Number(req.body?.stars);
  if (!(s >= 1 && s <= 5)) return 'Rating must be between 1 and 5 stars.';
  b.contractorRating = s;
  b.contractorComment = String(req.body?.comment || '').slice(0, 140);

  const c = db.users.find((u) => u.id === job.contractorId);
  if (c) {
    c.rating = c.rating ? +(c.rating * 0.9 + s * 0.1).toFixed(2) : s;
  }
});

// 10. Cash payment acknowledgements
act('cash-ack', 'worker', 'paid', (b) => {
  if (b.payMethod !== 'Cash') return 'Cash receipt is only applicable for cash payouts.';
  b.cashAck = true;
});

act('cash-contractor-ack', 'contractor', 'paid', (b) => {
  if (b.payMethod !== 'Cash') return 'Only applicable for cash payouts.';
  b.cashContractorAck = true;
});

// 11. Instant Payout
act('instant', 'worker', 'paid', (b) => {
  b.instant = true;
  b.instantAt = Date.now();
});

// One-click wage release for all completed funded shifts (PDF Feature 17)
app.post('/api/bookings/release-all', auth(['contractor']), (req, res) => {
  const jobIds = db.jobs.filter((j) => j.contractorId === req.user.id).map((j) => j.id);
  const releasable = db.bookings.filter((b) => jobIds.includes(b.jobId) && b.status === 'completed' && b.funded);

  let count = 0;
  for (const b of releasable) {
    b.status = 'paid';
    b.paidAt = Date.now();
    const w = db.users.find((u) => u.id === b.workerId);
    if (w) {
      w.days = (Number(w.days) || 0) + 1;
      w.totalEarned = (Number(w.totalEarned) || 0) + (db.jobs.find((j) => j.id === b.jobId)?.wage || 0);
    }
    const job = db.jobs.find((j) => j.id === b.jobId);
    hook('release', b, job, req);
    count++;
  }
  save();

  res.json({ ok: true, releasedCount: count });
});

// Escrow top-up / deposit endpoint for contractors
app.post('/api/contractor/deposit-escrow', auth(['contractor']), (req, res) => {
  const amount = Number(req.body?.amount);
  if (!(amount > 0)) return res.status(400).json({ error: 'Deposit amount must be greater than 0.' });

  req.user.escrowBalance = (req.user.escrowBalance || 0) + amount;
  save();

  res.json({ ok: true, escrowBalance: req.user.escrowBalance });
});

// ---- Digital Wage Passport (Hero Feature) ----
app.get('/api/passport/:id', (req, res) => {
  const query = req.params.id.replace(/^kaamsetu:passport:/i, '').trim();
  const w = db.users.find((u) => (u.id === query || u.phone === query) && u.role === 'worker');
  if (!w) return res.status(404).json({ error: 'Worker passport not found.' });

  const completed = db.bookings.filter((b) => b.workerId === w.id && b.status === 'paid');
  const wagesFromBookings = completed.reduce((sum, b) => {
    const j = db.jobs.find((job) => job.id === b.jobId);
    return sum + (j?.wage || 700);
  }, 0);
  const totalWagesReceived = (w.baseEarnings || (Number(w.days || 0) * 700)) + wagesFromBookings;

  const reviews = db.bookings
    .filter((b) => b.workerId === w.id && b.rating)
    .slice(-6)
    .map((b) => {
      const j = db.jobs.find((job) => job.id === b.jobId);
      const c = j ? db.users.find((u) => u.id === j.contractorId) : null;
      return {
        stars: b.rating,
        comment: b.comment || 'Verified completed shift.',
        contractor: c?.name || 'Contractor',
        site: j?.site || 'Site',
        date: b.paidAt ? new Date(b.paidAt).toLocaleDateString() : 'Recent',
      };
    });

  const workHistory = completed.slice(-5).map((b) => {
    const j = db.jobs.find((job) => job.id === b.jobId);
    return {
      title: j?.title || 'Masonry work',
      site: j?.site || 'Site',
      wage: j?.wage || 700,
      paidAt: b.paidAt,
      payMethod: b.payMethod,
    };
  });

  res.json({
    ...pub(w),
    phone: w.consent ? w.phone : undefined,
    badges: badges(w),
    consent: !!w.consent,
    available: !!w.available,
    completedJobs: completed.length,
    totalWagesReceived,
    reviews,
    workHistory,
    trustScore: w.onTimePct || 96,
  });
});

// ---- Mukkadam: Crew Management & Fair Wage Split ----
app.get('/api/crew', auth(['mukkadam']), (req, res) => res.json(db.crew || []));

app.post('/api/crew', auth(['mukkadam']), (req, res) => {
  const { name, role, days, phone } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Worker name is required.' });

  const member = {
    id: uid('c'),
    name: name.trim(),
    role: role?.trim() || 'Helper',
    days: Number(days) || 1,
    present: true,
    phone: phone?.trim() || `98220${Math.floor(10000 + Math.random() * 90000)}`,
  };

  db.crew = db.crew || [];
  db.crew.push(member);
  save();

  res.status(201).json(member);
});

app.post('/api/crew/:id/toggle', auth(['mukkadam']), (req, res) => {
  const c = db.crew.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Crew member not found.' });
  c.present = !c.present;
  save();

  res.json(c);
});

// Fair wage split by role & days (PDF Feature 9)
app.post('/api/crew/split', auth(['mukkadam']), (req, res) => {
  const total = Number(req.body?.total);
  const mode = req.body?.mode || 'role_days'; // 'role_days' or 'equal'
  if (!(total > 0)) return res.status(400).json({ error: 'Please enter total lump-sum wage received (> 0).' });

  const present = (db.crew || []).filter((c) => c.present);
  if (!present.length) return res.status(400).json({ error: 'No crew members are currently marked present.' });

  if (mode === 'equal') {
    const share = Math.floor(total / present.length);
    const remainder = total - share * present.length;
    return res.json({
      mode: 'equal',
      total,
      share,
      remainder,
      shares: db.crew.map((c) => ({
        id: c.id,
        name: c.name,
        role: c.role || 'Worker',
        amount: c.present ? share : 0,
        present: c.present,
      })),
    });
  }

  // Fair weighted role formula
  const roleWeights = { Mason: 1.3, Electrician: 1.4, Plumber: 1.3, Painter: 1.2, Helper: 1.0 };
  const getWeight = (r) => roleWeights[r] || 1.0;

  const totalPoints = present.reduce((sum, c) => sum + getWeight(c.role) * (Number(c.days) || 1), 0);
  let distributed = 0;

  const shares = db.crew.map((c) => {
    if (!c.present) return { id: c.id, name: c.name, role: c.role || 'Worker', days: c.days || 1, amount: 0, present: false };
    const memberPoints = getWeight(c.role) * (Number(c.days) || 1);
    const amount = Math.floor((memberPoints / totalPoints) * total);
    distributed += amount;
    return { id: c.id, name: c.name, role: c.role || 'Worker', days: c.days || 1, amount, present: true };
  });

  const remainder = total - distributed;

  present.forEach((c) => {
    const s = shares.find((x) => x.id === c.id);
    if (s) {
      notify(c.phone || c.name, `Wage split receipt: ₹${s.amount} credited for ${c.role} (${c.days || 1} shifts)`, null, 'WhatsApp');
    }
  });

  save();
  res.json({ mode: 'role_days', total, distributed, remainder, shares });
});

app.get('/api/crew/jobs', auth(['mukkadam']), (req, res) => {
  db.crewJobs = db.crewJobs || [];
  res.json({
    jobs: db.jobs.map((j) => ({
      ...j,
      otp: undefined,
      booked: db.crewJobs.some((c) => c.jobId === j.id),
      contractor: pub(db.users.find((u) => u.id === j.contractorId)),
    })),
  });
});

app.post('/api/crew/book', auth(['mukkadam']), (req, res) => {
  const job = db.jobs.find((j) => j.id === req.body?.jobId);
  const size = (db.crew || []).filter((c) => c.present).length;
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  if (!size) return res.status(400).json({ error: 'Mark present crew members first.' });

  db.crewJobs = db.crewJobs || [];
  db.crewJobs.push({ id: uid('cj'), jobId: job.id, size, bookedAt: Date.now(), mukkadamId: req.user.id });
  notify(job.contractorId, `Crew of ${size} workers booked for ${job.title} by ${req.user.name}`);
  save();

  res.json({ ok: true, size });
});

// Contractor crew bookings list
app.get('/api/contractor/crew-bookings', auth(['contractor']), (req, res) => {
  const jobIds = db.jobs.filter((j) => j.contractorId === req.user.id).map((j) => j.id);
  const myCrewJobs = (db.crewJobs || []).filter((c) => jobIds.includes(c.jobId));
  res.json(
    myCrewJobs.map((c) => {
      const job = db.jobs.find((j) => j.id === c.jobId);
      const mukkadam = db.users.find((u) => u.id === c.mukkadamId);
      return { ...c, job, mukkadam: pub(mukkadam) };
    })
  );
});

// ---- Supporting Routes ----
app.get('/api/notifications', auth(), (req, res) => {
  db.notifs = db.notifs || [];
  res.json(
    db.notifs
      .filter((n) => n.to === req.user.id || (n.to === 'workers' && req.user.role === 'worker'))
      .sort((a, b) => b.at - a.at)
      .slice(0, 15)
  );
});

app.post('/api/availability', auth(['worker']), (req, res) => {
  req.user.available = !!req.body?.available;
  save();
  res.json({ available: req.user.available });
});

app.get('/api/workers/available', auth(['contractor', 'mukkadam']), (req, res) => {
  res.json(db.users.filter((u) => u.role === 'worker' && u.available).map(pub));
});

app.post('/api/profile', auth(['worker']), (req, res) => {
  if (req.body?.skill) req.user.skill = String(req.body.skill).slice(0, 30);
  if (req.body?.name) req.user.name = String(req.body.name).slice(0, 50);
  if (typeof req.body?.consent === 'boolean') req.user.consent = req.body.consent;
  save();
  res.json(req.user);
});

const MIN = {
  Mason: [750, 950],
  Helper: [550, 700],
  Painter: [700, 900],
  Plumber: [800, 1050],
  Electrician: [850, 1100],
};

app.get('/api/minwage', (req, res) => {
  const skill = req.query.skill || 'Mason';
  res.json({
    skill,
    range: MIN[skill] || [550, 750],
    source: 'Maharashtra Minimum Wage Notification (Zone 1 - Construction & Allied Trades)',
    overtimeRate: '1.5x regular wage beyond 8 hours',
    note: 'Government certified wage range. Workers should not accept less than ₹' + (MIN[skill]?.[0] || 550) + '/day.',
  });
});

app.post('/api/sos', auth(['worker']), (req, res) => {
  const activeBookings = db.bookings.filter(
    (b) => b.workerId === req.user.id && !['paid', 'cancelled'].includes(b.status)
  );

  if (activeBookings.length) {
    activeBookings.forEach((b) => {
      const j = db.jobs.find((job) => job.id === b.jobId);
      if (j) notify(j.contractorId, `🚨 SOS EMERGENCY from ${req.user.name} (${req.user.phone}) at ${j.site}!`, null, 'SMS');
    });
  } else {
    notify('contractors', `🚨 SOS EMERGENCY from ${req.user.name} (${req.user.phone})!`, null, 'SMS');
  }
  save();

  res.json({ ok: true, alertSent: true });
});

app.get('/api/analytics', auth(['contractor']), (req, res) => {
  const jobIds = db.jobs.filter((j) => j.contractorId === req.user.id).map((j) => j.id);
  const bk = db.bookings.filter((b) => jobIds.includes(b.jobId));
  const wage = (b) => db.jobs.find((j) => j.id === b.jobId)?.wage || 0;
  db.crewJobs = db.crewJobs || [];

  res.json({
    jobs: jobIds.length,
    active: bk.filter((b) => !['paid', 'cancelled'].includes(b.status)).length,
    completed: bk.filter((b) => b.status === 'paid').length,
    escrowHeld: bk.filter((b) => b.funded && b.status !== 'paid').reduce((s, b) => s + wage(b), 0),
    paidOut: bk.filter((b) => b.status === 'paid').reduce((s, b) => s + wage(b), 0),
    claims: bk.filter((b) => b.claim).length,
    crewBooked: db.crewJobs.filter((c) => jobIds.includes(c.jobId)).reduce((s, c) => s + c.size, 0),
    escrowBalance: req.user.escrowBalance || 25000,
    chartData: [
      { day: 'Mon', workers: 4, wagePaid: 2800, escrow: 700 },
      { day: 'Tue', workers: 5, wagePaid: 3500, escrow: 700 },
      { day: 'Wed', workers: 6, wagePaid: 4200, escrow: 1400 },
      { day: 'Thu', workers: 5, wagePaid: 3500, escrow: 700 },
      { day: 'Fri', workers: 7, wagePaid: 4900, escrow: 2100 },
      { day: 'Sat', workers: 6, wagePaid: 4200, escrow: 1400 },
      { day: 'Sun', workers: 3, wagePaid: 2100, escrow: 0 },
    ],
  });
});

app.post('/api/verify', auth(['contractor']), (req, res) => {
  req.user.verified = true;
  save();
  res.json(req.user);
});

// Demo Data Reset
app.post('/api/reset', (req, res) => {
  db = seed();
  save();
  res.json({ ok: true, message: 'Data reset to initial seed state.' });
});

app.get('/api/health', (req, res) => res.json({ ok: true, version: 3 }));

// Serve production static assets from client/dist if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Custom Error Middleware
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
  }
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => console.log(`KaamSetu API running on http://localhost:${PORT}`));
