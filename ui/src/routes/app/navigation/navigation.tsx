import React from 'react'
import { Button } from '~/src/components/button/button'
import { Container } from '~/src/components/container/container'
import { Logo } from '~/src/components/logo/logo'
import { Link } from 'react-router'
import { SquaresPlusIcon } from '@heroicons/react/20/solid'
import { UserDropdown } from './user-dropdown'
import { useBoardList } from '~/src/contexts/board-list/board-list-provider'
import { useHeroList } from '~/src/contexts/hero-list/hero-list-provider'

const Navigation: React.FC = () => {
  const { createBoard, isBoardCreating } = useBoardList()
  const { isLoading: isHeroListLoading } = useHeroList()

  return (
    <div className="mb-12 border-b border-zinc-800">
      <div className="h-1 bg-linear-to-r from-primary-600 to-primary-400" />

      <Container>
        <div className="flex items-center justify-between py-6">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center">
            <div className="mr-6">
              <Button
                icon={SquaresPlusIcon}
                disabled={isBoardCreating || isHeroListLoading}
                onClick={() => createBoard()}>
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
