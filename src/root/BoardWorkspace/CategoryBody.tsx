import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Category } from '~/src/types/api'

import { useDroppable } from '@dnd-kit/core'

interface Props {
  category: Category
}

const CategoryBody: React.FC<Props> = ({ category, children }) => {
  const { setNodeRef } = useDroppable({
    id: category.id
  })

  return <Body ref={setNodeRef}>{children}</Body>
}

const Body = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 16px 8px;
  background: ${theme.colors.neutral[800]};
  border-radius: 4px;
`

export { CategoryBody }
