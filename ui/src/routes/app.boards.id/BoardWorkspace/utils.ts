type Listener = (...args: any[]) => void

/** Combine two objects of event handlers. A handler both define runs both, first `a`'s, then `b`'s. */
export function mergeEvents<A extends object, B extends object>(a: A, b: B): A & B {
  const result: Record<string, Listener> = { ...(a as Record<string, Listener>) }

  for (const [event, listener] of Object.entries(b as Record<string, Listener>)) {
    const first = result[event]
    result[event] = first
      ? (...args) => {
          first(...args)
          listener(...args)
        }
      : listener
  }

  return result as A & B
}
