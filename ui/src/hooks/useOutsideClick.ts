import { MutableRefObject } from 'react'
import { useDocumentListener } from './useDocumentListener'

const useOutsideClick = (containers: MutableRefObject<HTMLElement>[], listener) => {
  useDocumentListener('mousedown', (e) => {
    for (let container of containers) {
      if (container.current?.contains(e.target as Node)) {
        return
      }
    }

    listener(e)
  })
}

export { useOutsideClick }
