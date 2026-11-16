import React, { useEffect, useRef } from 'react'
import { cn } from 'cn'
import { CheckIcon } from '@heroicons/react/16/solid'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { CATEGORY_COLORS, CATEGORY_FADE_LAYER, categoryColorClass } from '~/src/lib/category-colors'
import { type CategoryColor } from '~/src/types/api'

interface Props {
  // The category's saved colour.
  value: CategoryColor | null
  // A swatch is hovered or focused: show it on the card. `undefined` goes back to the saved colour.
  onPreview: (color: CategoryColor | null | undefined) => void
  onSelect: (color: CategoryColor | null) => void
  onCancel: () => void
}

// None first, then the colours.
const OPTIONS: { key: CategoryColor | null; name: string }[] = [{ key: null, name: 'None' }, ...CATEGORY_COLORS]

/**
 * Picks a category's colour, over the card's header: the swatches rise into place where the name was. Hovering or
 * focusing a swatch previews it on the card (the fade here is the card's, so it follows). The saved colour takes
 * focus; Escape, the X, or a click anywhere else backs out.
 */
const BoardWorkspaceCategoryColorPicker: React.FC<Props> = ({ value, onPreview, onSelect, onCancel }) => {
  const ref = useRef<HTMLFieldSetElement>(null)

  const currentRef = useRef<HTMLButtonElement>(null)

  useEffect(() => currentRef.current?.focus({ preventScroll: true }), [])

  useEffect(() => {
    const handlePointerDown = (evt: PointerEvent) => {
      if (evt.target instanceof Node && ref.current?.contains(evt.target)) return
      onCancel()
    }

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') onCancel()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    // Placed like the delete confirm: 1px inside the card so its rim still shows, and 12px down under the hero tray.
    // Solid, to cover the header's own controls, with the card's fade drawn again over that.
    <fieldset
      ref={ref}
      aria-label="Category colour"
      onPointerLeave={() => onPreview(undefined)}
      className={cn(
        'absolute inset-x-px top-px -bottom-3 isolate flex items-center rounded-t-[calc(var(--radius-xl)-1px)] bg-zinc-800 pr-1 pb-3 pl-2 focus-gap-zinc-800',
        CATEGORY_FADE_LAYER,
        'before:inset-0'
      )}>
      <div className="flex animate-confirm-rise gap-1.5 motion-reduce:animate-none">
        {OPTIONS.map(({ key, name }) => (
          <button
            key={key ?? 'none'}
            ref={key === value ? currentRef : undefined}
            type="button"
            aria-pressed={key === value}
            aria-label={name}
            title={name}
            onPointerEnter={() => onPreview(key)}
            onFocus={() => onPreview(key)}
            onClick={() => onSelect(key)}
            className={cn(
              'relative grid size-5 cursor-pointer place-items-center rounded-full text-white hover:ring-2 hover:ring-primary-500 focus-visible:ring-focus',
              key
                ? cn('bg-category-metal inset-ring inset-ring-white/20', categoryColorClass[key])
                : // No colour: a hollow ring with a slash through it, brighter when it's the saved choice.
                  cn(
                    'inset-ring-2 after:absolute after:inset-y-1 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rotate-45 after:rounded-full',
                    value === null ? 'inset-ring-zinc-200 after:bg-zinc-200' : 'inset-ring-zinc-500 after:bg-zinc-500'
                  )
            )}>
            {key && key === value && (
              <span className="drop-shadow-sm drop-shadow-black/60">
                <Icon icon={CheckIcon} size={12} />
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        title="Cancel"
        aria-label="Cancel"
        onClick={onCancel}
        className="ml-auto grid size-7 animate-confirm-rise-late cursor-pointer place-items-center rounded-md text-zinc-400 hover:bg-white/8 hover:text-zinc-50 focus-visible:ring-focus motion-reduce:animate-none">
        <Icon icon={XMarkIcon} size={16} />
      </button>
    </fieldset>
  )
}

export { BoardWorkspaceCategoryColorPicker }
