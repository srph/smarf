import React from 'react'
import { StartCategoryCard } from './start-category-card'
import { type ResolvedStart } from './starts/start'

// The board lying on a table, its top-left corner nearest. Scale comes before the perspective, so the perspective is
// in board pixels. A constant, so it goes in style.
const TILT = 'translate(14px, 30px) scale(0.42) perspective(1400px) rotateX(36deg) rotateZ(-10deg)'

/**
 * A start's board, tilted and cropped from its top-left, fading out to the right and the bottom. Behind it, its hero's
 * portrait glows; the start's button is the `group`, and hovering or focusing it brightens the glow.
 */
const StartPreview: React.FC<{ start: ResolvedStart }> = ({ start }) => (
  // Decorative: the start's name and description say what it is.
  <div
    aria-hidden="true"
    className="relative mb-2.5 h-32 overflow-hidden rounded-lg bg-zinc-900 mask-r-from-78% mask-b-from-72% inset-ring inset-ring-white/8">
    {start.glow && (
      <img
        src={start.glow.thumbnail}
        alt=""
        className="absolute -top-9 -right-6 h-34 w-60 object-cover opacity-30 blur-xl saturate-150 transition-opacity duration-250 group-hover:opacity-60 group-focus-visible:opacity-60"
      />
    )}

    <div className="absolute top-0 left-0 origin-top-left transform-3d" style={{ transform: TILT }}>
      {/* The board's 64px dots as the floor, smaller and fainter than the workspace's: the tilt magnifies the near ones. */}
      <div className="absolute -inset-x-200 -inset-y-104 -z-10 bg-[radial-gradient(circle,var(--color-zinc-600)_1.9px,transparent_2.4px)] bg-size-[64px_64px] opacity-60" />
      {start.categories.map((category) => (
        <StartCategoryCard key={category.name} category={category} variant="preview" />
      ))}
    </div>
  </div>
)

export { StartPreview }
