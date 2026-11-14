import React from 'react'
import { cn } from 'cn'
import { Icon, type IconComponent } from '../icon/icon'

type Variant = 'primary' | 'clear' | 'danger'

interface ButtonProps {
  block?: boolean
  variant?: Variant
  icon?: IconComponent
  type?: 'button' | 'submit'
  disabled?: boolean
  /** Working on its action: disables the button but keeps it at full color, with a progress cursor. ButtonLoader shows the spinner. */
  busy?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  ref?: React.Ref<HTMLButtonElement>
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-500',
  danger: 'bg-red-500',
  clear: 'border border-zinc-700'
}

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
  children,
  icon,
  variant = 'primary',
  type = 'button',
  onClick,
  block = false,
  disabled = false,
  busy = false,
  ref
}) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cn(
        // A leading icon weighs down the left side, so the right side gets more room to balance it.
        // Clipped so ButtonLoader's content is cut at the button's edge while its width tweens.
        'w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg p-2 text-center text-sm font-bold text-zinc-50 ring-sky-500 transition-shadow duration-200 has-data-button-icon:pr-3',
        'enabled:hover:ring-2 enabled:focus:ring-2 disabled:not-aria-busy:cursor-not-allowed disabled:not-aria-busy:opacity-75 aria-busy:cursor-progress',
        block ? 'flex' : 'inline-flex',
        variants[variant]
      )}>
      {icon ? (
        <div className="mr-2 text-primary-200" data-button-icon>
          <Icon icon={icon} />
        </div>
      ) : null}
      <span>{children}</span>
    </button>
  )
}

export { Button, type ButtonProps }
