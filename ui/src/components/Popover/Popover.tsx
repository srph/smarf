import React, { MutableRefObject, useMemo } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { usePopper } from 'react-popper'
import type { Placement, Offsets } from '@popperjs/core'

import { useStateRef, useUpdateEffect, useDocumentListener, useOutsideClick } from '~/src/hooks'
import { theme } from '~/src/theme'

interface PopoverProps {
  open: boolean
  onChangeOpen: (open: boolean) => void
  trigger: React.ReactNode | (({ ref }: { ref: (n) => void }) => React.ReactNode)
  strategy?: 'absolute' | 'fixed'
  placement?: Placement
  container?: HTMLElement
  offset?: Offsets
  dependencies?: any[]
}

const PORTAL_ID = 'smarf-popover-portal'

const Popover: React.FC<PopoverProps> = ({
  open,
  onChangeOpen,
  strategy = 'absolute',
  placement,
  offset,
  trigger,
  container: containerElement,
  dependencies,
  children
}) => {
  const [triggerElement, setTriggerElement, triggerElementRef] = useStateRef<HTMLElement>()

  const [popperElement, setPopperElement, popperElementRef] = useStateRef<HTMLElement>()

  const modifiers = useMemo(() => {
    const result = []
    if (offset) {
      result.push({
        name: 'offset',
        options: {
          offset: [offset.x, offset.y]
        }
      })
    }
    return result
  }, [offset])

  const { styles, attributes, forceUpdate } = usePopper(containerElement || triggerElement, popperElement, {
    placement,
    modifiers,
    strategy
  })

  const portalElement = useMemo(() => {
    return document.getElementById(PORTAL_ID)
  }, [])

  // Force-calculate position when dependencies change
  // e.g., category height increases
  useUpdateEffect(
    () => {
      forceUpdate?.()
    },
    dependencies ? [forceUpdate, ...dependencies] : [forceUpdate]
  )

  useDocumentListener('keydown', (evt) => {
    if (open && evt.key === 'Escape') {
      onChangeOpen(false)
    }
  })

  useOutsideClick([popperElementRef, triggerElementRef], (evt) => {
    if (open) {
      onChangeOpen(false)
    }
  })

  return (
    <>
      {typeof trigger === 'function' ? (
        trigger({ ref: setTriggerElement })
      ) : (
        <div ref={setTriggerElement}>{trigger}</div>
      )}

      {portalElement &&
        open &&
        ReactDOM.createPortal(
          <PopperContainer ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            {children}
          </PopperContainer>,
          portalElement
        )}
    </>
  )
}

const PopoverPortal = () => {
  return <div id={PORTAL_ID} />
}

const PopperContainer = styled.div`
  position: absolute;
  z-index: ${theme.zIndex.popover};
`

export { Popover, PopoverPortal, PopoverProps }
