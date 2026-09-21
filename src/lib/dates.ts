// ── Available dates ──────────────────────────────────────────────────────────
// Each entry is a Saturday→Saturday week (standard timeshare check-in/out)
// Shared between the client UI and the /api/book route, so the server can
// validate a submitted date.id against the real canonical values instead of
// trusting whatever the client sends.

export type AvailableDate = {
  id: string;
  checkIn: string;
  checkOut: string;
  label: string;
};

export const AVAILABLE_DATES: AvailableDate[] = [
  // 2026
  { id: '2026-07', checkIn: '2026-07-11', checkOut: '2026-07-18', label: 'Jul 11 – 18, 2026' },
  { id: '2026-08', checkIn: '2026-08-08', checkOut: '2026-08-15', label: 'Aug 8 – 15, 2026' },
  { id: '2026-09', checkIn: '2026-09-05', checkOut: '2026-09-12', label: 'Sep 5 – 12, 2026' },
  { id: '2026-10', checkIn: '2026-10-03', checkOut: '2026-10-10', label: 'Oct 3 – 10, 2026' },
  { id: '2026-11', checkIn: '2026-11-07', checkOut: '2026-11-14', label: 'Nov 7 – 14, 2026' },
  { id: '2026-12', checkIn: '2026-12-05', checkOut: '2026-12-12', label: 'Dec 5 – 12, 2026' },
  // 2027
  { id: '2027-01', checkIn: '2027-01-09', checkOut: '2027-01-16', label: 'Jan 9 – 16, 2027' },
  { id: '2027-02', checkIn: '2027-02-06', checkOut: '2027-02-13', label: 'Feb 6 – 13, 2027' },
  { id: '2027-03', checkIn: '2027-03-06', checkOut: '2027-03-13', label: 'Mar 6 – 13, 2027' },
  { id: '2027-04', checkIn: '2027-04-03', checkOut: '2027-04-10', label: 'Apr 3 – 10, 2027' },
  { id: '2027-05', checkIn: '2027-05-01', checkOut: '2027-05-08', label: 'May 1 – 8, 2027' },
  { id: '2027-06', checkIn: '2027-06-05', checkOut: '2027-06-12', label: 'Jun 5 – 12, 2027' },
  { id: '2027-07', checkIn: '2027-07-10', checkOut: '2027-07-17', label: 'Jul 10 – 17, 2027' },
  { id: '2027-08', checkIn: '2027-08-07', checkOut: '2027-08-14', label: 'Aug 7 – 14, 2027' },
  { id: '2027-09', checkIn: '2027-09-04', checkOut: '2027-09-11', label: 'Sep 4 – 11, 2027' },
  { id: '2027-10', checkIn: '2027-10-02', checkOut: '2027-10-09', label: 'Oct 2 – 9, 2027' },
  { id: '2027-11', checkIn: '2027-11-06', checkOut: '2027-11-13', label: 'Nov 6 – 13, 2027' },
  { id: '2027-12', checkIn: '2027-12-04', checkOut: '2027-12-11', label: 'Dec 4 – 11, 2027' },
];

export function findAvailableDate(id: unknown): AvailableDate | undefined {
  if (typeof id !== 'string') return undefined;
  return AVAILABLE_DATES.find((d) => d.id === id);
}
