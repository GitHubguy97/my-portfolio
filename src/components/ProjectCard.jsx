import React from 'react';

export default function ProjectCard(props) {
  const p = props.project || props; // support both shapes
  const {
    title,
    blurb,
    imageUrl,
    liveUrl,
    githubUrl,
    tags = [],
    stack = [],
  } = p;

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/85 backdrop-blur-sm shadow-lg shadow-black/5 transition
                 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10
                 dark:bg-white/5 dark:border-neutral-800 dark:shadow-black/40"
    >
      <div className="grid md:grid-cols-[320px,1fr]">
        {/* Preview */}
        <div className="relative h-52 md:h-full overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900" />
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title || 'Untitled'}</h3>
          {blurb && <p className="mt-1 text-neutral-700 dark:text-neutral-300">{blurb}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            {[...(tags || []), ...(stack || [])].slice(0, 6).map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-[11px] border border-neutral-300 bg-white text-neutral-700
                           dark:border-neutral-700 dark:bg-white/10 dark:text-indigo-100"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm
                           dark:bg-white/10 dark:border-neutral-700 dark:text-neutral-100"
              >
                Live Demo ↗
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm
                           dark:bg-white/10 dark:border-neutral-700 dark:text-neutral-100"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
