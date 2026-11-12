import React from 'react'
import { cn } from 'cn'
import { Icon, type IconComponent } from '../icon/icon'

type Variant = 'primary' | 'clear' | 'danger'

interface Props {
  block?: boolean
  variant?: Variant
  icon?: IconComponent
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  ref?: React.Ref<HTMLButtonElement>
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-500',
  danger: 'bg-red-500',
  clear: 'border border-zinc-700'
}

const Button: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  icon,
  variant = 'primary',
  type = 'button',
  onClick,
  block = false,
  disabled = false,
  ref
}) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full cursor-pointer items-center justify-center rounded p-2 text-center text-sm font-bold text-zinc-50 ring-sky-500 transition-shadow duration-200',
        'enabled:hover:ring-2 enabled:focus:ring-2 disabled:cursor-not-allowed disabled:opacity-75',
        block ? 'flex' : 'inline-flex',
        variants[variant]
      )}>
      {icon ? (
        <div className="mr-2 text-primary-200">
          <Icon icon={icon} />
        </div>
      ) : null}
      <span>{children}</span>
    </button>
  )
}

export { Button }
