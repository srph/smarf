import React from 'react'
import styled, { css } from 'styled-components'
import { theme } from '../../theme'
import { Icon } from '../Icon'

type Variant = 'primary' | 'clear' | 'danger'

interface Props {
  block?: boolean
  variant?: Variant
  icon?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const Button: React.FC<Props> = ({
  children,
  icon,
  variant = 'primary',
  type = 'button',
  onClick,
  block = false,
  disabled = false
}) => {
  return (
    <Element variant={variant} type={type} onClick={onClick} block={block} disabled={disabled}>
      {icon ? (
        <IconContainer>
          <Icon name={icon} />
        </IconContainer>
      ) : null}
      <span>{children}</span>
    </Element>
  )
}

const Element = styled.button<{ block?: boolean; variant?: Variant }>`
  display: ${(props) => (props.block ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
  color: ${theme.colors.text};
  background: transparent;
  font-size: ${theme.fontSizes.md}px;
  font-weight: bold;
  text-align: center;
  border: 0;
  border-radius: 4px;
  cursor: pointer;

  ${(props) =>
    props.variant === 'primary' &&
    css`
      background: ${theme.colors.indigo[400]};
    `}

  ${(props) =>
    props.variant === 'danger' &&
    css`
      background: ${theme.colors.red[500]};
    `}

    ${(props) =>
    props.variant === 'clear' &&
    css`
      border: 1px solid ${theme.colors.neutral[700]};
    `}

  &:not(:disabled):hover,
  &:not(:disabled):focus {
    transition: 200ms box-shadow ease;
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`

const IconContainer = styled.div`
  margin-right: 8px;
  color: ${theme.colors.indigo[200]};
`

export { Button }
