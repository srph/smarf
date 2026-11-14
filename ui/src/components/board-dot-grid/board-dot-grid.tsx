import React from 'react'

interface Props {
  ref?: React.Ref<HTMLDivElement>
  /** The workspace's height: room below the lowest category to drag things into. */
  height: number
}

/**
 * The board's workspace: categories are placed inside it by position, over a dot grid to line them up by eye. Faint
 * dots every 16px, and a brighter dot every 64px. Both grids have a dot on the workspace's top-left corner, where
 * category positions start. The dots fill the page from under the navigation to the bottom, edge to edge: the layer
 * reaches 48px up (the navigation's margin), 400px down (the spacer below the workspace) and 2048px to each side. The
 * 64px grid sits at (-32px, 16px): -32px puts a dot on a tile corner, and the 48px down makes up for the layer
 * starting 48px above the workspace. Its parent clips the dots sideways (overflow-x-clip).
 */
const BoardDotGrid: React.FC<React.PropsWithChildren<Props>> = ({ ref, height, children }) => (
  <div
    ref={ref}
    className="relative z-(--z-board-workspace) before:pointer-events-none before:absolute before:-inset-x-512 before:-top-12 before:-bottom-100 before:-z-10 before:bg-[radial-gradient(circle,var(--color-zinc-500)_1.5px,transparent_1.5px),radial-gradient(circle,color-mix(in_oklab,var(--color-zinc-800),var(--color-zinc-700)_40%)_1px,transparent_1px)] before:bg-size-[64px_64px,16px_16px] before:bg-position-[-32px_16px,-8px_-8px]"
    style={{ height }}>
    {children}
  </div>
)

export { BoardDotGrid }
