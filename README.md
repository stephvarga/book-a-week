# Book a Week

A small, password-protected site for gifting or sharing a vacation week: a
gallery, amenities list, a calendar of available weeks, and a booking form
that emails the request to you and confirms it to the requester. Built with
Next.js, TypeScript, and [Resend](https://resend.com) — no database required.

Originally built to gift a timeshare week as a wedding present; generalized
here so anyone can fork it for their own property, cabin, or vacation week.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in the values, see below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Enter the password you
set in `.env.local` to see the site.

## Configure it as your own

Everything you'd want to change for a basic reskin lives in one file:
[`src/content/site.ts`](src/content/site.ts) — the hero copy, property
description, amenities, gallery captions, and email text. Edit that file,
save, and the site reflects it.

The available date ranges live in [`src/lib/dates.ts`](src/lib/dates.ts)
instead, since the server also validates bookings against that exact list —
see the comment at the top of the file for why it's kept separate.

Gallery and hero images default to placeholder SVGs under
[`public/images/`](public/images/). Drop your own JPGs/PNGs in there with the
same filenames (or update the paths in `content/site.ts`) to replace them. If
you'd rather host images externally, add the image host to
`images.remotePatterns` in `next.config.js` and use `next/image` or an
`<img>` tag pointing at the remote URL.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | What it's for |
|---|---|
| `SITE_PASSWORD` | The password gating the whole site. Also used to sign session cookies — changing it invalidates existing sessions. |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) (free tier available) for sending booking emails. |
| `OWNER_EMAIL` | Where booking requests get sent. |
| `FROM_EMAIL` | The "from" address on outgoing emails — must be a verified sender/domain in Resend. |

In production (Vercel or otherwise), set these in your host's environment
variable settings rather than committing `.env.local`.

## Security

This isn't a toy password gate — a few things are handled deliberately:

- **Real sessions, not client-side state.** `/api/auth` sets an httpOnly,
  signed session cookie on correct password. The booking API checks that
  cookie server-side rather than trusting anything the client claims.
- **Rate limiting** on both the login and booking endpoints (in-memory,
  per-IP — see the note in `src/lib/rate-limit.ts` about its limits on
  serverless deployments).
- **Constant-time password comparison** to avoid leaking password length or
  content via response timing.
- **Input sanitization**: all user-submitted text is escaped before being
  interpolated into the HTML emails, and the submitted booking date is looked
  up against the server's own canonical list rather than trusted as-is from
  the client — closing what would otherwise be an open endpoint that could
  send arbitrary emails to arbitrary addresses.
- **Security headers** (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS) set in `next.config.js`.

If you fork this for something with actually sensitive data behind it, treat
the password gate as a "keep casual visitors out" mechanism, not
enterprise-grade access control — there's no user accounts, no audit log, and
one shared password.

## Deploy

Works on [Vercel](https://vercel.com) with zero config beyond the environment
variables above:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stephvarga/book-a-week&env=SITE_PASSWORD,RESEND_API_KEY,OWNER_EMAIL,FROM_EMAIL&envDescription=See%20README%20for%20details%20on%20each%20variable)

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Resend](https://resend.com) for transactional email
- No database — available dates are a static list, bookings are emailed, not stored

## License

MIT — see [LICENSE](LICENSE). Fork it, use it for your own property, change
whatever you want.
