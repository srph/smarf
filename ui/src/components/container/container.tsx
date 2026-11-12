import React from 'react'

const Container: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative mx-auto max-w-400 px-4">{children}</div>
)

export { Container }
