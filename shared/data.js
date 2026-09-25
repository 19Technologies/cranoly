// ------------------------------------------------------------------
// All demo content lives here. The landing page and the app both read
// from this file, so editing a tutor here updates them everywhere.
// Names, bios, prices and reviews are placeholders.
//
// PRICES ARE UNVERIFIED PLACEHOLDERS. Check real market rates before
// building anything around them.
// ------------------------------------------------------------------

export const BRAND = {
  name: 'Cranoly',
  currency: 'UGX',
};

function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// ------------------------------------------------------------------
// Placeholder portraits.
//
// These are initials on a coloured tile, generated inline — NOT photos.
// That is deliberate: stock-photo services could not supply Ugandan
// faces, and putting a real identifiable person under a fabricated
// "UNEB examiner, 11 years teaching" claim would be misrepresentation.
//
// When you have real teachers, replace the body of this function with
// a URL and everything updates: the cards, profiles, messages and rail.
//   export const photo = (t, size = 300) => t.photoUrl;
// ------------------------------------------------------------------
const FACE_TINTS = ['#C8EBD8', '#CFE0F5', '#FDF0CC', '#F8DECB', '#DFDCF5', '#D8EFE3'];

export const initialsOf = (name) =>
  name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const photo = (t, size = 300) => {
  const txt = initialsOf(t.name);
  const tint = FACE_TINTS[hash(t.id) % FACE_TINTS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`
    + `<rect width="100" height="100" fill="${tint}"/>`
    + `<text x="50" y="52" text-anchor="middle" dominant-baseline="central" `
    + `font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif" `
    + `font-size="30" font-weight="700" letter-spacing="-1" fill="#15181B">${txt}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

// UGX formatting: 25000 -> "25,000"
export const ugx = (n) => n.toLocaleString('en-UG');

// ---- Curriculum ----
export const SUBJECTS = [
  { id: 'maths',      name: 'Mathematics',   glyph: '÷',  tutors: 1840, tint: 'sky',   levels: ['primary', 'olevel', 'alevel'] },
  { id: 'physics',    name: 'Physics',       glyph: 'Ω',  tutors: 620,  tint: 'lilac', levels: ['olevel', 'alevel'] },
  { id: 'chemistry',  name: 'Chemistry',     glyph: 'Ch',  tutors: 580,  tint: 'mint',  levels: ['olevel', 'alevel'] },
  { id: 'biology',    name: 'Biology',       glyph: 'Bi', tutors: 640,  tint: 'mint',  levels: ['olevel', 'alevel'] },
  { id: 'english',    name: 'English',       glyph: 'Aa', tutors: 1520, tint: 'gold',  levels: ['primary', 'olevel', 'alevel'] },
  { id: 'science',    name: 'Science',       glyph: 'Sc', tutors: 980,  tint: 'sky',   levels: ['primary'] },
  { id: 'sst',        name: 'Social Studies', glyph: 'SS', tutors: 870, tint: 'peach', levels: ['primary'] },
  { id: 'geography',  name: 'Geography',     glyph: 'Ge',  tutors: 410,  tint: 'peach', levels: ['olevel', 'alevel'] },
  { id: 'history',    name: 'History',       glyph: 'Hi',  tutors: 380,  tint: 'gold',  levels: ['olevel', 'alevel'] },
  { id: 'ict',        name: 'ICT',           glyph: 'IT',  tutors: 290,  tint: 'lilac', levels: ['olevel', 'alevel'] },
  { id: 'kiswahili',  name: 'Kiswahili',     glyph: 'Ki', tutors: 340,  tint: 'mint',  levels: ['primary', 'olevel'] },
  { id: 'luganda',    name: 'Luganda',       glyph: 'Lg', tutors: 260,  tint: 'peach', levels: ['primary', 'olevel'] },
];

export const subjectById = (id) => SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];

// Exam tracks. `exam` is what parents actually search for.
export const STAGES = [
  { id: 'primary', name: 'Primary',        exam: 'PLE',   classes: ['P5', 'P6', 'P7'] },
  { id: 'olevel',  name: 'O-Level',        exam: 'UCE',   classes: ['S1', 'S2', 'S3', 'S4'] },
  { id: 'alevel',  name: 'A-Level',        exam: 'UACE',  classes: ['S5', 'S6'] },
];

export const stageById = (id) => STAGES.find((s) => s.id === id) || STAGES[1];
export const stageOfClass = (c) => STAGES.find((s) => s.classes.includes(c)) || STAGES[1];

export const ALL_CLASSES = STAGES.flatMap((s) => s.classes);

// UNEB sits national exams around Oct/Nov. Used for the countdown on Home.
// Update each year, or wire to a real calendar later.
export const EXAM_DATES = {
  PLE:  '2026-11-03',
  UCE:  '2026-10-19',
  UACE: '2026-11-16',
};

// ---- Where lessons happen ----
// In-person is the default in this market. Video is the premium tier.
export const MODES = [
  { id: 'home',     name: 'At your home',   short: 'Home',     icon: 'home',  note: 'Tutor travels to you' },
  { id: 'tutor',    name: 'At the tutor',   short: 'Tutor’s',  icon: 'pin',   note: 'You travel to them' },
  { id: 'whatsapp', name: 'WhatsApp call',  short: 'WhatsApp', icon: 'phone', note: 'Voice only — light on data' },
  { id: 'video',    name: 'Video call',     short: 'Video',    icon: 'video', note: 'In-app, needs good internet' },
];
export const modeById = (id) => MODES.find((m) => m.id === id) || MODES[0];

// Kampala + the commuter belt first. Add districts as you expand.
export const AREAS = [
  { id: 'central',  name: 'Kampala Central' },
  { id: 'kawempe',  name: 'Kawempe' },
  { id: 'makindye', name: 'Makindye' },
  { id: 'nakawa',   name: 'Nakawa' },
  { id: 'rubaga',   name: 'Rubaga' },
  { id: 'wakiso',   name: 'Wakiso' },
  { id: 'kira',     name: 'Kira' },
  { id: 'entebbe',  name: 'Entebbe' },
  { id: 'mukono',   name: 'Mukono' },
];
export const areaById = (id) => AREAS.find((a) => a.id === id) || AREAS[0];

export const GOALS = [
  { id: 'exam',      name: 'Pass the national exam', emoji: '📝' },
  { id: 'catchup',   name: 'Catch up after falling behind', emoji: '🩹' },
  { id: 'grades',    name: 'Push grades higher', emoji: '📈' },
  { id: 'confidence', name: 'Build confidence', emoji: '💪' },
  { id: 'holiday',   name: 'Holiday coaching', emoji: '☀️' },
];

// ---- Tutors ----
// `rate` is UGX per 1-hour session. `verified` means ID + qualification checked.
// `examiner` = has marked for UNEB — the credential parents ask about first.
export const TUTORS = [
  {
    id: 'grace-nakimuli', name: 'Grace Nakimuli', gender: 'f',
    subjects: ['maths', 'physics'], stages: ['olevel', 'alevel'],
    area: 'nakawa', travels: ['nakawa', 'central', 'kira'],
    modes: ['home', 'tutor', 'video'],
    rate: 35000, rating: 4.9, reviews: 84, students: 62, sessions: 940,
    verified: true, examiner: true, top: true, years: 11,
    headline: 'A-Level Maths and Physics, taught by a UNEB examiner',
    bio: 'I have taught Maths and Physics at secondary level for eleven years and marked UACE papers for six. I know exactly where students lose marks, and we work on those spots first. Every session ends with a short set of past-paper questions, and I send parents a note on how it went.',
    resume: [['2015–now', 'UNEB examiner, Mathematics', 'Uganda National Examinations Board'], ['2013', 'BSc with Education', 'Makerere University']],
    schoolNote: 'Teaches at a secondary school in Nakawa',
  },
  {
    id: 'julius-okello', name: 'Julius Okello', gender: 'm',
    subjects: ['chemistry', 'biology'], stages: ['olevel', 'alevel'],
    area: 'wakiso', travels: ['wakiso', 'kira', 'nakawa'],
    modes: ['home', 'tutor', 'whatsapp'],
    rate: 30000, rating: 4.8, reviews: 61, students: 48, sessions: 720,
    verified: true, examiner: false, top: true, years: 8,
    headline: 'Chemistry and Biology that finally make sense',
    bio: 'Most students do not struggle with Chemistry — they struggle with how it was first explained to them. I go back to the foundation, rebuild it properly, then move fast. I work well with students who have decided they are "bad at science".',
    resume: [['2018', 'Diploma in Education', 'Kyambogo University'], ['2016–now', 'Secondary science teacher', 'Wakiso']],
    schoolNote: 'Teaches at a secondary school in Wakiso',
  },
  {
    id: 'sarah-ainembabazi', name: 'Sarah Ainembabazi', gender: 'f',
    subjects: ['english', 'sst'], stages: ['primary'],
    area: 'rubaga', travels: ['rubaga', 'central', 'makindye'],
    modes: ['home', 'tutor'],
    rate: 20000, rating: 5.0, reviews: 112, students: 90, sessions: 1310,
    verified: true, examiner: true, top: true, years: 14,
    headline: 'PLE coaching — English and Social Studies',
    bio: 'Fourteen years in P6 and P7 classrooms. I am patient with children who are nervous, and firm with children who are coasting. Parents get a short WhatsApp update after every session so you always know where your child stands.',
    resume: [['2017–now', 'UNEB examiner, Primary English', 'Uganda National Examinations Board'], ['2010', 'Grade V Teaching Certificate', 'Shimoni Core PTC']],
    schoolNote: 'Teaches at a primary school in Rubaga',
  },
  {
    id: 'david-ssempala', name: 'David Ssempala', gender: 'm',
    subjects: ['maths', 'science'], stages: ['primary'],
    area: 'kawempe', travels: ['kawempe', 'central'],
    modes: ['home', 'tutor', 'whatsapp'],
    rate: 18000, rating: 4.7, reviews: 43, students: 35, sessions: 480,
    verified: true, examiner: false, top: false, years: 6,
    headline: 'Primary Maths and Science, patient and practical',
    bio: 'I use everyday objects and simple drawings rather than long explanations. Children who have been told they are slow often just need a different route to the same answer. I mostly teach P5 to P7 in the afternoons and on weekends.',
    resume: [['2019', 'Grade III Teaching Certificate', 'Kyambogo University'], ['2019–now', 'Primary teacher', 'Kawempe']],
    schoolNote: 'Teaches at a primary school in Kawempe',
  },
  {
    id: 'patience-atuhaire', name: 'Patience Atuhaire', gender: 'f',
    subjects: ['biology', 'chemistry'], stages: ['alevel'],
    area: 'central', travels: ['central', 'nakawa', 'makindye'],
    modes: ['home', 'video'],
    rate: 40000, rating: 4.9, reviews: 57, students: 39, sessions: 610,
    verified: true, examiner: true, top: true, years: 9,
    headline: 'A-Level Biology for students aiming at medicine',
    bio: 'I coach S5 and S6 students who need strong points for medical and health science courses. We work from the UNEB syllabus outward, with weekly timed papers. I am direct about what a student needs to fix — but never unkind about it.',
    resume: [['2019–now', 'UNEB examiner, Biology', 'Uganda National Examinations Board'], ['2016', 'BSc Biology with Education', 'Mbarara University of Science and Technology']],
    schoolNote: 'Teaches at a secondary school in Kampala Central',
  },
  {
    id: 'moses-waiswa', name: 'Moses Waiswa', gender: 'm',
    subjects: ['maths', 'ict'], stages: ['olevel', 'alevel'],
    area: 'kira', travels: ['kira', 'nakawa', 'mukono'],
    modes: ['home', 'tutor', 'video', 'whatsapp'],
    rate: 28000, rating: 4.8, reviews: 39, students: 31, sessions: 420,
    verified: true, examiner: false, top: false, years: 5,
    headline: 'O-Level Maths and ICT, weekends and evenings',
    bio: 'I work a full-time job and teach in the evenings and on Saturdays, so I am reliable about time. Maths from S1 to S4, and Computer Studies for the new curriculum. I am comfortable teaching over WhatsApp when travel is difficult.',
    resume: [['2021', 'BSc Computer Science', 'Makerere University'], ['2021–now', 'Part-time Maths and ICT tutor', 'Kira']],
    schoolNote: 'Software developer, teaches evenings and weekends',
  },
  {
    id: 'rebecca-nabirye', name: 'Rebecca Nabirye', gender: 'f',
    subjects: ['english', 'luganda'], stages: ['primary', 'olevel'],
    area: 'makindye', travels: ['makindye', 'central', 'rubaga'],
    modes: ['home', 'tutor', 'whatsapp'],
    rate: 22000, rating: 4.9, reviews: 68, students: 54, sessions: 790,
    verified: true, examiner: false, top: false, years: 10,
    headline: 'English reading and writing, plus Luganda',
    bio: 'I help children who can decode words but cannot yet explain what they read — which is where most English marks are lost. I also teach Luganda to children in English-medium homes, including families abroad over WhatsApp.',
    resume: [['2015', 'Diploma in Primary Education', 'Kyambogo University'], ['2014–now', 'Primary teacher', 'Makindye']],
    schoolNote: 'Teaches at a primary school in Makindye',
  },
  {
    id: 'ronald-byaruhanga', name: 'Ronald Byaruhanga', gender: 'm',
    subjects: ['physics', 'maths'], stages: ['olevel'],
    area: 'mukono', travels: ['mukono', 'kira'],
    modes: ['tutor', 'whatsapp'],
    rate: 25000, rating: 4.6, reviews: 27, students: 22, sessions: 310,
    verified: true, examiner: false, top: false, years: 4,
    headline: 'O-Level Physics, small groups welcome',
    bio: 'I teach from my home in Mukono and I am happy to take two or three students together, which brings the cost down for each family. Practicals explained properly — not just memorised.',
    resume: [['2022', 'BSc with Education', 'Kyambogo University'], ['2022–now', 'Secondary physics teacher', 'Mukono']],
    schoolNote: 'Teaches at a secondary school in Mukono',
  },
  {
    id: 'esther-namuli', name: 'Esther Namuli', gender: 'f',
    subjects: ['maths', 'english', 'science'], stages: ['primary'],
    area: 'entebbe', travels: ['entebbe', 'wakiso'],
    modes: ['home', 'tutor'],
    rate: 20000, rating: 4.8, reviews: 51, students: 44, sessions: 590,
    verified: true, examiner: false, top: false, years: 7,
    headline: 'All-round P6 and P7 coaching in Entebbe',
    bio: 'I take a child through all four PLE subjects rather than just one, so nothing gets neglected in the final year. Three sessions a week is what I usually recommend from second term onwards.',
    resume: [['2018', 'Grade III Teaching Certificate', 'Ndejje Core PTC'], ['2018–now', 'Primary teacher', 'Entebbe']],
    schoolNote: 'Teaches at a primary school in Entebbe',
  },
  {
    id: 'ibrahim-kaggwa', name: 'Ibrahim Kaggwa', gender: 'm',
    subjects: ['geography', 'history'], stages: ['olevel', 'alevel'],
    area: 'central', travels: ['central', 'kawempe', 'rubaga'],
    modes: ['home', 'tutor', 'whatsapp'],
    rate: 26000, rating: 4.7, reviews: 34, students: 28, sessions: 390,
    verified: true, examiner: false, top: false, years: 9,
    headline: 'Geography and History — structure your answers properly',
    bio: 'In humanities, most marks are lost to poor structure rather than poor knowledge. I teach students how to plan an essay in two minutes and answer exactly what was asked. Plenty of past-paper practice.',
    resume: [['2016', 'BA with Education', 'Makerere University'], ['2016–now', 'Secondary humanities teacher', 'Kampala Central']],
    schoolNote: 'Teaches at a secondary school in Kampala Central',
  },
  {
    id: 'joan-akello', name: 'Joan Akello', gender: 'f',
    subjects: ['kiswahili', 'english'], stages: ['primary', 'olevel'],
    area: 'nakawa', travels: ['nakawa', 'kira', 'central'],
    modes: ['home', 'whatsapp', 'video'],
    rate: 24000, rating: 4.9, reviews: 46, students: 38, sessions: 520,
    verified: true, examiner: false, top: false, years: 6,
    headline: 'Kiswahili for the new curriculum, and English',
    bio: 'Kiswahili is compulsory now and many parents cannot help with homework at home. I start from everyday conversation rather than grammar tables, which is far less discouraging for a beginner.',
    resume: [['2020', 'BA Languages', 'Makerere University'], ['2020–now', 'Kiswahili teacher', 'Nakawa']],
    schoolNote: 'Teaches at a secondary school in Nakawa',
  },
  {
    id: 'samuel-mugisha', name: 'Samuel Mugisha', gender: 'm',
    subjects: ['chemistry', 'maths'], stages: ['alevel'],
    area: 'wakiso', travels: ['wakiso', 'rubaga', 'central'],
    modes: ['home', 'tutor', 'video'],
    rate: 38000, rating: 4.8, reviews: 41, students: 26, sessions: 450,
    verified: true, examiner: true, top: false, years: 10,
    headline: 'A-Level Chemistry, PCM and PCB combinations',
    bio: 'I take S5 and S6 students through the full Chemistry syllabus with weekly timed papers. Organic chemistry is where most students give up, so we start there rather than leaving it to the end.',
    resume: [['2020–now', 'UNEB examiner, Chemistry', 'Uganda National Examinations Board'], ['2015', 'BSc with Education', 'Makerere University']],
    schoolNote: 'Teaches at a secondary school in Wakiso',
  },
];

export const tutorById = (id) => TUTORS.find((t) => t.id === id);

// Sessions are priced per hour. Two-hour sessions get a small discount;
// home visits carry a travel fee the tutor keeps.
export const TRAVEL_FEE = 5000;
export const priceFor = (tutor, hours, mode) => {
  const base = hours === 2 ? Math.round(tutor.rate * 1.8) : tutor.rate;
  return base + (mode === 'home' ? TRAVEL_FEE : 0);
};

// Days until an exam, for the Home countdown.
export const daysTo = (iso) => Math.max(0, Math.ceil((new Date(iso + 'T00:00:00') - Date.now()) / 864e5));

// ---- Deterministic "random" helpers so demo data looks stable ----
export function seeded(seed) {
  let a = hash(String(seed));
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Open time slots for a tutor on a given day (YYYY-MM-DD), as "HH:MM".
// Weighted to after school and weekends, which is when coaching actually happens.
export function slotsFor(tutorId, day) {
  const rnd = seeded(tutorId + day);
  const weekend = [0, 6].includes(new Date(day + 'T00:00:00').getDay());
  const slots = [];
  const from = weekend ? 8 : 15;
  const to = weekend ? 19 : 21;
  for (let h = from; h < to; h++) {
    for (const m of [0, 30]) {
      if (rnd() < (weekend ? 0.45 : 0.38)) slots.push(`${String(h).padStart(2, '0')}:${m ? '30' : '00'}`);
    }
  }
  return slots;
}

const REVIEWERS = [
  ['Aisha', 'Parent, P7'], ['Robert', 'Parent, S4'], ['Specioza', 'Parent, P6'], ['Henry', 'S6 student'],
  ['Betty', 'Parent, S2'], ['Denis', 'S5 student'], ['Margaret', 'Parent, P5'], ['Fred', 'Parent, S4'],
  ['Prossy', 'Parent, P7'], ['Ivan', 'S4 student'], ['Sylvia', 'Parent, S6'], ['Charles', 'Parent, P6'],
];
const REVIEW_TEXT = [
  'My daughter moved from aggregate 12 to aggregate 7 in two terms. Very reliable with time.',
  'Comes on time every week and always has work prepared. My son no longer dreads the subject.',
  'Explains slowly without making the child feel stupid. That is what we were looking for.',
  'The past-paper practice made the real exam feel familiar. Worth every shilling.',
  'Sends me a short update after each session so I know what was covered.',
  'Patient with my son who had given up completely. He now asks when the next session is.',
  'Knows the syllabus inside out and does not waste time on things that never come up.',
  'We started late in third term and still saw a real improvement. Wish we had started earlier.',
  'Happy to teach my two children together, which helped with the cost.',
  'Professional and respectful in our home. My husband and I are both satisfied.',
];
const AGO = ['3 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago', '2 months ago', '3 months ago'];

export function reviewsFor(tutor, count = 5) {
  const rnd = seeded('rev' + tutor.id);
  const out = [];
  const used = new Set();
  let guard = 0;
  while (out.length < count && guard++ < 200) {
    const r = REVIEWERS[Math.floor(rnd() * REVIEWERS.length)];
    const text = REVIEW_TEXT[Math.floor(rnd() * REVIEW_TEXT.length)];
    if (used.has(r[0]) || used.has(text)) continue;
    used.add(r[0]); used.add(text);
    out.push({ name: r[0], who: r[1], text, stars: rnd() < 0.85 ? 5 : 4, ago: AGO[out.length] });
  }
  return out;
}

// Short study tips shown on Home, keyed by stage.
export const TIPS = {
  primary: [
    ['Do one past paper a week', 'Timed, sitting properly at a table — not on the sofa'],
    ['Read the question twice', 'Most lost marks in PLE come from answering the wrong thing'],
    ['Practise handwriting', 'A marker who cannot read it cannot award it'],
  ],
  olevel: [
    ['Work backwards from the syllabus', 'Tick off topics you can actually do unaided'],
    ['Draw the diagram first', 'In sciences it often carries marks on its own'],
    ['Show every step', 'Method marks survive a wrong final answer'],
  ],
  alevel: [
    ['Time every paper you attempt', 'Running out of time is the most common A-Level failure'],
    ['Mark your own work honestly', 'Use the marking guide before asking anyone for help'],
    ['Do the hard topic first', 'The one you keep avoiding is the one costing you a grade'],
  ],
};

export const AUTO_REPLIES = [
  'Noted. I will prepare some past-paper questions for the next session.',
  'Good question — let us go through it properly when we meet.',
  'Thank you for the message. See you on the day.',
  'That works for me. I will confirm the time.',
  'I will send a short update after the session.',
];
