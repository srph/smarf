import React, { createContext, use, useState } from 'react'
import { cn } from 'cn'
import { Button, type ButtonProps } from '~/src/components/button/button'
import { Spinner } from '~/src/components/spinner/spinner'
import { useWidthTransition } from '~/src/hooks/use-width-transition'

const BusyContext = createContext(false)

// The two states swap in place: one blurs out as the other sharpens in.
const swap = 'transition duration-250 ease-morph motion-reduce:transition-none'
const hidden = 'opacity-0 blur-xs'

type ButtonLoaderProps = React.PropsWithChildren<Omit<ButtonProps, 'icon' | 'busy'> & { busy: boolean }>

/**
 * A Button that morphs while its action runs: the icon turns into a spinner, the label blurs into
 * its busy text, and the button eases to the new width. Compose it from ButtonLoaderIcon and
 * ButtonLoaderText, which read `busy` from here:
 *
 *   <ButtonLoader busy={isPending} onClick={create}>
 *     <ButtonLoaderIcon><Icon icon={SquaresPlusIcon} /></ButtonLoaderIcon>
 *     <ButtonLoaderText>{isPending ? 'Creating' : 'New Board'}</ButtonLoaderText>
 *   </ButtonLoader>
 */
const ButtonLoader: React.FC<ButtonLoaderProps> = ({ busy, children, ...props }) => {
  const contentRef = useWidthTransition<HTMLSpanElement>(busy)

  return (
    <Button {...props} busy={busy}>
      <BusyContext value={busy}>
        {/* Start-aligned: the width tweens, so centered content would jump. Its overflow runs through
            the padding and is clipped by the button's own edge, which also leaves room for the blur. */}
        <span ref={contentRef} className="flex items-center whitespace-nowrap">
          {children}
        </span>
      </BusyContext>
    </Button>
  )
}

/** The button's icon (`<Icon icon={...} />`), which becomes a spinner while busy. */
const ButtonLoaderIcon: React.FC<React.PropsWithChildren> = ({ children }) => {
  const busy = use(BusyContext)

  return (
    <span className="mr-2 grid size-5 shrink-0 place-items-center text-primary-200" aria-hidden="true" data-button-icon>
      <span className={cn('col-start-1 row-start-1 flex', swap, busy && hidden)}>{children}</span>
      <span className={cn('col-start-1 row-start-1 flex', swap, !busy && hidden)}>
        <Spinner tone="primary" />
      </span>
    </span>
  )
}

/**
 * The button's label. Pass whichever text fits the state, e.g. `{isPending ? 'Creating…' : 'Create'}`.
 * When `busy` flips, the last text from the other state is kept so the two can cross-fade.
 */
const ButtonLoaderText: React.FC<React.PropsWithChildren> = ({ children }) => {
  const busy = use(BusyContext)

  // Both labels stay mounted, so flipping `busy` transitions them instead of swapping instantly.
  const [labels, setLabels] = useState({ idle: busy ? null : children, busy: busy ? children : null })
  const current = busy ? 'busy' : 'idle'
  if (labels[current] !== children) setLabels({ ...labels, [current]: children })

  // The shown label sets the width; the other sits on top of it, out of the flow.
  const label = (state: 'idle' | 'busy') => {
    const shown = state === current
    return (
      <span
        className={cn('block', swap, !shown && cn('absolute top-0 left-0', hidden))}
        aria-hidden={!shown || undefined}>
        {shown ? children : labels[state]}
      </span>
    )
  }

  return (
    <span className="relative block">
      {label('idle')}
      {label('busy')}
    </span>
  )
}

export { ButtonLoader, ButtonLoaderIcon, ButtonLoaderText, type ButtonLoaderProps }
