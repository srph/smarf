import React from 'react'
import styled from 'styled-components'
import { theme } from '../../theme'

interface Props {
  variant: 'primary'
  icon?: string
}

const Button: React.FC<Props> = ({ children, icon }) => {
  return (
    <Element>
      {icon ? <Icon>{icon}</Icon> : null}
      <span>{children}</span>
    </Element>
  )
}

const Element = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px;
  width: 100%;
  color: ${theme.colors.neutral[50]};
  background: ${theme.colors.indigo[400]};
  font-size: ${theme.fontSizes.md}px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;

  &:hover,
  &:focus {
    transition: 200ms border ease;
    transition-delay: 200ms;
    border-color: ${theme.colors.indigo[300]};
  }
`

const Icon = styled.div`
  margin-right: 8px;
  font-size: ${theme.fontSizes.sm}px;
  color: ${theme.colors.indigo[200]};
`

export { Button }
