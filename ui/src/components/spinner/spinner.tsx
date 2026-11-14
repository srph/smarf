import React from 'react'
import { cn } from 'cn'

// @source: https://loading.io/css/
const ring =
  'absolute m-0.5 block size-4 animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] rounded-full border-2 border-transparent'

type Tone = 'sky' | 'primary' | 'white'

// sky on plain surfaces; primary (the pale indigo of button icons) on a primary button; white on red metal.
const tones: Record<Tone, string> = {
  sky: 'border-t-sky-500',
  primary: 'border-t-primary-200',
  white: 'border-t-white'
}

const Spinner: React.FC<{ tone?: Tone }> = ({ tone = 'sky' }) => {
  return (
    <div className="relative inline-block size-5">
      <div className={cn(ring, tones[tone], '[animation-delay:-0.45s]')} />
      <div className={cn(ring, tones[tone], '[animation-delay:-0.3s]')} />
      <div className={cn(ring, tones[tone], '[animation-delay:-0.15s]')} />
    </div>
  )
}

export { Spinner }
