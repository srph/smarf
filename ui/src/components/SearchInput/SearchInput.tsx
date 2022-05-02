import React from 'react'
import styled from 'styled-components'
import { Icon } from '../Icon'
import { theme } from '../../theme'

interface Props {
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}

const SearchInput: React.FC<Props> = ({ value, onChange, autoFocus = false }) => {
  const handleChange = (evt) => {
    onChange(evt.target.value)
  }

  return (
    <Container>
      <Input type="text" value={value} onChange={handleChange} placeholder="Search..." autoFocus={autoFocus} />
      <SearchIcon>
        <Icon name="search" width={16} />
      </SearchIcon>
    </Container>
  )
}

const Container = styled.label`
  display: flex;
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[700]};
  border-radius: 4px;

  &:hover,
  &:focus-within {
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }
`

const Input = styled.input`
  display: block;
  padding: 8px;
  color: ${theme.colors.text};
  background: transparent;
  border: 0;

  &:focus {
    outline: 0;
  }
`

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 8px;
  color: ${theme.colors.neutral[400]};
`

export { SearchInput }
