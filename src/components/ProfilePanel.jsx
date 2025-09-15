import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/** Normalize a URL to ensure it opens externally, not as a route. */
function normalizeUrl(u) {
  if (!u) return '';
  const str = String(u).trim();
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  // if someone saved "www.linkedin.com/..." or "github.com/..."
  return `https://${str.replace(/^\/+/, '')}`;
}

/** Build a Gmail compose URL for a given email address. */
function gmailCompose(email) {
  if (!email) return '';
  const to = encodeURIComponent(email);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`;
}

const fallback = {
  name: 'Gideon Jamala',
  role: 'Full-stack Developer',
  tagline: 'Clean, fast, and deployed.',
  bio: 'I build UI you can feel and APIs you can trust.',
  email: 'you@example.com',
  githubUrl: 'https://github.com/GitHubguy97',
  linkedinUrl: 'https://www.linkedin.com/in/gideon-i-jamala',
  avatarUrl: '',
  focus: ['Frontend', 'APIs', 'Perf'],
  stack: ['React', 'FastAPI', 'Postgres'],
};

export default function ProfilePanel() {
  const [profile, setProfile] = useState(fallback);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site', 'profile'), (snap) => {
      if (snap.exists()) setProfile({ ...fallback, ...snap.data() });
    });
    return () => unsub();
  }, []);

  const emailHref = gmailCompose(profile.email);
  const githubHref = normalizeUrl(profile.githubUrl);
  const linkedinHref = normalizeUrl(profile.linkedinUrl);

  return (
    <aside className="relative">
      <div className="sticky top-6 rounded-2xl border border-neutral-200/70 bg-white/85 shadow-xl shadow-black/5 backdrop-blur-sm p-5
                      dark:bg-white/5 dark:border-neutral-800 dark:shadow-black/40">
        {/* avatar */}
        <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-cyan-300" />
          )}
        </div>

        <h3 className="text-center font-bold text-lg mt-3 text-neutral-900 dark:text-neutral-100">
          {profile.name}
        </h3>
        <p className="text-center text-neutral-600 dark:text-neutral-400">{profile.role}</p>
        <p className="text-center mt-2 text-neutral-700 dark:text-neutral-300">{profile.bio}</p>

        {/* links */}
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {profile.email && (
            <a
              className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm
                         dark:bg-white/10 dark:border-neutral-700 dark:text-neutral-100"
              href={emailHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Email
            </a>
          )}
          {profile.githubUrl && (
            <a
              className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm
                         dark:bg-white/10 dark:border-neutral-700 dark:text-neutral-100"
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm
                         dark:bg-white/10 dark:border-neutral-700 dark:text-neutral-100"
              href={linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
        </div>

        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-4" />

        {/* focus */}
        <div className="mb-2">
          <div className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Focus</div>
          <div className="flex flex-wrap gap-1">
            {(profile.focus || []).map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-[11px] border border-neutral-300 bg-white text-neutral-700
                           dark:border-neutral-700 dark:bg-white/10 dark:text-indigo-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* stack */}
        <div>
          <div className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Stack</div>
          <div className="flex flex-wrap gap-1">
            {(profile.stack || []).map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-[11px] border border-neutral-300 bg-white text-neutral-700
                           dark:border-neutral-700 dark:bg-white/10 dark:text-indigo-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
