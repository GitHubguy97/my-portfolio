import { useEffect, useMemo, useState } from 'react'
import { auth, db, googleProvider, storage } from '../firebase'
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState(null)
  const [list, setList] = useState([])
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ pinned: false, sortOrder: 100, tagsString: '', stackString: '' })

  const isAdmin = useMemo(() => userEmail && ADMIN_EMAIL && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [userEmail])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserEmail(u?.email ?? null))
    return () => unsub()
  }, [])

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setList(snap.docs.map((d) => ({ id: d.id, ...(d.data()) })))
    }
    load()
  }, [busy])

  const handleSignIn = async () => { await signInWithPopup(auth, googleProvider) }
  const handleSignOut = async () => { await signOut(auth) }

  const resetForm = () => {
    setForm({ pinned: false, sortOrder: 100, tagsString: '', stackString: '' })
    setFile(null)
    setEditing(null)
  }

  const upsert = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setBusy(true)

    try {
      let imageUrl = form.imageUrl || ''
      if (file) {
        const storageRef = ref(storage, `project-images/${Date.now()}-${file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file)
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', undefined, reject, async () => {
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
            resolve()
          })
        })
      }

      const payload = {
        title: (form.title || 'Untitled').trim(),
        blurb: (form.blurb || '').trim(),
        description: (form.description || '').trim(),
        imageUrl,
        liveUrl: (form.liveUrl || '').trim(),
        githubUrl: (form.githubUrl || '').trim(),
        tags: form.tags && form.tags.length ? form.tags : (form.tagsString || '').split(',').map((s) => s.trim()).filter(Boolean),
        stack: form.stack && form.stack.length ? form.stack : (form.stackString || '').split(',').map((s) => s.trim()).filter(Boolean),
        role: (form.role || 'Developer').trim(),
        year: Number(form.year) || new Date().getFullYear(),
        pinned: !!form.pinned,
        sortOrder: Number(form.sortOrder) || 100,
        updatedAt: serverTimestamp(),
      }

      if (editing) {
        await updateDoc(doc(db, 'projects', editing.id), payload)
      } else {
        await addDoc(collection(db, 'projects'), { ...payload, createdAt: serverTimestamp() })
      }

      resetForm()
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (p) => {
    setEditing(p)
    setForm({
      ...p,
      tagsString: (p.tags || []).join(', '),
      stackString: (p.stack || []).join(', '),
    })
  }

  const remove = async (id) => {
    if (!isAdmin) return
    if (!confirm('Delete this project?')) return
    setBusy(true)
    try { await deleteDoc(doc(db, 'projects', id)) } finally { setBusy(false) }
  }

  if (!userEmail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-neutral-300 mb-6">Sign in to manage projects.</p>
        <button onClick={handleSignIn} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-500">Sign in with Google</button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-neutral-300">Signed in as <span className="font-mono">{userEmail}</span>. You do not have write access.</p>
        <button onClick={handleSignOut} className="mt-6 text-sm underline">Sign out</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Project Manager</h1>
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <span>{userEmail}</span>
          <button onClick={handleSignOut} className="underline">Sign out</button>
        </div>
      </div>

      <form onSubmit={upsert} className="grid gap-4 md:grid-cols-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 mb-8">
        <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">Title<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.title || ''} onChange={e=>setForm(f=>({...f, title:e.target.value}))} required/></label>
          <label className="grid gap-1 text-sm">Blurb<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.blurb || ''} onChange={e=>setForm(f=>({...f, blurb:e.target.value}))}/></label>
        </div>
        <label className="grid gap-1 text-sm md:col-span-2">Description<textarea className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" rows="4" value={form.description || ''} onChange={e=>setForm(f=>({...f, description:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Live URL<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.liveUrl || ''} onChange={e=>setForm(f=>({...f, liveUrl:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">GitHub URL<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.githubUrl || ''} onChange={e=>setForm(f=>({...f, githubUrl:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Tags (comma-separated)<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.tagsString || ''} onChange={e=>setForm(f=>({...f, tagsString:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Stack (comma-separated)<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.stackString || ''} onChange={e=>setForm(f=>({...f, stackString:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Role<input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.role || ''} onChange={e=>setForm(f=>({...f, role:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Year<input type="number" className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.year || ''} onChange={e=>setForm(f=>({...f, year:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Sort Order<input type="number" className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" value={form.sortOrder ?? 100} onChange={e=>setForm(f=>({...f, sortOrder:e.target.value}))}/></label>
        <label className="grid gap-1 text-sm">Pinned<div className="flex items-center gap-2"><input type="checkbox" checked={!!form.pinned} onChange={e=>setForm(f=>({...f, pinned:e.target.checked}))}/><span className="text-neutral-300">Show at top</span></div></label>
        <label className="grid gap-1 text-sm md:col-span-2">Preview Image<input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} /></label>
        <div className="md:col-span-2 flex gap-3">
          <button disabled={busy} className="focus-ring rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-500 disabled:opacity-50">{editing ? 'Update' : 'Create'} Project</button>
          {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-neutral-600 px-4 py-2">Cancel</button>}
        </div>
      </form>

      <div className="grid gap-3">
        {list.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-3 min-w-0">
              {p.imageUrl ? <img src={p.imageUrl} className="h-10 w-16 object-cover rounded" alt="" /> : <div className="h-10 w-16 rounded bg-neutral-800" />}
              <div className="truncate">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-neutral-400 truncate">{p.blurb}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={()=>startEdit(p)} className="px-3 py-1 rounded-lg border border-neutral-700">Edit</button>
              <button onClick={()=>remove(p.id)} className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
