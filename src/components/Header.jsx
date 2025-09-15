import { NavLink, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function NavItem({ to, children, className = '' }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative ml-6 text-sm text-neutral-300 hover:text-white
         after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-0.5
         after:origin-left after:scale-x-0 after:rounded
         after:bg-gradient-to-r after:from-indigo-400 after:to-cyan-300
         hover:after:scale-x-100 transition ${isActive ? 'text-white after:scale-x-100' : ''} ${className}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur bg-black/60 dark:bg-black/60">
      <div className="mx-auto max-w-[1180px] px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-full border border-border shadow-elev
                          bg-gradient-to-br from-indigo-200 to-cyan-300" />
          <span>Gideon Jamala</span>
        </Link>

        <nav className="flex items-center">
          {/* anchors to sections on the home page */}
          <a href="/#projects" className="ml-6 text-sm text-neutral-300 hover:text-white">Projects</a>
          <a href="/#about" className="ml-6 text-sm text-neutral-300 hover:text-white">About</a>
          <a href="/resume.pdf" className="ml-6 text-sm text-neutral-300 hover:text-white" target="_blank" rel="noreferrer">Resume</a>
          {/* Admin route */}
          <NavItem to="/admin" className="ml-6">Admin</NavItem>

          <div className="ml-5">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
