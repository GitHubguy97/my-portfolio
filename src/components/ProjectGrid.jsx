import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import ProjectCard from './ProjectCard';

export default function ProjectGrid() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // basic stream; we’ll sort locally so we can prioritize pinned + sortOrder
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        // pinned first
        if (!!b.pinned - !!a.pinned) return (!!b.pinned - !!a.pinned);
        // then sortOrder ascending
        const so = (a.sortOrder ?? 100) - (b.sortOrder ?? 100);
        if (so !== 0) return so;
        // fallback newest first
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
      setProjects(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="my-6 grid gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
