// ── Available weeks ──────────────────────────────────────────────────────────
// Weeks run Saturday → Saturday (standard timeshare check-in/out). Rather
// than a hardcoded list of calendar dates — which goes stale the moment it
// ships and eventually shows weeks that have already passed — the available
// weeks are generated on the fly from whatever "now" is passed in.
//
// The client (src/app/page.tsx) calls `generateUpcomingWeeks` with the
// browser's own `new Date()`, so what's displayed is accurate to the
// visitor's own timezone, always starts from the next real Saturday, and
// never shows a week that's already passed — no manual upkeep required.
//
// The server (src/app/api/book/route.ts) never needs the full list. It only
// validates that a submitted week id is well-formed — a real Saturday, in a
// plausible range — via `findAvailableDate`. That's a pattern check, not a
// "does this match today" check, so there's no client/server timezone to
// reconcile: a booking request a few hours "late" due to timezone skew
// between browser and server is still a real, valid week, just one a human
// will confirm or decline anyway (this is a request-to-book flow, not
// instant booking).

export type AvailableDate = {
  /** YYYY-MM-DD of check-in (always a Saturday). Doubles as a stable id. */
  id: string;
  checkIn: string;
  checkOut: string;
  label: string;
};

const SATURDAY = 6; // Date#getDay(): 0 = Sunday … 6 = Saturday

function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Calendar-safe day arithmetic. Deliberately NOT `new Date(d.getTime() + n *
// 86400000)` — that adds a fixed number of milliseconds, which silently
// lands on the wrong calendar day (or even the wrong weekday) whenever a
// daylight saving transition falls inside the span. `setDate` operates on
// the local calendar fields directly, so it's correct across DST.
function addDays(d: Date, days: number): Date {
  const result = dateOnly(d);
  result.setDate(result.getDate() + days);
  return result;
}

function formatId(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLabel(checkIn: Date, checkOut: Date): string {
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', opts);
  const sameMonth =
    checkIn.getMonth() === checkOut.getMonth() && checkIn.getFullYear() === checkOut.getFullYear();
  const start = fmt(checkIn, { month: 'short', day: 'numeric' });
  const end = sameMonth ? fmt(checkOut, { day: 'numeric' }) : fmt(checkOut, { month: 'short', day: 'numeric' });
  return `${start} – ${end}, ${checkOut.getFullYear()}`;
}

function nextSaturdayOnOrAfter(d: Date): Date {
  const date = dateOnly(d);
  const diff = (SATURDAY - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function buildWeek(checkIn: Date): AvailableDate {
  const checkOut = addDays(checkIn, 7);
  return {
    id: formatId(checkIn),
    checkIn: formatId(checkIn),
    checkOut: formatId(checkOut),
    label: formatLabel(checkIn, checkOut),
  };
}

/**
 * Generates `weeksAhead` consecutive Saturday→Saturday weeks starting from
 * the next Saturday on/after `from`. Pass the caller's own `new Date()` (e.g.
 * from a client component) so "upcoming" reflects that viewer's timezone.
 */
export function generateUpcomingWeeks(opts: { from?: Date; weeksAhead?: number } = {}): AvailableDate[] {
  const { from = new Date(), weeksAhead = 52 } = opts;
  const firstCheckIn = nextSaturdayOnOrAfter(from);
  const weeks: AvailableDate[] = [];
  for (let i = 0; i < weeksAhead; i++) {
    weeks.push(buildWeek(addDays(firstCheckIn, i * 7)));
  }
  return weeks;
}

const ID_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a submitted week id and reconstructs the canonical week from it
 * — the label/check-in/check-out sent in emails always come from here, never
 * from whatever the client claims. Deliberately doesn't compare against
 * "today": see the file header for why that's a display concern, not a
 * validation one.
 */
export function findAvailableDate(id: unknown): AvailableDate | undefined {
  if (typeof id !== 'string' || !ID_RE.test(id)) return undefined;

  const [y, m, d] = id.split('-').map(Number);
  const checkIn = new Date(y, m - 1, d);
  // Rejects invalid calendar dates (e.g. 2026-02-30) that the Date
  // constructor would otherwise silently roll over into the next month.
  if (checkIn.getFullYear() !== y || checkIn.getMonth() !== m - 1 || checkIn.getDate() !== d) {
    return undefined;
  }
  if (checkIn.getDay() !== SATURDAY) return undefined;

  // Loose plausibility bound, not a freshness check — keeps obviously bogus
  // dates (decades off) out of the confirmation emails without needing any
  // notion of the visitor's "today".
  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const maxDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
  if (checkIn < minDate || checkIn > maxDate) return undefined;

  return buildWeek(checkIn);
}
