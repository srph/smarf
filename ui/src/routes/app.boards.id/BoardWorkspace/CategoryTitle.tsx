import React, { useState } from 'react'
import styled from 'styled-components'
import AutosizeInput from 'react-input-autosize'
import { theme } from '~/src/theme'
import { useDebouncedEffect } from '~/src/hooks'

import { CATEGORY_NAME_MAX_CHARACTERS } from '~/src/contexts/BoardList'
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

  const handleChange = (event) => {
    if (event.target.value.length > CATEGORY_NAME_MAX_CHARACTERS) return
    setInput(event.target.value)
  }

  return (
    <AutosizeInput
      value={input}
      onChange={handleChange}
      inputStyle={{
        padding: 0,
        margin: 0,
        background: 'transparent',
        fontSize: `${theme.fontSizes.md}px`,
        color: theme.colors.text,
        border: 0,
        outline: 0
      }}
    />
  )
}

const CategoryHeadingTitle = styled(({ className, props }) => <AutosizeInput inputClassName={className} {...props} />)`
  padding: 0;
  margin: 0;
  background: transparent;
  font-size: ${theme.fontSizes.md}px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  border: 0;
  outline: 0;
`

export { CategoryTitle }
