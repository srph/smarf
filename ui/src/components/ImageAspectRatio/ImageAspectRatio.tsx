import React from 'react'
import styled from 'styled-components'

interface Props {
  src: string
  value: string
}

const ImageAspectRatio: React.FC<Props> = ({ value, src }) => {
  const [w, h] = value.split(':')

  return (
    <Container multiplier={Number(h) / Number(w)}>
      <Image src={src} />
    </Container>
  )
}

const Container = styled.div<{ multiplier: number }>`
  position: relative;
  padding-bottom: ${(props) => 100 * props.multiplier}%;
  width: 100%;
`

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`

export { ImageAspectRatio }
