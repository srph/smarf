import styled from 'styled-components'

interface Props {
  size: number
}

const Spacer = styled.div<Props>`
  margin-bottom: ${(props) => 8 * (props.size || 1)}px;
`

export { Spacer }
