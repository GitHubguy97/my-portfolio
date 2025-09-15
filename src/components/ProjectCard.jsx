export default function ProjectCard({ p }) {
  return (
    <article className="card-hover rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[16/10] md:aspect-auto md:h-48 lg:h-56">
          {p?.imageUrl ? (
            <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-400">
              No preview
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{p?.title || 'Untitled'}</h3>
          {p?.blurb && <p className="text-sm text-neutral-300">{p.blurb}</p>}
          {Array.isArray(p?.stack) && p.stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {p.stack.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto pt-2 flex items-center gap-3 card-actions">
            {p?.liveUrl && (
              <a className="focus-ring inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200"
                 href={p.liveUrl} target="_blank" rel="noreferrer">
                Live Demo ↗
              </a>
            )}
            {p?.githubUrl && (
              <a className="focus-ring inline-flex items-center gap-1 text-sm text-neutral-300 hover:text-white"
                 href={p.githubUrl} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
