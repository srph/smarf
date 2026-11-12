import React from 'react'
import styled, { keyframes } from 'styled-components'
import { theme } from '~/src/theme'

// @source: https://loading.io/css/
const Spinner = () => {
  return (
    <Container>
      <Ring />
      <Ring />
      <Ring />
    </Container>
  )
}

const kf = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const Container = styled.div`
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
`

const Ring = styled.div`
  & {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 16px;
    height: 16px;
    margin: 2px;
    border: 2px solid ${theme.colors.blue[500]};
    border-radius: 50%;
    animation: ${kf} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: ${theme.colors.blue[500]} transparent transparent transparent;
  }

  &:nth-child(1) {
    animation-delay: -0.45s;
  }

  &:nth-child(2) {
    animation-delay: -0.3s;
  }

  &:nth-child(3) {
    animation-delay: -0.15s;
  }
`

export { Spinner }
