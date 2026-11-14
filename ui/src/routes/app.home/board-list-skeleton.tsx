import React from 'react'
import { cn } from 'cn'

// Each row fainter than the one above, so the list trails off instead of ending at a hard edge.
const rows = [
  { title: 'w-48', opacity: '' },
  { title: 'w-36', opacity: 'opacity-60' },
  { title: 'w-56', opacity: 'opacity-30' }
]

interface Props {
  title: string
}

/** Placeholder for BoardList while the boards load: the real heading, then the same row sizes as grey bars. */
const BoardListSkeleton: React.FC<Props> = ({ title }) => {
  return (
    <div className="mx-auto w-120">
      {/* The heading doesn't depend on the boards, so it shows for real: same element and classes as BoardList's */}
      <h5 className="mb-4 text-xs font-bold text-zinc-300">{title}</h5>

      <output className="block motion-safe:animate-pulse">
        <span className="sr-only">Loading your boards…</span>

        {rows.map((row, i) => (
          // Same box as BoardListItem: p-4 around an lg title with my-4.5, then a p-4 star button.
          <div
            key={i}
            className={cn('flex items-center rounded-xl bg-zinc-800 not-last:mb-4', row.opacity)}
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
    </div>
  )
}

export { BoardListSkeleton }
