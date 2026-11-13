import { useState, useMemo } from 'react'
import { ID } from '~/src/types/api'
import { DragStartEvent, DragMoveEvent, DragCancelEvent, DragEndEvent } from '@dnd-kit/core'

export interface Translate {
  x: number
  y: number
}

interface UseBoardWorkspaceDragContainerChangeEvent<T> {
  container: T
  translate: Translate
}

interface UseBoardWorkspaceDragContainerProps<T> {
  containers: T[]
  getContainerId: (container: T) => ID
  getContainerPosition: (container: T) => Translate
  onChange: (e: UseBoardWorkspaceDragContainerChangeEvent<T>) => void
  onDragEnd: (e: Pick<UseBoardWorkspaceDragContainerChangeEvent<T>, 'container'>) => void
}

interface UseBoardWorkspaceDragContainerReturnType {
  onDragStart: (e: DragStartEvent) => void
  onDragMove: (e: DragMoveEvent) => void
  onDragEnd: (e: DragCancelEvent) => void
  onDragCancel: (e: DragEndEvent) => void
}

type Containers = ID[]

const defaultTranslate: Translate = {
  x: 0,
  y: 0
}

/**
 * Encapsulates drag logic for containers
 */
function useBoardWorkspaceDragContainer<T>(
  props: UseBoardWorkspaceDragContainerProps<T>
): UseBoardWorkspaceDragContainerReturnType {
  const { containers, getContainerId } = props

  const containerIds: Containers = useMemo(() => containers.map(getContainerId), [containers, getContainerId])

  const [activeId, setActiveId] = useState<ID | null>(null)

  const getContainer = (containerId: ID) => containers[containerIds.indexOf(containerId)]

  const activeContainer = activeId ? getContainer(activeId) : undefined
  const [initialTranslate, setInitialTranslate] = useState<Translate>(defaultTranslate)

  const onDragStart = ({ active }: DragStartEvent) => {
    const container = getContainer(String(active.id))

    // Avoid conflict with useBoardWorkspaceGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!container) return

    setActiveId(String(active.id))
    const translate = props.getContainerPosition(container)
    setInitialTranslate(translate)
  }

  const onDragMove = ({ delta }: DragMoveEvent) => {
    // Avoid conflict with useBoardWorkspaceGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId || !activeContainer) return

    // dnd-kit's delta already includes any scrolling since the drag started.
    props.onChange({
      container: activeContainer,
      translate: {
        x: initialTranslate.x + delta.x,
        y: initialTranslate.y + delta.y
      }
    })
  }

  const onDragEnd = () => {
    // Avoid conflict with useBoardWorkspaceGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId) return

    if (activeContainer) {
      props.onDragEnd({
        container: activeContainer
      })
    }

    setActiveId(null)
    setInitialTranslate(defaultTranslate)
  }

  const onDragCancel = () => {
    // Avoid conflict with useBoardWorkspaceGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeContainer) return

    props.onChange({
      container: activeContainer,
      translate: initialTranslate
    })

    setActiveId(null)
    setInitialTranslate(defaultTranslate)
  }

  return {
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel
  }
}

export { useBoardWorkspaceDragContainer }
