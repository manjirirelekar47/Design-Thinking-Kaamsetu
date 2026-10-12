import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const translations = {
  en: {
    // Navigation & Common
    homeJobs: 'Home / Jobs',
    attendance: 'Attendance',
    wageTracker: 'Wage Tracker',
    wagePassport: 'Wage Passport',
    crewList: 'Crew List',
    groupJobs: 'Group Jobs',
    crewAttendance: 'Crew Attendance',
    wageSplitter: 'Wage Splitter',
    dashboard: 'Dashboard',
    verification: 'Passport Verify',
    activeSites: 'Active Sites',
    
    hello: 'Hello',
    logout: 'Log out',
    resetDemo: 'Reset Demo',
    offlineNotice: 'Offline - Showing saved data. Reconnects automatically.',
    listen: 'Listen',
    verified: 'Verified',
    unverified: 'Unverified',
    simulated: 'Simulated',
    
    // Worker actions & UI
    availableAtNaka: 'I am available at Naka today',
    availableDesc: 'Contractors nearby can hire you directly on live map',
    availableDescOff: 'Toggle to broadcast availability at local labour chowk',
    jobAlerts: 'Available Job Alerts',
    dailyWageRate: 'Guaranteed Daily Wage',
    perShift: '/ 8-hr shift',
    acceptJob: 'Accept Job',
    accepted: 'Accepted',
    headToSite: 'Job Accepted — Head to Site',
    checkIn: 'Check In (Site OTP / QR)',
    checkedIn: 'Checked In',
    endShift: 'Complete Shift',
    completed: 'Shift Finished',
    paid: 'Wage Paid',
    enterSiteOtp: 'Enter 4-digit Site OTP or scan QR',
    siteVerification: 'Site Code Verification',
    useOtp: 'Use',
    shiftActive: 'Shift Active',
    shiftFinished: 'Shift Completed',
    awaitingRelease: 'Awaiting Contractor Release',
    wageSettled: 'Wage Settled & Released',
    timelineTitle: 'Settlement Timeline',
    workDone: 'Work Done',
    verifiedInEscrow: 'Verified in Escrow',
    payoutMethod: 'Payout Method (Simulated)',
    confirmCashReceipt: 'Confirm Cash Handed Over',
    instantPayout: 'Instant Payout (UPI)',
    rateContractor: 'Rate Contractor Trust',
    rateContractorPrompt: 'Rate Contractor Trust:',
    raiseClaim: 'Wage Late? Raise Claim with Attendance Proof',
    raiseClaimPrompt: 'Wage Overdue? Raise Claim / Dispute',
    claimRaised: 'Claim Raised: Pending Resolution',
    officialPassport: 'Digital Wage Passport',
    officialCredential: 'Official Portable Credential',
    daysWorked: 'Days Worked',
    wagesSecured: 'Wages Secured',
    trustRating: 'Rating',
    safetyProtocol: 'Start-of-Day Safety Check-in',
    safetyDesc: 'Protective gear protocol before starting tools',
    sosAlert: '🚨 SOS EMERGENCY — BROADCAST DISTRESS (Simulated)',
    shareWhatsApp: 'Share on WhatsApp',
    missedCallAlerts: 'Missed-Call & WhatsApp Job Alerts',
    buttonPhoneWorks: 'Works on basic button phone (Simulated)',
    verifiedBadges: 'Verified Trust Badges',

    // Mukkadam actions & UI
    squadManagement: 'Crew Squad Management',
    squadReadiness: 'Manage members and squad work readiness',
    squadAvailability: 'Squad Naka Availability',
    addWorker: '+ Add Worker to Squad',
    groupJobsTitle: 'Group Crew Jobs',
    bookForCrew: 'Accept for Crew',
    crewAttendanceTitle: 'Daily Crew Attendance',
    markAllPresent: 'Mark All Present',
    markAllAbsent: 'Mark All Absent',
    present: 'Present',
    absent: 'Absent',
    wageSplitterTitle: 'Crew Wage-Split Calculator',
    wageSplitterDesc: 'Transparent, dispute-free daily wage distribution for your crew',
    lumpSumWage: 'Total Lump-Sum Wage Received from Builder (₹)',
    distributionFormula: 'Distribution Formula',
    weightedSplit: '⚖️ Role + Experience Multiplier',
    equalSplit: '🟰 Equal Split (1/N)',
    computeDistribution: 'Compute Fair Distribution',
    remainderBuffer: 'remainder buffer',

    // Contractor actions & UI
    dashboardTab: '1. Dashboard & Post Job',
    verificationTab: '2. Passport Verification',
    activeSitesTab: '3. Active Sites & Wages',
    escrowBalance: 'Escrow Balance',
    topUp: '+ Top Up',
    activeOnSite: 'Active Workers on Site',
    jobsSettled: 'Jobs Settled',
    postJobTitle: 'Easy "Post a Job" Form',
    postJobButton: '📢 Post Job & Alert Workers',
    scannerTitle: 'Wage Passport QR Scanner',
    simulateScan: 'Simulate Camera Scan (Worker Ramesh u1)',
    verify: 'Verify',
    activeSitesTitle: 'Active Sites & Wage Approvals',
    oneClickReleaseAll: '⚡ 1-Click Release All',
    approveRelease: 'Approve & Release',
    cancelPenalty: 'Cancel Shift (₹150 penalty compensation)',
    
    // Pain points
    ppWageProtection: 'Pre-funded Escrow: Guaranteed daily wage',
    ppVoiceFirst: 'Voice & Large Icon UI: No typing required',
    ppPassport: 'Digital Wage Passport: Portable proof of work',
    ppNakaVisibility: 'Naka Check-in: Get hired without standing hours at chowk',
    ppCancellation: 'Late Cancel Protection: Automatic ₹150 compensation',

    // Additional UI & helper strings
    attendanceTracking: 'Site Attendance & Shift Tracking',
    wageDueToday: 'Wage Due: Today 6:00 PM',
    goToAttendance: 'Go to Attendance to Check In 📍',
    trackSettlement: '📈 Track Settlement in Wage Tracker',
    viewUpdatedPassport: '🪪 View Updated Wage Passport ID',
    noOpenJobs: 'No open jobs right now',
    noOpenJobsDesc: 'Turn on your Naka availability toggle above to receive priority broadcasts.',
    noActiveBookings: 'No active bookings to check in',
    noActiveBookingsDesc: 'Go to Home/Jobs and accept a job first to start working.',
    noWageRecords: 'No wage records yet',
    noWageRecordsDesc: 'Accept and complete shifts to track daily wage settlements.',
    scanQr: 'Scan QR (Simulated)',
    contractorQrScan: 'Contractor Instant QR Verification',
    primaryTrade: 'Primary Trade',
    passportDesc: 'Portable, tamper-proof record of verified attendance, collected wages, and contractor ratings. Scannable at any construction site.',
    updateTradeSkill: 'Update Trade Skill',
    dataPrivacy: 'Consent & Data Privacy',
    privacyDesc: 'Contractors only see verified shift counts and ratings when you show your QR code. Your personal phone and address remain confidential.',
    earnedBadges: 'Earned Skill Badges',
    voiceOnboarding: 'Voice-First Onboarding',
    voiceOnboardingDesc: 'Speak in Marathi or Hindi — Zero typing needed',
    oneTapDemo: '1-Tap Demo Roles (OTP: 1234)',
    mobileNumber: 'Mobile Number',
    smsOtp: 'SMS OTP (Demo: 1234)',
    enterPlatform: 'Enter Platform →',
    loggingIn: 'Logging In...',
    worker: 'Worker',
    contractor: 'Contractor',
    mukkadam: 'Mukkadam',
    totalSquadDailyWage: 'Total Squad Daily Wage',
    perWorker: 'per worker',
    acceptForCrewCount: 'Accept for Crew',
    crewBookedConfirmed: '✓ Crew Booked & Confirmed',
    whatsappReceiptsBroadcast: 'Broadcast Split Receipts via WhatsApp',
    whatsappReceiptsDispatched: '✓ WhatsApp Receipts Dispatched to Squad',
    calculatedDistribution: 'Calculated Distribution',
    totalAcrossPresentCrew: 'Total across present crew',
    statEscrowSubtitle: 'Guaranteed funds locked',
    statWorkersSubtitle: 'Punched in via GPS / OTP',
    statSettledSubtitle: 'Direct bank / UPI transfers',
    weeklyEscrowActivity: 'Weekly Escrow Activity (₹ Thousands)',
    recentJobsOverview: 'Recent Jobs Overview',
    viewPassportPill: 'View Digital Wage Passport',
    verifyGstCheck: '🛡️ Verify Business (GST Check)',
    verifiedBuilderAccount: 'Verified Builder Account (GST Active)',
    unverifiedContractorAccount: 'Unverified Contractor Account',
    unverifiedDesc: 'Verify GST and trade registration credentials to unlock lower escrow thresholds and worker trust.',
    rateWorkerPrompt: 'Rate Worker Trust:',
    cashHandoverAck: 'Confirm Cash Handover',
  },
  hi: {
    // Navigation & Common
    homeJobs: 'होम / काम',
    attendance: 'हाजिरी',
    wageTracker: 'मजदूरी ट्रैकर',
    wagePassport: 'वेज पासपोर्ट',
    crewList: 'टोली सूची',
    groupJobs: 'टोली काम',
    crewAttendance: 'टोली हाजिरी',
    wageSplitter: 'मजदूरी बंटवारा',
    dashboard: 'डैशबोर्ड',
    verification: 'पासपोर्ट जांच',
    activeSites: 'साइट्स और मजदूरी',
    
    hello: 'नमस्ते',
    logout: 'लॉग आउट',
    resetDemo: 'डेमो रीसेट',
    offlineNotice: 'ऑफलाइन मोड - सुरक्षित पुराना डेटा दिखाया जा रहा है।',
    listen: 'बोलकर सुनें',
    verified: 'प्रमाणित',
    unverified: 'गैर-प्रमाणित',
    simulated: 'सिम्युलेटेड',
    
    // Worker actions & UI
    availableAtNaka: 'मैं आज नाके पर काम के लिए उपलब्ध हूँ',
    availableDesc: 'आसपास के ठेकेदार आपको सीधे लाइव मैप पर काम पर रख सकते हैं',
    availableDescOff: 'चौक पर उपलब्धता दिखाने के लिए चालू करें',
    jobAlerts: 'उपलब्ध काम अलर्ट',
    dailyWageRate: 'पक्की दैनिक मजदूरी',
    perShift: '/ 8 घंटे की शिफ्ट',
    acceptJob: 'काम स्वीकारें',
    accepted: 'स्वीकार कर लिया',
    headToSite: 'काम स्वीकार किया — साइट पर जाएं',
    checkIn: 'हाजिरी लगाएं (OTP / QR)',
    checkedIn: 'हाजिरी दर्ज',
    endShift: 'काम समाप्त (शिफ्ट खत्म)',
    completed: 'काम पूरा हुआ',
    paid: 'मजदूरी मिल गई',
    enterSiteOtp: 'साइट का 4-अंकों का OTP दर्ज करें',
    siteVerification: 'साइट कोड सत्यापन',
    useOtp: 'उपयोग करें',
    shiftActive: 'काम चालू है',
    shiftFinished: 'काम पूरा हुआ',
    awaitingRelease: 'ठेकेदार भुगतान की प्रतीक्षा',
    wageSettled: 'मजदूरी खाते में जमा',
    timelineTitle: 'भुगतान प्रक्रिया',
    workDone: 'काम पूरा',
    verifiedInEscrow: 'एस्क्रो में सुरक्षित',
    payoutMethod: 'भुगतान का तरीका (सिम्युलेटेड)',
    confirmCashReceipt: 'नकद मिलने की पुष्टि करें',
    instantPayout: 'तुरंत बैंक / UPI में भेजें',
    rateContractor: 'ठेकेदार का भरोसा स्कोर दें',
    rateContractorPrompt: 'ठेकेदार का भरोसा स्कोर दें:',
    raiseClaim: 'मजदूरी में देरी? हाजिरी सबूत के साथ क्लेम करें',
    raiseClaimPrompt: 'मजदूरी में देरी? शिकायत / क्लेम दर्ज करें',
    claimRaised: 'शिकायत दर्ज: समीक्षा में',
    officialPassport: 'डिजिटल वेज पासपोर्ट',
    officialCredential: 'आधिकारिक डिजिटल प्रमाण',
    daysWorked: 'काम के दिन',
    wagesSecured: 'प्राप्त मजदूरी',
    trustRating: 'रेटिंग',
    safetyProtocol: 'काम से पहले सुरक्षा जांच',
    safetyDesc: 'काम शुरू करने से पहले सुरक्षा उपकरण पहनें',
    sosAlert: '🚨 आपातकालीन मदद (SOS) — तुरंत संदेश भेजें (सिम्युलेटेड)',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    missedCallAlerts: 'मिस्ड-कॉल और व्हाट्सएप जॉब अलर्ट',
    buttonPhoneWorks: 'सादे बटन वाले फोन पर भी काम करता है (सिम्युलेटेड)',
    verifiedBadges: 'सत्यापित विश्वास बैज',

    // Mukkadam actions & UI
    squadManagement: 'टोली मजदूर प्रबंधन',
    squadReadiness: 'मजदूरों की सूची और काम की तैयारी',
    squadAvailability: 'टोली नाका उपलब्धता',
    addWorker: '+ टोली में नया मजदूर जोड़ें',
    groupJobsTitle: 'सामूहिक टोली काम',
    bookForCrew: 'पूरी टोली के लिए स्वीकारें',
    crewAttendanceTitle: 'दैनिक टोली हाजिरी',
    markAllPresent: 'सभी को उपस्थित करें',
    markAllAbsent: 'सभी को अनुपस्थित करें',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    wageSplitterTitle: 'टोली मजदूरी बंटवारा कैलकुलेटर',
    wageSplitterDesc: 'अपनी टोली के लिए पारदर्शी और बिना विवाद का दैनिक मजदूरी बंटवारा',
    lumpSumWage: 'ठेकेदार से मिली कुल मजदूरी (₹)',
    distributionFormula: 'बंटवारा सूत्र',
    weightedSplit: '⚖️ काम और अनुभव अनुसार',
    equalSplit: '🟰 बराबर बंटवारा (1/N)',
    computeDistribution: 'उचित बंटवारा गणना करें',
    remainderBuffer: 'बकाया शेष बफर',

    // Contractor actions & UI
    dashboardTab: '1. डैशबोर्ड और काम पोस्ट करें',
    verificationTab: '2. पासपोर्ट जांच',
    activeSitesTab: '3. सक्रिय साइट्स और भुगतान',
    escrowBalance: 'एस्क्रो सुरक्षित जमा',
    topUp: '+ पैसे जोड़ें',
    activeOnSite: 'साइट पर उपस्थित मजदूर',
    jobsSettled: 'भुगतान किए गए काम',
    postJobTitle: 'आसान "काम पोस्ट" फॉर्म',
    postJobButton: '📢 काम पोस्ट करें और मजदूरों को अलर्ट भेजें',
    scannerTitle: 'वेज पासपोर्ट QR स्कैनर',
    simulateScan: 'कैमरा स्कैन सिम्युलेट करें (रमेश u1)',
    verify: 'जांचें',
    activeSitesTitle: 'सक्रिय साइट्स और मजदूरी मंजूरी',
    oneClickReleaseAll: '⚡ 1-क्लिक में सबका भुगतान करें',
    approveRelease: 'मंजूर करें और भेजें',
    cancelPenalty: 'काम रद्द करें (₹150 मुआवजा जुर्माना)',

    // Pain points
    ppWageProtection: 'एस्क्रो सुरक्षित: रोज की पक्की मजदूरी',
    ppVoiceFirst: 'आवाज और बड़े बटन: बिना टाइप किए आसान उपयोग',
    ppPassport: 'डिजिटल वेज पासपोर्ट: काम और हुनर का पक्का सबूत',
    ppNakaVisibility: 'नाका हाजिरी: बिना घंटों खड़े रहे काम पाएं',
    ppCancellation: 'रद्द मुआवजा: ठेकेदार रद्द करे तो ₹150 पक्के',

    // Additional UI & helper strings
    attendanceTracking: 'साइट हाजिरी और शिफ्ट ट्रैकिंग',
    wageDueToday: 'मजदूरी देय: आज शाम 6:00 बजे',
    goToAttendance: 'हाजिरी टैब पर जाएं और चेक-इन करें 📍',
    trackSettlement: '📈 मजदूरी ट्रैकर में भुगतान देखें',
    viewUpdatedPassport: '🪪 अपडेटेड वेज पासपोर्ट देखें',
    noOpenJobs: 'फिलहाल कोई नया काम उपलब्ध नहीं है',
    noOpenJobsDesc: 'प्राथमिकता के साथ काम पाने के लिए ऊपर नाका उपलब्धता चालू करें।',
    noActiveBookings: 'चेक-इन के लिए कोई स्वीकृत काम नहीं है',
    noActiveBookingsDesc: 'काम शुरू करने के लिए पहले "होम / काम" पर जाकर काम स्वीकारें।',
    noWageRecords: 'अभी कोई मजदूरी रिकॉर्ड नहीं है',
    noWageRecordsDesc: 'दैनिक मजदूरी देखने के लिए काम पूरा करें।',
    scanQr: 'QR स्कैन करें (सिम्युलेटेड)',
    contractorQrScan: 'ठेकेदार त्वरित QR सत्यापन',
    primaryTrade: 'मुख्य हुनर / काम',
    passportDesc: 'प्रमाणित हाजिरी, प्राप्त मजदूरी और ठेकेदार रेटिंग का सुरक्षित डिजिटल रिकॉर्ड। किसी भी निर्माण साइट पर मान्य।',
    updateTradeSkill: 'काम का हुनर बदलें',
    dataPrivacy: 'सहमति और डेटा गोपनीयता',
    privacyDesc: 'QR कोड दिखाने पर ठेकेदारों को केवल आपके काम के दिन और रेटिंग दिखेंगे। आपका मोबाइल नंबर और पता पूरी तरह सुरक्षित है।',
    earnedBadges: 'अर्जित कौशल बैज',
    voiceOnboarding: 'आवाज से आसान शुरुआत',
    voiceOnboardingDesc: 'मराठी या हिन्दी में बोलें — लिखने की ज़रूरत नहीं',
    oneTapDemo: '1-क्लिक डेमो लॉगिन (OTP: 1234)',
    mobileNumber: 'मोबाइल नंबर',
    smsOtp: 'एसएमएस ओटीपी (डेमो: 1234)',
    enterPlatform: 'प्लेटफॉर्म में प्रवेश करें →',
    loggingIn: 'लॉगिन हो रहा है...',
    worker: 'कामगार',
    contractor: 'ठेकेदार',
    mukkadam: 'मुकादम',
    totalSquadDailyWage: 'टोली की कुल दैनिक मजदूरी',
    perWorker: 'प्रति मजदूर',
    acceptForCrewCount: 'पूरी टोली के लिए स्वीकारें',
    crewBookedConfirmed: '✓ टोली बुक व स्वीकृत',
    whatsappReceiptsBroadcast: 'व्हाट्सएप पर मजदूरी रसीद भेजें',
    whatsappReceiptsDispatched: '✓ टोली को व्हाट्सएप रसीद भेजी गई',
    calculatedDistribution: 'गणना किया गया बंटवारा',
    totalAcrossPresentCrew: 'उपस्थित मजदूरों में कुल वितरण',
    statEscrowSubtitle: 'सुरक्षित लॉक्ड धनराशि',
    statWorkersSubtitle: 'GPS / OTP द्वारा उपस्थित',
    statSettledSubtitle: 'बैंक / UPI द्वारा भुगतान',
    weeklyEscrowActivity: 'साप्ताहिक एस्क्रो गतिविधि (₹ हज़ार)',
    recentJobsOverview: 'हालिया काम विवरण',
    viewPassportPill: 'डिजिटल वेज पासपोर्ट देखें',
    verifyGstCheck: '🛡️ व्यवसाय सत्यापित करें (GST जांच)',
    verifiedBuilderAccount: 'सत्यापित बिल्डर खाता (GST सक्रिय)',
    unverifiedContractorAccount: 'गैर-सत्यापित ठेकेदार खाता',
    unverifiedDesc: 'एस्क्रो छूट और मजदूरों का भरोसा पाने के लिए GST व पंजीकरण विवरण सत्यापित करें।',
    rateWorkerPrompt: 'मजदूर का भरोसा स्कोर दें:',
    cashHandoverAck: 'नकद सौंपने की पुष्टि करें',
  },
  mr: {
    // Navigation & Common
    homeJobs: 'मुख्य / कामे',
    attendance: 'हजेरी',
    wageTracker: 'मजुरी ट्रॅकर',
    wagePassport: 'वेज पासपोर्ट',
    crewList: 'टोळी यादी',
    groupJobs: 'टोळी कामे',
    crewAttendance: 'टोळी हजेरी',
    wageSplitter: 'मजुरी वाटप',
    dashboard: 'डॅशबोर्ड',
    verification: 'पासपोर्ट तपासणी',
    activeSites: 'साइट व पेमेंट',
    
    hello: 'नमस्कार',
    logout: 'बाहेर पडा',
    resetDemo: 'डेमो पूर्ववत',
    offlineNotice: 'ऑफलाइन मोड - स्थानिक जतन केलेला डेटा दाखवत आहे.',
    listen: 'ऐका',
    verified: 'प्रमाणित',
    unverified: 'अप्रमाणित',
    simulated: 'सिम्युलेटेड',
    
    // Worker actions & UI
    availableAtNaka: 'मी आज नाक्यावर कामासाठी उपलब्ध आहे',
    availableDesc: 'जवळचे कॉन्ट्रॅक्टर तुम्हाला थेट लाइव्ह नकाशावर कामावर घेऊ शकतात',
    availableDescOff: 'चौकावर उपलब्धता दाखवण्यासाठी चालू करा',
    jobAlerts: 'उपलब्ध कामांचे अलर्ट',
    dailyWageRate: 'खात्रीशीर दररोजची मजुरी',
    perShift: '/ ८ तासांची शिफ्ट',
    acceptJob: 'काम स्वीकारा',
    accepted: 'स्वीकारले',
    headToSite: 'काम स्वीकारले — साइटवर जा',
    checkIn: 'हजेरी नोंदवा (OTP / QR)',
    checkedIn: 'हजेरी नोंदवली',
    endShift: 'काम संपले (शिफ्ट पूर्ण)',
    completed: 'काम पूर्ण झाले',
    paid: 'मजुरी जमा झाली',
    enterSiteOtp: 'साइटचा ४-अंकी OTP टाका किंवा QR स्कॅन करा',
    siteVerification: 'साइट कोड पडताळणी',
    useOtp: 'वापरा',
    shiftActive: 'काम सुरू आहे',
    shiftFinished: 'काम पूर्ण झाले',
    awaitingRelease: 'कॉन्ट्रॅक्टर पेमेंटची प्रतीक्षा',
    wageSettled: 'मजुरी खात्यात जमा झाली',
    timelineTitle: 'मजुरी जमा प्रक्रिया',
    workDone: 'काम झाले',
    verifiedInEscrow: 'एस्क्रो सुरक्षित',
    payoutMethod: 'पेमेंट पर्याय (सिम्युलेटेड)',
    confirmCashReceipt: 'रोख पैसे मिळाल्याची पावती',
    instantPayout: 'तात्काळ खात्यात वर्ग करा (UPI)',
    rateContractor: 'कॉन्ट्रॅक्टर विश्वासार्हता रेटिंग',
    rateContractorPrompt: 'कॉन्ट्रॅक्टर विश्वासार्हता रेटिंग द्या:',
    raiseClaim: 'मजुरी थकली? हजेरी पुराव्यासह क्लेम करा',
    raiseClaimPrompt: 'मजुरी थकली? तक्रार / क्लेम नोंदवा',
    claimRaised: 'तक्रार नोंदवली: तपासणी सुरू',
    officialPassport: 'डिजिटल वेज पासपोर्ट',
    officialCredential: 'अधिकृत डिजिटल दाखला',
    daysWorked: 'कामाचे दिवस',
    wagesSecured: 'मिळालेली मजुरी',
    trustRating: 'रेटिंग',
    safetyProtocol: 'कामापूर्वी सुरक्षा तपासणी',
    safetyDesc: 'काम सुरू करण्यापूर्वी सुरक्षा साधने वापरा',
    sosAlert: '🚨 तातडीची मदत (SOS) — त्वरित संदेश पाठवा (सिम्युलेटेड)',
    shareWhatsApp: 'व्हॉट्सॲपवर शेअर करा',
    missedCallAlerts: 'मिस्ड-कॉल व व्हॉट्सॲप काम अलर्ट',
    buttonPhoneWorks: 'साध्या कीपॅड फोनवरही चालते (सिम्युलेटेड)',
    verifiedBadges: 'प्रमाणित विश्वास बॅजेस',

    // Mukkadam actions & UI
    squadManagement: 'टोळी कामगार व्यवस्थापन',
    squadReadiness: 'कामगारांची यादी व कामाची पूर्वतयारी',
    squadAvailability: 'टोळी नाका उपलब्धता',
    addWorker: '+ टोळीत नवीन कामगार जोडा',
    groupJobsTitle: 'सामूहिक टोळी कामे',
    bookForCrew: 'संपूर्ण टोळीसाठी स्वीकारा',
    crewAttendanceTitle: 'दैनिक टोळी हजेरी',
    markAllPresent: 'सर्व हजर करा',
    markAllAbsent: 'सर्व गैरहजर करा',
    present: 'हजर',
    absent: 'गैरहजर',
    wageSplitterTitle: 'टोळी मजुरी वाटप कॅल्क्युलेटर',
    wageSplitterDesc: 'आपल्या टोळीसाठी पारदर्शक आणि विना-तक्रार दैनिक मजुरी वाटप',
    lumpSumWage: 'कॉन्ट्रॅक्टरकडून मिळालेली एकूण मजुरी (₹)',
    distributionFormula: 'वाटपाची पद्धत',
    weightedSplit: '⚖️ काम व अनुभवानुसार',
    equalSplit: '🟰 समान वाटप (1/N)',
    computeDistribution: 'योग्य वाटप करा',
    remainderBuffer: 'शिल्लक रक्कम बफर',

    // Contractor actions & UI
    dashboardTab: '1. डॅशबोर्ड व काम पोस्ट करा',
    verificationTab: '2. पासपोर्ट तपासणी',
    activeSitesTab: '3. सक्रिय साइट्स व पेमेंट',
    escrowBalance: 'एस्क्रो सुरक्षित ठेव',
    topUp: '+ पैसे भरा',
    activeOnSite: 'साइटवरील उपस्थित कामगार',
    jobsSettled: 'पूर्ण झालेली कामे',
    postJobTitle: 'सोपा "काम पोस्ट" फॉर्म',
    postJobButton: '📢 काम पोस्ट करा व कामगारांना अलर्ट पाठवा',
    scannerTitle: 'वेज पासपोर्ट QR स्कॅनर',
    simulateScan: 'कॅमेरा स्कॅन सिम्युलेट करा (रमेश u1)',
    verify: 'तपासा',
    activeSitesTitle: 'सक्रिय साइट्स व मजुरी मंजुरी',
    oneClickReleaseAll: '⚡ एका क्लिकवर सर्वांचे पेमेंट करा',
    approveRelease: 'मंजूर करा व पाठवा',
    cancelPenalty: 'काम रद्द करा (₹१५० नुकसानभरपाई दंड)',

    // Pain points
    ppWageProtection: 'एस्क्रो हमी: दररोजची खात्रीशीर मजुरी',
    ppVoiceFirst: 'आवाज आणि मोठी बटणे: वाचता येत नसले तरी सोपे',
    ppPassport: 'डिजिटल वेज पासपोर्ट: कामाचा पक्का डिजिटल दाखला',
    ppNakaVisibility: 'नाका हजेरी: नाक्यावर तासनतास न थांबता काम मिळवा',
    ppCancellation: 'रद्द भरपाई: अचानक रद्द केल्यास ₹१५० नुकसानभरपाई',

    // Additional UI & helper strings
    attendanceTracking: 'साइट हजेरी आणि शिफ्ट ट्रॅकिंग',
    wageDueToday: 'मजुरी देय: आज संध्याकाळी ६:०० वाजता',
    goToAttendance: 'हजेरी टॅबवर जाऊन हजेरी नोंदवा 📍',
    trackSettlement: '📈 मजुरी ट्रॅकरमध्ये पेमेंट तपासा',
    viewUpdatedPassport: '🪪 अद्ययावत वेज पासपोर्ट दाखला पहा',
    noOpenJobs: 'सध्या कोणतेही नवीन काम उपलब्ध नाही',
    noOpenJobsDesc: 'कामाचे अलर्ट मिळवण्यासाठी वरील नाका उपलब्धता बटण चालू करा.',
    noActiveBookings: 'हजेरी नोंदवण्यासाठी कोणतेही स्वीकारलेले काम नाही',
    noActiveBookingsDesc: 'काम सुरू करण्यासाठी आधी "मुख्य / कामे" वर जाऊन काम स्वीकारा.',
    noWageRecords: 'अद्याप कोणताही मजुरी रेकॉर्ड नाही',
    noWageRecordsDesc: 'दैनिक मजुरीची नोंद पाहण्यासाठी काम पूर्ण करा.',
    scanQr: 'QR स्कॅन करा (सिम्युलेटेड)',
    contractorQrScan: 'कॉन्ट्रॅक्टर त्वरित QR पडताळणी',
    primaryTrade: 'मुख्य काम / कौशल्य',
    passportDesc: 'प्रमाणित हजेरी, मिळालेली मजुरी आणि रेटिंगचा सुरक्षित डिजिटल दाखला. कोणत्याही बांधकाम साइटवर वैध.',
    updateTradeSkill: 'कामाचे कौशल्य बदला',
    dataPrivacy: 'संमती व डेटा गोपनीयता',
    privacyDesc: 'QR कोड दाखवल्यावर कॉन्ट्रॅक्टरना फक्त तुमचे कामाचे दिवस आणि रेटिंग दिसेल. तुमचा मोबाइल नंबर व पत्ता गोपनीय राहील.',
    earnedBadges: 'प्राप्त कौशल्य बॅजेस',
    voiceOnboarding: 'आवाजाद्वारे सोपी नोंदणी',
    voiceOnboardingDesc: 'मराठी किंवा हिन्दीमध्ये बोला — लिहिण्याची अजिबात गरज नाही',
    oneTapDemo: '१-क्लिक डेमो लॉगिन (OTP: 1234)',
    mobileNumber: 'मोबाईल नंबर',
    smsOtp: 'एसएमएस ओटीपी (डेमो: 1234)',
    enterPlatform: 'प्लेटफॉर्ममध्ये प्रवेश करा →',
    loggingIn: 'लॉगिन होत आहे...',
    worker: 'कामगार',
    contractor: 'कॉन्ट्रॅक्टर',
    mukkadam: 'मुकादम',
    totalSquadDailyWage: 'टोळीची एकूण दररोजची मजुरी',
    perWorker: 'प्रत्येकी मजुरी',
    acceptForCrewCount: 'संपूर्ण टोळीसाठी स्वीकारा',
    crewBookedConfirmed: '✓ टोळी बुक व पक्की झाली',
    whatsappReceiptsBroadcast: 'व्हॉट्सॲपवर मजुरी पावत्या पाठवा',
    whatsappReceiptsDispatched: '✓ टोळीला व्हॉट्सॲप पावत्या पाठवल्या',
    calculatedDistribution: 'हिशोब केलेले मजुरी वाटप',
    totalAcrossPresentCrew: 'उपस्थित कामगारांमध्ये एकूण रक्कम',
    statEscrowSubtitle: 'खात्रीशीर जमा निधी',
    statWorkersSubtitle: 'GPS / OTP द्वारे हजर',
    statSettledSubtitle: 'थेट बँक / UPI पेमेंट',
    weeklyEscrowActivity: 'साप्ताहिक एस्क्रो व्यवहार (₹ हजार)',
    recentJobsOverview: 'कामांचा सद्यस्थिती आढावा',
    viewPassportPill: 'डिजिटल वेज पासपोर्ट दाखला पहा',
    verifyGstCheck: '🛡️ व्यवसाय प्रमाणित करा (GST पडताळणी)',
    verifiedBuilderAccount: 'प्रमाणित बिल्डर खाते (GST सक्रिय)',
    unverifiedContractorAccount: 'अप्रमाणित कॉन्ट्रॅक्टर खाते',
    unverifiedDesc: 'कमी एस्क्रो मर्यादा व कामगारांचा विश्वास मिळवण्यासाठी GST व नोंदणी कागदपत्रे प्रमाणित करा.',
    rateWorkerPrompt: 'कामगार विश्वासार्हता रेटिंग द्या:',
    cashHandoverAck: 'रोख रक्कम दिल्याची पुष्टी',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kaamsetu_lang') || 'en');
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length) setAvailableVoices(v);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('kaamsetu_lang', newLang);
  };

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] || translations.en?.[key] || key;
    },
    [lang]
  );

  const speak = useCallback(
    (text, forcedLang) => {
      try {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const l = forcedLang || lang;

        if (l === 'mr') {
          utterance.lang = 'mr-IN';
        } else if (l === 'hi') {
          utterance.lang = 'hi-IN';
        } else {
          utterance.lang = 'en-IN';
        }

        if (availableVoices.length > 0) {
          const matchedVoice =
            availableVoices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(l)) ||
            (l === 'mr' ? availableVoices.find((v) => v.lang.toLowerCase().startsWith('hi')) : null) ||
            availableVoices.find((v) => v.lang.includes('IN')) ||
            null;
          if (matchedVoice) utterance.voice = matchedVoice;
        }

        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis not available:', err);
      }
    },
    [lang, availableVoices]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t, speak }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
