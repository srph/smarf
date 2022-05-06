import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { ImageAspectRatio } from '~/src/components'
import { useSortable } from '@dnd-kit/sortable'
import { Category, HeroCategoryPivot } from '~/src/types/api'
import { CSS } from '@dnd-kit/utilities'
import {
  CATEGORY_HERO_ASPECT_RATIO,
  CATEGORY_HERO_WIDTH,
  CATEGORY_HERO_X_TOTAL_PADDING
} from '~/src/contexts/BoardList/constants'

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
    <Container ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CategoryHeroImage>
        <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} />
      </CategoryHeroImage>
    </Container>
  )
}

const Container = styled.div`
  flex-shrink: 0;
  padding: ${CATEGORY_HERO_X_TOTAL_PADDING / 2}px;
`

const CategoryHeroImage = styled.div`
  width: ${CATEGORY_HERO_WIDTH}px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0px 0px 0px 0px ${theme.colors.blue[500]};

  &:hover {
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }
`

export { CategoryHero }
