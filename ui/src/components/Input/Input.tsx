import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'

interface Props {
  label?: string
  autoFocus?: boolean
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}

const Input: React.FC<Props> = (props) => {
  const handleChange = (evt) => {
    props.onChange(evt.target.value)
  }

  return (
    <div>
      {props.label && <Label>{props.label}</Label>}
      <StyledInput
        type={props.type || 'text'}
        autoFocus={props.autoFocus}
        value={props.value}
        onChange={handleChange}
        placeholder={props.placeholder}
      />
    </div>
  )
}

const Label = styled.label`
  display: block;
  width: 100%;
  margin-bottom: 8px;
  font-size: ${theme.fontSizes.sm}px;
  font-weight: bold;
`

const StyledInput = styled.input`
  display: flex;
  align-items: center;
  padding: 8px;
  height: 32px;
  width: 100%;
  background: transparent;
  border-radius: 4px;
  color: ${theme.colors.neutral[50]};
  border: 1px solid ${theme.colors.neutral[700]};
`

export { Input }
