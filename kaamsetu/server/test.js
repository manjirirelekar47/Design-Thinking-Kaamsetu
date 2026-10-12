// KaamSetu End-to-End Test Suite
// Verifies JWT auth, role protection, strict state machine, ownership checks, escrow balance, and lifecycle.

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

async function run() {
  console.log('=====================================================');
  console.log('   KAAMSETU END-TO-END VERIFICATION TEST SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  // 1. Health & Reset
  const health = await req('/health');
  test('API Health Check', health.ok && health.data.version === 3);

  const reset = await req('/reset', { method: 'POST' });
  test('Demo Seed Reset', reset.ok);

  // 2. Auth for all three roles
  const wLogin = await req('/auth/login', { method: 'POST', body: { phone: '9000000001', otp: '1234' } });
  test('Worker Login (9000000001)', wLogin.ok && wLogin.data.user.role === 'worker');
  const wToken = wLogin.data.token;
  const wId = wLogin.data.user.id;

  const cLogin = await req('/auth/login', { method: 'POST', body: { phone: '9000000002', otp: '1234' } });
  test('Contractor Login (9000000002)', cLogin.ok && cLogin.data.user.role === 'contractor');
  const cToken = cLogin.data.token;

  const mLogin = await req('/auth/login', { method: 'POST', body: { phone: '9000000003', otp: '1234' } });
  test('Mukkadam Login (9000000003)', mLogin.ok && mLogin.data.user.role === 'mukkadam');
  const mToken = mLogin.data.token;

  // 3. Role Protection Verification
  const workerPostJob = await req('/jobs', {
    method: 'POST',
    token: wToken,
    body: { title: 'Unauthorized', site: 'Site', wage: 500 },
  });
  test('Role Protection: Worker cannot post jobs (HTTP 403)', workerPostJob.status === 403);

  const contractorAcceptJob = await req('/jobs/j1/accept', { method: 'POST', token: cToken });
  test('Role Protection: Contractor cannot accept jobs (HTTP 403)', contractorAcceptJob.status === 403);

  // 4. Contractor Job Posting with Escrow Balance
  const initContractor = await req('/me', { token: cToken });
  const initEscrow = initContractor.data.escrowBalance || 25000;

  const jobPost = await req('/jobs', {
    method: 'POST',
    token: cToken,
    body: {
      title: 'Senior Mason Lead',
      site: 'Baner Tech Park',
      wage: 800,
      workersNeeded: 1,
      duration: '1 day',
      escrowFunded: true,
    },
  });
  test('Contractor Posts Job with Pre-funded Escrow', jobPost.ok && jobPost.data.escrowFunded === true);
  const jobId = jobPost.data.id;
  const jobOtp = jobPost.data.otp;

  // Verify escrow deducted
  const postContractor = await req('/me', { token: cToken });
  test('Escrow Balance Deducted', postContractor.data.escrowBalance === initEscrow - 800);

  // 5. Worker Accepts Job
  const acceptRes = await req(`/jobs/${jobId}/accept`, { method: 'POST', token: wToken });
  test('Worker Accepts Job', acceptRes.ok && acceptRes.data.status === 'accepted' && acceptRes.data.funded === true);
  const bookingId = acceptRes.data.id;

  // 6. Strict State Machine Transition Checks (Rejects Invalid Transitions with HTTP 400)
  const invalidCheckout = await req(`/bookings/${bookingId}/checkout`, { method: 'POST', token: wToken });
  test(
    'State Machine: Cannot checkout before check-in (HTTP 400)',
    invalidCheckout.status === 400 && invalidCheckout.data.error.includes('Invalid transition')
  );

  const invalidRelease = await req(`/bookings/${bookingId}/release`, { method: 'POST', token: cToken });
  test(
    'State Machine: Cannot release before shift completion (HTTP 400)',
    invalidRelease.status === 400 && invalidRelease.data.error.includes('Invalid transition')
  );

  // 7. Ownership Protection Checks
  // Register another worker
  const w2Reg = await req('/auth/voice-onboard', {
    method: 'POST',
    body: { name: 'Kiran Pawar', skill: 'Helper', phone: '9000000088', area: 'Wakad' },
  });
  const w2Token = w2Reg.data.token;

  const unauthorizedCheckin = await req(`/bookings/${bookingId}/checkin`, {
    method: 'POST',
    token: w2Token,
    body: { otp: jobOtp },
  });
  test(
    'Ownership Protection: Worker 2 cannot check in for Worker 1 (HTTP 403)',
    unauthorizedCheckin.status === 403 && unauthorizedCheckin.data.error.includes('Forbidden')
  );

  // 8. Valid Check-in Flow: accepted -> checked_in
  const validCheckin = await req(`/bookings/${bookingId}/checkin`, {
    method: 'POST',
    token: wToken,
    body: { otp: `kaamsetu:site:${jobOtp}`, gps: { lat: 18.559, lng: 73.7868 } },
  });
  test('Worker Valid Check-in with Site OTP & GPS', validCheckin.ok && validCheckin.data.status === 'checked_in');

  // Verify cannot check in twice
  const doubleCheckin = await req(`/bookings/${bookingId}/checkin`, {
    method: 'POST',
    token: wToken,
    body: { otp: jobOtp },
  });
  test('State Machine: Cannot re-check in from checked_in (HTTP 400)', doubleCheckin.status === 400);

  // 9. Valid Checkout Flow: checked_in -> completed
  const validCheckout = await req(`/bookings/${bookingId}/checkout`, { method: 'POST', token: wToken });
  test('Worker End Shift -> Status "completed"', validCheckout.ok && validCheckout.data.status === 'completed');

  // 10. Valid Release Flow: completed -> paid
  const prevDays = wLogin.data.user.days;
  const releaseRes = await req(`/bookings/${bookingId}/release`, { method: 'POST', token: cToken });
  test('Contractor Releases Wage -> Status "paid"', releaseRes.ok && releaseRes.data.status === 'paid');

  // 11. Worker Wage Passport Update Check
  const passportRes = await req(`/passport/${wId}`);
  test(
    'Wage Passport Days Incremented & Total Wages Verified',
    passportRes.ok && passportRes.data.days === prevDays + 1 && passportRes.data.totalWagesReceived > 0,
    `Days: ${passportRes.data.days}, Wages: ₹${passportRes.data.totalWagesReceived}`
  );

  // 12. Rating System
  const rateWorker = await req(`/bookings/${bookingId}/rate`, {
    method: 'POST',
    token: cToken,
    body: { stars: 5, comment: 'Punctual and very neat finish.' },
  });
  test('Contractor Rates Worker Performance', rateWorker.ok && rateWorker.data.rating === 5);

  const rateContractor = await req(`/bookings/${bookingId}/rate-contractor`, {
    method: 'POST',
    token: wToken,
    body: { stars: 5, comment: 'Immediate escrow release, great contractor.' },
  });
  test('Worker Rates Contractor Trust Score', rateContractor.ok && rateContractor.data.contractorRating === 5);

  // 13. Mukkadam: Attendance, Booking, and Fair Split
  const crewList = await req('/crew', { token: mToken });
  test('Mukkadam Crew List Fetched', crewList.ok && crewList.data.length >= 4);

  const toggleCrew = await req(`/crew/${crewList.data[0].id}/toggle`, { method: 'POST', token: mToken });
  test('Mukkadam Toggles Crew Attendance', toggleCrew.ok);

  const fairSplit = await req('/crew/split', {
    method: 'POST',
    token: mToken,
    body: { total: 4200, mode: 'role_days' },
  });
  test('Mukkadam Fair Wage Split (by Role & Days)', fairSplit.ok && fairSplit.data.shares?.length > 0);

  // 14. Emergency Safety SOS
  const sos = await req('/sos', { method: 'POST', token: wToken });
  test('Worker Safety SOS Emergency Broadcast', sos.ok && sos.data.alertSent === true);

  // 15. Contractor Analytics Dashboard
  const analytics = await req('/analytics', { token: cToken });
  test('Contractor Analytics & Chart Data Available', analytics.ok && analytics.data.chartData?.length === 7);

  console.log('\n=====================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('=====================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Test runner encountered error:', e);
  process.exit(1);
});
