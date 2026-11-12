import React from 'react'
import styled from 'styled-components'

interface Props {
  size?: number
}

// Vertical gap in steps of 8px.
const Spacer: React.FC<Props> = ({ size = 1 }) => <Gap $size={size} />

const Gap = styled.div<{ $size: number }>`
  margin-bottom: ${(props) => 8 * props.$size}px;
`

export { Spacer }
