import { useEffect, useLayoutEffect, useRef } from 'react'

const DURATION = 300

/**
 * Tween an element's width to its new natural width whenever `key` changes, instead of snapping.
 *
 * The element should start-align and clip its content: the width moves over 300ms, so centered
 * content would jump to its new center on the first frame. Skipped under reduced motion.
 */
const useWidthTransition = <T extends HTMLElement>(key: unknown) => {
  const ref = useRef<T>(null)
  const keyRef = useRef(key)
  // The width at rest. By the time the key's effect runs, the DOM already holds the new content,
  // so the width it had before is read from here.
  const restingWidthRef = useRef<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      if (!el.style.width) restingWidthRef.current = el.getBoundingClientRect().width
    }
    measure()

    // Late changes (the web font loading) move the resting width too.
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || Object.is(keyRef.current, key)) return
    keyRef.current = key

    // Mid-tween, the inline width holds the element where the last tween has it.
    const from = el.style.width ? el.getBoundingClientRect().width : restingWidthRef.current
    clearTimeout(timeoutRef.current)
    el.style.transition = 'none'
    el.style.width = ''
    const to = el.getBoundingClientRect().width
    restingWidthRef.current = to

    if (from === null || from === to || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.style.transition = ''
      return
    }

    el.style.width = `${from}px`
    void el.offsetWidth // commit the start width, or the browser skips straight to the end
    el.style.transition = `width ${DURATION}ms var(--ease-morph)`
    el.style.width = `${to}px`

    timeoutRef.current = setTimeout(() => {
      el.style.transition = ''
      el.style.width = ''
    }, DURATION)
  }, [key])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return ref
}

export { useWidthTransition }
