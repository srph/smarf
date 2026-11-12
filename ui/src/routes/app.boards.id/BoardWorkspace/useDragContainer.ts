import { useState, useMemo } from 'react'
import { ID } from '~/src/types/api'
import { DragStartEvent, DragMoveEvent, DragCancelEvent, DragEndEvent } from '@dnd-kit/core'

export interface Translate {
  x: number
  y: number
}

interface UseDragContainerChangeEvent<T> {
  container: T
  translate: Translate
}

interface UseDragContainerProps<T> {
  containers: T[]
  getContainerId: (container: T) => ID
  getContainerPosition: (container: T) => Translate
  onChange: (e: UseDragContainerChangeEvent<T>) => void
  onDragEnd: (e: Pick<UseDragContainerChangeEvent<T>, 'container'>) => void
}

interface UseDragContainerReturnType {
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
function useDragContainer<T>(props: UseDragContainerProps<T>): UseDragContainerReturnType {
  const { containers, getContainerId } = props

  const containerIds: Containers = useMemo(() => containers.map(getContainerId), [containers, getContainerId])

  const [activeId, setActiveId] = useState<ID | null>(null)

  const getContainer = (containerId: ID) => containers[containerIds.indexOf(containerId)]

  const activeContainer = getContainer(activeId)
  const [initialTranslate, setInitialTranslate] = useState<Translate>(defaultTranslate)
  const [initialWindowScroll, setInitialWindowScroll] = useState<Translate>(defaultTranslate)

  const onDragStart = ({ active }: DragStartEvent) => {
    const container = getContainer(String(active.id))

    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!container) return

    setInitialWindowScroll({
      x: window.scrollX,
      y: window.scrollY
    })

    setActiveId(String(active.id))
    const translate = props.getContainerPosition(container)
    setInitialTranslate(translate)
  }

  const onDragMove = ({ delta }: DragMoveEvent) => {
    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId) return

    props.onChange({
      container: activeContainer,
      translate: {
        x: initialTranslate.x + delta.x - initialWindowScroll.x,
        y: initialTranslate.y + delta.y - initialWindowScroll.y
      }
    })
  }

  const onDragEnd = () => {
    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId) return

    props.onDragEnd({
      container: activeContainer
    })

    setActiveId(null)
    setInitialTranslate(defaultTranslate)
  }

  const onDragCancel = () => {
    // Avoid conflict with useGridCollisionDetection
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

export { useDragContainer }
