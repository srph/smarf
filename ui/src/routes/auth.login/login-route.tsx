import React from 'react'
import { useLocation } from 'react-router'
import { getReturnPath } from '~/src/components/guarded-route/guarded-route'
import { PageTitle } from '~/src/components/page-title/page-title'
import { DiscordButton } from './discord-button'

const LoginRoute = () => {
  const location = useLocation()

  return (
    <>
      <PageTitle title="Sign in" />
      <DiscordButton returnTo={getReturnPath(location) ?? null} />
    </>
  )
}

export { LoginRoute }
