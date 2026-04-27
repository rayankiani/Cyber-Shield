// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════
const state = {
  score: 0,
  xp: 0,
  correct: 0,
  total: 0,
  timeTaken: 0,
  levelScores: { 1:0, 2:0, 3:0, 4:0, B:0 },
  unlockedLevels: ['1'],
  completedLevels: [],
  timerIntervals: {},
  modalCallback: null,
  foundVulns: new Set(),
  pwdScore: 0,
  socialStep: 0,
  socialScore: 0,
  networkAnswered: false,
  phishStep: 0,
  phishScore: 0,
  lightMode: false,
  achievements: [],
  difficulty: 'beginner',
  skillChart: null
};

const LEVELS = [
  { id:'1', num:'01', name:'Phishing Detection', desc:'Identify malicious emails', icon:'📧', points:300 },
  { id:'2', num:'02', name:'Password Strength', desc:'Build unbreakable passwords', icon:'🔐', points:200 },
  { id:'3', num:'03', name:'Fake Website', desc:'Spot fraudulent web pages', icon:'🌐', points:250 },
  { id:'4', num:'04', name:'Social Engineering', desc:'Resist manipulation tactics', icon:'🧠', points:350 },
  { id:'B', num:'⭐', name:'Network Security', desc:'Identify safe networks', icon:'📡', points:200, bonus:true }
];

const LEVEL_DESC_BY_DIFFICULTY = {
  beginner: {
    '1': 'Basic phishing vs safe email recognition',
    '2': 'Create a basic strong password',
    '3': 'Spot obvious fake website red flags',
    '4': 'Handle common social trick scenarios',
    'B': 'Choose safe networks in simple cases'
  },
  intermediate: {
    '1': 'Identify moderate phishing patterns',
    '2': 'Build stronger password with better hygiene',
    '3': 'Detect deceptive website warning signs',
    '4': 'Respond to practical workplace social attacks',
    'B': 'Evaluate mixed-trust network environments'
  },
  expert: {
    '1': 'Analyze advanced spear-phishing indicators',
    '2': 'Meet strict enterprise password standards',
    '3': 'Uncover subtle fraudulent web manipulations',
    '4': 'Defend against advanced social engineering',
    'B': 'Assess high-risk network security scenarios'
  }
};

const ACHIEVEMENTS = [
  { id:'first_blood', icon:'🎯', title:'First Strike', body:'Completed your first level!' },
  { id:'perfect_1', icon:'💎', title:'Perfect Detective', body:'Aced the phishing level!' },
  { id:'password_god', icon:'🔱', title:'Password God', body:'Created an ultra-strong password!' },
  { id:'eagle_eye', icon:'🦅', title:'Eagle Eye', body:'Found all website vulnerabilities!' },
  { id:'mind_shield', icon:'🧠', title:'Mind Shield', body:'Resisted all social engineering!' },
  { id:'cyber_elite', icon:'⚡', title:'Cyber Elite', body:'Completed all levels!' }
];

const DIFFICULTY_CONFIG = {
  beginner: {
    label: 'BEGINNER',
    short: 'BGN',
    pointsMult: 1.1,
    penaltyMult: 0.6,
    timers: { '1': 80, '2': 120, '3': 95, '4': 150, 'B': 80 },
    minPwdScore: 4
  },
  intermediate: {
    label: 'INTERMEDIATE',
    short: 'INT',
    pointsMult: 1,
    penaltyMult: 1,
    timers: { '1': 60, '2': 90, '3': 75, '4': 120, 'B': 60 },
    minPwdScore: 4
  },
  expert: {
    label: 'EXPERT',
    short: 'EXP',
    pointsMult: 0.95,
    penaltyMult: 1.5,
    timers: { '1': 45, '2': 65, '3': 55, '4': 90, 'B': 45 },
    minPwdScore: 5
  }
};

// ═══════════════════════════════════════════════════════════════════
// CANVAS BACKGROUND — PARTICLES
// ═══════════════════════════════════════════════════════════════════
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 212, ${p.alpha})`;
    ctx.fill();
  });
  // grid lines (subtle)
  ctx.strokeStyle = 'rgba(0,245,212,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ═══════════════════════════════════════════════════════════════════
// LOADING
// ═══════════════════════════════════════════════════════════════════
const loadMsgs = ['INITIALIZING SECURITY PROTOCOLS...','LOADING THREAT DATABASE...','CONFIGURING FIREWALL...','ENCRYPTING CHANNELS...','READY FOR DEPLOYMENT'];
let loadPct = 0;
const loadFill = document.getElementById('load-fill');
const loadText = document.getElementById('load-text');
const loadInv = setInterval(() => {
  loadPct += 2;
  loadFill.style.width = loadPct + '%';
  loadText.textContent = loadMsgs[Math.floor(loadPct / 25)] || loadMsgs[4];
  if (loadPct >= 100) {
    clearInterval(loadInv);
    setTimeout(() => {
      document.getElementById('loading').style.opacity = '0';
      setTimeout(() => { document.getElementById('loading').style.display = 'none'; init(); }, 800);
    }, 500);
  }
}, 30);

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════
function init() {
  applyDifficultyContent();
  setupEventHandlers();
  renderDifficultyButtons();
  renderLevelGrids();
  updateNav();
  updateLevelTimersUI();
}

function getDifficultyPackIndex() {
  return state.difficulty === 'beginner' ? 0 :
         state.difficulty === 'intermediate' ? 1 : 2;
}

function applyDifficultyContent() {
  const idx = getDifficultyPackIndex();
  phishEmails = PHISH_PACKS[idx];
  socialScenarios = SOCIAL_PACKS[idx];
  networks = NETWORK_PACKS[idx];
  currentL3Site = L3_SITE_PACKS[idx];
  applyL3SiteContent();
}

function setupEventHandlers() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'show-screen') showScreen(trigger.dataset.target);
    if (action === 'submit-password') submitPassword();
    if (action === 'submit-l3') submitL3();
    if (action === 'download-cert') downloadCert();
    if (action === 'restart-game') restartGame();
    if (action === 'clear-leaderboard') clearLeaderboard();
    if (action === 'close-modal') closeModal();
    if (action === 'phish-answer') answerPhish(trigger.dataset.value);
    if (action === 'find-vuln') findVuln(trigger.dataset.vuln);
    if (action === 'toggle-network') toggleNetwork(Number(trigger.dataset.network));
    if (action === 'submit-networks') submitNetworks();
    if (action === 'answer-social') answerSocial(Number(trigger.dataset.social));
    if (action === 'set-difficulty') setDifficulty(trigger.dataset.value);
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('pwd-toggle').addEventListener('click', togglePwd);
  document.getElementById('pwd-field').addEventListener('input', analyzePassword);
  document.getElementById('nav-menu-btn').addEventListener('click', () => {
    document.querySelector('nav').classList.toggle('menu-open');
  });
}

function setDifficulty(mode) {
  if (!DIFFICULTY_CONFIG[mode]) return;
  state.difficulty = mode;
  applyDifficultyContent();
  renderDifficultyButtons();
  renderLevelGrids();
  updateLevelTimersUI();
  updateNav();
}

function renderDifficultyButtons() {
  const buttons = document.querySelectorAll('.difficulty-btn');
  buttons.forEach((button) => {
    button.classList.toggle('active', button.dataset.value === state.difficulty);
  });
}

function getDifficulty() {
  return DIFFICULTY_CONFIG[state.difficulty] || DIFFICULTY_CONFIG.intermediate;
}

function getLevelTime(id) {
  return getDifficulty().timers[String(id)];
}

function scaledPoints(points) {
  const cfg = getDifficulty();
  if (points >= 0) return Math.round(points * cfg.pointsMult);
  return -Math.round(Math.abs(points) * cfg.penaltyMult);
}

function updateLevelTimersUI() {
  ['1', '2', '3', '4', 'B'].forEach((id) => {
    const timerEl = document.getElementById('timer' + id);
    if (timerEl) timerEl.textContent = '⏱ ' + getLevelTime(id) + 's';
  });
}

function toggleTheme() {
  state.lightMode = !state.lightMode;
  document.body.classList.toggle('light-mode', state.lightMode);
  document.getElementById('theme-toggle').textContent = state.lightMode ? '🌙 DARK' : '☀ LIGHT';
}

// ═══════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelector('nav').classList.remove('menu-open');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id === 'B' ? 'levelB' : (id.startsWith('level') ? id : (id.match(/^\d$/) ? 'level'+id : id))).classList.add('active');
}

function gotoLevel(id) {
  if (!state.unlockedLevels.includes(String(id))) return;
  const screenId = id === 'B' ? 'levelB' : 'level' + id;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  startLevel(id);
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL GRIDS
// ═══════════════════════════════════════════════════════════════════
function renderLevelGrids() {
  const descSet = LEVEL_DESC_BY_DIFFICULTY[state.difficulty] || LEVEL_DESC_BY_DIFFICULTY.intermediate;
  ['home-levels-grid','levels-grid'].forEach(gid => {
    const g = document.getElementById(gid);
    if (!g) return;
    g.innerHTML = '';
    LEVELS.forEach(lv => {
      const unlocked = state.unlockedLevels.includes(lv.id);
      const completed = state.completedLevels.includes(lv.id);
      const card = document.createElement('div');
      card.className = 'level-card' + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="level-num">${lv.icon}</div>
        <div class="level-name">${lv.name}</div>
        <div class="level-desc">${descSet[lv.id] || lv.desc}</div>
        <div class="level-status">
          ${completed ? '<span class="status-complete">✓ COMPLETE +'+state.levelScores[lv.id]+'pts</span>' :
            unlocked ? '<span class="status-available">▶ AVAILABLE</span>' :
            '<span class="status-locked">🔒 LOCKED</span>'}
        </div>`;
      if (unlocked) card.onclick = () => gotoLevel(lv.id);
      g.appendChild(card);
    });
  });
}

function updateNav() {
  const cfg = getDifficulty();
  document.getElementById('nav-score').textContent = state.score;
  document.getElementById('nav-level').textContent = state.completedLevels.length + '/' + LEVELS.length;
  document.getElementById('nav-difficulty').textContent = cfg.short;
  const xpPct = Math.min(100, (state.score / 1300) * 100);
  document.getElementById('xp-bar').style.width = xpPct + '%';
}

// ═══════════════════════════════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════════════════════════════
function startTimer(id, seconds, onEnd) {
  clearInterval(state.timerIntervals[id]);
  const el = document.getElementById('timer' + id);
  let t = seconds;
  const start = Date.now();
  state.timerIntervals[id] = setInterval(() => {
    t--;
    if (el) {
      el.textContent = '⏱ ' + t + 's';
      el.className = 'timer-display' + (t <= 10 ? ' danger' : '');
    }
    if (t <= 0) {
      clearInterval(state.timerIntervals[id]);
      state.timeTaken += seconds;
      onEnd();
    }
  }, 1000);
  return { stop: () => { clearInterval(state.timerIntervals[id]); return seconds - t; } };
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL 1 — PHISHING
// ═══════════════════════════════════════════════════════════════════
const PHISH_PACKS = [
  [
    {
      from: 'security@paypa1-alerts.com',
      to: 'you@gmail.com',
      subject: '⚠️ URGENT: Your account has been compromised!',
      body: `Dear Valued Customer,<br><br>
<span class="urgent">YOUR ACCOUNT WILL BE SUSPENDED IN 24 HOURS</span> unless you verify your identity immediately.<br><br>
We have detected suspicious activity from an <strong>unknown IP address in Russia</strong>. To protect your account, please click the link below and confirm your personal informations:<br><br>
<span class="sus-link">http://paypa1-secure.verification-center.ru/confirm?token=abc123</span><br><br>
If you do not comfirm within 24 hours, your account will be permanently <strong>deleted</strong>.<br><br>
Regards,<br>
PayPal Security Team`,
      answer: 'phishing',
      clues: ['paypa1-alerts.com — fake domain', 'Urgency pressure tactic', 'Grammar errors ("informations", "comfirm")', 'Suspicious .ru link', 'Threat of account deletion']
    },
    {
      from: 'newsletter@amazon.com',
      to: 'you@gmail.com',
      subject: 'Your weekly deals are here!',
      body: `Hi there,<br><br>
This week's top deals just for you:<br><br>
• 40% off Echo devices<br>
• Buy 2 get 1 free on Kindle books<br>
• Prime members get exclusive early access<br><br>
Shop now at amazon.com and save big this weekend.<br><br>
Happy shopping!<br>
The Amazon Team<br><br>
<small class="email-muted">To unsubscribe, visit your Amazon account settings.</small>`,
      answer: 'safe',
      clues: ['Legitimate amazon.com domain', 'No urgency pressure', 'No suspicious links', 'No personal info requested', 'Professional grammar']
    },
    {
      from: 'it-helpdesk@yourcompanyyy.support',
      to: 'you@yourcompany.com',
      subject: 'Password Expiry Notice — Action Required',
      body: `Hello Employee,<br><br>
Your network password is due to expire in <span class="urgent">2 HOURS</span>. You must reset it immediately to avoid losing access to all company systems.<br><br>
Reset your password here: <span class="sus-link">http://yourcompany-reset.support-helpdesk.xyz/reset</span><br><br>
Please enter your current password followed by your new password.<br><br>
Failure to act will result in account lockout and <strong>disciplinary action</strong>.<br><br>
— IT Department`,
      answer: 'phishing',
      clues: ['yourcompanyyy.support — misspelled domain', 'External URL not company domain', 'Requests current password', 'Threat of disciplinary action', 'Extreme urgency (2 hours)']
    }
  ],
  [
    {
      from: 'verify@micr0soft-secure365.com',
      to: 'staff@company.com',
      subject: 'Action needed: MFA session expired',
      body: `Hello User,<br><br>
Your Microsoft 365 MFA token has been deactivated. <span class="urgent">Re-verify within 30 minutes</span> to avoid mailbox suspension.<br><br>
Use this secure portal now: <span class="sus-link">http://microsoft-auth-reset.live/login</span><br><br>
Do not contact IT. This verification is automatic and time limited.<br><br>
Security Desk`,
      answer: 'phishing',
      clues: ['Lookalike domain micr0soft', 'HTTP link', 'Pressure + short deadline', 'Tells user not to contact IT']
    },
    {
      from: 'no-reply@github.com',
      to: 'dev@company.com',
      subject: 'New sign-in from Chrome on Windows',
      body: `Hi there,<br><br>
We noticed a new sign-in to your GitHub account.<br>
If this was you, no action is needed.<br>
If not, secure your account from github.com/settings/security.<br><br>
Thanks,<br>GitHub`,
      answer: 'safe',
      clues: ['Legit github.com sender', 'No forced urgent threat', 'No credential request via email']
    },
    {
      from: 'hr-payroll@companny-benefits.net',
      to: 'employee@company.com',
      subject: 'Salary Adjustment Form (Confidential)',
      body: `Dear Employee,<br><br>
To process your annual raise, submit your bank account verification today.<br>
Open: <span class="sus-link">http://payroll-fasttrack-form.info/secure</span><br><br>
Failure to submit can delay your payroll cycle by 60 days.`,
      answer: 'phishing',
      clues: ['Misspelled companny domain', 'Non-company external link', 'Asks sensitive banking info', 'Fear-based urgency']
    }
  ],
  [
    {
      from: 'apple-id@security-applle.com',
      to: 'you@icloud.com',
      subject: 'Apple ID locked due to suspicious login',
      body: `Dear customer,<br><br>
Your Apple ID is temporary blocked. To unlock now, click below and confirm card detail.<br>
<span class="sus-link">http://apple-verification-unlock.support/identity</span><br><br>
If not done now, all iCloud data may be removed.`,
      answer: 'phishing',
      clues: ['applle typo domain', 'HTTP malicious link', 'Requests card details', 'Data deletion threat']
    },
    {
      from: 'receipts@steamgames.com',
      to: 'gamer@email.com',
      subject: 'Your purchase receipt',
      body: `Hello,<br><br>
Thanks for your purchase. This is your receipt summary for order #847229.<br>
Visit store.steampowered.com for full invoice details.<br><br>
Steam Billing`,
      answer: 'safe',
      clues: ['Informational receipt style', 'No urgent pressure', 'No suspicious direct credential link']
    },
    {
      from: 'admin@dropbox-security-alerts.org',
      to: 'team@startup.com',
      subject: 'Shared file malware warning',
      body: `Attention,<br><br>
Your shared folder has dangerous file. Immediate identity check required.<br>
<span class="sus-link">http://dropbox-cleanup-center.org/verify</span><br><br>
Complete in 15 minutes or all team files quarantine permanently.`,
      answer: 'phishing',
      clues: ['Non-official dropbox domain', 'Bad grammar', 'Short panic timer', 'Suspicious cleanup URL']
    }
  ]
];
let phishEmails = PHISH_PACKS[0];

let phishTimer;
function startLevel(id) {
  state.phishStep = 0;
  state.phishScore = 0;
  state.foundVulns = new Set();
  state.socialStep = 0;
  state.socialScore = 0;
  state.networkAnswered = false;

  if (id === '1') {
    renderPhishQuestion();
    phishTimer = startTimer('1', getLevelTime('1'), () => completeLevel('1', state.phishScore));
  } else if (id === '2') {
    document.getElementById('pwd-field').value = '';
    analyzePassword();
    startTimer('2', getLevelTime('2'), () => { submitPassword(); });
  } else if (id === '3') {
    setupL3();
    startTimer('3', getLevelTime('3'), () => submitL3());
  } else if (id === '4') {
    renderSocialStep();
    startTimer('4', getLevelTime('4'), () => completeLevel('4', state.socialScore));
  } else if (id === 'B') {
    renderNetworks();
    startTimer('B', getLevelTime('B'), () => { if (!state.networkAnswered) completeLevel('B', 0); });
  }
}

function renderPhishQuestion() {
  const q = phishEmails[state.phishStep % phishEmails.length];
  const pct = (state.phishStep / phishEmails.length) * 100;
  document.getElementById('prog1').style.width = pct + '%';
  document.getElementById('phish-question-area').innerHTML = `
    <div class="glass-card card-margin-bottom-lg">
      <div class="card-title">📧 Analyze this email — Safe or Phishing?</div>
      <div class="card-sub">Email ${state.phishStep+1} of ${phishEmails.length}</div>
      <div class="email-container">
        <div class="email-toolbar">
          <div class="email-dot dot-red"></div>
          <div class="email-dot dot-yellow"></div>
          <div class="email-dot dot-green"></div>
        </div>
        <div class="email-header-section">
          <div class="email-field"><span class="email-field-label">From:</span><span class="email-field-val">${q.from}</span></div>
          <div class="email-field"><span class="email-field-label">To:</span><span class="email-field-val">${q.to}</span></div>
          <div class="email-field"><span class="email-field-label">Subj:</span><span class="email-field-val"><strong>${q.subject}</strong></span></div>
        </div>
        <div class="email-body">${q.body}</div>
      </div>
      <div class="choice-btns">
        <button class="btn-safe" data-action="phish-answer" data-value="safe">✅ SAFE EMAIL</button>
        <button class="btn-phish" data-action="phish-answer" data-value="phishing">🎣 PHISHING ATTACK</button>
      </div>
    </div>`;
}

function answerPhish(ans) {
  const q = phishEmails[state.phishStep % phishEmails.length];
  const correct = ans === q.answer;
  const reward = scaledPoints(100);
  const penalty = scaledPoints(-30);
  state.total++;
  if (correct) { state.correct++; state.phishScore += reward; addScore(reward); }
  else { addScore(penalty); }
  showModal(
    correct, correct ? '🎯 Correct!' : '❌ Wrong!',
    correct ? `This ${q.answer === 'phishing' ? 'was indeed a phishing email' : 'was a legitimate email'}!` :
              `This was a <strong>${q.answer}</strong> email.`,
    correct ? reward : penalty,
    `<strong>Key indicators:</strong><br>${q.clues.map(c => '• ' + c).join('<br>')}`,
    () => {
      state.phishStep++;
      if (state.phishStep >= phishEmails.length) {
        clearInterval(state.timerIntervals['1']);
        completeLevel('1', state.phishScore);
      } else { renderPhishQuestion(); }
    }
  );
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL 2 — PASSWORD
// ═══════════════════════════════════════════════════════════════════
const pwdChecks = [
  { id:'len', label:'8+ characters', fn: p => p.length >= 8 },
  { id:'upper', label:'Uppercase letter', fn: p => /[A-Z]/.test(p) },
  { id:'lower', label:'Lowercase letter', fn: p => /[a-z]/.test(p) },
  { id:'num', label:'Number', fn: p => /\d/.test(p) },
  { id:'special', label:'Special character', fn: p => /[^a-zA-Z0-9]/.test(p) },
  { id:'long', label:'12+ characters', fn: p => p.length >= 12 }
];

function analyzePassword() {
  const pwd = document.getElementById('pwd-field').value;
  const checks = pwdChecks.map(c => ({ ...c, pass: c.fn(pwd) }));
  const score = checks.filter(c => c.pass).length;
  state.pwdScore = score;

  // Render checks
  document.getElementById('pwd-checks').innerHTML = checks.map(c => `
    <div class="pwd-check ${c.pass ? 'pass' : 'fail'}">
      <span class="check-icon">${c.pass ? '✓' : '○'}</span>
      ${c.label}
    </div>`).join('');

  // Strength bar
  const fill = document.getElementById('strength-fill');
  const pct = (score / pwdChecks.length) * 100;
  fill.style.width = pct + '%';
  const colors = ['#ff006e','#ff006e','#ffbe0b','#ffbe0b','#00f5d4','#00ff88'];
  fill.style.background = colors[Math.min(score, colors.length-1)];
  fill.style.boxShadow = score >= 4 ? '0 0 10px rgba(0,245,212,0.6)' : 'none';

  const labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong!'];
  const label = document.getElementById('strength-label');
  label.textContent = pwd ? labels[Math.min(score, labels.length-1)] : 'Enter a password';
  label.style.color = colors[Math.min(score, colors.length-1)];

  // Crack time
  const crackTimes = ['< 1 second','< 1 minute','< 1 hour','< 1 day','Several years','Centuries!'];
  document.getElementById('crack-val').textContent = crackTimes[Math.min(score, crackTimes.length-1)];

  // Submit button
  const btn = document.getElementById('pwd-submit');
  const minScore = getDifficulty().minPwdScore;
  btn.classList.toggle('btn-disabled', score < minScore);
}

function togglePwd() {
  const f = document.getElementById('pwd-field');
  f.type = f.type === 'password' ? 'text' : 'password';
}

function submitPassword() {
  const score = state.pwdScore;
  const minScore = getDifficulty().minPwdScore;
  clearInterval(state.timerIntervals['2']);
  if (score < minScore) {
    const penalty = scaledPoints(-50);
    addScore(penalty);
    showModal(false, '❌ Password Too Weak', `Your password did not meet minimum security requirements for ${getDifficulty().label} mode.`, penalty,
      'A strong password needs uppercase, lowercase, numbers, and special characters.',
      () => completeLevel('2', 0));
    return;
  }
  const basePts = score >= 6 ? 200 : score >= 5 ? 150 : 100;
  const pts = scaledPoints(basePts);
  if (score >= 6) unlockAchievement('password_god');
  state.total++;
  state.correct++;
  addScore(pts);
  showModal(true, '🔐 Password Secured!', `Your password scored ${score}/6 on the security scale.`, pts,
    score >= 6 ? '⭐ Ultra-strong! This password would take centuries to crack!' :
    'Good password! Try adding more length for maximum security.',
    () => completeLevel('2', pts));
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL 3 — FAKE WEBSITE
// ═══════════════════════════════════════════════════════════════════
const vulnList = [
  { id:'http', label:'HTTP (No HTTPS)', found:false },
  { id:'typo', label:'Spelling errors', found:false },
  { id:'form', label:'Button typo', found:false },
  { id:'footer', label:'Copyright errors', found:false },
  { id:'cert', label:'Missing SSL cert', found:false }
];
const L3_SITE_PACKS = [
  {
    domain: 'paypa1-secure-login.net/account/verify',
    title: 'PayPa1 Secure Center',
    tagline: 'Your trusted paymant partner since 1998',
    submit: 'Sign In to Your Acount',
    footer: '© 2019 PayPa1 Inc. All rights reserves. | Privacy Plicy | Terms of Survice',
    cert: '🔓 This connection is not secure'
  },
  {
    domain: 'microsoft-support-login.info/session/renew',
    title: 'Micr0soft Account Recovery',
    tagline: 'Protecting your bussiness data globally',
    submit: 'Continue Verfication',
    footer: '© 2018 Microsofot Corporation | Privacey | Legel',
    cert: '🔓 Certificate invalid for this host'
  },
  {
    domain: 'amaz0n-wallet-security-check.co/update',
    title: 'Amaz0n Payment Protect',
    tagline: 'Fastest securrity validation portal',
    submit: 'Validate My Accont',
    footer: '© 2020 Amaz0n Intl. | Privasy Center | Terms',
    cert: '🔓 SSL handshake failed'
  }
];
let currentL3Site = L3_SITE_PACKS[0];

function setupL3() {
  state.foundVulns = new Set();
  applyL3SiteContent();
  document.getElementById('l3-submit-wrap').style.display = 'none';
  document.getElementById('vuln-count').textContent = vulnList.length;
  document.getElementById('prog3').style.width = '0%';
  document.getElementById('vulns-list').innerHTML = vulnList.map(v =>
    `<div class="vuln-tag" id="vtag-${v.id}">${v.label}</div>`).join('');
}

function applyL3SiteContent() {
  document.getElementById('url-domain').textContent = currentL3Site.domain;
  document.getElementById('fake-site-title').textContent = currentL3Site.title;
  document.getElementById('fake-tagline').textContent = currentL3Site.tagline;
  document.getElementById('fake-submit').textContent = currentL3Site.submit;
  document.getElementById('fake-footer').textContent = currentL3Site.footer;
  document.getElementById('cert-warning').textContent = currentL3Site.cert;
}

function findVuln(id) {
  if (state.foundVulns.has(id)) return;
  state.foundVulns.add(id);
  const tag = document.getElementById('vtag-' + id);
  if (tag) tag.classList.add('found');
  // Flash element
  const elMap = { http:'url-bar', typo:'fake-tagline', form:'fake-submit', footer:'fake-footer' };
  if (elMap[id]) {
    const el = document.querySelector('.' + (id === 'http' ? 'url-bar' : id === 'typo' ? 'fake-tagline' : id === 'form' ? 'fake-submit' : 'fake-footer'));
    if (el) el.classList.add('vuln-found');
  }
  if (state.foundVulns.size >= vulnList.length) {
    document.getElementById('l3-submit-wrap').style.display = 'block';
    unlockAchievement('eagle_eye');
  }
  updateProg3();
}

function updateProg3() {
  const pct = (state.foundVulns.size / vulnList.length) * 100;
  document.getElementById('prog3').style.width = pct + '%';
}

function submitL3() {
  clearInterval(state.timerIntervals['3']);
  const found = state.foundVulns.size;
  const pts = Math.round((found / vulnList.length) * 250);
  state.total++;
  if (found >= vulnList.length) state.correct++;
  addScore(pts);
  showModal(found >= vulnList.length, found >= vulnList.length ? '🕵️ Master Detective!' : '⚠️ Partially Done',
    `You found ${found} of ${vulnList.length} vulnerabilities.`, pts,
    'Key red flags: HTTP instead of HTTPS, fake domain (paypa1), typos, outdated copyright.',
    () => completeLevel('3', pts));
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL 4 — SOCIAL ENGINEERING
// ═══════════════════════════════════════════════════════════════════
const SOCIAL_PACKS = [
  [
    {
      from: 'Unknown Caller — "IT Support"',
      text: `"Hello! This is Mike from IT support. We've detected a critical virus on your computer that's spreading across the network. I need you to immediately give me your login password so I can fix it remotely before it destroys company data. This is extremely urgent!"`,
      choices: [
        { text: 'Give him your password immediately — it sounds urgent!', correct: false, pts: -50 },
        { text: 'Ask for his employee ID and call IT back on the official number', correct: true, pts: 100 },
        { text: 'Hang up and ignore it', correct: false, pts: 20 },
        { text: 'Give your username but not password', correct: false, pts: -20 }
      ],
      explanation: 'Never give passwords over the phone. Legitimate IT will never ask for your password. Always verify through official channels.'
    },
    {
      from: 'USB Drive Found in Parking Lot',
      text: `You find an unmarked USB drive in the company parking lot. It has a label: "Q3 Salary Information - CONFIDENTIAL". What do you do?`,
      choices: [
        { text: 'Plug it into your work computer to see what\'s on it', correct: false, pts: -100 },
        { text: 'Take it home and check on personal computer', correct: false, pts: -50 },
        { text: 'Hand it to IT security department without plugging it in', correct: true, pts: 100 },
        { text: 'Throw it in the trash', correct: false, pts: -10 }
      ],
      explanation: 'Baited USB drives are a classic attack vector. Never plug in unknown USBs. Malware can execute automatically on insertion.'
    },
    {
      from: 'LinkedIn Message from "CEO"',
      text: `You receive a LinkedIn message from your CEO: "Hi! I'm in an important meeting and need you to buy $500 in Amazon gift cards for client gifts ASAP. Keep this confidential and email me the codes: ceo.executive@gmail.com. I'll reimburse you!"`,
      choices: [
        { text: 'Buy the gift cards — the CEO is asking!', correct: false, pts: -100 },
        { text: 'Email the codes to the gmail address provided', correct: false, pts: -100 },
        { text: 'Call the CEO\'s verified phone number to confirm', correct: true, pts: 100 },
        { text: 'Reply asking for more information', correct: false, pts: 20 }
      ],
      explanation: 'CEO fraud (BEC) is extremely common. Real executives never ask for gift cards via social media. The gmail address is a major red flag.'
    }
  ],
  [
    {
      from: 'SMS from "Bank Security"',
      text: `Message: "Unauthorized charge detected. Verify your account now at tinyurl-bank-check.io to prevent freeze."`,
      choices: [
        { text: 'Tap the link immediately', correct: false, pts: -80 },
        { text: 'Call the number in SMS', correct: false, pts: -40 },
        { text: 'Open bank app manually and verify from official channel', correct: true, pts: 100 },
        { text: 'Forward to friends as warning', correct: false, pts: 10 }
      ],
      explanation: 'Smishing attacks use fear and short links. Always verify from official app/site, never from message links.'
    },
    {
      from: 'Reception Desk Visitor',
      text: `A person says he is "network auditor", forgot his badge, and asks you to hold the secure door open for 2 minutes.`,
      choices: [
        { text: 'Let him in; he sounds technical', correct: false, pts: -70 },
        { text: 'Ask security desk to verify identity first', correct: true, pts: 100 },
        { text: 'Give him your access card quickly', correct: false, pts: -100 },
        { text: 'Ignore and walk away', correct: false, pts: 20 }
      ],
      explanation: 'Tailgating is common physical social engineering. Verify identity through official security process.'
    },
    {
      from: 'Slack DM from "Finance Head"',
      text: `"Need urgent vendor payment. Send me latest payroll sheet now. Don’t tell anyone until board meeting ends."`,
      choices: [
        { text: 'Share file quickly due to urgency', correct: false, pts: -90 },
        { text: 'Request approval in official finance workflow', correct: true, pts: 100 },
        { text: 'Upload on public drive and share link', correct: false, pts: -100 },
        { text: 'Send only half data', correct: false, pts: -30 }
      ],
      explanation: 'Urgency + secrecy is a red flag. Sensitive files must follow approved workflow and verification.'
    }
  ],
  [
    {
      from: 'Voice Call: "Cloud Vendor Support"',
      text: `"Your tenant backup failed. I can fix now if you share admin OTP from your authenticator app."`,
      choices: [
        { text: 'Share OTP once to restore backup', correct: false, pts: -100 },
        { text: 'Decline and open support ticket from vendor portal', correct: true, pts: 100 },
        { text: 'Share only first 3 digits', correct: false, pts: -60 },
        { text: 'Tell them to call later', correct: false, pts: 10 }
      ],
      explanation: 'OTP is equivalent to password for that session. No legit support asks for it.'
    },
    {
      from: 'Free Conference WiFi Booth',
      text: `A promoter offers "VIP network booster app" via USB for better signal and asks you to install now.`,
      choices: [
        { text: 'Install to improve internet', correct: false, pts: -100 },
        { text: 'Decline and use approved company VPN only', correct: true, pts: 100 },
        { text: 'Install on spare office laptop', correct: false, pts: -70 },
        { text: 'Take USB and test later', correct: false, pts: -30 }
      ],
      explanation: 'Unknown software media can carry malware. Use only approved software and managed channels.'
    },
    {
      from: 'Email + Call Combo Attack',
      text: `You get a fake invoice email, then a caller asks you to "confirm attachment details" and share internal vendor IDs.`,
      choices: [
        { text: 'Share IDs to close ticket quickly', correct: false, pts: -80 },
        { text: 'Verify sender and caller independently before any data', correct: true, pts: 100 },
        { text: 'Reply with partial IDs', correct: false, pts: -40 },
        { text: 'Delete email only', correct: false, pts: 20 }
      ],
      explanation: 'Multi-channel attacks increase trust pressure. Verify identity on known official contacts.'
    }
  ]
];
let socialScenarios = SOCIAL_PACKS[0];

function renderSocialStep() {
  const q = socialScenarios[state.socialStep];
  if (!q) {
    clearInterval(state.timerIntervals['4']);
    if (state.socialScore >= 200) unlockAchievement('mind_shield');
    completeLevel('4', state.socialScore);
    return;
  }
  const pct = (state.socialStep / socialScenarios.length) * 100;
  document.getElementById('prog4').style.width = pct + '%';
  document.getElementById('social-area').innerHTML = `
    <div class="glass-card">
      <div class="card-title">🧠 Scenario ${state.socialStep+1} of ${socialScenarios.length}</div>
      <div class="scenario-box">
        <div class="scenario-from">${q.from}</div>
        <div class="scenario-text">"${q.text}"</div>
      </div>
      <div class="card-sub">Choose the best response:</div>
      <div class="choices-list">
        ${q.choices.map((c,i) => `<button class="choice-btn" data-action="answer-social" data-social="${i}"><span class="choice-key">${['A','B','C','D'][i]}</span>${c.text}</button>`).join('')}
      </div>
    </div>`;
}

function answerSocial(idx) {
  const q = socialScenarios[state.socialStep];
  const choice = q.choices[idx];
  const pts = scaledPoints(choice.pts);
  state.total++;
  if (choice.correct) state.correct++;
  state.socialScore += Math.max(0, pts);
  addScore(pts);
  showModal(
    choice.correct, choice.correct ? '✅ Excellent Response!' : '⚠️ Risky Decision!',
    choice.correct ? 'You handled this social engineering attempt correctly!' : 'This response could have led to a security breach.',
    pts,
    q.explanation,
    () => { state.socialStep++; renderSocialStep(); }
  );
}

// ═══════════════════════════════════════════════════════════════════
// BONUS — NETWORK
// ═══════════════════════════════════════════════════════════════════
const NETWORK_PACKS = [
  [
    { name:'Home_WiFi_5G', detail:'WPA3 encrypted • Private', icon:'🏠', secure:true, explanation:'Private WPA3 network — safe for sensitive activities.' },
    { name:'FREE_AIRPORT_WIFI', detail:'Open network • No password', icon:'✈️', secure:false, explanation:'Open networks have no encryption — attackers can intercept traffic.' },
    { name:'CafeGuest_2.4G', detail:'WPA2 • Public • Shared', icon:'☕', secure:false, explanation:'Public shared networks expose you to MITM attacks.' },
    { name:'VPN_SecureTunnel', detail:'AES-256 encrypted VPN', icon:'🔒', secure:true, explanation:'VPN encrypts all traffic — safe even on public networks.' },
    { name:'XFINITY_GUEST', detail:'Open • No authentication', icon:'📡', secure:false, explanation:'ISP guest networks are unencrypted and monitored.' }
  ],
  [
    { name:'CorpNet-Secure', detail:'WPA3 Enterprise • Certificate auth', icon:'🏢', secure:true, explanation:'Enterprise-authenticated encrypted network is safe.' },
    { name:'Hotel_Free_WiFi', detail:'Open captive portal', icon:'🏨', secure:false, explanation:'Open captive portals are still vulnerable to interception.' },
    { name:'PhoneHotspot-AES', detail:'WPA2 Personal • Trusted device', icon:'📱', secure:true, explanation:'Personal hotspot on trusted device is generally secure.' },
    { name:'Mall_Guest_Internet', detail:'Open • Shared LAN', icon:'🛍️', secure:false, explanation:'Shared open networks allow easy sniffing and spoofing.' },
    { name:'CoffeeShop_123', detail:'Weak password shared publicly', icon:'☕', secure:false, explanation:'Publicly shared credentials reduce trust and allow attackers in.' }
  ],
  [
    { name:'VPN-ZeroTrust-Tunnel', detail:'WireGuard tunnel active', icon:'🛡️', secure:true, explanation:'Active trusted VPN tunnel secures transit traffic.' },
    { name:'Event_WiFi_Free', detail:'No encryption • Open SSID', icon:'🎪', secure:false, explanation:'Open SSIDs expose traffic and session hijacking risks.' },
    { name:'Office-IoT-Net', detail:'Legacy WPA • Device segment', icon:'🏭', secure:false, explanation:'Legacy weak encryption + mixed devices is unsafe for sensitive data.' },
    { name:'HomeFiber_WPA3', detail:'WPA3 + strong router password', icon:'🏡', secure:true, explanation:'Modern home WPA3 setup is acceptable for private tasks.' },
    { name:'Neighbor_EXT', detail:'Unknown extender network', icon:'📶', secure:false, explanation:'Unknown extender could be rogue AP/evil twin.' }
  ]
];
let networks = NETWORK_PACKS[0];

function renderNetworks() {
  const q = {
    prompt: 'You need to send sensitive financial data. Which network(s) are SAFE to use?',
    multiple: true
  };
  document.getElementById('network-area').innerHTML = `
    <div class="glass-card card-margin-bottom">
      <div class="card-title">📡 Network Security Check</div>
      <div class="card-sub">${q.prompt}</div>
      <p class="net-help-text">Click to select safe networks, then submit.</p>
    </div>
    <div class="networks-grid" id="net-grid">
      ${networks.map((n,i) => `
        <div class="network-card" id="nc-${i}" data-action="toggle-network" data-network="${i}">
          <div class="network-icon">${n.icon}</div>
          <div class="network-name">${n.name}</div>
          <div class="network-detail">${n.detail}</div>
        </div>`).join('')}
    </div>
    <div class="network-submit-wrap">
      <button class="btn-primary" data-action="submit-networks">Submit Selection</button>
    </div>`;
  window._netSelected = new Set();
}

function toggleNetwork(i) {
  if (!window._netSelected) window._netSelected = new Set();
  const card = document.getElementById('nc-'+i);
  if (window._netSelected.has(i)) {
    window._netSelected.delete(i);
    card.classList.remove('selected');
  } else {
    window._netSelected.add(i);
    card.classList.add('selected');
  }
}

function submitNetworks() {
  if (state.networkAnswered) return;
  state.networkAnswered = true;
  clearInterval(state.timerIntervals['B']);
  const sel = window._netSelected || new Set();
  let pts = 0;
  networks.forEach((n,i) => {
    const card = document.getElementById('nc-'+i);
    if (n.secure && sel.has(i)) { pts += 50; card.classList.add('correct'); }
    else if (!n.secure && !sel.has(i)) { pts += 20; }
    else if (!n.secure && sel.has(i)) { pts -= 30; card.classList.add('wrong'); }
    else if (n.secure && !sel.has(i)) { card.classList.add('missing'); }
  });
  pts = Math.max(0, scaledPoints(pts));
  state.total++;
  if (pts >= 100) { state.correct++; }
  addScore(pts);
  setTimeout(() => {
    showModal(pts >= 80, pts >= 80 ? '🔒 Network Expert!' : '⚠️ Review Needed',
      `You scored ${pts} points on network security.`, pts,
      'WPA3 home networks and VPNs are safe. Open/public networks expose your data.',
      () => completeLevel('B', pts));
  }, 1000);
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL COMPLETION
// ═══════════════════════════════════════════════════════════════════
function completeLevel(id, pts) {
  clearInterval(state.timerIntervals[id]);
  state.levelScores[id] = pts;
  if (!state.completedLevels.includes(id)) {
    state.completedLevels.push(id);
    // Unlock next
    const order = ['1','2','3','4','B'];
    const idx = order.indexOf(String(id));
    if (idx >= 0 && idx < order.length - 1) {
      const next = order[idx+1];
      if (!state.unlockedLevels.includes(next)) state.unlockedLevels.push(next);
    }
  }
  if (!state.achievements.includes('first_blood') && state.completedLevels.length === 1) unlockAchievement('first_blood');
  if (state.completedLevels.length === LEVELS.length) unlockAchievement('cyber_elite');
  const perfectPhish = phishEmails.length * scaledPoints(100);
  if (id === '1' && state.phishScore >= perfectPhish) unlockAchievement('perfect_1');

  renderLevelGrids();
  updateNav();
  saveLeaderboard();

  if (state.completedLevels.length >= LEVELS.length) {
    setTimeout(() => { showFinalReport(); }, 500);
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('levels').classList.add('active');
    renderLevelGrids();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SCORE
// ═══════════════════════════════════════════════════════════════════
function addScore(pts) {
  state.score = Math.max(0, state.score + pts);
  updateNav();
}

function playFeedbackTone(success) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const audio = new AudioCtx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = success ? 'triangle' : 'sawtooth';
  osc.frequency.value = success ? 680 : 180;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(audio.destination);
  const now = audio.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.start(now);
  osc.stop(now + 0.23);
}

// ═══════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════
function showModal(success, title, body, pts, extra, callback) {
  state.modalCallback = callback;
  playFeedbackTone(success);
  document.getElementById('modal-icon').textContent = success ? '✅' : '❌';
  const titleEl = document.getElementById('modal-title');
  titleEl.textContent = title;
  titleEl.className = 'modal-title ' + (success ? 'success' : 'fail');
  document.getElementById('modal-body').innerHTML = body + (extra ? `<br><br><small>${extra}</small>` : '');
  const ptsEl = document.getElementById('modal-points');
  ptsEl.textContent = pts > 0 ? `+${pts} points` : `${pts} points`;
  ptsEl.className = 'modal-points ' + (pts >= 0 ? 'pos' : 'neg');
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  if (state.modalCallback) { const cb = state.modalCallback; state.modalCallback = null; cb(); }
}

// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════
function unlockAchievement(id) {
  if (state.achievements.includes(id)) return;
  state.achievements.push(id);
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `<div class="toast-icon">${ach.icon}</div><div><div class="toast-title">🏆 ACHIEVEMENT UNLOCKED</div><div class="toast-body">${ach.title}: ${ach.body}</div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.5s';
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// ═══════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════
function saveLeaderboard() {
  const boards = JSON.parse(localStorage.getItem('cs_leaderboard') || '[]');
  const names = ['Agent X', 'CyberHunter', 'NetGuardian', 'PhishSlayer', 'CodeBreaker'];
  const entry = {
    name: names[Math.floor(Math.random() * 3)] + '_' + Math.random().toString(36).slice(2,5).toUpperCase(),
    score: state.score,
    difficulty: getDifficulty().label,
    date: new Date().toLocaleDateString()
  };
  boards.push(entry);
  boards.sort((a,b) => b.score - a.score);
  localStorage.setItem('cs_leaderboard', JSON.stringify(boards.slice(0,10)));
}

function renderLeaderboard() {
  const boards = JSON.parse(localStorage.getItem('cs_leaderboard') || '[]');
  const medals = ['🥇','🥈','🥉'];
  document.getElementById('lb-list').innerHTML = boards.length ? boards.map((e,i) => `
    <div class="lb-entry">
      <div class="lb-rank">${medals[i] || '#'+(i+1)}</div>
      <div class="lb-name">${e.name}</div>
      <div class="lb-date">${e.date} • ${e.difficulty || 'INTERMEDIATE'}</div>
      <div class="lb-score">${e.score}</div>
    </div>`).join('') : '<p class="lb-empty">No entries yet. Complete the game to appear here!</p>';
}

function clearLeaderboard() {
  localStorage.removeItem('cs_leaderboard');
  renderLeaderboard();
}

// ═══════════════════════════════════════════════════════════════════
// FINAL REPORT
// ═══════════════════════════════════════════════════════════════════
function showFinalReport() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('final-screen').classList.add('active');
  saveLeaderboard();

  const accuracy = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
  let rank, rankClass;
  if (state.score >= 900) { rank = '⚡ CYBER EXPERT'; rankClass = 'rank-expert'; }
  else if (state.score >= 500) { rank = '🔵 INTERMEDIATE'; rankClass = 'rank-intermediate'; }
  else { rank = '🟡 BEGINNER'; rankClass = 'rank-beginner'; }

  document.getElementById('rank-display').innerHTML = `<div class="rank-badge ${rankClass}">${rank}</div>`;
  const risk = Math.max(0, Math.min(100, Math.round((accuracy * 0.7) + (state.score / 13) * 0.3)));
  animateCounter('fs-score', state.score, '');
  document.getElementById('fs-correct').textContent = state.correct + '/' + state.total;
  animateCounter('fs-accuracy', accuracy, '%');
  animateCounter('fs-risk', risk, '%');
  animateCounter('fs-time', state.timeTaken, 's');

  // Tips
  const tips = [
    { icon:'📧', text:'Always check sender email addresses carefully. Phishing emails use lookalike domains.' },
    { icon:'🔐', text:'Use a password manager and enable 2FA on all accounts.' },
    { icon:'🌐', text:'Never enter credentials on HTTP sites. Always verify the URL.' },
    { icon:'🧠', text:'Be skeptical of urgent requests. Verify identities through official channels.' },
    { icon:'📡', text:'Use a VPN on public networks. Avoid sensitive transactions on open WiFi.' },
    { icon:'🔄', text:'Keep software updated. Most attacks exploit known, patched vulnerabilities.' }
  ];
  document.getElementById('tips-grid').innerHTML = tips.map(t => `
    <div class="tip-card"><div class="tip-icon">${t.icon}</div><div class="tip-text">${t.text}</div></div>`).join('');

  // Chart
  setTimeout(() => drawSkillChart(), 300);
}

function animateCounter(id, target, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 900;
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const value = Math.round(from + (target - from) * p);
    el.textContent = value + (suffix || '');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function drawSkillChart() {
  const canvas = document.getElementById('skill-chart');
  const ctx = canvas.getContext('2d');
  const data = [
    { label:'Phishing', score: Math.min(100, Math.round((state.levelScores['1'] / 300) * 100)) },
    { label:'Password', score: Math.min(100, Math.round((state.levelScores['2'] / 200) * 100)) },
    { label:'Web Security', score: Math.min(100, Math.round((state.levelScores['3'] / 250) * 100)) },
    { label:'Social Eng', score: Math.min(100, Math.round((state.levelScores['4'] / 350) * 100)) },
    { label:'Network', score: Math.min(100, Math.round((state.levelScores['B'] / 200) * 100)) }
  ];
  if (typeof Chart === 'undefined') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  if (state.skillChart) state.skillChart.destroy();
  state.skillChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [{
        data: data.map((d) => d.score),
        borderRadius: 8,
        backgroundColor: ['#00f5d4', '#3a86ff', '#00f5d4', '#3a86ff', '#00f5d4']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#5a7a9a' }, grid: { color: 'rgba(255,255,255,0.08)' } },
        x: { ticks: { color: '#c8d8f0' }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx0) => `${ctx0.raw}%` } }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// CERTIFICATE
// ═══════════════════════════════════════════════════════════════════
function downloadCert() {
  const c = document.getElementById('cert-canvas');
  c.style.display = 'block';
  const ctx = c.getContext('2d');
  const W = 900, H = 600;
  // Background
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#050d1a'); bg.addColorStop(1,'#0a1628');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);
  // Border
  ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 3;
  ctx.strokeRect(20,20,W-40,H-40);
  ctx.strokeStyle = 'rgba(0,245,212,0.3)'; ctx.lineWidth = 1;
  ctx.strokeRect(30,30,W-60,H-60);
  // Title
  ctx.fillStyle = '#00f5d4'; ctx.font = 'bold 42px Orbitron, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('CyberShield', W/2, 100);
  ctx.fillStyle = '#3a86ff'; ctx.font = '18px Rajdhani, sans-serif';
  ctx.fillText('CERTIFICATE OF COMPLETION', W/2, 135);
  // Main text
  ctx.fillStyle = '#c8d8f0'; ctx.font = '16px Rajdhani, sans-serif';
  ctx.fillText('This certifies that you have successfully completed the', W/2, 200);
  ctx.fillStyle = '#00f5d4'; ctx.font = 'bold 22px Rajdhani, sans-serif';
  ctx.fillText('Cyber Security Awareness Training Program', W/2, 240);
  // Score
  ctx.fillStyle = '#c8d8f0'; ctx.font = '16px Rajdhani, sans-serif';
  ctx.fillText('with a final score of', W/2, 310);
  ctx.fillStyle = '#00f5d4'; ctx.font = 'bold 48px Orbitron, sans-serif';
  ctx.fillText(state.score + ' pts', W/2, 380);
  // Date
  ctx.fillStyle = '#5a7a9a'; ctx.font = '14px Share Tech Mono, monospace';
  ctx.fillText('Issued: ' + new Date().toLocaleDateString() + ' • Mode: ' + getDifficulty().label, W/2, 440);
  // Shield
  ctx.fillStyle = '#00f5d4'; ctx.font = '60px serif';
  ctx.fillText('🛡️', W/2, 530);
  // Download
  const link = document.createElement('a');
  link.download = 'CyberShield_Certificate.png';
  link.href = c.toDataURL('image/png');
  link.click();
  c.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════
// RESTART
// ═══════════════════════════════════════════════════════════════════
function restartGame() {
  if (state.skillChart) {
    state.skillChart.destroy();
    state.skillChart = null;
  }
  Object.assign(state, {
    score:0, xp:0, correct:0, total:0, timeTaken:0,
    levelScores:{1:0,2:0,3:0,4:0,B:0},
    unlockedLevels:['1'], completedLevels:[],
    timerIntervals:{}, modalCallback:null,
    foundVulns:new Set(), pwdScore:0,
    socialStep:0, socialScore:0, networkAnswered:false,
    phishStep:0, phishScore:0, achievements:[]
  });
  applyDifficultyContent();
  updateNav();
  updateLevelTimersUI();
  renderLevelGrids();
  showScreen('home');
}

// ═══════════════════════════════════════════════════════════════════
// LEADERBOARD SCREEN HOOK
// ═══════════════════════════════════════════════════════════════════
window.showScreen = function(id) {
  document.querySelector('nav').classList.remove('menu-open');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screenEl = document.getElementById(
    id === 'leaderboard' ? 'leaderboard' :
    id === 'levels' ? 'levels' :
    id === 'home' ? 'home' :
    id === 'final-screen' ? 'final-screen' :
    id === 'B' ? 'levelB' :
    'level' + id
  );
  if (screenEl) { screenEl.classList.add('active'); }
  if (id === 'leaderboard') renderLeaderboard();
};
