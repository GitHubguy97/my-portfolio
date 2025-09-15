import { Link, NavLink } from 'react-router-dom'


export default function Header() {
return (
<header className="sticky top-0 z-20 backdrop-blur bg-neutral-950/70 border-b border-neutral-800">
<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
<Link to="/" className="font-semibold text-lg">Gideon Jamala</Link>
<nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
<NavLink to="/" className={({isActive}) => isActive ? 'text-white' : ''}>Projects</NavLink>
<a href="#about">About</a>
<a href="/resume.pdf" target="_blank" rel="noreferrer">Resume</a>
<NavLink to="/admin" className={({isActive}) => isActive ? 'text-white' : ''}>Admin</NavLink>
</nav>
</div>
</header>
)
}