import React from 'react'

// @source: https://loading.io/css/
const ring =
  'absolute m-0.5 block size-4 animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] rounded-full border-2 border-transparent border-t-sky-500'

const Spinner = () => {
  return (
    <div className="relative inline-block size-5">
      <div className={`${ring} [animation-delay:-0.45s]`} />
      <div className={`${ring} [animation-delay:-0.3s]`} />
      <div className={`${ring} [animation-delay:-0.15s]`} />
    </div>
  )
}

export { Spinner }
