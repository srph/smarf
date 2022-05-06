import { MutableRefObject } from 'react'
import type { Modifier, ClientRect } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'

export const restrictWithinWorkspace = ({
  workspaceRef
}: {
  workspaceRef: MutableRefObject<HTMLDivElement>
}): Modifier => {
  return ({ draggingNodeRect, transform }) => {
    if (!workspaceRef.current || !draggingNodeRect) {
      return transform
    }

    return restrictToBoundingRect(transform, draggingNodeRect, workspaceRef.current.getBoundingClientRect())
  }
}

// @source https://github.com/clauderic/dnd-kit/blob/e302bd4488bdfb6735c97ac42c1f4a0b1e8bfdf9/packages/modifiers/src/utilities/restrictToBoundingRect.ts
function restrictToBoundingRect(transform: Transform, rect: ClientRect, boundingRect: ClientRect): Transform {
  const value = {
    ...transform
  }

  if (rect.top + transform.y <= boundingRect.top) {
    value.y = boundingRect.top - rect.top
  } else if (rect.bottom + transform.y >= boundingRect.top + boundingRect.height) {
    value.y = boundingRect.top + boundingRect.height - rect.bottom
  }

  if (rect.left + transform.x <= boundingRect.left) {
    value.x = boundingRect.left - rect.left
  } else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) {
    value.x = boundingRect.left + boundingRect.width - rect.right
  }

  return value
}
