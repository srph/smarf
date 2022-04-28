import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'
import { theme } from '../../theme'
import { Icon } from '../Icon'

interface Props {
  block?: boolean
  variant?: 'primary'
  icon?: string
  type?: 'button' | 'submit'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const Button: React.FC<Props> = ({ children, icon, type = 'button', onClick, block = false }) => {
  return (
    <Element type={type} onClick={onClick} block={block}>
      {icon ? (
        <IconContainer>
          <Icon name={icon} />
        </IconContainer>
      ) : null}
      <span>{children}</span>
    </Element>
  )
}

const Element = styled.div<{ block?: boolean }>`
  display: ${(props) => (props.block ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: ${theme.colors.neutral[50]};
  background: ${theme.colors.indigo[400]};
  font-size: ${theme.fontSizes.md}px;
  font-weight: bold;
  text-align: center;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;

  &:hover,
  &:focus {
    transition: 200ms box-shadow ease;
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }
`

const IconContainer = styled.div`
  margin-right: 8px;
  color: ${theme.colors.indigo[200]};
`

export { Button }
