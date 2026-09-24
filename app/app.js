import {
  SUBJECTS, STAGES, ALL_CLASSES, MODES, AREAS, GOALS, TUTORS, TIPS, AUTO_REPLIES,
  EXAM_DATES, TRAVEL_FEE,
  tutorById, subjectById, stageById, stageOfClass, modeById, areaById,
  photo, priceFor, slotsFor, reviewsFor, seeded, ugx, daysTo,
} from '../shared/data.js';
import { icon, logoMark } from '../shared/icons.js';

// ================= Helpers =================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const view = $('#view');
const fixed = $('#fixed');
const tabbar = $('#tabbar');
const sheetRoot = $('#sheet');
const toastEl = $('#toast');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const at = (key, time) => {
  const [y, m, d] = key.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi);
};
const week = (n = 7) => Array.from({ length: n }, (_, i) => {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d;
});
const isToday = (d) => dayKey(d) === dayKey(new Date());
const fmtDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLong = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtTime = (d) => d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
const money = (n) => 'UGX ' + ugx(n);
const firstName = (name) => name.split(' ')[0];
const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k' : String(n));
const stars = (n, size = 14) => Array.from({ length: Math.round(n) }, () => icon('star', size)).join('');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const online = (t) => seeded('on' + t.id + new Date().getHours())() > 0.45;

function until(date) {
  const m = Math.round((date - Date.now()) / 60000);
  if (m <= 0) return 'Starting now';
  if (m < 60) return `in ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h ${m % 60}m`;
  const d = Math.round(h / 24);
  return `in ${plural(d, 'day')}`;
}
function ago(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const BUCKETS = [
  ['afternoon', 'Afternoon', '12:00–17:00'],
  ['evening', 'Evening', '17:00–21:00'],
  ['morning', 'Morning', 'Before 12:00'],
];
const bucket = (s) => { const h = +s.slice(0, 2); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };

// ================= State (saved on this device) =================
const KEY = 'cranoly-state-v1';
const blank = () => ({
  onboarded: false, name: '', forChild: true, learnerName: '', klass: 'S4',
  subjects: ['maths'], area: 'nakawa', goal: 'exam',
  saved: [], bookings: [], threads: {}, notifications: true,
  momo: { provider: 'mtn', phone: '' },
});
let state = load();
function load() {
  try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return blank(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
}
const thread = (id) => (state.threads[id] ||= { unread: false, msgs: [] });
const findBooking = (id) => state.bookings.find((b) => b.id === id);
const upcoming = () => state.bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.start.localeCompare(b.start));
const pastSessions = () => state.bookings.filter((b) => b.status === 'done').sort((a, b) => b.start.localeCompare(a.start));
const learner = () => (state.forChild ? (state.learnerName || 'your child') : 'you');
const myStage = () => stageOfClass(state.klass);

function settle() {
  let changed = false;
  for (const b of state.bookings) {
    if (b.status === 'upcoming' && new Date(b.start).getTime() + b.hours * 3600e3 < Date.now()) { b.status = 'done'; changed = true; }
  }
  if (changed) save();
}

function openSlots(t, key) {
  const soon = Date.now() + 60 * 60000;
  const taken = new Set(state.bookings.filter((b) => b.tutorId === t.id && b.status === 'upcoming').map((b) => b.start));
  return slotsFor(t.id, key).filter((s) => {
    const d = at(key, s);
    return d.getTime() > soon && !taken.has(d.toISOString());
  });
}
const firstOpenDay = (t) => dayKey(week(14).find((d) => openSlots(t, dayKey(d)).length) || new Date());

function seedDemo() {
  const mk = (tutorId, days, time, hours, mode, status, extra = {}) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    const t = tutorById(tutorId);
    return { id: uid(), tutorId, start: at(dayKey(d), time).toISOString(), hours, mode, price: priceFor(t, hours, mode), status, ...extra };
  };
  // Keep the demo's "next session" at a plausible after-school hour.
  const soon = new Date(Date.now() + 2 * 3600e3);
  soon.setMinutes(soon.getMinutes() < 30 ? 30 : 60, 0, 0);
  if (soon.getHours() >= 20 || soon.getHours() < 14) {
    if (soon.getHours() >= 20) soon.setDate(soon.getDate() + 1);
    soon.setHours(16, 0, 0, 0);
  }
  const now = Date.now();
  state = {
    ...blank(), onboarded: true, name: 'Sarah', forChild: true, learnerName: 'Brian',
    klass: 'S4', subjects: ['maths', 'physics'], area: 'nakawa', goal: 'exam',
    saved: ['grace-nakimuli', 'julius-okello', 'samuel-mugisha'],
    momo: { provider: 'mtn', phone: '0772 000 000' },
    bookings: [
      { id: uid(), tutorId: 'grace-nakimuli', start: soon.toISOString(), hours: 1, mode: 'home', price: 40000, status: 'upcoming' },
      mk('grace-nakimuli', 3, '17:00', 1, 'home', 'upcoming'),
      mk('julius-okello', 5, '16:00', 2, 'tutor', 'upcoming'),
      mk('grace-nakimuli', -3, '17:00', 1, 'home', 'done', { rating: 5 }),
      mk('grace-nakimuli', -7, '17:00', 1, 'home', 'done', { rating: 5 }),
      mk('julius-okello', -9, '16:00', 2, 'tutor', 'done', { rating: 5 }),
      mk('grace-nakimuli', -10, '17:00', 1, 'home', 'done', { rating: 4 }),
      mk('grace-nakimuli', -14, '17:00', 1, 'home', 'done', { rating: 5 }),
    ],
    threads: {
      'grace-nakimuli': {
        unread: true,
        msgs: [
          { from: 'them', text: 'Good evening. Brian did well on simultaneous equations today — much better than last week. I have left him five questions to finish before Thursday.', ts: now - 3 * 864e5 },
          { from: 'me', text: 'Thank you Grace. He says the graphs part is still hard.', ts: now - 3 * 864e5 + 45 * 60e3 },
          { from: 'them', text: 'Noted. We will spend the first half of Thursday on graphs and I will bring past-paper questions on that topic.', ts: now - 55 * 60e3 },
        ],
      },
      'julius-okello': {
        unread: false,
        msgs: [{ from: 'them', text: 'Hello. Confirming Saturday at 4pm at my place in Wakiso as usual. Please send Brian with his practical notebook.', ts: now - 2 * 864e5 }],
      },
    },
  };
  save();
}

// ================= UI primitives =================
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function openSheet(html, mount) {
  sheetRoot.innerHTML = `<div class="sheet-backdrop" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div>${html}</div>`;
  sheetRoot.setAttribute('aria-hidden', 'false');
  void sheetRoot.offsetHeight;
  sheetRoot.classList.add('open');
  mount?.($('.sheet', sheetRoot));
}
function closeSheet() {
  if (!sheetRoot.classList.contains('open')) return;
  sheetRoot.classList.remove('open');
  sheetRoot.setAttribute('aria-hidden', 'true');
  setTimeout(() => { if (!sheetRoot.classList.contains('open')) sheetRoot.innerHTML = ''; }, 350);
}

const initial = () => esc((state.name || 'G')[0].toUpperCase());
const topbar = (title, fallback, right = '<span class="spacer"></span>') =>
  `<header class="topbar"><button class="icon-btn" data-act="back" data-fallback="${fallback}" aria-label="Back">${icon('back')}</button><h1>${title}</h1>${right}</header>`;
const emptyState = (ic, title, text, cta = '') =>
  `<div class="empty"><div class="blob">${icon(ic)}</div><h2>${title}</h2><p>${text}</p>${cta}</div>`;

const trustRow = (t) => [
  t.verified ? `<span class="trust-chip ok">${icon('shield', 13)} Verified</span>` : '',
  t.examiner ? `<span class="trust-chip gold">${icon('badge', 13)} UNEB examiner</span>` : '',
].join('');

const modeChips = (t) => t.modes.map((m) => `<span class="pill sm">${icon(modeById(m).icon, 13)} ${modeById(m).short}</span>`).join('');

function tutorCard(t, i = 0) {
  const saved = state.saved.includes(t.id);
  const subs = t.subjects.map((s) => subjectById(s).name).join(', ');
  const stages = t.stages.map((s) => stageById(s).name).join(' · ');
  return `<article class="tcard" style="animation-delay:${Math.min(i, 6) * 40}ms">
    <a class="tcard-main" href="#/tutor/${t.id}">
      <div class="tcard-photo"><img src="${photo(t.img, 200)}" alt="" loading="lazy" />${online(t) ? '<span class="online" title="Online now"></span>' : ''}</div>
      <div>
        <div class="tcard-name">${t.name}${t.top ? `<span class="badge-top">${icon('sparkle', 12)} Top</span>` : ''}</div>
        <div class="tcard-sub">${icon('book', 15)} ${subs}</div>
        <div class="tcard-sub">${icon('pin', 15)} ${areaById(t.area).name}</div>
        <div class="tcard-stats">
          <div><b>${icon('star', 15)}${t.rating.toFixed(1)}</b><small>${plural(t.reviews, 'review')}</small></div>
          <div><b>${ugx(t.rate)}</b><small>per hour</small></div>
        </div>
      </div>
    </a>
    <button class="heart ${saved ? 'on' : ''}" data-act="save" data-id="${t.id}" aria-label="Save ${t.name}" aria-pressed="${saved}">${icon('heart', 22)}</button>
    <div class="trust-row">${trustRow(t)}<span class="trust-chip">${plural(t.years, 'yr')} teaching</span></div>
    <p class="tcard-text"><b>${t.headline}.</b> ${t.bio}</p>
    <div class="tcard-meta">${icon('trophy', 16)} ${stages} · ${plural(t.students, 'student')} coached</div>
    <div class="tcard-meta modes">${modeChips(t)}</div>
    <div class="tcard-actions">
      <a class="btn btn-primary btn-sm" href="#/book/${t.id}">Book a session</a>
      <a class="btn btn-outline btn-sm" href="#/chat/${t.id}">Message</a>
    </div>
  </article>`;
}

const miniCard = (t) => `<a class="mini" href="#/tutor/${t.id}">
  <div class="ph"><img src="${photo(t.img, 300)}" alt="" loading="lazy" />${t.examiner ? `<span class="badge-top">${icon('badge', 12)} Examiner</span>` : ''}</div>
  <div class="bd"><b>${t.name}</b><div class="ln"><span class="r">${icon('star', 13)}${t.rating.toFixed(1)}</span><span>${ugx(t.rate)}/hr</span></div></div>
</a>`;

const tutorMini = (t, sub) => `<div class="tutor-mini"><img src="${photo(t.img, 160)}" alt="" /><div><b>${t.name}</b><small>${sub ?? `${icon('star')} ${t.rating.toFixed(1)} · ${t.subjects.map((s) => subjectById(s).name).join(', ')}`}</small></div></div>`;

function scheduleHtml(t, key, selected, prefix) {
  const slots = openSlots(t, key);
  const days = week(14).map((d) => {
    const k = dayKey(d);
    const has = openSlots(t, k).length > 0;
    return `<button class="day ${k === key ? 'on' : ''} ${has ? '' : 'none'}" data-act="${prefix}Day" data-k="${k}">
      <small>${isToday(d) ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${d.getDate()}</b><i></i></button>`;
  }).join('');
  const groups = BUCKETS.map(([id, label]) => [label, slots.filter((s) => bucket(s) === id)]).filter((g) => g[1].length);
  const body = groups.length
    ? groups.map(([label, list]) => `<div class="slot-group"><h4>${label}</h4><div class="slot-grid">${list.map((s) =>
        `<button class="slot ${selected === s ? 'on' : ''}" data-act="${prefix}Slot" data-t="${s}">${fmtTime(at(key, s))}</button>`).join('')}</div></div>`).join('')
    : `<div class="no-slots">No open times this day — try another one.</div>`;
  return `<div class="days">${days}</div>${body}`;
}

function openRate(b) {
  const t = tutorById(b.tutorId);
  openSheet(`<h2>How was the session with ${firstName(t.name)}?</h2>
    <p>Your rating helps other parents find the right teacher.</p>
    <div class="stars-input">${[1, 2, 3, 4, 5].map((n) => `<button data-act="star" data-n="${n}" aria-label="${n} stars">${icon('star', 44)}</button>`).join('')}</div>
    <div class="foot one"><button class="btn btn-primary" id="rateGo" data-act="rateSubmit" data-id="${b.id}" disabled>Submit rating</button></div>`);
}

function downloadIcs(b) {
  const t = tutorById(b.tutorId);
  const s = new Date(b.start);
  const e = new Date(s.getTime() + b.hours * 3600e3);
  const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cranoly//Demo//EN', 'BEGIN:VEVENT',
    `UID:${b.id}@cranoly.demo`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
    `SUMMARY:${t.subjects.map((x) => subjectById(x).name)[0]} with ${t.name}`,
    `LOCATION:${modeById(b.mode).name}`, 'DESCRIPTION:Booked through Cranoly.',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  a.download = 'session.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const waLink = (t, text) => `https://wa.me/?text=${encodeURIComponent(text || `Hello ${firstName(t.name)}, this is about our Cranoly session.`)}`;

// ================= Screens =================
function Welcome() {
  const faces = [[45, '8%', '8%', 112], [51, '58%', '4%', 94], [32, '55%', '44%', 120], [60, '10%', '54%', 90], [44, '32%', '26%', 100]];
  const words = [['PLE', '30%', '5%'], ['UCE', '2%', '38%'], ['UACE', '33%', '74%']];
  return {
    mode: 'bare',
    html: `<section class="welcome">
      <div class="welcome-art" aria-hidden="true">
        ${faces.map(([img, l, tp, s], i) => `<div class="ring" style="left:${l};top:${tp};width:${s}px;height:${s}px;animation-delay:${i * 80}ms,${i * 0.7}s"><img src="${photo(img, 300)}" alt="" /></div>`).join('')}
        ${words.map(([w, l, tp], i) => `<span class="word" style="left:${l};top:${tp};animation-delay:${300 + i * 120}ms,${i}s">${w}</span>`).join('')}
      </div>
      <div class="welcome-copy">
        <div class="logo">${logoMark(28)} cranoly</div>
        <h1>The right teacher,<br />before the exam.</h1>
        <p>Vetted teachers for PLE, UCE and UACE — at your home or online. Pay by the session with Mobile Money.</p>
        <a class="btn btn-primary btn-block" href="#/onboarding">Get started</a>
        <button class="btn btn-outline btn-block" data-act="demoLogin">Explore with sample data</button>
        <a class="btn btn-ghost btn-block" href="../">Back to website</a>
      </div>
    </section>`,
  };
}

// ---- Onboarding ----
let ob = null;
let obTimer;
function Onboarding() {
  ob ||= { step: 0, forChild: null, klass: null, subjects: [], area: null, name: state.name || '' };
  const s = ob.step;
  const tick = (on) => `<span class="radio">${on ? icon('check', 14) : ''}</span>`;
  let body = '';
  let ready = false;

  if (s === 0) {
    body = `<h1>Who needs a teacher?</h1><p>We will tailor what you see.</p>
      <div class="ob-list">
        <button class="opt ${ob.forChild === true ? 'on' : ''}" data-act="obPick" data-k="forChild" data-v="1">
          <span class="emoji">👨‍👩‍👧</span><div><b>My child</b><small>I am booking as a parent or guardian</small></div>${tick(ob.forChild === true)}</button>
        <button class="opt ${ob.forChild === false ? 'on' : ''}" data-act="obPick" data-k="forChild" data-v="0">
          <span class="emoji">🎒</span><div><b>Me</b><small>I am the student</small></div>${tick(ob.forChild === false)}</button>
      </div>`;
    ready = ob.forChild !== null;
  } else if (s === 1) {
    body = `<h1>Which class?</h1><p>This decides the syllabus and the exam we work towards.</p>
      ${STAGES.map((st) => `<h3 class="ob-group">${st.name} <span>${st.exam}</span></h3>
        <div class="class-grid">${st.classes.map((c) => `<button class="class-btn ${ob.klass === c ? 'on' : ''}" data-act="obPick" data-k="klass" data-v="${c}">${c}</button>`).join('')}</div>`).join('')}`;
    ready = !!ob.klass;
  } else if (s === 2) {
    const stage = stageOfClass(ob.klass).id;
    const avail = SUBJECTS.filter((x) => x.levels.includes(stage));
    body = `<h1>Which subjects?</h1><p>Pick as many as you need. You can change these later.</p>
      <div class="ob-grid">${avail.map((x) => `<button class="opt ${ob.subjects.includes(x.id) ? 'on' : ''}" data-act="obSubject" data-v="${x.id}">
        <span class="glyph tint-${x.tint}">${x.glyph}</span><div><b>${x.name}</b><small>${x.tutors.toLocaleString()} teachers</small></div></button>`).join('')}</div>`;
    ready = ob.subjects.length > 0;
  } else if (s === 3) {
    body = `<h1>Where are you?</h1><p>So we can show teachers who can reach you.</p>
      <div class="ob-list compact">${AREAS.map((a) => `<button class="opt ${ob.area === a.id ? 'on' : ''}" data-act="obPick" data-k="area" data-v="${a.id}">
        <span class="ic-box">${icon('pin', 20)}</span><div><b>${a.name}</b></div>${tick(ob.area === a.id)}</button>`).join('')}</div>`;
    ready = !!ob.area;
  } else {
    body = `<h1>What should we call you?</h1><p>Teachers will see this name when you book.</p>
      <label class="field"><span>Your name</span><input class="input" id="obName" autocomplete="given-name" maxlength="30" placeholder="e.g. Sarah" value="${esc(ob.name)}" /></label>`;
    ready = ob.name.trim().length > 0;
  }

  return {
    mode: 'bare',
    html: `<section class="ob">
      <div class="ob-top"><button class="icon-btn" data-act="obBack" aria-label="Back">${icon('back')}</button><div class="progress"><i style="width:${((s + 1) / 5) * 100}%"></i></div></div>
      <div class="ob-body">${body}</div>
      <div class="ob-foot"><button class="btn btn-primary btn-block" id="obNext" data-act="obNext" ${ready ? '' : 'disabled'}>${s === 4 ? 'Find teachers' : 'Continue'}</button></div>
    </section>`,
    mount() {
      const inp = $('#obName');
      if (!inp) return;
      inp.focus();
      inp.addEventListener('input', () => { ob.name = inp.value; $('#obNext').disabled = !inp.value.trim(); });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inp.value.trim()) A.obNext(); });
    },
  };
}

// ---- Home ----
function Home() {
  const stage = myStage();
  const next = upcoming()[0];
  const done = pastSessions();
  const hours = done.reduce((s, b) => s + b.hours, 0);
  const spent = done.reduce((s, b) => s + b.price, 0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const tips = TIPS[stage.id];
  const [tip, tipWhy] = tips[Math.floor(Date.now() / 864e5) % tips.length];
  const left = daysTo(EXAM_DATES[stage.exam]);
  const unread = Object.values(state.threads).some((t) => t.unread);

  const recs = TUTORS
    .filter((t) => t.stages.includes(stage.id) && t.subjects.some((s) => state.subjects.includes(s)))
    .sort((a, b) => (b.examiner - a.examiner) || b.rating - a.rating);
  const nearby = recs.filter((t) => t.travels.includes(state.area) || t.area === state.area);
  const mine = [...new Set(state.bookings.map((b) => b.tutorId))].map(tutorById).filter(Boolean);

  const nextCard = next ? (() => {
    const t = tutorById(next.tutorId);
    const d = new Date(next.start);
    const m = modeById(next.mode);
    return `<div class="next">
      <div class="next-top"><span>Next session · ${isToday(d) ? 'Today' : fmtDay(d)}, ${fmtTime(d)}</span><span class="countdown" data-until="${next.start}">${until(d)}</span></div>
      <div class="next-row"><img src="${photo(t.img, 160)}" alt="" /><div><b>${subjectById(t.subjects[0]).name} with ${firstName(t.name)}</b><small>${plural(next.hours, 'hour')} · ${m.name}</small></div></div>
      <div class="next-actions">${sessionCta(next, t, 'btn-primary')}<a class="btn btn-outline" href="#/sessions">All sessions</a></div>
    </div>`;
  })() : `<div class="first"><h2>Book the first session</h2><p>Teachers near ${areaById(state.area).name} from ${money(18000)} an hour. Most families start with two sessions a week.</p><a class="btn btn-dark" href="#/search">Find a teacher ${icon('arrow', 20)}</a></div>`;

  return {
    tab: 'home',
    html: `<header class="home-head">
        <div><small>${greet}</small><h1>Hi, ${esc(state.name || 'there')}</h1></div>
        <a class="icon-btn" href="#/messages" aria-label="Messages">${icon('bell')}${unread ? '<span class="dot"></span>' : ''}</a>
        <a class="avatar" href="#/profile" aria-label="Profile">${initial()}</a>
      </header>

      <div class="countdown-card">
        <div><small>${stage.exam} ${state.forChild && state.learnerName ? `· ${esc(state.learnerName)}, ${state.klass}` : `· ${state.klass}`}</small>
        <b>${left} days</b><span>until the national exam</span></div>
        <div class="ring-stat" style="--p:${Math.max(4, Math.min(100, Math.round((1 - left / 365) * 100)))}">${icon('trophy', 22)}</div>
      </div>

      ${nextCard}

      <div class="stat-row">
        <div class="stat">${icon('check', 20)}<b>${done.length}</b><small>sessions done</small></div>
        <div class="stat">${icon('clock', 20)}<b>${hours}h</b><small>coached</small></div>
        <div class="stat">${icon('wallet', 20)}<b>${compact(spent)}</b><small>UGX spent</small></div>
      </div>

      <section class="sec"><div class="sec-head"><h2>Study tip</h2></div>
        <div class="phrase tint-gold"><div><small>${stage.name} · ${stage.exam}</small><b>${tip}</b><span>${tipWhy}</span></div>
        <span class="speak static">${icon('sparkle', 22)}</span></div>
      </section>

      ${mine.length ? `<section class="sec"><div class="sec-head"><h2>Your teachers</h2></div><div class="row-list">${mine.map((t) => `<div class="row">
          <img src="${photo(t.img, 120)}" alt="" /><a class="grow" href="#/tutor/${t.id}"><b>${t.name}</b><small>${subjectById(t.subjects[0]).name} · ${plural(state.bookings.filter((b) => b.tutorId === t.id && b.status === 'done').length, 'session')} together</small></a>
          <a class="btn btn-outline btn-sm" href="#/book/${t.id}">Book</a></div>`).join('')}</div></section>` : ''}

      <section class="sec"><div class="sec-head"><h2>Teachers near you</h2><a href="#/search">See all</a></div>
        <div class="rail">${(nearby.length ? nearby : recs).map(miniCard).join('')}</div></section>

      <section class="sec"><div class="sec-head"><h2>Other subjects</h2></div>
        <div class="lang-chips">${SUBJECTS.filter((x) => x.levels.includes(stage.id) && !state.subjects.includes(x.id)).map((x) => `<a class="lang-chip" href="#/search?subject=${x.id}"><span class="tint-${x.tint}">${x.glyph}</span>${x.name}</a>`).join('')}</div>
      </section>`,
    mount() {
      const tick = () => $$('[data-until]').forEach((el) => (el.textContent = until(new Date(el.dataset.until))));
      const id = setInterval(tick, 30000);
      return () => clearInterval(id);
    },
  };
}

// The Join / Directions / WhatsApp button, depending on how the session happens.
function sessionCta(b, t, cls = 'btn-primary btn-sm') {
  if (b.mode === 'video') return `<a class="btn ${cls}" href="#/room/${b.id}">${icon('video', 18)} Join</a>`;
  if (b.mode === 'whatsapp') return `<a class="btn ${cls}" href="${waLink(t)}" target="_blank" rel="noopener">${icon('whatsapp', 18)} WhatsApp</a>`;
  return `<button class="btn ${cls}" data-act="where" data-id="${b.id}">${icon('pin', 18)} Details</button>`;
}

// ---- Search ----
const SORTS = { best: 'Best match', priceAsc: 'Price: lowest first', priceDesc: 'Price: highest first', rating: 'Highest rated', reviews: 'Most reviews' };
const MAX_RATE = 40000;
const filters = { subject: null, q: '', max: MAX_RATE, area: null, modes: [], examiner: false, stage: null, sort: 'best' };

function searchResults() {
  const q = filters.q.trim().toLowerCase();
  const list = TUTORS.filter((t) =>
    (!filters.subject || t.subjects.includes(filters.subject)) &&
    t.rate <= filters.max &&
    (!filters.examiner || t.examiner) &&
    (!filters.stage || t.stages.includes(filters.stage)) &&
    (!filters.area || t.area === filters.area || t.travels.includes(filters.area)) &&
    (!filters.modes.length || filters.modes.some((m) => t.modes.includes(m))) &&
    (!q || [t.name, t.headline, t.bio, ...t.subjects.map((s) => subjectById(s).name)].join(' ').toLowerCase().includes(q))
  );
  const by = {
    best: (a, b) => (b.examiner - a.examiner) || (b.top - a.top) || b.rating - a.rating,
    priceAsc: (a, b) => a.rate - b.rate,
    priceDesc: (a, b) => b.rate - a.rate,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    reviews: (a, b) => b.reviews - a.reviews,
  };
  return list.sort(by[filters.sort]);
}
const activeFilters = () => (filters.max < MAX_RATE) + !!filters.area + !!filters.modes.length + filters.examiner + !!filters.stage + !!filters.q.trim();

function renderResults() {
  const list = searchResults();
  $('#results').innerHTML = `<div class="result-count"><span>${plural(list.length, 'teacher')} available</span>${activeFilters() ? '<button class="link" data-act="fClear">Clear filters</button>' : ''}</div>` +
    (list.length
      ? `<div class="tlist">${list.map(tutorCard).join('')}</div>`
      : emptyState('search', 'No teachers match', 'Try a wider price range, or allow a different area.', '<button class="btn btn-outline" data-act="fClear">Clear all filters</button>'));
}

function Search(r) {
  if (r.q.subject && SUBJECTS.some((s) => s.id === r.q.subject)) filters.subject = r.q.subject;
  if (filters.subject === null) filters.subject = state.subjects[0] || 'maths';
  if (filters.area === null && !r.q.all) filters.area = state.area;
  const sub = subjectById(filters.subject);
  const chip = (act, on, label) => `<button class="chip ${on ? 'on' : ''}" data-act="${act}">${label}</button>`;
  return {
    tab: 'search',
    html: `<header class="search-head" id="shead">
        <div class="search-title">
          <button class="lang-switch" data-act="pickSubject"><span class="g tint-${sub.tint}">${sub.glyph}</span>${sub.name} ${icon('down', 20)}</button>
          <a class="icon-btn outlined" href="#/saved" aria-label="Saved teachers">${icon('heart')}</a>
        </div>
        <label class="search-input">${icon('search', 20)}<input id="q" type="search" placeholder="Name or keyword" value="${esc(filters.q)}" autocomplete="off" /></label>
        <div class="chip-row">
          ${chip('fArea', !!filters.area, `${filters.area ? areaById(filters.area).name : 'Anywhere'} ${icon('down', 16)}`)}
          ${chip('fRate', filters.max < MAX_RATE, `${filters.max < MAX_RATE ? `Under ${ugx(filters.max)}` : 'Price'} ${icon('down', 16)}`)}
          ${chip('fMode', filters.modes.length, `${filters.modes.length ? filters.modes.map((m) => modeById(m).short).join(', ') : 'Where'} ${icon('down', 16)}`)}
          ${chip('fExaminer', filters.examiner, `${icon('badge', 16)} UNEB examiner`)}
          ${chip('fStage', !!filters.stage, `${filters.stage ? stageById(filters.stage).name : 'Level'} ${icon('down', 16)}`)}
          ${chip('fSort', false, `${icon('sliders', 16)} ${SORTS[filters.sort]}`)}
        </div>
      </header>
      <div id="results"></div>`,
    mount() {
      renderResults();
      const q = $('#q');
      q.addEventListener('input', () => { filters.q = q.value; renderResults(); });
      view.onscroll = () => $('#shead')?.classList.toggle('stuck', view.scrollTop > 4);
    },
  };
}

// ---- Tutor profile ----
let prof = { id: null, day: null, more: false };
function Tutor(r) {
  const t = tutorById(r.id);
  if (!t) return NotFound();
  if (prof.id !== t.id) prof = { id: t.id, day: firstOpenDay(t), more: false };
  const saved = state.saved.includes(t.id);
  const p5 = Math.min(97, Math.max(60, Math.round((t.rating - 4) * 95)));
  const dist = [p5, Math.max(2, 97 - p5), 2, 1, 0];
  const similar = TUTORS.filter((x) => x.id !== t.id && x.subjects.some((s) => t.subjects.includes(s))).slice(0, 6);

  return {
    mode: 'no-tabs',
    html: `<div class="p-hero">
        <div class="video-cover">
          <img src="${photo(t.img, 600)}" alt="${t.name}" />
          <div class="cover-tags">${trustRow(t)}</div>
        </div>
        <div class="topbar topbar--float">
          <button class="icon-btn" data-act="back" data-fallback="#/search" aria-label="Back">${icon('back')}</button>
          <div style="display:flex;gap:8px">
            <button class="icon-btn" data-act="share" data-id="${t.id}" aria-label="Share">${icon('share', 20)}</button>
            <button class="icon-btn fav ${saved ? 'on' : ''}" data-act="save" data-id="${t.id}" aria-label="Save" aria-pressed="${saved}">${icon('heart', 20)}</button>
          </div>
        </div>
      </div>
      <section class="p-head">
        <div class="p-name"><h1>${t.name}</h1>${t.top ? `<span class="badge-top">${icon('sparkle', 13)} Top rated</span>` : ''}</div>
        <div class="tcard-sub">${icon('book', 15)} ${t.subjects.map((s) => subjectById(s).name).join(', ')} · ${t.stages.map((s) => stageById(s).name).join(', ')}</div>
        <div class="tcard-sub">${icon('pin', 15)} ${t.schoolNote}</div>
        <p class="p-headline">${t.headline}</p>
        <div class="p-stats">
          <div><b>${icon('star')}${t.rating.toFixed(1)}</b><small>${t.reviews} reviews</small></div>
          <div><b>${ugx(t.rate)}</b><small>per hour</small></div>
          <div><b>${compact(t.students)}</b><small>students</small></div>
          <div><b>${t.years}</b><small>years</small></div>
        </div>
      </section>
      <nav class="p-tabs" id="ptabs">
        <button class="on" data-act="jump" data-to="about">About</button>
        <button data-act="jump" data-to="where">Where</button>
        <button data-act="jump" data-to="schedule">Schedule</button>
        <button data-act="jump" data-to="reviews">Reviews</button>
        <button data-act="jump" data-to="resume">Resume</button>
      </nav>
      <section class="p-sec" id="sec-about">
        <h2>About</h2>
        <p class="bio ${prof.more ? '' : 'clamp'}">${t.bio}</p>
        <button class="more-btn" data-act="bioMore">${prof.more ? 'Show less' : 'Read more'}</button>
        <h3>Teaches</h3>
        <div class="pills">${t.subjects.map((s) => `<span class="pill">${subjectById(s).name}</span>`).join('')}${t.stages.map((s) => `<span class="pill lvl"><b>${stageById(s).name}</b> <em>${stageById(s).exam}</em></span>`).join('')}</div>
      </section>
      <section class="p-sec" id="sec-where">
        <h2>Where lessons happen</h2>
        <div class="mode-list">${t.modes.map((m) => {
          const mo = modeById(m);
          const extra = m === 'home' ? `+${ugx(TRAVEL_FEE)} travel` : m === 'tutor' ? areaById(t.area).name : '';
          return `<div class="mode-row"><span class="ic-box">${icon(mo.icon, 20)}</span><div class="grow"><b>${mo.name}</b><small>${mo.note}</small></div>${extra ? `<span class="pill sm">${extra}</span>` : ''}</div>`;
        }).join('')}</div>
        <h3>Travels to</h3>
        <div class="pills">${t.travels.map((a) => `<span class="pill">${areaById(a).name}</span>`).join('')}</div>
      </section>
      <section class="p-sec" id="sec-schedule">
        <h2>Schedule</h2>
        <p class="tz">${icon('clock')} Times shown in East Africa Time</p>
        <div id="sched">${scheduleHtml(t, prof.day, null, 't')}</div>
      </section>
      <section class="p-sec" id="sec-reviews">
        <h2>What families say</h2>
        <div class="rating-sum">
          <div><div class="big">${t.rating.toFixed(1)}</div><div class="stars">${stars(5, 15)}</div><small class="muted">${t.reviews} reviews</small></div>
          <div class="bars">${dist.map((p, i) => `<div>${5 - i}<span><i style="width:${p}%"></i></span></div>`).join('')}</div>
        </div>
        ${reviewsFor(t).map((rv) => `<div class="review"><div class="review-top"><span class="avatar">${rv.name[0]}</span><div><b>${rv.name}</b><small>${rv.who} · ${rv.ago}</small></div><span class="stars">${stars(rv.stars, 13)}</span></div><p>${rv.text}</p></div>`).join('')}
      </section>
      <section class="p-sec" id="sec-resume">
        <h2>Qualifications</h2>
        <div class="timeline">${t.resume.map(([y, title, place]) => `<div><small>${y}</small><b>${title}</b><span>${place}</span></div>`).join('')}</div>
      </section>
      <section class="sec"><div class="sec-head"><h2>Similar teachers</h2></div><div class="rail">${similar.map(miniCard).join('')}</div></section>`,
    fixed: `<div class="actionbar">
        <div class="price"><b>${money(t.rate)}</b><small>per hour</small></div>
        <a class="icon-btn outlined" href="#/chat/${t.id}" aria-label="Message ${t.name}">${icon('chat')}</a>
        <a class="btn btn-primary" href="#/book/${t.id}">Book a session</a>
      </div>`,
    mount() {
      const secs = ['about', 'where', 'schedule', 'reviews', 'resume'];
      view.onscroll = () => {
        let active = 'about';
        for (const s of secs) if ($('#sec-' + s)?.getBoundingClientRect().top < 160) active = s;
        $$('#ptabs button').forEach((b) => b.classList.toggle('on', b.dataset.to === active));
      };
    },
  };
}

// ---- Booking ----
let bk = null;
function Book(r) {
  const t = tutorById(r.id);
  if (!t) return NotFound();
  const re = r.q.re ? findBooking(r.q.re) : null;
  if (!bk || bk.src !== location.hash) {
    bk = {
      src: location.hash, tutorId: t.id,
      hours: re ? re.hours : 1,
      mode: re ? re.mode : (t.modes.includes('home') ? 'home' : t.modes[0]),
      day: r.q.d || firstOpenDay(t), time: r.q.t || null, re: re?.id || null,
    };
  }
  return {
    mode: 'no-tabs',
    html: `${topbar(re ? 'Change session time' : 'Book a session', `#/tutor/${t.id}`)}
      <div class="pad">
        ${tutorMini(t)}
        ${re ? '' : `
        <h2 class="step-title">Where</h2>
        <div class="mode-pick">${t.modes.map((m) => {
          const mo = modeById(m);
          return `<button class="mode-opt ${bk.mode === m ? 'on' : ''}" data-act="bMode" data-v="${m}">
            <span class="ic-box">${icon(mo.icon, 20)}</span><div><b>${mo.name}</b><small>${m === 'home' ? `+${ugx(TRAVEL_FEE)} travel` : mo.note}</small></div></button>`;
        }).join('')}</div>

        <h2 class="step-title">How long</h2>
        <div class="seg tall">${[1, 2].map((h) => `<button class="${bk.hours === h ? 'on' : ''}" data-act="bLen" data-h="${h}">${plural(h, 'hour')}<small>${money(priceFor(t, h, bk.mode))}</small></button>`).join('')}</div>`}

        <h2 class="step-title">Pick a time</h2>
        <div id="sched">${scheduleHtml(t, bk.day, bk.time, 'b')}</div>
      </div>`,
    fixed: bookBar(t),
  };
}
function bookBar(t) {
  const when = bk.time ? at(bk.day, bk.time) : null;
  const total = priceFor(t, bk.hours, bk.mode);
  return `<div class="actionbar">
    <div class="price"><b>${when ? fmtTime(when) : money(total)}</b><small>${when ? `${fmtDay(when)} · ${money(total)}` : `${plural(bk.hours, 'hour')} · ${modeById(bk.mode).short}`}</small></div>
    <button class="btn btn-primary" data-act="bNext" ${bk.time ? '' : 'disabled'}>${bk.re ? 'Confirm new time' : 'Continue'}</button>
  </div>`;
}

// ---- Checkout (Mobile Money) ----
let pending = null;
function Checkout(r) {
  const t = tutorById(r.id);
  const { d, t: time } = r.q;
  if (!t || !d || !time) return NotFound();
  const hours = +r.q.h === 2 ? 2 : 1;
  const mode = modeById(r.q.m).id;
  const start = at(d, time);
  const end = new Date(start.getTime() + hours * 3600e3);
  const lesson = hours === 2 ? Math.round(t.rate * 1.8) : t.rate;
  const travel = mode === 'home' ? TRAVEL_FEE : 0;
  const total = lesson + travel;
  pending = { tutorId: t.id, start: start.toISOString(), hours, mode, price: total };

  return {
    mode: 'no-tabs',
    html: `${topbar('Confirm and pay', `#/book/${t.id}`)}
      <div class="pad">
        ${tutorMini(t)}
        <div class="summary">
          <div class="line"><span>Subject</span><b>${subjectById(t.subjects[0]).name}</b></div>
          <div class="line"><span>When</span><b>${fmtLong(start)}<br />${fmtTime(start)} – ${fmtTime(end)}</b></div>
          <div class="line"><span>Where</span><b>${modeById(mode).name}</b></div>
        </div>

        <h2 class="step-title">Pay with Mobile Money</h2>
        <div class="momo-pick">
          ${[['mtn', 'MTN MoMo'], ['airtel', 'Airtel Money']].map(([id, name]) => `
            <button class="momo-opt ${state.momo.provider === id ? 'on' : ''}" data-act="momoProvider" data-v="${id}">
              <span class="momo-logo ${id}">${id === 'mtn' ? 'MTN' : 'airtel'}</span><b>${name}</b></button>`).join('')}
        </div>
        <label class="field" style="margin-top:12px"><span>Mobile Money number</span>
          <input class="input" id="momoPhone" type="tel" inputmode="tel" maxlength="14" placeholder="07XX XXX XXX" value="${esc(state.momo.phone)}" /></label>

        <div class="summary">
          <div class="line"><span>${plural(hours, 'hour')} coaching</span><b>${money(lesson)}</b></div>
          ${travel ? `<div class="line"><span>Travel to your home</span><b>${money(travel)}</b></div>` : ''}
          <div class="line total"><span>Total</span><b>${money(total)}</b></div>
        </div>

        <div class="policy">
          <div>${icon('check')} Free cancellation up to 12 hours before</div>
          <div>${icon('check')} Money held until the session is confirmed done</div>
          <div>${icon('check')} Every teacher is ID-checked before joining</div>
        </div>
        <div class="notice">${icon('info')} Demo only — no Mobile Money request is actually sent and no money moves.</div>
      </div>`,
    fixed: `<div class="actionbar"><div class="price"><b>${money(total)}</b><small>${fmtDay(start)}, ${fmtTime(start)}</small></div><button class="btn btn-primary" data-act="payStart">Request payment</button></div>`,
  };
}

// The MoMo "check your phone" state — the bit a card checkout never has.
function payFlow() {
  const phone = $('#momoPhone')?.value.trim() || state.momo.phone;
  if (!phone || phone.replace(/\D/g, '').length < 9) { toast('Enter a valid Mobile Money number'); return; }
  state.momo.phone = phone;
  save();
  const provider = state.momo.provider === 'mtn' ? 'MTN MoMo' : 'Airtel Money';
  openSheet(`<div class="pay-wait">
      <div class="pulse">${icon('phone', 30)}</div>
      <h2>Check your phone</h2>
      <p>We sent a ${provider} request to <b>${esc(phone)}</b>. Enter your PIN to approve it.</p>
      <div class="pay-timer"><i></i></div>
      <small class="muted" id="payHint">Waiting for approval…</small>
    </div>`);
  setTimeout(() => { if ($('#payHint')) $('#payHint').textContent = 'Still waiting — this can take a moment.'; }, 3000);
  setTimeout(() => {
    if (!pending) return;
    const b = { id: uid(), ...pending, status: 'upcoming' };
    const t = tutorById(b.tutorId);
    const s = new Date(b.start);
    state.bookings.push(b);
    state.onboarded = true;
    const th = thread(t.id);
    th.msgs.push({
      from: 'them',
      text: `Thank you for booking. I have you down for ${fmtDay(s)} at ${fmtTime(s)}, ${modeById(b.mode).name.toLowerCase()}. Please let me know which topics ${state.forChild && state.learnerName ? state.learnerName : 'you'} find hardest so I come prepared.`,
      ts: Date.now(),
    });
    th.unread = true;
    save();
    pending = null;
    bk = null;
    closeSheet();
    location.hash = `#/confirmed/${b.id}`;
  }, 5200);
}

function Confirmed(r) {
  const b = findBooking(r.id);
  if (!b) return NotFound();
  const t = tutorById(b.tutorId);
  const s = new Date(b.start);
  return {
    mode: 'bare',
    html: `<section class="done">
      <div class="done-check">${icon('check', 54)}</div>
      <h1>Payment received</h1>
      <p>${firstName(t.name)} is confirmed for ${fmtLong(s)} at ${fmtTime(s)}, ${modeById(b.mode).name.toLowerCase()}.</p>
      ${tutorMini(t, `${plural(b.hours, 'hour')} · ${fmtDay(s)}, ${fmtTime(s)}`)}
      <div class="receipt-note">${icon('receipt', 16)} A receipt was sent to ${esc(state.momo.phone || 'your phone')}</div>
      <div class="actions">
        <button class="btn btn-outline btn-block" data-act="ics" data-id="${b.id}">${icon('calendar', 20)} Add to calendar</button>
        <a class="btn btn-outline btn-block" href="#/chat/${t.id}">${icon('chat', 20)} Message ${firstName(t.name)}</a>
        <a class="btn btn-primary btn-block" href="#/sessions">Go to my sessions</a>
      </div>
    </section>`,
    mount() {
      const box = $('.done');
      const colors = ['var(--brand)', 'var(--gold)', 'var(--mint)', 'var(--sky)', 'var(--ink)'];
      for (let i = 0; i < 24; i++) {
        const c = document.createElement('i');
        c.className = 'confetti';
        c.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.6}s;animation-duration:${1.8 + Math.random()}s`;
        box.appendChild(c);
      }
    },
  };
}

// ---- Sessions ----
let sessTab = 'upcoming';
function Sessions(r) {
  if (r.q.tab) sessTab = r.q.tab === 'past' ? 'past' : 'upcoming';
  const up = upcoming();
  const past = pastSessions();
  const list = sessTab === 'upcoming' ? up : past;
  const card = (b) => {
    const t = tutorById(b.tutorId);
    const s = new Date(b.start);
    const e = new Date(s.getTime() + b.hours * 3600e3);
    const isPast = b.status === 'done';
    const m = modeById(b.mode);
    const actions = isPast
      ? `<a class="btn btn-outline btn-sm" href="#/book/${t.id}">Book again</a>${b.rating ? '' : `<button class="btn btn-outline btn-sm" data-act="rate" data-id="${b.id}">Rate</button>`}`
      : `${sessionCta(b, t)}<a class="btn btn-outline btn-sm" href="#/book/${t.id}?re=${b.id}">Change</a><button class="btn btn-outline btn-sm icon-only" data-act="cancel" data-id="${b.id}" aria-label="Cancel session">${icon('x', 18)}</button>`;
    return `<article class="lesson ${isPast ? 'past' : ''}">
      <div class="datebox"><small>${s.toLocaleDateString('en-GB', { month: 'short' })}</small><b>${s.getDate()}</b><span>${s.toLocaleDateString('en-GB', { weekday: 'short' })}</span></div>
      <div class="grow">
        <div class="lesson-top"><img src="${photo(t.img, 80)}" alt="" /><b>${subjectById(t.subjects[0]).name} · ${firstName(t.name)}</b></div>
        <div class="lesson-time">${icon('clock', 15)} ${fmtTime(s)} – ${fmtTime(e)}${!isPast ? ` · ${until(s)}` : ''}${isPast && b.rating ? ` <span class="mini-stars">${stars(b.rating)}</span>` : ''}</div>
        <div class="lesson-time">${icon(m.icon, 15)} ${m.name}${b.price ? ` · ${money(b.price)}` : ''}</div>
        <div class="lesson-actions">${actions}</div>
      </div>
    </article>`;
  };
  const empty = sessTab === 'upcoming'
    ? emptyState('calendar', 'No sessions booked', 'Find a teacher near you and book the first one.', '<a class="btn btn-primary" href="#/search">Find a teacher</a>')
    : emptyState('book', 'No past sessions yet', 'Finished sessions show up here with your ratings.');
  return {
    tab: 'sessions',
    html: `<header class="page-head"><h1>Sessions</h1><a class="icon-btn outlined" href="#/search" aria-label="Book a session">${icon('plus')}</a></header>
      <div class="pad" style="margin-bottom:16px"><div class="seg">
        <button class="${sessTab === 'upcoming' ? 'on' : ''}" data-act="sTab" data-v="upcoming">Upcoming${up.length ? ` (${up.length})` : ''}</button>
        <button class="${sessTab === 'past' ? 'on' : ''}" data-act="sTab" data-v="past">Past${past.length ? ` (${past.length})` : ''}</button>
      </div></div>
      ${list.length ? list.map(card).join('') : empty}`,
  };
}

// ---- Video room (only used for mode: video) ----
let cls = null;
function Room(r) {
  const b = findBooking(r.id);
  if (!b) return NotFound();
  const t = tutorById(b.tutorId);
  const subject = subjectById(t.subjects[0]);
  b.notes ||= '';
  cls = { b, mic: true, cam: false, panel: false, stream: null };
  return {
    mode: 'bare',
    html: '',
    fixed: `<div class="class">
      <header class="class-top">
        <button class="icon-btn" data-act="cLeave" aria-label="Leave">${icon('back')}</button>
        <div class="grow"><b>${subject.name} · ${firstName(t.name)}</b><small id="timer">00:00 / ${b.hours}:00:00</small></div>
        <span class="live-pill">LIVE</span>
      </header>
      <div class="stage">
        <img class="bg" src="${photo(t.img, 300)}" alt="" />
        <div class="face-wrap"><img class="face" src="${photo(t.img, 600)}" alt="${t.name}" /></div>
        <span class="name-tag">${icon('mic', 15)} ${firstName(t.name)}</span>
        <div class="self" id="self"></div>
      </div>
      <div class="controls">
        <button class="ctl" id="ctlMic" data-act="cMic" aria-label="Mute">${icon('mic')}</button>
        <button class="ctl" id="ctlCam" data-act="cCam" aria-label="Camera">${icon('videoOff')}</button>
        <button class="ctl" id="ctlNotes" data-act="cPanel" aria-label="Notes">${icon('note')}</button>
        <button class="ctl end" data-act="cEnd" aria-label="End session">${icon('phone', 26)}</button>
      </div>
      <div class="panel" id="panel">
        <div class="panel-head"><h3>Session notes</h3><button class="icon-btn" data-act="cPanel" aria-label="Close">${icon('x')}</button></div>
        <div class="panel-body"><textarea class="notes" id="notes" placeholder="Topics covered, homework, what to revise…">${esc(b.notes)}</textarea></div>
      </div>
    </div>`,
    mount() {
      paintSelf();
      const started = Date.now();
      const timer = setInterval(() => {
        const s = Math.floor((Date.now() - started) / 1000);
        const el = $('#timer');
        if (el) el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)} / ${b.hours}:00:00`;
      }, 1000);
      $('#notes')?.addEventListener('input', (e) => { b.notes = e.target.value; save(); });
      return () => {
        clearInterval(timer);
        cls?.stream?.getTracks().forEach((tr) => tr.stop());
        cls = null;
      };
    },
  };
}
function paintSelf() {
  const self = $('#self');
  if (!self || !cls) return;
  self.innerHTML = cls.cam && cls.stream ? '<video autoplay playsinline muted></video>' : `<span class="avatar">${initial()}</span>`;
  if (cls.cam && cls.stream) $('video', self).srcObject = cls.stream;
  if (!cls.mic) self.insertAdjacentHTML('beforeend', `<span class="muted-ic">${icon('micOff', 14)}</span>`);
}

// ---- Messages ----
function Messages() {
  const list = Object.entries(state.threads)
    .map(([id, th]) => ({ t: tutorById(id), th, last: th.msgs[th.msgs.length - 1] }))
    .filter((x) => x.t && x.last)
    .sort((a, b) => b.last.ts - a.last.ts);
  return {
    tab: 'messages',
    html: `<header class="page-head"><h1>Messages</h1></header>
      ${list.length ? list.map(({ t, th, last }) => `<a class="thread ${th.unread ? 'unread' : ''}" href="#/chat/${t.id}">
          <div class="ph"><img src="${photo(t.img, 120)}" alt="" />${online(t) ? '<span class="online"></span>' : ''}</div>
          <div class="grow"><div class="top"><b>${t.name}</b><time>${ago(last.ts)}</time></div>
          <p><span style="overflow:hidden;text-overflow:ellipsis">${last.from === 'me' ? 'You: ' : ''}${esc(last.text)}</span>${th.unread ? '<i class="unread-dot"></i>' : ''}</p></div>
        </a>`).join('')
        : emptyState('chat', 'No messages yet', 'Message a teacher before you book to ask about their approach.', '<a class="btn btn-primary" href="#/search">Find a teacher</a>')}`,
  };
}

let chatPaint = null;
let chatTutor = null;
const chatTyping = {};
function Chat(r) {
  const t = tutorById(r.id);
  if (!t) return NotFound();
  const th = thread(t.id);
  th.unread = false;
  save();
  const suggestions = ['Hello, are you free on weekends?', 'Do you teach two children together?', 'Can you travel to my area?'];
  return {
    mode: 'full',
    html: `<section class="chat">
      <header class="chat-head">
        <button class="icon-btn" data-act="back" data-fallback="#/messages" aria-label="Back">${icon('back')}</button>
        <a href="#/tutor/${t.id}" style="display:flex;gap:10px;align-items:center;flex:1;min-width:0">
          <img src="${photo(t.img, 120)}" alt="" /><div class="grow"><b>${t.name}</b><small>${online(t) ? 'Online now' : 'Usually replies within a few hours'}</small></div>
        </a>
        <a class="btn btn-primary btn-sm" href="#/book/${t.id}">Book</a>
      </header>
      <div class="msgs" id="msgs"></div>
      <div class="suggest" id="suggest">${th.msgs.some((m) => m.from === 'me') ? '' : suggestions.map((s) => `<button class="chip" data-act="suggest" data-text="${esc(s)}">${s}</button>`).join('')}</div>
      <div class="composer">
        <textarea id="txt" rows="1" placeholder="Message ${firstName(t.name)}…" aria-label="Message"></textarea>
        <button class="send" id="send" data-act="send" disabled aria-label="Send">${icon('send', 20)}</button>
      </div>
    </section>`,
    mount() {
      const msgs = $('#msgs');
      const txt = $('#txt');
      chatTutor = t.id;
      chatPaint = (typing = chatTyping[t.id]) => {
        let lastDay = '';
        msgs.innerHTML = th.msgs.map((m) => {
          const d = new Date(m.ts);
          const k = dayKey(d);
          const sep = k !== lastDay ? `<div class="day-sep">${isToday(d) ? 'Today' : fmtDay(d)}</div>` : '';
          lastDay = k;
          return `${sep}<div class="msg ${m.from}">${esc(m.text)}<time>${fmtTime(d)}</time></div>`;
        }).join('') + (typing ? '<div class="typing"><i></i><i></i><i></i></div>' : '');
        msgs.scrollTop = msgs.scrollHeight;
      };
      chatPaint();
      txt.addEventListener('input', () => {
        $('#send').disabled = !txt.value.trim();
        txt.style.height = 'auto';
        txt.style.height = Math.min(txt.scrollHeight, 120) + 'px';
      });
      txt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && matchMedia('(pointer: fine)').matches) { e.preventDefault(); A.send(); }
      });
      return () => { chatPaint = null; chatTutor = null; };
    },
  };
}
function sendMessage(tutorId, text) {
  const th = thread(tutorId);
  th.msgs.push({ from: 'me', text, ts: Date.now() });
  save();
  chatPaint?.();
  const s = $('#suggest');
  if (s) s.innerHTML = '';
  setTimeout(() => { chatTyping[tutorId] = true; if (chatTutor === tutorId) chatPaint?.(true); }, 700);
  setTimeout(() => {
    chatTyping[tutorId] = false;
    th.msgs.push({ from: 'them', text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], ts: Date.now() });
    if (chatTutor === tutorId) chatPaint?.(false); else th.unread = true;
    save();
    if (current?.name === 'messages') rerender(); else renderTabs(currentTab);
  }, 2600);
}

// ---- Profile ----
function Profile() {
  const stage = myStage();
  const goal = GOALS.find((g) => g.id === state.goal);
  const chev = icon('chevron', 20, 'chev');
  const row = (ic, title, sub, attrs, right = chev, tag = 'button') =>
    `<${tag} class="row" ${attrs}><span class="ic-box">${icon(ic, 20)}</span><div class="grow"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>${right}</${tag}>`;
  return {
    tab: 'profile',
    html: `<header class="page-head"><h1>Profile</h1></header>
      <div class="me"><span class="avatar lg">${initial()}</span><div class="grow"><b>${esc(state.name || 'Guest')}</b>
        <small>${state.forChild ? `Parent · ${esc(state.learnerName || 'child')} in ${state.klass}` : `Student · ${state.klass}`}</small></div>
        <button class="icon-btn outlined" data-act="editMe" aria-label="Edit profile">${icon('pen', 20)}</button></div>

      <div class="plan"><div class="grow"><small>${stage.exam} countdown</small><b>${daysTo(EXAM_DATES[stage.exam])} days to go</b></div>
        <a class="btn btn-dark btn-sm" href="#/search">Add sessions</a></div>

      <p class="menu-title">Learning</p>
      <div class="row-list">
        ${row('book', 'Subjects', state.subjects.map((s) => subjectById(s).name).join(', '), 'data-act="editSubjects"')}
        ${row('trophy', 'Goal', goal?.name ?? 'Not set', 'data-act="editMe"')}
        ${row('pin', 'Your area', areaById(state.area).name, 'data-act="editMe"')}
        ${row('heart', 'Saved teachers', plural(state.saved.length, 'teacher'), 'href="#/saved"', chev, 'a')}
      </div>

      <p class="menu-title">Payments</p>
      <div class="row-list">
        ${row('wallet', 'Mobile Money', `${state.momo.provider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}${state.momo.phone ? ' · ' + esc(state.momo.phone) : ''}`, 'data-act="editMomo"')}
        ${row('receipt', 'Receipts', `${plural(pastSessions().length, 'session')} paid`, 'href="#/sessions?tab=past"', chev, 'a')}
      </div>

      <p class="menu-title">Settings</p>
      <div class="row-list">
        ${row('bell', 'Session reminders', 'SMS and push', 'data-act="notif"', `<span class="switch ${state.notifications ? 'on' : ''}"></span>`)}
        ${row('shield', 'Safety', 'How we vet teachers', 'data-act="safety"')}
        ${row('help', 'Help', 'FAQs and support', 'data-act="toast" data-msg="Help centre — coming soon"')}
      </div>

      <p class="menu-title">Demo</p>
      <div class="row-list">
        ${row('sparkle', 'Load sample data', 'A filled-in parent account', 'data-act="demoLogin"', '')}
        ${row('refresh', 'Reset app', 'Clear everything on this device', 'data-act="reset"', '')}
        ${row('logout', 'Back to website', '', 'href="../"', chev, 'a')}
      </div>
      <p class="fine">Cranoly · prototype build</p>`,
  };
}

function Saved() {
  const list = state.saved.map(tutorById).filter(Boolean);
  return {
    tab: 'profile',
    html: `${topbar('Saved teachers', '#/profile')}
      ${list.length ? `<div class="tlist">${list.map(tutorCard).join('')}</div>`
        : emptyState('heart', 'No saved teachers yet', 'Tap the heart on any teacher to keep them here.', '<a class="btn btn-primary" href="#/search">Browse teachers</a>')}`,
  };
}

function NotFound() {
  return { tab: null, mode: 'bare', html: emptyState('help', 'Page not found', 'That link does not lead anywhere.', '<a class="btn btn-primary" href="#/home">Go home</a>') };
}

// ================= Actions =================
const A = {
  noop() {},
  closeSheet,
  toast: (el) => toast(el.dataset.msg),
  back(el) {
    if (navDepth > 0) history.back();
    else location.hash = el.dataset.fallback || '#/home';
  },
  demoLogin() {
    seedDemo();
    closeSheet();
    if (location.hash === '#/home') rerender(); else location.hash = '#/home';
    toast('Sample data loaded');
  },
  save(el) {
    const id = el.dataset.id;
    const on = !state.saved.includes(id);
    state.saved = on ? [...state.saved, id] : state.saved.filter((x) => x !== id);
    save();
    el.classList.toggle('on', on);
    el.setAttribute('aria-pressed', on);
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    toast(on ? 'Saved' : 'Removed from saved');
    if (current?.name === 'saved') rerender();
  },
  share(el) {
    const t = tutorById(el.dataset.id);
    const url = location.href;
    if (navigator.share) navigator.share({ title: t.name, text: t.headline, url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => toast('Link copied'), () => toast('Could not copy link'));
  },
  where(el) {
    const b = findBooking(el.dataset.id);
    const t = tutorById(b.tutorId);
    const s = new Date(b.start);
    const atHome = b.mode === 'home';
    openSheet(`<h2>${atHome ? 'Teacher comes to you' : 'You go to the teacher'}</h2>
      <p>${fmtLong(s)} at ${fmtTime(s)} · ${plural(b.hours, 'hour')}</p>
      ${tutorMini(t, atHome ? `Travelling to ${areaById(state.area).name}` : areaById(t.area).name)}
      <div class="policy" style="margin-top:16px">
        <div>${icon('check')} ${atHome ? 'Have a quiet table and good light ready' : 'Arrive five minutes early'}</div>
        <div>${icon('check')} Payment is already held — nothing to pay on the day</div>
        <div>${icon('shield')} Report anything that concerns you from this screen</div>
      </div>
      <div class="foot">
        <a class="btn btn-outline" href="${waLink(t)}" target="_blank" rel="noopener">${icon('whatsapp', 18)} WhatsApp</a>
        <button class="btn btn-primary" data-act="closeSheet">Got it</button>
      </div>`);
  },
  safety() {
    openSheet(`<h2>How we vet teachers</h2>
      <div class="policy" style="margin-top:8px">
        <div>${icon('check')} National ID checked against the name on the profile</div>
        <div>${icon('check')} Teaching certificate or degree seen and recorded</div>
        <div>${icon('check')} Two referees contacted, usually a head teacher</div>
        <div>${icon('check')} Ratings are only from families who actually paid for a session</div>
      </div>
      <div class="notice">${icon('info')} Demo build — no real vetting has happened here. Report anything concerning to a real safeguarding contact before this ships.</div>
      <div class="foot one"><button class="btn btn-primary" data-act="closeSheet">Close</button></div>`);
  },

  // Onboarding
  obPick(el) {
    const k = el.dataset.k;
    ob[k] = k === 'forChild' ? el.dataset.v === '1' : el.dataset.v;
    if (k === 'klass') ob.subjects = [];
    rerender();
    const step = ob.step;
    clearTimeout(obTimer);
    obTimer = setTimeout(() => { if (ob && ob.step === step) A.obNext(); }, 260);
  },
  obSubject(el) {
    const v = el.dataset.v;
    ob.subjects = ob.subjects.includes(v) ? ob.subjects.filter((x) => x !== v) : [...ob.subjects, v];
    rerender();
  },
  obNext() {
    if (!ob) return;
    clearTimeout(obTimer);
    if (ob.step < 4) { ob.step++; rerender(); view.scrollTop = 0; return; }
    Object.assign(state, {
      onboarded: true, forChild: ob.forChild, klass: ob.klass,
      subjects: ob.subjects, area: ob.area, name: ob.name.trim(),
    });
    save();
    filters.subject = state.subjects[0];
    filters.area = state.area;
    ob = null;
    location.hash = '#/search';
    toast(`Welcome, ${state.name}. Here are teachers near you.`);
  },
  obBack() {
    clearTimeout(obTimer);
    if (ob && ob.step > 0) { ob.step--; rerender(); } else { ob = null; location.hash = '#/welcome'; }
  },

  // Search filters
  pickSubject() {
    openSheet(`<h2>Which subject?</h2>
      <div class="ob-grid" style="margin-top:14px">${SUBJECTS.map((x) => `<button class="opt ${filters.subject === x.id ? 'on' : ''}" data-act="setSubject" data-v="${x.id}">
        <span class="glyph tint-${x.tint}">${x.glyph}</span><div><b>${x.name}</b><small>${x.tutors.toLocaleString()} teachers</small></div></button>`).join('')}</div>`);
  },
  setSubject(el) { filters.subject = el.dataset.v; closeSheet(); rerender(); view.scrollTop = 0; },
  fArea() {
    openSheet(`<h2>Where are you?</h2><p>We show teachers based there, or who travel to you.</p>
      <div class="ob-list compact">
        <button class="opt ${!filters.area ? 'on' : ''}" data-act="setArea" data-v=""><span class="ic-box">${icon('globe', 20)}</span><div><b>Anywhere</b></div></button>
        ${AREAS.map((a) => `<button class="opt ${filters.area === a.id ? 'on' : ''}" data-act="setArea" data-v="${a.id}">
          <span class="ic-box">${icon('pin', 20)}</span><div><b>${a.name}</b></div></button>`).join('')}</div>`);
  },
  setArea(el) { filters.area = el.dataset.v || null; closeSheet(); rerender(); },
  fRate() {
    const label = (v) => (+v >= MAX_RATE ? 'Any price' : `Under ${ugx(+v)}`);
    openSheet(`<h2>Price per hour</h2><p>What teachers charge before any travel fee.</p>
      <div class="range-val" id="rv">${label(filters.max)}</div>
      <input type="range" class="range" id="rr" min="15000" max="${MAX_RATE}" step="1000" value="${filters.max}" aria-label="Maximum hourly rate" />
      <div class="range-ends"><span>${ugx(15000)}</span><span>${ugx(MAX_RATE)}+</span></div>
      <div class="foot"><button class="btn btn-outline" data-act="rateReset">Reset</button><button class="btn btn-primary" data-act="rateApply">Show teachers</button></div>`,
    (s) => { const rr = $('#rr', s); rr.addEventListener('input', () => ($('#rv', s).textContent = label(rr.value))); });
  },
  rateApply() { filters.max = +$('#rr').value; closeSheet(); rerender(); },
  rateReset() { filters.max = MAX_RATE; closeSheet(); rerender(); },
  fMode() {
    openSheet(`<h2>Where should lessons happen?</h2>
      <div class="check-list" style="margin-top:14px">${MODES.map((m) => `<button class="opt ${filters.modes.includes(m.id) ? 'on' : ''}" data-act="toggleOn" data-v="${m.id}">
        <span class="ic-box">${icon(m.icon, 20)}</span><div><b>${m.name}</b><small>${m.note}</small></div><span class="radio">${filters.modes.includes(m.id) ? icon('check', 14) : ''}</span></button>`).join('')}</div>
      <div class="foot"><button class="btn btn-outline" data-act="modeReset">Reset</button><button class="btn btn-primary" data-act="modeApply">Show teachers</button></div>`);
  },
  modeApply() { filters.modes = $$('.sheet .opt.on').map((o) => o.dataset.v); closeSheet(); rerender(); },
  modeReset() { filters.modes = []; closeSheet(); rerender(); },
  fStage() {
    openSheet(`<h2>Which level?</h2>
      <div class="check-list" style="margin-top:14px">
        <button class="opt ${!filters.stage ? 'on' : ''}" data-act="setStage" data-v=""><div><b>Any level</b></div></button>
        ${STAGES.map((s) => `<button class="opt ${filters.stage === s.id ? 'on' : ''}" data-act="setStage" data-v="${s.id}">
          <div><b>${s.name}</b><small>${s.classes.join(', ')} · ${s.exam}</small></div></button>`).join('')}</div>`);
  },
  setStage(el) { filters.stage = el.dataset.v || null; closeSheet(); rerender(); },
  toggleOn(el) {
    const on = el.classList.toggle('on');
    const r = $('.radio', el);
    if (r) r.innerHTML = on ? icon('check', 14) : '';
  },
  fExaminer() { filters.examiner = !filters.examiner; rerender(); },
  fSort() {
    openSheet(`<h2>Sort by</h2><div class="check-list" style="margin-top:14px">${Object.entries(SORTS).map(([k, v]) => `<button class="opt ${filters.sort === k ? 'on' : ''}" data-act="setSort" data-v="${k}">
      <div><b>${v}</b></div><span class="radio">${filters.sort === k ? icon('check', 14) : ''}</span></button>`).join('')}</div>`);
  },
  setSort(el) { filters.sort = el.dataset.v; closeSheet(); rerender(); },
  fClear() { Object.assign(filters, { q: '', max: MAX_RATE, area: null, modes: [], examiner: false, stage: null, sort: 'best' }); rerender(); },

  // Tutor profile
  jump(el) { $('#sec-' + el.dataset.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  bioMore() { prof.more = !prof.more; rerender(); },
  tDay(el) {
    prof.day = el.dataset.k;
    $('#sched').innerHTML = scheduleHtml(tutorById(prof.id), prof.day, null, 't');
  },
  tSlot(el) { location.hash = `#/book/${prof.id}?d=${prof.day}&t=${el.dataset.t}`; },

  // Booking
  bMode(el) { bk.mode = el.dataset.v; rerender(); },
  bLen(el) { bk.hours = +el.dataset.h; rerender(); },
  bDay(el) {
    bk.day = el.dataset.k;
    bk.time = null;
    const t = tutorById(bk.tutorId);
    $('#sched').innerHTML = scheduleHtml(t, bk.day, bk.time, 'b');
    fixed.innerHTML = bookBar(t);
  },
  bSlot(el) {
    bk.time = el.dataset.t;
    $$('#sched .slot').forEach((s) => s.classList.toggle('on', s === el));
    fixed.innerHTML = bookBar(tutorById(bk.tutorId));
  },
  bNext() {
    if (!bk.time) return;
    if (bk.re) {
      const b = findBooking(bk.re);
      b.start = at(bk.day, bk.time).toISOString();
      save();
      location.hash = '#/sessions';
      toast(`Moved to ${fmtDay(new Date(b.start))}, ${fmtTime(new Date(b.start))}`);
      return;
    }
    location.hash = `#/checkout/${bk.tutorId}?d=${bk.day}&t=${bk.time}&h=${bk.hours}&m=${bk.mode}`;
  },

  // Payment
  momoProvider(el) {
    state.momo.provider = el.dataset.v;
    save();
    $$('.momo-opt').forEach((o) => o.classList.toggle('on', o.dataset.v === el.dataset.v));
  },
  payStart: payFlow,
  ics(el) { downloadIcs(findBooking(el.dataset.id)); },

  // Sessions
  sTab(el) { sessTab = el.dataset.v; history.replaceState(null, '', `#/sessions?tab=${sessTab}`); rerender(); },
  cancel(el) {
    const b = findBooking(el.dataset.id);
    const t = tutorById(b.tutorId);
    const hoursAway = (new Date(b.start) - Date.now()) / 3600e3;
    openSheet(`<h2>Cancel this session?</h2>
      <p>${subjectById(t.subjects[0]).name} with ${t.name}, ${fmtDay(new Date(b.start))} at ${fmtTime(new Date(b.start))}.
      ${hoursAway >= 12 ? 'It is more than 12 hours away, so you get a full refund to your Mobile Money.' : 'It starts in under 12 hours, so the teacher keeps half the fee.'}</p>
      <div class="foot"><button class="btn btn-outline" data-act="closeSheet">Keep it</button><button class="btn btn-dark" data-act="cancelYes" data-id="${b.id}">Cancel session</button></div>`);
  },
  cancelYes(el) {
    findBooking(el.dataset.id).status = 'cancelled';
    save();
    closeSheet();
    rerender();
    toast('Session cancelled — refund on its way');
  },
  rate(el) { openRate(findBooking(el.dataset.id)); },
  star(el) {
    const n = +el.dataset.n;
    $$('.stars-input button').forEach((b, i) => b.classList.toggle('on', i < n));
    const go = $('#rateGo');
    go.disabled = false;
    go.dataset.n = n;
  },
  rateSubmit(el) {
    const b = findBooking(el.dataset.id);
    b.rating = +el.dataset.n;
    save();
    closeSheet();
    rerender();
    toast('Thank you for the feedback');
  },

  // Video room
  cLeave() { location.hash = '#/sessions'; },
  cMic() {
    cls.mic = !cls.mic;
    const btn = $('#ctlMic');
    btn.classList.toggle('off', !cls.mic);
    btn.innerHTML = icon(cls.mic ? 'mic' : 'micOff');
    paintSelf();
  },
  async cCam() {
    const btn = $('#ctlCam');
    if (!cls.cam) {
      try {
        cls.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!cls) return;
        cls.cam = true;
      } catch {
        toast('Camera unavailable — check browser permissions');
        return;
      }
    } else {
      cls.stream?.getTracks().forEach((tr) => tr.stop());
      cls.stream = null;
      cls.cam = false;
    }
    btn.classList.toggle('on', cls.cam);
    btn.innerHTML = icon(cls.cam ? 'video' : 'videoOff');
    paintSelf();
  },
  cPanel() {
    cls.panel = !cls.panel;
    $('#panel').classList.toggle('open', cls.panel);
    $('#ctlNotes').classList.toggle('on', cls.panel);
  },
  cEnd() {
    const b = cls.b;
    b.status = 'done';
    save();
    location.hash = '#/sessions?tab=past';
    setTimeout(() => openRate(b), 450);
  },

  // Chat
  send() {
    const txt = $('#txt');
    const text = txt?.value.trim();
    if (!text || !chatTutor) return;
    sendMessage(chatTutor, text);
    txt.value = '';
    txt.style.height = '';
    $('#send').disabled = true;
  },
  suggest(el) { if (chatTutor) sendMessage(chatTutor, el.dataset.text); },

  // Profile
  editMe() {
    openSheet(`<h2>Your details</h2>
      <div style="display:grid;gap:14px">
        <label class="field"><span>Your name</span><input class="input" id="pfName" maxlength="30" value="${esc(state.name)}" /></label>
        <label class="field"><span>Booking for</span><select class="input" id="pfFor">
          <option value="1" ${state.forChild ? 'selected' : ''}>My child</option>
          <option value="0" ${!state.forChild ? 'selected' : ''}>Myself</option></select></label>
        <label class="field" id="learnerField" ${state.forChild ? '' : 'hidden'}><span>Child’s name</span><input class="input" id="pfLearner" maxlength="30" value="${esc(state.learnerName)}" placeholder="e.g. Brian" /></label>
        <label class="field"><span>Class</span><select class="input" id="pfClass">${ALL_CLASSES.map((c) => `<option value="${c}" ${c === state.klass ? 'selected' : ''}>${c} — ${stageOfClass(c).exam}</option>`).join('')}</select></label>
        <label class="field"><span>Area</span><select class="input" id="pfArea">${AREAS.map((a) => `<option value="${a.id}" ${a.id === state.area ? 'selected' : ''}>${a.name}</option>`).join('')}</select></label>
        <label class="field"><span>Goal</span><select class="input" id="pfGoal">${GOALS.map((g) => `<option value="${g.id}" ${g.id === state.goal ? 'selected' : ''}>${g.name}</option>`).join('')}</select></label>
      </div>
      <div class="foot"><button class="btn btn-outline" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="saveMe">Save</button></div>`,
    (s) => {
      $('#pfFor', s).addEventListener('change', (e) => { $('#learnerField', s).hidden = e.target.value !== '1'; });
    });
  },
  saveMe() {
    state.name = $('#pfName').value.trim() || state.name;
    state.forChild = $('#pfFor').value === '1';
    state.learnerName = $('#pfLearner')?.value.trim() || '';
    state.klass = $('#pfClass').value;
    state.area = $('#pfArea').value;
    state.goal = $('#pfGoal').value;
    filters.area = state.area;
    save();
    closeSheet();
    rerender();
    toast('Profile updated');
  },
  editSubjects() {
    const stage = myStage().id;
    const avail = SUBJECTS.filter((x) => x.levels.includes(stage));
    openSheet(`<h2>Subjects</h2><p>Which subjects need coaching?</p>
      <div class="pills">${avail.map((x) => `<button class="chip ${state.subjects.includes(x.id) ? 'on' : ''}" data-act="toggleOn" data-v="${x.id}">${x.name}</button>`).join('')}</div>
      <div class="foot one"><button class="btn btn-primary" data-act="saveSubjects">Save</button></div>`);
  },
  saveSubjects() {
    const picked = $$('.sheet .chip.on').map((c) => c.dataset.v);
    if (!picked.length) { toast('Pick at least one subject'); return; }
    state.subjects = picked;
    filters.subject = picked[0];
    save();
    closeSheet();
    rerender();
  },
  editMomo() {
    openSheet(`<h2>Mobile Money</h2><p>Used for paying teachers and receiving refunds.</p>
      <div class="momo-pick">${[['mtn', 'MTN MoMo'], ['airtel', 'Airtel Money']].map(([id, name]) => `
        <button class="momo-opt ${state.momo.provider === id ? 'on' : ''}" data-act="momoProvider" data-v="${id}">
          <span class="momo-logo ${id}">${id === 'mtn' ? 'MTN' : 'airtel'}</span><b>${name}</b></button>`).join('')}</div>
      <label class="field" style="margin-top:14px"><span>Number</span><input class="input" id="momoEdit" type="tel" inputmode="tel" maxlength="14" placeholder="07XX XXX XXX" value="${esc(state.momo.phone)}" /></label>
      <div class="notice">${icon('info')} Demo only — nothing is sent to MTN or Airtel.</div>
      <div class="foot"><button class="btn btn-outline" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="saveMomo">Save</button></div>`);
  },
  saveMomo() {
    state.momo.phone = $('#momoEdit').value.trim();
    save();
    closeSheet();
    rerender();
    toast('Mobile Money updated');
  },
  notif() { state.notifications = !state.notifications; save(); rerender(); },
  reset() {
    openSheet(`<h2>Reset the app?</h2><p>This clears your profile, sessions, saved teachers and messages on this device.</p>
      <div class="foot"><button class="btn btn-outline" data-act="closeSheet">Cancel</button><button class="btn btn-dark" data-act="resetYes">Reset</button></div>`);
  },
  resetYes() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    state = blank();
    filters.subject = null;
    filters.area = null;
    closeSheet();
    location.hash = '#/welcome';
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.act];
  if (!fn) return;
  e.preventDefault();
  fn(el, e);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

// ================= Router =================
const routes = {
  welcome: Welcome, onboarding: Onboarding, home: Home, search: Search, tutor: Tutor, book: Book,
  checkout: Checkout, confirmed: Confirmed, sessions: Sessions, room: Room, messages: Messages,
  chat: Chat, profile: Profile, saved: Saved,
};
const TABS = [['home', 'home', 'Home'], ['search', 'search', 'Find'], ['sessions', 'calendar', 'Sessions'], ['messages', 'chat', 'Messages'], ['profile', 'user', 'Profile']];

let current = null;
let currentTab = null;
let cleanup = null;
let navDepth = 0;

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = h.split('?');
  const [name, id] = path.split('/');
  return { name, id: id && decodeURIComponent(id), q: Object.fromEntries(new URLSearchParams(qs)) };
}

function renderTabs(active) {
  currentTab = active;
  tabbar.classList.toggle('hidden', !active);
  if (!active) { tabbar.innerHTML = ''; return; }
  const unread = Object.values(state.threads).filter((t) => t.unread).length;
  tabbar.innerHTML = TABS.map(([id, ic, label]) => `<a class="tab ${id === active ? 'on' : ''}" href="#/${id}" ${id === active ? 'aria-current="page"' : ''}>
    <span class="ic-wrap">${icon(ic, 22)}</span>${label}${id === 'messages' && unread ? `<span class="badge">${unread}</span>` : ''}</a>`).join('');
}

function render({ keep = false } = {}) {
  settle();
  let r = parse();
  if (r.name === 'demo') {
    seedDemo();
    r = { name: 'home', q: {} };
    history.replaceState(null, '', '#/home');
  } else if (!routes[r.name]) {
    r = { name: state.onboarded ? 'home' : 'welcome', q: {} };
    history.replaceState(null, '', '#/' + r.name);
  }
  cleanup?.();
  cleanup = null;
  view.onscroll = null;
  if (!keep) closeSheet();
  const scroll = view.scrollTop;
  const scr = routes[r.name](r);
  current = r;
  view.className = `view ${scr.mode || ''}`;
  view.innerHTML = `<div class="${keep ? '' : 'screen'}">${scr.html}</div>`;
  fixed.innerHTML = scr.fixed || '';
  view.scrollTop = keep ? scroll : 0;
  renderTabs(scr.tab || null);
  cleanup = scr.mount?.() || null;
}
const rerender = () => render({ keep: true });

addEventListener('hashchange', () => { navDepth++; render(); });
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
