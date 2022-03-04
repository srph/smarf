import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { ImageAspectRatio } from '~/src/components'
import { useSortable } from '@dnd-kit/sortable'
import { Category, HeroCategoryPivot } from '~/src/types/api'
import { CSS } from '@dnd-kit/utilities'
import { CATEGORY_HERO_WIDTH } from '~/src/root/constants'

interface Props {
  category: Category
  hero: HeroCategoryPivot
}

const CategoryHero: React.FC<Props> = ({ category, hero }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hero.pivot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Container width={100 / (category.heroes.length + 1)} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CategoryHeroImage>
        <ImageAspectRatio src={hero.thumbnail} value="4:5" />
      </CategoryHeroImage>
    </Container>
  )
}

const Container = styled.div<{ width: number }>`
  flex-shrink: 0;
  padding: 8px;
`

const CategoryHeroImage = styled.div`
  width: ${CATEGORY_HERO_WIDTH}px;
  border: 2px solid transparent;
  border-radius: 4px;

  &:hover {
    border-color: ${theme.colors.blue[500]};
  }
`

export { CategoryHero }
