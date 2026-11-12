import React from 'react'
import { config } from '~/src/config'

interface Props {
  title: string
}

/**
 * Sets the document title ("Smarf — <title>"). React 19 hoists <title> into <head> and removes it on
 * unmount, so pages without one fall back to the title in index.html.
 */
const PageTitle = ({ title }: Props) => {
  return <title>{`${config.app.title} — ${title}`}</title>
}

export { PageTitle }
