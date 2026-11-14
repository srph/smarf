import React from 'react'
import { StartPreview } from './start-preview'
import { type ResolvedStart, type Start } from './starts/start'

interface Props {
  starts: ResolvedStart[]
  /** Saving a chosen start: the starts can't be chosen again. */
  saving: boolean
  onHover: (id: Start['id'] | null) => void
  onChoose: (start: ResolvedStart) => void
}

/** "Start this board with": the three starts, in the board toolbar's place until one is chosen. */
const StartTray: React.FC<Props> = ({ starts, saving, onHover, onChoose }) => (
  // The toolbar's own wrapper, so the tray sits where the dock will.
  <div className="pointer-events-none fixed inset-x-0 bottom-6 z-(--z-board-toolbar) flex justify-center px-4">
    <section
      aria-labelledby="start-tray-heading"
      onPointerLeave={() => onHover(null)}
      className="pointer-events-auto w-210 animate-toolbar-rise rounded-xl border border-white/10 bg-zinc-800/88 p-3 shadow-2xl ring-1 inset-shadow-xs shadow-black/70 ring-black/50 inset-shadow-white/5 backdrop-blur-lg backdrop-saturate-150 motion-reduce:animate-none">
      <h2 id="start-tray-heading" className="px-1 pb-2.5 font-semibold text-zinc-200">
        Start this board with
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {starts.map((start) => (
          <button
            key={start.id}
            type="button"
            disabled={saving}
            onClick={() => onChoose(start)}
            onPointerEnter={() => onHover(start.id)}
            onFocus={() => onHover(start.id)}
            onBlur={() => onHover(null)}
            className="group flex cursor-pointer flex-col rounded-xl bg-white/3 px-1.5 pt-1.5 pb-2.5 text-left inset-ring inset-ring-white/6 transition-[background-color,box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:bg-white/7 hover:inset-ring-white/14 focus-visible:-translate-y-0.5 focus-visible:bg-white/7 focus-visible:ring-focus disabled:cursor-progress motion-reduce:hover:translate-y-0">
            <StartPreview start={start} />
            <span className="px-1 font-semibold">{start.name}</span>
            <span className="mt-0.5 px-1 text-xs text-zinc-400">{start.description}</span>
          </button>
        ))}
      </div>
    </section>
  </div>
)

export { StartTray }
