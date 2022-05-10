import { MutableRefObject } from 'react'

type Ref<T> = MutableRefObject<T> | ((value: T) => void)

export function mergeRefs<T>(...refs: Ref<T>[]) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref.current) {
        ref.current = value
      }
    })
  }
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1]
}
