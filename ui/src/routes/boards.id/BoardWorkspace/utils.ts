// I don't know how to type this shit lmao, we got too clever sir
export const mergeEvents = (...objects: any) => {
  const listeners = {}

  for (const events of objects) {
    for (const event in events) {
      const listener = events[event]
      listeners[event] = listeners[event] ? [...listeners[event], listener] : [listener]
    }
  }

  const result = {}

  for (const event in listeners) {
    result[event] = (...arg) => {
      for (const listener of listeners[event]) {
        listener(...arg)
      }
    }
  }

  return result
}
