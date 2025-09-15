import { useEffect, useMemo, useState } from 'react'
import { auth, db, googleProvider, storage } from '../firebase'
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query,
  serverTimestamp, updateDoc, getDoc, setDoc
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable, uploadBytes } from 'firebase/storage'

// ------- helpers -------
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
const toArray = (s) => (s || '').split(',').map(v => v.trim()).filter(Boolean)
const toCSV = (arr) => (arr || []).join(', ')

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState(null)

  // ---- profile state ----
  const [profLoading, setProfLoading] = useState(true)
  const [savingProf, setSavingProf] = useState(false)
  const [prof, setProf] = useState({
    name: '',
    role: 'Full-stack Developer',
    tagline: 'Clean, fast, and deployed.',
    bio: 'I build UI you can feel and APIs you can trust.',
    email: '',
    githubUrl: '',
    linkedinUrl: '',
    focusCSV: 'Frontend, APIs, Perf',
    stackCSV: 'React, FastAPI, Postgres',
    avatarFile: null,
    avatarUrl: '',
  })

  // ---- projects state ----
  const [list, setList] = useState([])
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ pinned: false, sortOrder: 100, tagsString: '', stackString: '' })

  const isAdmin = useMemo(
    () => userEmail && ADMIN_EMAIL && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    [userEmail]
  )

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserEmail(u?.email ?? null))
    return () => unsub()
  }, [])

  // load profile once
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'site', 'profile'))
        if (snap.exists()) {
          const data = snap.data()
          setProf({
            name: data.name || '',
            role: data.role || 'Full-stack Developer',
            tagline: data.tagline || 'Clean, fast, and deployed.',
            bio: data.bio || 'I build UI you can feel and APIs you can trust.',
            email: data.email || '',
            githubUrl: data.githubUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            focusCSV: toCSV(data.focus),
            stackCSV: toCSV(data.stack),
            avatarFile: null,
            avatarUrl: data.avatarUrl || '',
          })
        }
      } finally {
        setProfLoading(false)
      }
    }
    loadProfile()
  }, [])

  // load projects whenever busy toggles (after create/update/delete)
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

  // ------- profile actions -------
  const saveProfile = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setSavingProf(true)
    try {
      let avatarUrl = prof.avatarUrl
      if (prof.avatarFile) {
        const ext = prof.avatarFile.name.split('.').pop()
        const storageRef = ref(storage, `profile-images/avatar-${Date.now()}.${ext}`)
        await uploadBytes(storageRef, prof.avatarFile)
        avatarUrl = await getDownloadURL(storageRef)
      }

      await setDoc(doc(db, 'site', 'profile'), {
        name: prof.name,
        role: prof.role,
        tagline: prof.tagline,
        bio: prof.bio,
        email: prof.email,
        githubUrl: prof.githubUrl,
        linkedinUrl: prof.linkedinUrl,
        focus: toArray(prof.focusCSV),
        stack: toArray(prof.stackCSV),
        avatarUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      setProf(p => ({ ...p, avatarUrl, avatarFile: null }))
      alert('Profile saved.')
    } catch (err) {
      console.error(err)
      alert('Failed to save profile. Check rules or network.')
    } finally {
      setSavingProf(false)
    }
  }

  // ------- project actions -------
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
        tags: form.tags && form.tags.length
          ? form.tags
          : toArray(form.tagsString),
        stack: form.stack && form.stack.length
          ? form.stack
          : toArray(form.stackString),
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
      tagsString: toCSV(p.tags),
      stackString: toCSV(p.stack),
    })
  }

  const remove = async (id) => {
    if (!isAdmin) return
    if (!confirm('Delete this project?')) return
    setBusy(true)
    try { await deleteDoc(doc(db, 'projects', id)) } finally { setBusy(false) }
  }

  // ------- gated views -------
  if (!userEmail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-neutral-300 mb-6">Sign in to manage your site.</p>
        <button onClick={handleSignIn}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-500">
          Sign in with Google
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-neutral-300">
          Signed in as <span className="font-mono">{userEmail}</span>. You do not have write access.
        </p>
        <button onClick={handleSignOut} className="mt-6 text-sm underline">Sign out</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Site Admin</h1>
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <span>{userEmail}</span>
          <button onClick={handleSignOut} className="underline">Sign out</button>
        </div>
      </div>

      {/* -------- Profile section -------- */}
      <section className="mx-auto max-w-3xl mb-10">
        <h2 className="text-lg font-semibold mb-3">Profile</h2>
        <form onSubmit={saveProfile}
              className="grid gap-4 md:grid-cols-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
          <label className="grid gap-1 text-sm">Name
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.name}
                   onChange={e=>setProf(p=>({ ...p, name:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">Role
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.role}
                   onChange={e=>setProf(p=>({ ...p, role:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">Tagline (hero line)
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.tagline}
                   onChange={e=>setProf(p=>({ ...p, tagline:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">Short Bio
            <textarea rows="3"
                      className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                      value={prof.bio}
                      onChange={e=>setProf(p=>({ ...p, bio:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">Email
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.email}
                   onChange={e=>setProf(p=>({ ...p, email:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">GitHub URL
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.githubUrl}
                   onChange={e=>setProf(p=>({ ...p, githubUrl:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">LinkedIn URL
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.linkedinUrl}
                   onChange={e=>setProf(p=>({ ...p, linkedinUrl:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">Focus (comma-separated)
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.focusCSV}
                   onChange={e=>setProf(p=>({ ...p, focusCSV:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">Stack (comma-separated)
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={prof.stackCSV}
                   onChange={e=>setProf(p=>({ ...p, stackCSV:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">Avatar Image
            <input type="file" accept="image/*"
                   onChange={e=>setProf(p=>({ ...p, avatarFile: e.target.files?.[0] || null }))} />
            {prof.avatarUrl && (
              <img src={prof.avatarUrl} alt="Avatar"
                   className="mt-2 w-24 h-24 rounded-full object-cover border border-neutral-700" />
            )}
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button disabled={savingProf}
                    className="focus-ring rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-500 disabled:opacity-50">
              {savingProf ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>

      {/* -------- Project manager section -------- */}
      <section className="mx-auto max-w-5xl">
        <h2 className="text-lg font-semibold mb-3">Project Manager</h2>
        <form onSubmit={upsert}
              className="grid gap-4 md:grid-cols-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 mb-8">
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">Title
              <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                     value={form.title || ''}
                     onChange={e=>setForm(f=>({ ...f, title:e.target.value }))} required />
            </label>
            <label className="grid gap-1 text-sm">Blurb
              <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                     value={form.blurb || ''}
                     onChange={e=>setForm(f=>({ ...f, blurb:e.target.value }))} />
            </label>
          </div>

          <label className="grid gap-1 text-sm md:col-span-2">Description
            <textarea rows="4"
                      className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                      value={form.description || ''}
                      onChange={e=>setForm(f=>({ ...f, description:e.target.value }))} />
          </label>

          <label className="grid gap-1 text-sm">Live URL
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.liveUrl || ''}
                   onChange={e=>setForm(f=>({ ...f, liveUrl:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">GitHub URL
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.githubUrl || ''}
                   onChange={e=>setForm(f=>({ ...f, githubUrl:e.target.value }))} />
          </label>

          <label className="grid gap-1 text-sm">Tags (comma-separated)
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.tagsString || ''}
                   onChange={e=>setForm(f=>({ ...f, tagsString:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">Stack (comma-separated)
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.stackString || ''}
                   onChange={e=>setForm(f=>({ ...f, stackString:e.target.value }))} />
          </label>

          <label className="grid gap-1 text-sm">Role
            <input className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.role || ''}
                   onChange={e=>setForm(f=>({ ...f, role:e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm">Year
            <input type="number"
                   className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.year || ''}
                   onChange={e=>setForm(f=>({ ...f, year:e.target.value }))} />
          </label>

          <label className="grid gap-1 text-sm">Sort Order
            <input type="number"
                   className="focus-ring rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                   value={form.sortOrder ?? 100}
                   onChange={e=>setForm(f=>({ ...f, sortOrder:e.target.value }))} />
          </label>

          <label className="grid gap-1 text-sm">Pinned
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.pinned}
                     onChange={e=>setForm(f=>({ ...f, pinned:e.target.checked }))} />
              <span className="text-neutral-300">Show at top</span>
            </div>
          </label>

          <label className="grid gap-1 text-sm md:col-span-2">Preview Image
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
          </label>

          <div className="md:col-span-2 flex gap-3">
            <button disabled={busy}
                    className="focus-ring rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-500 disabled:opacity-50">
              {editing ? 'Update' : 'Create'} Project
            </button>
            {editing && (
              <button type="button" onClick={resetForm}
                      className="rounded-xl border border-neutral-600 px-4 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid gap-3">
          {list.map(p => (
            <div key={p.id}
                 className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
              <div className="flex items-center gap-3 min-w-0">
                {p.imageUrl
                  ? <img src={p.imageUrl} className="h-10 w-16 object-cover rounded" alt="" />
                  : <div className="h-10 w-16 rounded bg-neutral-800" />}
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
      </section>
    </div>
  )
}
