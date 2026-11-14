import React from 'react'
import { Button } from '~/src/components/button/button'
import { Container } from '~/src/components/container/container'
import { Logo } from '~/src/components/logo/logo'
import { Link, useNavigate } from 'react-router'
import { SquaresPlusIcon } from '@heroicons/react/20/solid'
import { UserDropdown } from './user-dropdown'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'

const Navigation: React.FC = () => {
  const navigate = useNavigate()

  // Loads the hero list on every page, so New Board's starts and a board's hero picker have it ready.
  useHeroesQuery()

  return (
    <div className="mb-12 border-b border-zinc-800">
      <div className="h-1 bg-linear-to-r from-primary-600 to-primary-400" />

      <Container>
        <div className="flex items-center justify-between py-6">
          {/* Padded (and pulled back by as much) so the focus ring clears the wordmark. */}
          <Link to="/" className="-m-1 block rounded-xl p-1 focus-visible:ring-focus">
            <Logo />
          </Link>

          <div className="flex items-center">
            <div className="mr-6">
              {/* Nothing is saved until a start is chosen on /b/new. */}
              <Button icon={SquaresPlusIcon} onClick={() => navigate('/b/new')}>
                New Board
              </Button>
            </div>

            <UserDropdown />
          </div>
        </div>
      </Container>
    </div>
  )
}

export { Navigation }
