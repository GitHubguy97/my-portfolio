import { useEffect, useState } from 'react';

function applyTheme(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

export default function ThemeToggle() {
  // initial: localStorage -> system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => applyTheme(isDark), [isDark]);

  // keep in sync with system or other tabs
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMQ = (e) => {
      if (!localStorage.getItem('theme')) setIsDark(e.matches);
    };
    mq.addEventListener('change', onMQ);

    const onStorage = (e) => {
      if (e.key === 'theme') setIsDark(e.newValue === 'dark');
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mq.removeEventListener('change', onMQ);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => setIsDark((d) => !d)}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
      className="relative inline-flex h-6 w-11 items-center rounded-full border border-neutral-400/60 bg-white/70 backdrop-blur-sm transition
                 dark:bg-neutral-800 dark:border-neutral-600"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-neutral-700 transition-transform dark:bg-neutral-200
                    ${isDark ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}
