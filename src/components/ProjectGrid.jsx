// src/components/ProjectGrid.jsx
import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import ProjectCard from './ProjectCard'

export default function ProjectGrid() {
  const [projects, setProjects] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'projects'),
      orderBy('pinned', 'desc'),
      orderBy('sortOrder', 'asc'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setErr(null)
        setProjects(snap.docs.map((d) => ({ id: d.id, ...(d.data()) })))
      },
      (e) => {
        console.error('ProjectGrid snapshot error:', e)
        setErr(e)
      }
    )
    return () => unsub()
  }, [])

  if (err) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 text-sm text-red-300">
        Couldn’t load projects ({err.code || 'error'}). Check Firestore rules and env vars.
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
      {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
    </section>
  )
}
