import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ProjectGrid from './components/ProjectGrid'
import AdminPage from './pages/Admin'


export default function App() {
return (
<div className="min-h-screen">
<Header />
<main>
<Routes>
<Route path="/" element={
<>
<section className="mx-auto max-w-6xl px-4 pt-8">
<h1 className="text-2xl font-semibold">Projects</h1>
<p className="text-neutral-300 mt-1">Clean, fast, and deployed. Click any tile for the live demo or GitHub.</p>
</section>
<ProjectGrid />
<section id="about" className="mx-auto max-w-6xl px-4 pb-12">
<h2 className="text-xl font-semibold mb-2">About</h2>
<p className="text-neutral-300 max-w-3xl">I build fast, reliable web apps with React, FastAPI, and PostgreSQL. I care about performance, DX, and clean, maintainable code. Currently seeking Software Engineer roles in Canada.</p>
</section>
</>
} />
<Route path="/admin" element={<AdminPage />} />
</Routes>
</main>
</div>
)
}