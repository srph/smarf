import React, { useState } from 'react'
import { useLocation } from 'react-router'
import { config } from '~/src/config'
import { getReturnPath } from '~/src/components/guarded-route/guarded-route'
import { PageTitle } from '~/src/components/page-title/page-title'
import { DiscordButton } from '~/src/components/discord-button/discord-button'
import { randomState } from '~/src/lib/discord'
import { ShowcaseFilm } from './showcase-film'

const LoginRoute = () => {
  const location = useLocation()
  const returnTo = getReturnPath(location) ?? null
  // Shared with the film's own Discord button: see DiscordButton's `state`.
  const [discordState] = useState(randomState)

  return (
    <>
      <PageTitle title="Sign in" />
      <DiscordButton state={discordState} returnTo={returnTo} />
      {/* Absolute, so it sits at the foot of the auth layout, not in the column. */}
      <ShowcaseFilm videoUrl={config.showcase.videoUrl} discordState={discordState} returnTo={returnTo} />
    </>
  )
}

export { LoginRoute }
