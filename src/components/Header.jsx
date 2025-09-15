import { NavLink, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 text-sm transition ${
        isActive
          ? 'text-neutral-900 dark:text-neutral-100'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-block h-7 w-7 rounded-full bg-gradient-to-br from-sky-300 to-indigo-400 ring-1 ring-white/40 dark:ring-white/10" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Gideon Jamala
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavItem to="/">Projects</NavItem>
          <a href="#about" className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
            About
          </a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
            Resume
          </a>
          <NavItem to="/admin">Admin</NavItem>

          <div className="ml-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
