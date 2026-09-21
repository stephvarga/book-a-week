'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateUpcomingWeeks, type AvailableDate } from '@/lib/dates';
import { site } from '@/content/site';

// ── Password screen ──────────────────────────────────────────────────────────
function PasswordScreen({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError("That's not quite right. Try again.");
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="password-screen">
      <p className="password-screen__eyebrow">{site.passwordScreen.eyebrow}</p>
      <h1 className="password-screen__title">{site.passwordScreen.heading}</h1>
      <p className="password-screen__subtitle">{site.passwordScreen.subtitle}</p>
      <form className="password-screen__form" onSubmit={handleSubmit}>
        <input
          className="password-screen__input"
          type="password"
          placeholder="Enter your password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="current-password"
          autoFocus
        />
        <button className="password-screen__btn" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Enter'}
        </button>
        {error && <p className="password-screen__error">{error}</p>}
      </form>
    </div>
  );
}

// ── Booking form ─────────────────────────────────────────────────────────────
function BookingForm({ selectedDate }: { selectedDate: AvailableDate }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: string, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: selectedDate }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="request-form">
        <div className="form-success">{site.booking.successMessage(selectedDate.label)}</div>
      </div>
    );
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <h3>Request {selectedDate.label}</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="your@email.com"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="(555) 000-0000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="guests">Number of Guests</label>
          <input
            id="guests"
            type="number"
            min="1"
            max="7"
            required
            value={form.guests}
            onChange={(e) => update('guests', e.target.value)}
            placeholder="Up to 7"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="notes">Any notes or questions</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Anything we should know?"
        />
      </div>
      <button className="submit-btn" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Booking Request'}
      </button>
      {status === 'error' && <p className="form-error">{errorMsg}</p>}
    </form>
  );
}

// ── Main site ────────────────────────────────────────────────────────────────
function MainSite() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Computed once per mount from the browser's own clock, so the rolling
  // window (and what counts as "already passed") is accurate to this
  // visitor's timezone rather than the server's.
  const availableDates = useMemo(
    () => generateUpcomingWeeks({ from: new Date(), weeksAhead: site.booking.weeksAhead }),
    []
  );
  const selectedDate = availableDates.find((d) => d.id === selectedId) ?? null;

  const years = Array.from(new Set(availableDates.map((d) => d.id.split('-')[0])));

  return (
    <div className="site">
      {/* Hero */}
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero__bg" src={site.hero.image.src} alt={site.hero.image.alt} />
        <div className="hero__content">
          <p className="hero__eyebrow">{site.hero.eyebrow}</p>
          <h1 className="hero__title">
            {site.hero.titleLine1}
            <br />
            {site.hero.titleLine2}
          </h1>
          <p className="hero__sub">{site.hero.subtitle}</p>
        </div>
      </section>

      {/* The gift */}
      <section className="section section--cream">
        <div className="section__inner">
          <p className="eyebrow">{site.gift.eyebrow}</p>
          <h2 className="section__title">{site.gift.heading}</h2>
          <div className="blurb">
            <div className="blurb__text">
              {site.gift.paragraphs.map((p, i) => (
                <p key={i} className="section__body" style={i > 0 ? { marginTop: '1.25rem' } : undefined}>
                  {p}
                </p>
              ))}
            </div>
            <div className="blurb__stats">
              {site.gift.stats.map((s) => (
                <div key={s.label} className="stat">
                  <div className="stat__value">{s.value}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section section--white" style={{ paddingBottom: '4rem' }}>
        <div className="section__inner--wide">
          <p className="eyebrow">{site.gallery.eyebrow}</p>
          <h2 className="section__title">{site.gallery.heading}</h2>
          <div className="gallery">
            {site.gallery.images.map((img, i) => (
              <div key={i} className="gallery__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} loading={i === 0 ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section section--lavender">
        <div className="section__inner">
          <p className="eyebrow eyebrow--dark">{site.amenities.eyebrow}</p>
          <h2 className="section__title">{site.amenities.heading}</h2>
          <p className="section__body">{site.amenities.body}</p>
          <div className="amenities">
            {site.amenities.list.map((a) => (
              <div key={a.label} className="amenity">
                <span className="amenity__icon">{a.icon}</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section className="section section--peach" id="book">
        <div className="section__inner--wide">
          <p className="eyebrow">{site.booking.eyebrow}</p>
          <h2 className="section__title">{site.booking.heading}</h2>
          <p className="booking__intro">{site.booking.intro}</p>

          <div className="booking">
            {years.map((year) => (
              <div key={year}>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem',
                    color: 'var(--burgundy)',
                  }}
                >
                  — {year}
                </p>
                <div className="dates-grid">
                  {availableDates.filter((d) => d.id.startsWith(year)).map((d) => (
                    <div
                      key={d.id}
                      className={`date-card ${selectedId === d.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedId(selectedId === d.id ? null : d.id)}
                      aria-pressed={selectedId === d.id}
                    >
                      <div className="date-card__year">{year}</div>
                      <div className="date-card__dates">{d.label.replace(`, ${year}`, '')}</div>
                      <div className="date-card__nights">7 nights</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {selectedDate && <BookingForm selectedDate={selectedDate} />}
            {!selectedDate && (
              <p style={{ color: 'var(--light)', fontSize: '0.85rem', marginTop: '1rem', fontStyle: 'italic' }}>
                ← Select a week above to continue
              </p>
            )}
          </div>
        </div>
      </section>

      <footer>
        <p>{site.footer.propertyLine}</p>
        <p style={{ marginTop: '0.5rem' }}>{site.footer.signoffLine}</p>
      </footer>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
// The real session lives in an httpOnly cookie set by /api/auth, so it can't
// be forged from devtools and /api/book can trust it too. This just asks the
// server whether that cookie is still valid, so returning visitors skip the
// password screen without us ever storing anything meaningful client-side.
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => setAuthed(Boolean(data?.authed)))
      .catch(() => setAuthed(false))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;
  return authed ? <MainSite /> : <PasswordScreen onSuccess={() => setAuthed(true)} />;
}
