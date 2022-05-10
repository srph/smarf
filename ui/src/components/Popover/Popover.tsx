import React, { useState, useRef, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import ReactDOM from 'react-dom'
import { usePopper } from 'react-popper'
import { useStateRef } from '~/src/hooks'
import type { Placement, Offsets } from '@popperjs/core'
import { theme } from '~/src/theme'

interface Props {
  open: boolean
  onChangeOpen: (open: boolean) => void
  trigger: React.ReactNode
  placement?: Placement
  container?: HTMLElement
  offset?: Offsets
  closeOnContentClick?: boolean
}

const Popover: React.FC<Props> = ({
  open,
  onChangeOpen,
  placement,
  offset,
  trigger,
  container: containerElement,
  closeOnContentClick = false,
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
  const { styles, attributes } = usePopper(containerElement || triggerElement, popperElement, {
    placement,
    modifiers
  })
  const [portalElement, setPortalElement] = useState<HTMLElement>()
  const openRef = useRef(open)

  useEffect(() => {
    let portal

    if ((portal = document.querySelector('#smarf-popover-portal'))) {
      setPortalElement(portal)
    } else {
      portal = document.createElement('div')
      portal.setAttribute('id', 'smarf-popover-portal')
      document.body.appendChild(portal)
      setPortalElement(portal)
    }
  }, [])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    const handleEscape = (evt) => {
      if (openRef.current && evt.key === 'Escape') {
        onChangeOpen(false)
      }
    }

    const handleClick = (evt) => {
      // Clicking inside the popover won't close the popover
      if (!closeOnContentClick && popperElementRef.current?.contains(evt.target)) {
        return
      }

      // Clicking inside the trigger won't toggle the popover
      if (triggerElementRef.current?.contains(evt.target)) {
        return
      }

      // Close for everything else
      if (openRef.current) {
        // setTimeout(() => {
        //   onChangeOpen(false)
        // }, 50)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClick)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  return (
    <>
      <div ref={setTriggerElement}>{trigger}</div>

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

const PopperContainer = styled.div`
  position: absolute;
  z-index: ${theme.zIndex.popover};
`

export { Popover }
