import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

import {
  closestCenter,
  UniqueIdentifier,
  pointerWithin,
  CollisionDetection,
  rectIntersection,
  getFirstCollision,
  DragStartEvent,
  DragMoveEvent,
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
  /** While dragging: show the item moved into another container. Not a save; `containers` should reflect it. */
  onMove: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
  /** On drop: where the item started and where it ended up (never the same place). */
  onDrop: (start: CustomGridCollisionDetectionEvent, end: CustomGridCollisionDetectionEvent) => void
  /** Cancelled, or dropped where it started: undo whatever `onMove` showed. */
  onCancel: () => void
  /** An item was picked up. */
  onStart?: () => void
  /**
   * Dropped off every container: remove the item from where it started. Without it, such a drop puts it back.
   * `at` is the dropped item's center on screen (client coordinates), or null if dnd-kit didn't measure it.
   */
  onRemove?: (start: CustomGridCollisionDetectionEvent, at: { x: number; y: number } | null) => void
  /**
   * How far around a container's droppable the pointer still counts as on the container: `top` for a heading above
   * it, `edge` on the other sides. Only used with `onRemove`.
   */
  containerReach?: { top: number; edge: number }
}

interface CustomGridCollisionDetectionReturnType {
  collisionDetectionStrategy: CollisionDetection
  /** The dragged item's id while it's being dragged, else null. Container drags don't count. */
  activeId: ID | null
  /** The dragged item's id while the pointer is off every container (dropping it there removes it), else null. */
  removingId: ID | null
  onDragStart: (e: DragStartEvent) => void
  onDragMove: (e: DragMoveEvent) => void
  onDragOver: (e: DragOverEvent) => void
  onDragEnd: (e: DragEndEvent) => void
  onDragCancel: (e: DragCancelEvent) => void
}

type ContainerIds = ID[]

// Map for O(n) access
type PayloadMap = Record<ID, ID[]>

// Collision data saying the pointer is off every container. Carried on the collision, so the strategy stays pure and
// onDragMove/onDragEnd read the same answer it worked out.
interface OffContainersData {
  offContainers: true
}

const OFF_CONTAINERS: OffContainersData = { offContainers: true }

const isOffContainers = (collisions: DragMoveEvent['collisions']) => collisions?.[0]?.data?.offContainers === true

/**
 * Collision detection and drag handlers for items in a grid of containers (heroes in categories).
 * Moving into another container calls `onMove` as it happens, so the parent can show it; the drop calls
 * `onDrop` once with the start and end positions, so the parent saves once.
 */
function useBoardWorkspaceGridCollisionDetection<T>(
  props: CustomGridCollisionDetectionProps<T>
): CustomGridCollisionDetectionReturnType {
  const { containers, containerIdTransformer, containerDataIdTransformer, containerReach } = props

  const canRemove = Boolean(props.onRemove)

  const containerIds: ContainerIds = useMemo(
    () => containers.map(containerIdTransformer),
    [containers, containerIdTransformer]
  )

  const payload: PayloadMap = useMemo(() => {
    return containers.reduce((map, container, i) => {
      map[containerIds[i]] = containerDataIdTransformer(container)
      return map
    }, {} as PayloadMap)
  }, [containers, containerIds, containerDataIdTransformer])

  // An active item's starting position so we know how to put it back when user cancels
  const [startEvent, setStartEvent] = useState<CustomGridCollisionDetectionEvent | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isOff, setIsOff] = useState(false)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef<boolean>(false)

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   * @source https://github.com/clauderic/dnd-kit/blob/6f307806c09d4a1147073bf04f7cd15b7de721fc/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx#L180-L187
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Dragging an item with the pointer and it's off every container (and the reach around it): keep the last match,
      // so nothing shifts, and mark it so a drop here removes the item. Keyboard drags have no pointer, so never get here.
      const pointer = args.pointerCoordinates
      if (activeId && canRemove && pointer) {
        const top = containerReach?.top ?? 0
        const edge = containerReach?.edge ?? 0
        const onContainer = containerIds.some((id) => {
          const rect = args.droppableRects.get(id)
          return (
            rect &&
            pointer.x >= rect.left - edge &&
            pointer.x <= rect.right + edge &&
            pointer.y >= rect.top - top &&
            pointer.y <= rect.bottom + edge
          )
        })
        if (!onContainer) return [{ id: lastOverId.current ?? activeId, data: OFF_CONTAINERS }]
      }

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
                (container) => container.id !== overId && containerItems.includes(String(container.id))
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
    [activeId, payload, canRemove, containerIds, containerReach]
  )

  const findContainer = (id: ID): ID | undefined => {
    // Check if the id is actually a container id
    // Very important to allow dragOver to work when dragging an item into an empty sortable
    if (id in payload) return id

    return containerIds.find((containerId) => {
      return payload[containerId].includes(id)
    })
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    // Avoid conflict with useBoardWorkspaceDragContainer
    // This means we're dragging a container, and we don't care about it
    if (String(active.id) in payload) return

    const activeContainer = findContainer(String(active.id))
    if (!activeContainer) return

    setActiveId(String(active.id))

    setStartEvent({
      container: activeContainer,
      index: payload[activeContainer].indexOf(String(active.id))
    })

    props.onStart?.()
  }

  const onDragMove = ({ collisions }: DragMoveEvent) => {
    if (!activeId) return
    setIsOff(isOffContainers(collisions))
  }

  // Responsible for moving an item from array to array
  // when a user drags an item over to another container
  const onDragOver = ({ active, over }: DragOverEvent) => {
    // Avoid conflict with useBoardWorkspaceDragContainer
    // This means we're dragging a container, and we don't care about it
    if (!activeId) return

    const overId = over ? String(over.id) : undefined

    if (!overId) {
      return
    }

    const overContainer = findContainer(overId)
    const activeContainer = findContainer(String(active.id))

    // Bail if any of the containers are invalid
    if (!overContainer || !activeContainer) {
      return
    }

    // Bail if we're dragging to the same container as drag end already covers this.
    if (activeContainer === overContainer) {
      return
    }

    const activeItems = payload[activeContainer]
    const activeIndex = activeItems.indexOf(String(active.id))
    const overItems = payload[overContainer]
    const overIndex = overItems.indexOf(overId)

    const isBelowOverItem =
      over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height

    const modifier = isBelowOverItem ? 1 : 0

    const newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length

    recentlyMovedToNewContainer.current = true

    props.onMove(
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

  const reset = () => {
    setStartEvent(null)
    setActiveId(null)
    setIsOff(false)
  }

  // Works out where the item ended up and reports the whole move once.
  const onDragEnd = ({ active, over, collisions }: DragEndEvent) => {
    // Avoid conflict with useBoardWorkspaceDragContainer
    // This means we're dragging a container, and we don't care about it
    if (!activeId) return

    // Dropped off every container: remove it from where it started, whatever the drag showed on the way.
    if (startEvent && props.onRemove && isOffContainers(collisions)) {
      const rect = active.rect.current.translated
      props.onRemove(startEvent, rect && { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      reset()
      return
    }

    const activeContainer = findContainer(String(active.id))

    // The container somehow does not exist
    if (!startEvent || !activeContainer) {
      props.onCancel()
      reset()
      return
    }

    // Dropped on an item: that item's place. Otherwise (over an empty container, or nothing) wherever
    // the drag has already shown it.
    const overId = over ? String(over.id) : undefined
    const overContainer = overId ? findContainer(overId) : undefined
    const overIndex = overId && overContainer ? payload[overContainer].indexOf(overId) : -1

    const end: CustomGridCollisionDetectionEvent =
      overContainer && overIndex >= 0
        ? { container: overContainer, index: overIndex }
        : { container: activeContainer, index: payload[activeContainer].indexOf(activeId) }

    if (end.container === startEvent.container && end.index === startEvent.index) {
      props.onCancel()
    } else {
      props.onDrop(startEvent, end)
    }

    reset()
  }

  const onDragCancel = () => {
    // Avoid conflict with useBoardWorkspaceDragContainer
    // This means we're dragging a container, and we don't care about it
    if (!activeId) return

    props.onCancel()
    reset()
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [props.containers])

  return {
    collisionDetectionStrategy,
    activeId,
    removingId: activeId && isOff ? activeId : null,
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    onDragCancel
  }
}

export { useBoardWorkspaceGridCollisionDetection }
