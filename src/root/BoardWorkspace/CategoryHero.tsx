import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { useSortable } from '@dnd-kit/sortable'
import { HeroCategoryPivot } from '~/src/types/api'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  hero: HeroCategoryPivot
}

const CategoryHero: React.FC<Props> = ({ hero }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hero.pivot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Container ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CategoryHeroImage src={hero.thumbnail} />
    </Container>
  )
}

const Container = styled.div`
  padding: 8px;
`

const CategoryHeroImage = styled.img`
  height: 300px;
  width: 240px;
  border: 2px solid transparent;
  border-radius: 4px;

  &:hover {
    border-color: ${theme.colors.blue[500]};
  }
`

export { CategoryHero }
