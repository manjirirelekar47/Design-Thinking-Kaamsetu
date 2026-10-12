// Test every endpoint of KaamSetu API
const BASE = 'http://localhost:5000/api';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE API TEST ---');
  let passCount = 0;
  let failCount = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${title} ${extra}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${title} ${extra}`);
      failCount++;
    }
  }

  // 1. Health check
  const health = await req('/health');
  assert('GET /api/health', health.ok && health.data.ok === true, JSON.stringify(health.data));

  // 2. Reset demo data
  const reset = await req('/reset', { method: 'POST' });
  assert('POST /api/reset', reset.ok, JSON.stringify(reset.data));

  // 3. Auth logins for all 3 roles
  const wLogin = await req('/auth/login', { method: 'POST', body: { phone: '9000000001', otp: '1234' } });
  assert('Login Worker (9000000001)', wLogin.ok && wLogin.data.user.role === 'worker', wLogin.data.user?.name);
  const wToken = wLogin.data.token;

  const cLogin = await req('/auth/login', { method: 'POST', body: { phone: '9000000002', otp: '1234' } });
  assert('Login Contractor (9000000002)', cLogin.ok && cLogin.data.user.role === 'contractor', cLogin.data.user?.name);
  const cToken = cLogin.data.token;

  const mLogin = await req('/auth/login', { method: 'POST', body: { phone: '9000000003', otp: '1234' } });
  assert('Login Mukkadam (9000000003)', mLogin.ok && mLogin.data.user.role === 'mukkadam', mLogin.data.user?.name);
  const mToken = mLogin.data.token;

  // 4. Invalid Login tests
  const badOtp = await req('/auth/login', { method: 'POST', body: { phone: '9000000001', otp: '9999' } });
  assert('Login Bad OTP returns 401', badOtp.status === 401);

  const unknownPhone = await req('/auth/login', { method: 'POST', body: { phone: '9999999999', otp: '1234' } });
  assert('Login Unknown Phone returns 404', unknownPhone.status === 404);

  // 5. GET /api/me
  const me = await req('/me', { token: wToken });
  assert('GET /api/me (worker)', me.ok && me.data.id === 'u1');

  // 6. Voice onboarding (PDF Feature 2)
  const voice = await req('/auth/voice-onboard', {
    method: 'POST',
    body: { name: 'Santosh Pawar', skill: 'Painter', phone: '9000000009', area: 'Kothrud, Pune', language: 'mr' },
  });
  assert('POST /api/auth/voice-onboard', voice.ok && voice.data.user.name === 'Santosh Pawar', voice.data.user?.skill);

  // 7. GET /api/jobs
  const wJobs = await req('/jobs', { token: wToken });
  assert('GET /api/jobs (worker)', wJobs.ok && Array.isArray(wJobs.data) && wJobs.data.length >= 2, `Count: ${wJobs.data?.length}`);

  const cJobs = await req('/jobs', { token: cToken });
  assert('GET /api/jobs (contractor)', cJobs.ok && Array.isArray(cJobs.data), `Contractor jobs: ${cJobs.data?.length}`);

  // 8. Contractor posts new job
  const newJob = await req('/jobs', {
    method: 'POST',
    token: cToken,
    body: { title: 'Tiling specialist', site: 'Kalyani Nagar', wage: 850, workersNeeded: 2, duration: '2 days' },
  });
  assert('POST /api/jobs (post job)', newJob.ok && newJob.data.wage === 850, `Job ID: ${newJob.data?.id}`);
  const testJobId = newJob.data.id;
  const testJobOtp = newJob.data.otp;

  // 9. Full Flow:
  // Flow step 1: Worker accepts job
  const acceptRes = await req(`/jobs/${testJobId}/accept`, { method: 'POST', token: wToken });
  assert('POST /api/jobs/:id/accept', acceptRes.ok && acceptRes.data.status === 'accepted', `Booking ID: ${acceptRes.data?.id}`);
  const bookingId = acceptRes.data.id;

  // Flow step 2: Contractor pre-funds escrow
  const fundRes = await req(`/bookings/${bookingId}/fund`, { method: 'POST', token: cToken });
  assert('POST /api/bookings/:id/fund (escrow pre-fund)', fundRes.ok && fundRes.data.funded === true);

  // Flow step 3: Worker check-in with OTP (and test prefix stripping)
  const checkinWithPrefix = await req(`/bookings/${bookingId}/checkin`, {
    method: 'POST',
    token: wToken,
    body: { otp: `kaamsetu:site:${testJobOtp}`, gps: { lat: 18.552, lng: 73.901 } },
  });
  assert('POST /api/bookings/:id/checkin (QR/OTP check-in)', checkinWithPrefix.ok && checkinWithPrefix.data.status === 'checked_in');

  // Flow step 4: Worker ends shift
  const checkoutRes = await req(`/bookings/${bookingId}/checkout`, { method: 'POST', token: wToken });
  assert('POST /api/bookings/:id/checkout (end shift)', checkoutRes.ok && checkoutRes.data.status === 'completed');

  // Flow step 5: Set payout method
  const payMethodRes = await req(`/bookings/${bookingId}/paymethod`, { method: 'POST', token: wToken, body: { method: 'UPI' } });
  assert('POST /api/bookings/:id/paymethod', payMethodRes.ok && payMethodRes.data.payMethod === 'UPI');

  // Flow step 6: Contractor releases payment
  const initialDays = wLogin.data.user.days;
  const releaseRes = await req(`/bookings/${bookingId}/release`, { method: 'POST', token: cToken });
  assert('POST /api/bookings/:id/release (wage release)', releaseRes.ok && releaseRes.data.status === 'paid');

  // Flow step 7: Worker passport updated
  const passportRes = await req(`/passport/u1`);
  assert(
    'GET /api/passport/:id (Wage Passport updated)',
    passportRes.ok && passportRes.data.days === initialDays + 1 && passportRes.data.totalWagesReceived > 0,
    `Days: ${passportRes.data.days}, Wages: ₹${passportRes.data.totalWagesReceived}`
  );

  // Flow step 8: Ratings
  const rateWorker = await req(`/bookings/${bookingId}/rate`, {
    method: 'POST',
    token: cToken,
    body: { stars: 5, comment: 'Excellent tiling work, very clean and timely.' },
  });
  assert('POST /api/bookings/:id/rate (rate worker)', rateWorker.ok && rateWorker.data.rating === 5);

  const rateContractor = await req(`/bookings/${bookingId}/rate-contractor`, {
    method: 'POST',
    token: wToken,
    body: { stars: 5, comment: 'Quick escrow release and polite behaviour.' },
  });
  assert('POST /api/bookings/:id/rate-contractor (rate contractor trust)', rateContractor.ok && rateContractor.data.contractorRating === 5);

  // 10. Instant Payout (PDF Feature 1 & 2.5)
  const instantRes = await req(`/bookings/${bookingId}/instant`, { method: 'POST', token: wToken });
  assert('POST /api/bookings/:id/instant (instant payout)', instantRes.ok && instantRes.data.instant === true);

  // 11. Cancellation compensation flow (PDF Feature 10)
  // Create another job, accept, then cancel
  const jobToCancel = await req('/jobs', { method: 'POST', token: cToken, body: { title: 'Demolition helper', site: 'Aundh', wage: 600 } });
  const acceptToCancel = await req(`/jobs/${jobToCancel.data.id}/accept`, { method: 'POST', token: wToken });
  const cancelRes = await req(`/bookings/${acceptToCancel.data.id}/cancel`, { method: 'POST', token: cToken });
  assert('POST /api/bookings/:id/cancel (₹150 cancellation compensation)', cancelRes.ok && cancelRes.data.status === 'cancelled' && cancelRes.data.compensation === 150);

  // 12. Wage Claim / dispute flow (PDF Feature 5)
  const claimJob = await req('/jobs', { method: 'POST', token: cToken, body: { title: 'Painting master', site: 'Kothrud', wage: 750 } });
  const claimAccept = await req(`/jobs/${claimJob.data.id}/accept`, { method: 'POST', token: wToken });
  const claimRes = await req(`/bookings/${claimAccept.data.id}/claim`, { method: 'POST', token: wToken, body: { reason: 'Shift completed 3 days ago, wages not released.' } });
  assert('POST /api/bookings/:id/claim (wage dispute claim)', claimRes.ok && claimRes.data.claim === true);

  // 13. Mukkadam Crew & Split (PDF Feature 9 & 2.7)
  const crewList = await req('/crew', { token: mToken });
  assert('GET /api/crew (crew list)', crewList.ok && Array.isArray(crewList.data) && crewList.data.length >= 4);

  const toggleCrew = await req(`/crew/${crewList.data[0].id}/toggle`, { method: 'POST', token: mToken });
  assert('POST /api/crew/:id/toggle (crew attendance)', toggleCrew.ok);

  const addCrew = await req('/crew', { method: 'POST', token: mToken, body: { name: 'Balu Shinde', role: 'Painter', days: 5 } });
  assert('POST /api/crew (add crew member)', addCrew.ok && addCrew.data.name === 'Balu Shinde');

  // Test split modes
  const equalSplit = await req('/crew/split', { method: 'POST', token: mToken, body: { total: 3000, mode: 'equal' } });
  assert('POST /api/crew/split (equal mode)', equalSplit.ok && equalSplit.data.share > 0);

  const fairSplit = await req('/crew/split', { method: 'POST', token: mToken, body: { total: 4500, mode: 'role_days' } });
  assert('POST /api/crew/split (role & days fair mode)', fairSplit.ok && Array.isArray(fairSplit.data.shares));

  const crewJobs = await req('/crew/jobs', { token: mToken });
  assert('GET /api/crew/jobs', crewJobs.ok && Array.isArray(crewJobs.data.jobs));

  const bookCrew = await req('/crew/book', { method: 'POST', token: mToken, body: { jobId: claimJob.data.id } });
  assert('POST /api/crew/book (book whole crew)', bookCrew.ok && bookCrew.data.size > 0);

  // 14. Availability & Naka Check-in (PDF Feature 16)
  const availRes = await req('/availability', { method: 'POST', token: wToken, body: { available: true } });
  assert('POST /api/availability (naka check-in)', availRes.ok && availRes.data.available === true);

  const workersAtNaka = await req('/workers/available', { token: cToken });
  assert('GET /api/workers/available', workersAtNaka.ok && Array.isArray(workersAtNaka.data));

  // 15. Minimum wage checker (PDF Feature 11)
  const minWage = await req('/minwage?skill=Mason');
  assert('GET /api/minwage', minWage.ok && minWage.data.range[0] >= 500, `Range: ₹${minWage.data.range[0]}-${minWage.data.range[1]}`);

  // 16. Emergency SOS (PDF Feature 13)
  const sosRes = await req('/sos', { method: 'POST', token: wToken });
  assert('POST /api/sos (safety SOS alert)', sosRes.ok && sosRes.data.alertSent === true);

  // 17. Contractor Analytics & One-Click Wage Release (PDF Feature 17)
  const analytics = await req('/analytics', { token: cToken });
  assert('GET /api/analytics', analytics.ok && analytics.data.jobs > 0 && Array.isArray(analytics.data.chartData));

  const releaseAll = await req('/bookings/release-all', { method: 'POST', token: cToken });
  assert('POST /api/bookings/release-all (one-click wage release)', releaseAll.ok);

  // 18. Notifications
  const notifs = await req('/notifications', { token: wToken });
  assert('GET /api/notifications', notifs.ok && Array.isArray(notifs.data) && notifs.data.length > 0);

  // 19. Contractor verification
  const verifyRes = await req('/verify', { method: 'POST', token: cToken });
  assert('POST /api/verify', verifyRes.ok && verifyRes.data.verified === true);

  console.log(`\n================================`);
  console.log(`TOTAL TESTS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log(`================================`);

  if (failCount > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('Test script crashed:', e);
  process.exit(1);
});
