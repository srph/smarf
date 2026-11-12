import React, { useState } from 'react'
import { useDebouncedEffect } from '~/src/hooks/use-debounced-effect'
import { CATEGORY_NAME_MAX_CHARACTERS } from '~/src/contexts/board-list/constants'

interface Props {
  value: string
  onChange: (v: string) => void
}

const CategoryTitle: React.FC<Props> = ({ value, onChange }) => {
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
      className="field-sizing-content min-w-[1ch] outline-none"
    />
  )
}

export { CategoryTitle }
