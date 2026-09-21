'use client';

import { useEffect } from 'react';

const FAVICONS = {
  day: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <text y=".9em" font-size="90">🌝</text>
    </svg>`
  ),
  night: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <text y=".9em" font-size="90">🌚</text>
    </svg>`
  ),
};

function isDaytime(hour: number) {
  return hour >= 6 && hour < 18; // 6 AM – 6 PM
}

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

function msUntilNextBoundary(now: Date) {
  const hour = now.getHours();
  const next = new Date(now);
  if (hour < 6) next.setHours(6, 0, 0, 0);
  else if (hour < 18) next.setHours(18, 0, 0, 0);
  else {
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
  }
  return next.getTime() - now.getTime();
}

export function DynamicFavicon() {
  useEffect(() => {
    function update() {
      const hour = new Date().getHours();
      setFavicon(isDaytime(hour) ? FAVICONS.day : FAVICONS.night);
    }

    update();
    const timeout = window.setTimeout(function schedule() {
      update();
      window.setTimeout(schedule, msUntilNextBoundary(new Date()));
    }, msUntilNextBoundary(new Date()));

    return () => clearTimeout(timeout);
  }, []);

  return null;
}