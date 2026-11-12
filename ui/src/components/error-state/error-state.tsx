import React from 'react'
import { cn } from 'cn'
import { Button } from '~/src/components/button/button'
import { Spacer } from '~/src/components/spacer/spacer'

interface Props {
  message: React.ReactNode
  onRetry: () => void
  /** Disables Try again while the retry is in flight. */
  isRetrying?: boolean
  className?: string
}

/** A failed request: what went wrong and a Try again button. `children` adds more actions below it. */
const ErrorState: React.FC<React.PropsWithChildren<Props>> = ({
  message,
  onRetry,
  isRetrying = false,
  className,
  children
}) => {
  return (
    <div role="alert" className={cn('mx-auto max-w-90 text-center', className)}>
      <p>{message}</p>
      <Spacer size={2} />
      <Button onClick={onRetry} disabled={isRetrying}>
        Try again
      </Button>
      {children}
    </div>
  )
}

export { ErrorState }
