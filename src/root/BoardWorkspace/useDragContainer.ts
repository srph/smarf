import React, { useState, useMemo, useEffect } from 'react'
import { ID } from '~/src/types/api'
import { DragStartEvent, DragMoveEvent, DragCancelEvent, DragEndEvent } from '@dnd-kit/core'

export interface Translate {
  x: number
  y: number
}

interface TranslateMap {
  [id: string]: Translate
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
}

interface UseDragContainerReturnType {
  translateMap: TranslateMap
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
  const containerIds: Containers = useMemo(() => {
    return props.containers.map((container) => props.getContainerId(container))
  }, [props.containers])

  const makeInitialTranslateMap = () => {
    return containerIds.reduce((map, containerId, i) => {
      const container = props.containers[i]
      map[containerId] = props.getContainerPosition(container)
      return map
    }, {})
  }

  const makeTranslateMap = () => {
    return containerIds.reduce((map, containerId, i) => {
      const container = props.containers[i]
      map[containerId] = { x: 0, y: 0 }
      return map
    }, {})
  }

  const initialTranslateMap = useMemo(() => {
    return containerIds.reduce((map, containerId, i) => {
      const container = props.containers[i]
      map[containerId] = props.getContainerPosition(container)
      return map
    }, {})
  }, [props.containers, containerIds])

  const [activeTranslateMap, setActiveTranslateMap] = useState<TranslateMap>(makeTranslateMap)
  const [activeId, setActiveId] = useState<ID | null>(null)
  // const [initialTranslate, setInitialTranslate] = useState(<Translate)(defaultTranslate)
  const [initialWindowScroll, setInitialWindowScroll] = useState<Translate>(defaultTranslate)

  useEffect(() => {
    setActiveTranslateMap(makeInitialTranslateMap())
  }, [props.containers])

  const getContainer = (containerId: ID) => {
    const index = containerIds.indexOf(containerId)
    return props.containers[index]
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!getContainer(active.id)) return

    setInitialWindowScroll({
      x: window.scrollX,
      y: window.scrollY
    })

    setActiveId(active.id)
  }

  const onDragMove = ({ delta }: DragMoveEvent) => {
    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId) return

    setActiveTranslateMap((translateMap) => {
      return {
        ...translateMap,
        [activeId]: {
          x: initialTranslateMap[activeId].x + delta.x - initialWindowScroll.x,
          y: initialTranslateMap[activeId].y + delta.y - initialWindowScroll.y
        }
      }
    })
  }

  const onDragEnd = () => {
    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId) return

    props.onChange({
      container: getContainer(activeId),
      translate: activeTranslateMap[activeId]
    })

    setActiveId(null)
  }

  const onDragCancel = () => {
    // Avoid conflict with useGridCollisionDetection
    // It means we're not dragging any of the containers
    if (!activeId) return

    setActiveTranslateMap((translateMap) => {
      return {
        ...translateMap,
        [activeId]: props.getContainerPosition(getContainer(activeId))
      }
    })

    setActiveId(null)
  }

  return {
    translateMap: activeTranslateMap,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel
  }
}

export { useDragContainer }
