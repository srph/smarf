import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
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
    <TitleInput
      value={input}
      onChange={handleChange}
      maxLength={CATEGORY_NAME_MAX_CHARACTERS}
      // Fallback width for browsers without `field-sizing`.
      size={Math.max(input.length, 1)}
      aria-label="Category name"
    />
  )
}

const TitleInput = styled.input`
  field-sizing: content;
  min-width: 1ch;
  padding: 0;
  margin: 0;
  font: inherit;
  font-size: ${theme.fontSizes.md}px;
  color: ${theme.colors.text};
  background: transparent;
  border: 0;
  outline: 0;
`

export { CategoryTitle }
