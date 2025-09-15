import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const fallback = {
  name: 'Gideon Jamala',
  role: 'Full-stack Developer',
  tagline: 'Clean, fast, and deployed.',
  bio: 'I build UI you can feel and APIs you can trust.',
  email: 'you@example.com',
  githubUrl: 'https://github.com/GitHubguy97',
  linkedinUrl: 'https://www.linkedin.com/in/your-handle',
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

  return (
    <aside className="relative">
      <div className="sticky top-6 rounded-[18px] border border-border bg-white/5 dark:bg-white/5 shadow-elev p-4">
        <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border border-border">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-cyan-300" />
          )}
        </div>

        <h3 className="text-center font-bold text-lg mt-3">{profile.name}</h3>
        <p className="text-center text-neutral-400">{profile.role}</p>
        <p className="text-center text-neutral-400 mt-2">{profile.bio}</p>

        <div className="flex flex-wrap gap-2 justify-center mt-3">
          <a className="btn" href={`mailto:${profile.email}`}>Email</a>
          <a className="btn btn--ghost" href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
          <a className="btn btn--ghost" href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
        </div>

        <div className="h-px bg-border my-3" />

        <div className="flex items-center justify-between my-2">
          <span className="text-neutral-400 text-sm">Focus</span>
          <div className="flex flex-wrap gap-1">
            {(profile.focus || []).map((t, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-[11px] border border-border bg-white/10 text-indigo-100">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between my-2">
          <span className="text-neutral-400 text-sm">Stack</span>
          <div className="flex flex-wrap gap-1">
            {(profile.stack || []).map((t, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-[11px] border border-border bg-white/10 text-indigo-100">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
