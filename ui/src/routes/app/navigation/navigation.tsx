import React from 'react'
import { Button } from '~/src/components/button/button'
import { Container } from '~/src/components/container/container'
import { DiscordLogo } from '~/src/components/discord-button/discord-button'
import { Logo } from '~/src/components/logo/logo'
import { Link, useLocation, useNavigate } from 'react-router'
import { SquaresPlusIcon } from '@heroicons/react/20/solid'
import { UserDropdown } from './user-dropdown'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'

/**
 * One slim bar on every page, the same whether the board is yours or someone else's (a visitor's board details sit in
 * a dock at the bottom). Signed in: New Board and the account menu. Signed out (only on a public board): Sign in.
 */
const Navigation: React.FC = () => {
  const { user } = useAuthUser()

  const navigate = useNavigate()

  const location = useLocation()

  // Loads the hero list on every page, so New Board's starts and a board's hero picker have it ready.
  useHeroesQuery()

  return (
    <div className="relative mb-12 border-b border-zinc-800 bg-zinc-950/70">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary-600 to-primary-400" />

      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Padded (and pulled back by as much) so the focus ring clears the wordmark. */}
          <Link to="/" className="-m-1 block rounded-xl p-1 focus-visible:ring-focus">
            <Logo />
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Nothing is saved until a start is chosen on /b/new. */}
              <Button variant="clear" icon={SquaresPlusIcon} onClick={() => navigate('/b/new')}>
                New Board
              </Button>

              <UserDropdown />
            </div>
          ) : (
            // Signing in comes back to this page.
            <Button
              variant="clear"
              icon={DiscordLogo}
              onClick={() => navigate('/login', { state: { from: location } })}>
              Sign in
            </Button>
          )}
        </div>
      </Container>
    </div>
  )
}

export { Navigation }
