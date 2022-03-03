import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'
import { theme } from '../../theme'
import { Icon } from '../Icon'

interface Props {
  variant?: 'primary'
  icon?: string
  type?: 'button' | 'submit'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const Button: React.FC<Props> = ({ children, icon, type = 'button', onClick }) => {
  return (
    <Element type={type} onClick={onClick}>
      {icon ? (
        <IconContainer>
          <Icon name={icon} />
        </IconContainer>
      ) : null}
      <span>{children}</span>
    </Element>
  )
}

const Element = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px;
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

const IconContainer = styled.div`
  margin-right: 8px;
  color: ${theme.colors.indigo[200]};
`

export { Button }
