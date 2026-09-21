// ── Site content ────────────────────────────────────────────────────────────
// Everything you'd want to change to make this your own gift/booking site
// lives in this one file: copy, property details, dates, images, amenities.
// Nothing else needs opening for a basic reskin.
//
// The available date ranges live separately in `src/lib/dates.ts`, since the
// server also validates bookings against that list — see the comment there.

export const site = {
  meta: {
    title: 'A Vacation Gift',
    description: 'A week away — our gift to you.',
  },

  passwordScreen: {
    eyebrow: 'A gift from Us & family',
    heading: 'Congrats!',
    subtitle: "Now it's time to relax — with one week away, on us",
  },

  hero: {
    eyebrow: 'A gift · Sunset Cove Resort · Somewhere Nice',
    titleLine1: 'Seven days',
    titleLine2: 'of somewhere nice',
    subtitle: "Our gift to you — a week away, on us, whenever you're ready.",
    image: {
      src: '/images/hero.svg',
      alt: 'Illustration of the resort by the water',
    },
  },

  gift: {
    eyebrow: 'The Gift',
    heading: "One full week at the water's edge",
    paragraphs: [
      "We're giving you a full week at Sunset Cove Resort: a relaxing getaway with everything you need for a proper break. Wake up easy. Slow down. Every unit has a great view and a private balcony.",
      'This is a timeshare week gifted entirely to you. Dates are first-come, first-served, so pick your week and send us a request below.',
    ],
    stats: [
      { value: '2', label: 'Bedrooms' },
      { value: '2', label: 'Bathrooms' },
      { value: '7', label: 'Sleeps up to' },
      { value: '7', label: 'Nights' },
    ],
  },

  gallery: {
    eyebrow: 'The Property',
    heading: "Where you'll be staying",
    images: [
      { src: '/images/gallery-1.svg', alt: 'View from the resort' },
      { src: '/images/gallery-2.svg', alt: 'The resort building' },
      { src: '/images/gallery-3.svg', alt: 'Nearby boardwalk' },
      { src: '/images/gallery-4.svg', alt: 'View from the balcony' },
      { src: '/images/gallery-5.svg', alt: 'Local scenery' },
      { src: '/images/gallery-6.svg', alt: 'Pool and spa area' },
    ],
  },

  amenities: {
    eyebrow: "What's Included",
    heading: 'Everything you need',
    body: 'The unit is fully equipped — full kitchen, living and dining areas, laundry, and all the comforts of home. The building has parking, a pool, and shared amenities.',
    list: [
      { icon: '🛏️', label: '2 Bedrooms' },
      { icon: '🚿', label: '2 Bathrooms' },
      { icon: '👨‍👩‍👧‍👦', label: 'Sleeps 7 max' },
      { icon: '🛋️', label: 'Sofa Sleeper' },
      { icon: '🌊', label: 'Waterfront' },
      { icon: '🏊', label: 'Heated Pool' },
      { icon: '♨️', label: 'Hot Tub / Spa' },
      { icon: '🧖', label: 'Sauna' },
      { icon: '🍳', label: 'Full Kitchen' },
      { icon: '🅿️', label: 'Free Parking' },
      { icon: '🌅', label: 'Private Balcony' },
    ],
  },

  booking: {
    eyebrow: 'Reserve Your Week',
    heading: 'Choose your dates',
    intro:
      "Select a week below, then fill out the short form and we'll confirm everything with you directly. Dates run Saturday to Saturday.",
    successMessage: (dateLabel: string) =>
      `🎉 Request received! Your week of ${dateLabel} is on its way to confirmation. We'll reach out to you shortly to finalize everything.`,
  },

  footer: {
    propertyLine: 'Sunset Cove Resort · 123 Example Ave, Anytown, ST 00000',
    signoffLine: 'With love, from Us & family · example.com',
  },

  // Shared between the booking-confirmation emails and the on-site copy above.
  property: {
    name: 'Sunset Cove Resort',
    address: '123 Example Ave, Anytown, ST 00000',
    unitInfo: 'Typically unit 110, 112, or 212 (2 bed / 2 bath, sleeps 7)',
  },

  email: {
    // Shown under the heading in both emails, e.g. "Sunset Cove Resort — A Vacation Gift"
    tagline: 'Sunset Cove Resort — A Vacation Gift',
    // The name shown as who the requester will hear back from.
    signoffName: 'Us',
  },
};

export type Site = typeof site;
