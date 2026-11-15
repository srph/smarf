import React from 'react'
import { cn } from 'cn'
import { Link, useLocation, useNavigate } from 'react-router'
import { DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/20/solid'
import defaultAvatar from '~/src/assets/images/avatar.png'
import { BoardDotGrid } from '~/src/components/board-dot-grid/board-dot-grid'
import { Container } from '~/src/components/container/container'
import { Icon } from '~/src/components/icon/icon'
import { Logo } from '~/src/components/logo/logo'
import { PageTitle } from '~/src/components/page-title/page-title'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { CATEGORY_SPACING } from '~/src/contexts/board-list/constants'
import { getLowestCategoryBottom } from '~/src/contexts/board-list/utils'
import { useBoard } from './board-context'
import { BoardVisitorCategory } from './board-visitor-category'
import { MetalButton } from './metal-button'
import { useDuplicateBoardMutation } from './mutations/use-duplicate-board-mutation'

/**
 * Someone else's public board, read-only: a banner (whose board, view only, Copy to my boards) over the categories.
 * Signed out, the banner is the top of the page; signed in, it sits right under the navigation.
 */
const BoardVisitorView: React.FC = () => {
  const { board } = useBoard()

  const { user } = useAuthUser()

  const navigate = useNavigate()

  const location = useLocation()

  const { mutate: duplicateBoard, isPending: isCopying, isError: isCopyError } = useDuplicateBoardMutation(board.id)

  const handleCopy = () => {
    // Signing in comes back here, to copy then.
    if (!user) return navigate('/login', { state: { from: location } })
    duplicateBoard(undefined, { onSuccess: (copy) => navigate(`/b/${copy.id}`) })
  }

  return (
    <>
      <PageTitle title={`${board.name} Board`} />

      <div
        className={cn(
          // The navigation ends in a 48px margin (the dot grid reaches up into it); the banner takes that place.
          'sticky top-0 z-(--z-board-toolbar) mb-12 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md',
          user && '-mt-12'
        )}>
        <Container>
          <div className="flex h-16 items-center gap-3">
            {!user && (
              <>
                <Link to="/" className="-m-1 block shrink-0 rounded-xl p-1 focus-visible:ring-focus">
                  <Logo />
                </Link>
                <span className="mx-1 h-6 w-px shrink-0 bg-zinc-800" />
              </>
            )}

            <img src={board.owner.avatar || defaultAvatar} alt="" className="size-7 shrink-0 rounded-full" />

            <p className="min-w-0 truncate">
              <span className="font-semibold">{board.name}</span>{' '}
              <span className="text-zinc-400">by {board.owner.name}</span>
            </p>

            <span className="flex h-6 shrink-0 items-center gap-1 rounded-md bg-white/6 px-2 text-xs text-zinc-400">
              <Icon icon={EyeIcon} size={12} />
              View only
            </span>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              {isCopyError && <span className="text-xs text-red-400">Couldn't copy. Try again.</span>}

              <MetalButton busy={isCopying} onClick={handleCopy}>
                <Icon icon={DocumentDuplicateIcon} size={16} />
                {isCopying ? 'Copying…' : 'Copy to my boards'}
              </MetalButton>
            </div>
          </div>
        </Container>
      </div>

      {/* Clips the dots sideways, like the workspace. */}
      <div className="overflow-x-clip">
        <Container>
          <BoardDotGrid height={getLowestCategoryBottom(board) + CATEGORY_SPACING}>
            {board.categories.map((category) => (
              <BoardVisitorCategory key={category.id} category={category} />
            ))}
          </BoardDotGrid>
          <div className="pointer-events-none h-100" />
        </Container>
      </div>
    </>
  )
}

export { BoardVisitorView }
