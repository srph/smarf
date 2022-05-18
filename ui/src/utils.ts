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

// Mutably swap values array to array
export function arrayTransfer<T>(src: T[], dest: T[], from: number, to: number) {
  const value = src.splice(from, 1)[0]
  dest.splice(to, 0, value)
}
