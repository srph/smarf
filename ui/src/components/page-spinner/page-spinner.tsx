import React from 'react'
import { Spinner } from '~/src/components/spinner/spinner'

/** A centered spinner for a page whose data is still loading. */
const PageSpinner = () => {
  return (
    <div className="mx-auto flex justify-center p-12">
      <Spinner />
    </div>
  )
}

export { PageSpinner }
