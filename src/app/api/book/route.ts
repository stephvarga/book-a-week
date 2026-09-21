import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { findAvailableDate } from '@/lib/dates';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { cleanText, escapeHtml, isValidEmail, isValidGuests } from '@/lib/sanitize';
import { site } from '@/content/site';

const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  // Require the same session the password screen grants — this endpoint
  // sends real emails and must not be reachable by anyone who hasn't
  // gone through /api/auth first.
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`book:${ip}`, MAX_REQUESTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const name = cleanText(body.name, 100);
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = body.phone ? cleanText(body.phone, 30) : '';
    const notes = body.notes ? cleanText(body.notes, 1000) : '';
    const guests = body.guests;
    // Never trust the client's copy of the date — look it up by id so the
    // label/check-in/check-out in the email are always the real values.
    const date = findAvailableDate(body?.date?.id);

    if (!name || !isValidEmail(email) || !isValidGuests(guests) || !date) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }
    if (phone === null || notes === null) {
      return NextResponse.json({ error: 'Invalid field length' }, { status: 400 });
    }

    const ownerEmail = process.env.OWNER_EMAIL;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!ownerEmail || !resendApiKey) {
      console.error(
        !ownerEmail ? 'OWNER_EMAIL env variable not set' : 'RESEND_API_KEY env variable not set'
      );
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Constructed here rather than at module scope: the Resend SDK throws
    // synchronously on a missing key, which would otherwise crash `next
    // build`'s page-data collection step before any request is ever made.
    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeNotes = escapeHtml(notes);
    const safeGuests = escapeHtml(guests);
    const firstName = escapeHtml(name.split(' ')[0]);

    // Email to owner (you)
    await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      replyTo: email,
      subject: `🏖️ Booking Request — ${date.label}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1c1c1c;">
          <h2 style="font-weight: 300; font-size: 1.8rem; color: #1a4a62; margin-bottom: 0.25rem;">
            New Booking Request
          </h2>
          <p style="color: #8a8a8a; font-style: italic; margin-bottom: 2rem;">${escapeHtml(site.email.tagline)}</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0; width: 140px; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Requested Week</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0; font-weight: 400; color: #1a4a62; font-size: 1.05rem;">${date.label}</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Name</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0;"><a href="mailto:${safeEmail}" style="color: #2a6b8a;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Phone</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0;">${safePhone || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Guests</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #e8e0d0;">${safeGuests}</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 0; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Notes</td>
              <td style="padding: 0.75rem 0;">${safeNotes || '—'}</td>
            </tr>
          </table>

          <div style="margin-top: 2rem; padding: 1.25rem; background: #e8f4f8; border-left: 3px solid #2a6b8a;">
            <p style="margin: 0; font-size: 0.9rem; color: #1a4a62;">
              <strong>Check-in:</strong> ${date.checkIn} &nbsp;·&nbsp; <strong>Check-out:</strong> ${date.checkOut}
            </p>
          </div>

          <p style="margin-top: 2rem; font-size: 0.85rem; color: #8a8a8a;">
            Reply directly to this email to respond to ${firstName}.
          </p>
        </div>
      `,
    });

    // Confirmation email to the requester
    await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: ownerEmail,
      subject: `Your booking request for ${date.label} — ${site.property.name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1c1c1c;">
          <h2 style="font-weight: 300; font-size: 1.8rem; color: #1a4a62; margin-bottom: 0.25rem;">
            We got your request!
          </h2>
          <p style="color: #8a8a8a; font-style: italic; margin-bottom: 2rem;">${escapeHtml(site.email.tagline)}</p>

          <p style="line-height: 1.8; color: #5a5a5a;">
            Hi ${firstName},<br><br>
            Your request for <strong style="color: #1a4a62;">${date.label}</strong> at ${escapeHtml(site.property.name)} has been received.
            ${escapeHtml(site.email.signoffName)} will be in touch shortly to confirm your week and share any details you need before your stay.
          </p>

          <div style="margin: 2rem 0; padding: 1.5rem; background: #e8f4f8; border-left: 3px solid #2a6b8a;">
            <p style="margin: 0; font-size: 0.9rem; color: #1a4a62; line-height: 1.8;">
              <strong>Property:</strong> ${escapeHtml(site.property.name)} — ${escapeHtml(site.property.address)}<br>
              <strong>Unit:</strong> ${escapeHtml(site.property.unitInfo)}<br>
              <strong>Check-in:</strong> ${date.checkIn}<br>
              <strong>Check-out:</strong> ${date.checkOut}
            </p>
          </div>

          <p style="font-size: 0.85rem; color: #8a8a8a; line-height: 1.8;">
            Questions? Reply to this email or reach ${escapeHtml(site.email.signoffName)} directly.<br><br>
            With love,<br>
            <em>${escapeHtml(site.email.tagline)}</em>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Booking email error:', err);
    return NextResponse.json({ error: 'Failed to send booking request' }, { status: 500 });
  }
}
