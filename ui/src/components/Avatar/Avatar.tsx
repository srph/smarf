import React from 'react'
import styled from 'styled-components'
import { theme } from '../../theme'

type Sizes = 'sm' | 'md' | 'lg'

interface Props {
  src: string
  size?: Sizes
}

export const Avatar: React.FC<Props> = ({ src, size = 'md', bordered = false }) => {
  return (
    <Container size={size}>
      <Image src={src} size={size} />
    </Container>
  )
}

const sizes: Record<Sizes, number> = {
  sm: 24,
  md: 32,
  lg: 40
}

const Container = styled.div<{ size: Sizes }>`
  padding: 6px;
  border: 2px solid ${theme.colors.neutral[700]};
  border-radius: 50%;
`

const Image = styled.img<{ size: Sizes }>`
  display: block;
  height: ${(props) => sizes[props.size]}px;
  width: ${(props) => sizes[props.size]}px;
  border-radius: 50%;
`
