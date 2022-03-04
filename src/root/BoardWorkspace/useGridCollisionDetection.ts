import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'

import {
  closestCenter,
  UniqueIdentifier,
  pointerWithin,
  CollisionDetection,
  rectIntersection,
  getFirstCollision,
  DragStartEvent,
  DragOverEvent,
  DragCancelEvent,
  DragEndEvent
} from '@dnd-kit/core'

import { ID } from '~/src/types/api'

export interface CustomGridCollisionDetectionEvent {
  container: ID
  index: number
}

interface CustomGridCollisionDetectionProps<T> {
  containers: T[]
  containerIdTransformer: (item: T) => ID
  containerDataIdTransformer: (item: T) => ID[]
  onChange: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
}

interface CustomGridCollisionDetectionReturnType<T> {
  collisionDetectionStrategy: CollisionDetection
  onDragStart: (e: DragStartEvent) => void
  onDragOver: (e: DragOverEvent) => void
  onDragEnd: (e: DragEndEvent) => void
  onDragCancel: (e: DragCancelEvent) => void
}

type ContainerIds = ID[]

// Map for O(n) access
type PayloadMap = Record<ID, ID[]>

/**
 * Encapsulates custom collision detection strategy for our grid-type needs
 * Stores its own state so that parent is only aware of drag-end; where currently card goes to.
 * Won't this become problematic in a sense that if we update original state, we'll get outdated data?
 * What if we run onChange all the time? I think we should.
 */
function useGridCollisionDetection<T>(
  props: CustomGridCollisionDetectionProps<T>
): CustomGridCollisionDetectionReturnType<T> {
  const containerIds: ContainerIds = useMemo(() => {
    return props.containers.map(props.containerIdTransformer)
  }, [props.containers])

  const payload: PayloadMap = useMemo(() => {
    return props.containers.reduce((map, container, i) => {
      const containerId = containerIds[i]
      map[containerId] = props.containerDataIdTransformer(container)
      return map
    }, {})
  }, [props.containers, containerIds])

  // An active item's starting position so we know how to put it back when user cancels
  const [startEvent, setStartEvent] = useState<CustomGridCollisionDetectionEvent | null>(null)
  const [currentEvent, setCurrentEvent] = useState<CustomGridCollisionDetectionEvent | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef<boolean>(false)

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (overId != null) {
        if (overId in payload) {
          const containerItems = payload[overId]

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id)
              )
            })[0]?.id
          }
        }

        lastOverId.current = overId

        return [{ id: overId }]
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, payload]
  )

  const findContainer = (item: ID): ID => {
    return containerIds.find((containerId) => {
      return payload[containerId].includes(item)
    })
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id)

    const activeContainer = findContainer(active.id)

    setStartEvent({
      container: activeContainer,
      index: activeContainer.indexOf(active.id)
    })
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id
    if (!overId) return
    const overContainer = findContainer(overId)
    const activeContainer = findContainer(active.id)

    if (!overContainer || !activeContainer) {
      return
    }

    if (activeContainer !== overContainer) {
      const activeItems = payload[activeContainer]
      const overItems = payload[overContainer]
      const overIndex = overItems.indexOf(overId)
      const activeIndex = activeItems.indexOf(active.id)

      const isBelowOverItem =
        over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height

      const modifier = isBelowOverItem ? 1 : 0

      const newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1

      recentlyMovedToNewContainer.current = true

      setCurrentEvent({
        container: overContainer,
        index: newIndex
      })

      props.onChange(
        {
          container: activeContainer,
          index: activeIndex
        },
        {
          container: overContainer,
          index: newIndex
        }
      )
    }
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const activeContainer = findContainer(active.id)

    if (!activeContainer) {
      setStartEvent(null)
      setCurrentEvent(null)
      setActiveId(null)
      return
    }

    const overId = over?.id

    if (!overId) {
      setStartEvent(null)
      setCurrentEvent(null)
      setActiveId(null)
      return
    }

    const overContainer = findContainer(overId)

    if (overContainer) {
      const activeIndex = payload[activeContainer].indexOf(activeId)
      const overIndex = payload[overContainer].indexOf(overId)

      if (activeIndex !== overIndex) {
        props.onChange(
          {
            container: activeContainer,
            index: activeIndex
          },
          {
            container: overContainer,
            index: overIndex
          }
        )
      }
    }

    setStartEvent(null)
    setCurrentEvent(null)
    setActiveId(null)
  }

  const onDragCancel = () => {
    if (currentEvent && startEvent) {
      // Reset items to their original state in case items have been dragged across containers
      props.onChange(currentEvent, startEvent)
    }

    setStartEvent(null)
    setCurrentEvent(null)
    setActiveId(null)
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [props.containers])

  return {
    collisionDetectionStrategy,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel
  }
}

export { useGridCollisionDetection }
