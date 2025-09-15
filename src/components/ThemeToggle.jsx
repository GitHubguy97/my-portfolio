import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  // On mount, set initial state from localStorage or OS preference
  useEffect(() => {
    const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialLight = stored ? stored === 'light' : !prefersDark;
    setLight(initialLight);
    document.documentElement.classList.toggle('light', initialLight);
    document.documentElement.classList.toggle('dark', !initialLight);
  }, []);

  const onChange = () => {
    const next = !light;
    setLight(next);
    const mode = next ? 'light' : 'dark';
    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('light', next);
    document.documentElement.classList.toggle('dark', !next);
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={light}
        onChange={onChange}
        className="sr-only"
        aria-label="Toggle light mode"
      />
      <span
        className="h-6 w-11 rounded-full border border-border bg-white/15 dark:bg-white/15
                   transition-colors"
      />
      <span
        className={`absolute left-0 top-0 h-5 w-5 translate-x-[2px] translate-y-[2px] rounded-full
                    bg-white shadow transition-transform ${light ? 'translate-x-[22px]' : ''}`}
      />
    </label>
  );
}
