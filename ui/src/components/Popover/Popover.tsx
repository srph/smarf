import React, { useState, useRef, useMemo, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { usePopper } from 'react-popper'
import { useStateRef } from '~/src/hooks'
import type { Placement, Offsets } from '@popperjs/core'

interface Props {
  open: boolean
  onChangeOpen: (open: boolean) => void
  trigger: React.ReactNode
  placement?: Placement
  container?: HTMLElement
  offset?: Offsets
}

const Popover: React.FC<Props> = ({
  open,
  onChangeOpen,
  placement,
  offset,
  trigger,
  container: containerElement,
  children
}) => {
  const [triggerElement, setTriggerElement, triggerElementRef] = useStateRef<HTMLElement>()
  const [popperElement, setPopperElement] = useState<HTMLElement>()
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
      if (triggerElementRef.current?.contains(evt.target)) {
        onChangeOpen(!openRef.current)
      } else if (openRef.current) {
        onChangeOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <>
      <div ref={setTriggerElement}>{trigger}</div>

      {portalElement &&
        open &&
        ReactDOM.createPortal(
          <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            {children}
          </div>,
          portalElement
        )}
    </>
  )
}

export { Popover }
