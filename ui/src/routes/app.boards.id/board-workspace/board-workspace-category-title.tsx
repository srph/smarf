import React, { useState } from 'react'
import { useDebouncedEffect } from '~/src/hooks/use-debounced-effect'
import { CATEGORY_NAME_MAX_CHARACTERS } from '~/src/contexts/board-list/constants'

interface Props {
  value: string
  onChange: (v: string) => void
}

const BoardWorkspaceCategoryTitle: React.FC<Props> = ({ value, onChange }) => {
  const [input, setInput] = useState(value)

  useDebouncedEffect(
    () => {
      onChange(input)
    },
    [input],
    250
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  return (
    <input
      value={input}
      onChange={handleChange}
      maxLength={CATEGORY_NAME_MAX_CHARACTERS}
      // Fallback width for browsers without `field-sizing`.
      size={Math.max(input.length, 1)}
      aria-label="Category name"
      // No rename button: the hover tint says it's editable, and focus shows the sky ring.
      className="-mx-1.5 field-sizing-content min-w-[1ch] rounded-md px-1.5 py-0.5 font-semibold outline-none hover:bg-white/5 focus:bg-zinc-900 focus-visible:ring-focus"
    />
  )
}

export { BoardWorkspaceCategoryTitle }
