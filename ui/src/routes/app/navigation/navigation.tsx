import React from 'react'
import { ButtonLoader, ButtonLoaderIcon, ButtonLoaderText } from '~/src/components/button-loader/button-loader'
import { Icon } from '~/src/components/icon/icon'
import { Container } from '~/src/components/container/container'
import { Logo } from '~/src/components/logo/logo'
import { Link, useNavigate } from 'react-router'
import { SquaresPlusIcon } from '@heroicons/react/20/solid'
import { UserDropdown } from './user-dropdown'
import { useCreateBoardMutation, useIsBoardCreating } from '~/src/queries/boards/use-create-board-mutation'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'

const Navigation: React.FC = () => {
  const navigate = useNavigate()

  // isCreating is this button's own request, so only this button morphs; isBoardCreating disables both.
  const { mutate: createBoard, isPending: isCreating } = useCreateBoardMutation()
  const isBoardCreating = useIsBoardCreating()

  // The starter board uses the first heroes, so wait for the hero list.
  const { status: heroesStatus } = useHeroesQuery()

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
              <ButtonLoader
                busy={isCreating}
                disabled={isBoardCreating || heroesStatus === 'pending'}
                onClick={() => createBoard(undefined, { onSuccess: (board) => navigate(`/b/${board.id}`) })}>
                <ButtonLoaderIcon>
                  <Icon icon={SquaresPlusIcon} />
                </ButtonLoaderIcon>
                <ButtonLoaderText>{isCreating ? 'Creating' : 'New Board'}</ButtonLoaderText>
              </ButtonLoader>
            </div>

            <UserDropdown />
          </div>
        </div>
      </Container>
    </div>
  )
}

export { Navigation }
