import React from 'react'
import { cn } from 'cn'

// Each row fainter than the one above, so the list trails off instead of ending at a hard edge.
const rows = [
  { title: 'w-48', opacity: '' },
  { title: 'w-36', opacity: 'opacity-60' },
  { title: 'w-56', opacity: 'opacity-30' }
]

/** Placeholder for BoardList while the boards load: the same heading and row sizes, as grey bars. */
const BoardListSkeleton: React.FC = () => {
  return (
    <output className="mx-auto block w-120 motion-safe:animate-pulse">
      <span className="sr-only">Loading your boards…</span>

      {/* Same box as BoardList's heading (mb-4, text-xs line). No top margin: in BoardList it would collapse
          into the navigation's mb-12, but not through this <output>, so the skeleton would sit 20px lower. */}
      <div className="mb-4 flex h-4 items-center" aria-hidden="true">
        <div className="h-2 w-24 rounded-sm bg-zinc-800" />
      </div>

      {rows.map((row, i) => (
        // Same box as BoardListItem: p-4 around an lg title with my-4.5, then a p-4 star button.
        <div
          key={i}
          className={cn('flex items-center rounded bg-zinc-800 not-last:mb-4', row.opacity)}
          aria-hidden="true">
          <div className="flex w-full items-center justify-between p-4 pr-0">
            <div className="my-4.5 flex h-7 items-center">
              <div className={cn('h-3 rounded-sm bg-zinc-700', row.title)} />
            </div>
            <div className="h-2 w-16 rounded-sm bg-zinc-700" />
          </div>
          <div className="p-4">
            <div className="size-6 rounded-sm bg-zinc-700" />
          </div>
        </div>
      ))}
    </output>
  )
}

export { BoardListSkeleton }
