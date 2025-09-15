import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProfilePanel from './components/ProfilePanel';
import ProjectGrid from './components/ProjectGrid';
import AdminPage from './pages/Admin';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function HomePage() {
  const [tagline, setTagline] = useState(
    'Clean, fast, and deployed. Click any tile for the live demo or GitHub.'
  );

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site', 'profile'), (snap) => {
      if (snap.exists()) {
        const t = snap.data().tagline;
        if (t) setTagline(t);
      }
    });
    return () => unsub();
  }, []);

  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7">
      {/* Left column */}
      <section className="min-w-0">
        <h1 id="projects" className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Projects</h1>
        <p className="mt-2 text-neutral-700 dark:text-neutral-300">{tagline}</p>

        <ProjectGrid />

        <section id="about" className="pb-12">
          <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">About</h2>
          <p className="text-neutral-700 dark:text-neutral-300 max-w-3xl">
            I build fast, reliable web apps with React, FastAPI, and PostgreSQL. I care about performance,
            DX, and clean, maintainable code. Currently seeking Software Engineer roles in Canada.
          </p>
        </section>
      </section>

      {/* Right column */}
      <ProfilePanel />
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
