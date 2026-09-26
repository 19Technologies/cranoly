# Somero

A marketplace for **exam coaching in Uganda** — PLE, UCE and UACE. Parents find a vetted
teacher, book by the session, and pay with Mobile Money. The teacher comes to the home,
the student goes to them, or they meet over WhatsApp or video.

Plain HTML, CSS and JavaScript — no build step, no framework, no backend yet.

- Landing page: `index.html`
- App: `app/` (installable — "Add to Home Screen" on Android or iPhone)
- Sample data: open `app/#/demo`

## Why it is built this way

Decisions that are deliberate, not accidental:

- **In-person first.** Most coaching in Uganda happens face to face. Video is the premium
  tier, not the default. `MODES` in `shared/data.js` carries all four options and the
  session screen adapts to whichever was booked.
- **Mobile Money, not cards.** Card penetration is low. Checkout collects a phone number
  and shows the *"check your phone, enter your PIN"* pending state that a card flow never
  has — see `payFlow()` in `app/app.js`.
- **Trust is the product.** ID checks, qualifications, referees and UNEB examiner status
  are surfaced everywhere, because that is what a parent is actually buying.
- **Exam countdown.** The home screen leads with days remaining. The deadline is the
  reason anyone books.

## What works

**App** — onboarding (parent or student → class → subjects → area), home with exam
countdown and next session, search with filters for area, price, mode, level and UNEB
examiner status, teacher profiles with schedule and reviews, booking with mode and
duration, Mobile Money checkout, sessions list with reschedule and cancel, video room for
online sessions, messaging, profile.

**Landing page** — hero search, how it works, vetting, Mobile Money, teacher carousel,
parent testimonials, FAQ. Parent-facing only; teacher recruitment lives elsewhere.

State is saved in `localStorage`, so each device has its own data.

## Run locally

ES modules do not load from `file://`, so serve the folder:

```bash
cd somero
python3 -m http.server 8000
# http://localhost:8000        landing
# http://localhost:8000/app/   app
```

## Make it yours

| What | Where |
| --- | --- |
| Name | Find and replace `Somero` / `somero` |
| Colours, fonts, radii | `shared/tokens.css` |
| Logo | `logoMark()` in `shared/icons.js`, plus `app/icons/` |
| Subjects, classes, areas, teachers, prices | `shared/data.js` |
| Exam dates for the countdown | `EXAM_DATES` in `shared/data.js` |
| Landing copy | `index.html` |
| App screens | `app/app.js` — one function per screen |

## Not real yet

- **No payments.** Checkout simulates the MoMo flow but sends nothing to MTN or Airtel.
  Real integration needs a backend: Collections for taking money, Disbursements for
  paying teachers out.
- **No vetting.** The safety screens describe a process that does not exist yet. Before
  this ships with real teachers and real children, that process has to be real, with a
  named safeguarding contact and a working report route.
- **Prices are guesses.** The rates in `shared/data.js` are unverified placeholders.
  Check real market rates before pricing anything.
- **No photos.** Teacher portraits are initials on a coloured tile, generated inline by
  `photo()` in `shared/data.js`. Stock-photo services could not supply Ugandan faces, and
  putting a real identifiable person under a fabricated "UNEB examiner" claim would be
  misrepresentation. Swap in real teacher photos by changing that one function.
- **Data protection.** Uganda's Data Protection and Privacy Act 2019 applies once you
  hold student records. Worth reading before launch.

## Origin

Built from the design system of [tutor-marketplace](https://github.com/19Technologies/tutor-marketplace),
a language-tutoring prototype. Same component library, different market and domain model.
