import { describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { db, seedBoard } from './support/db'
import { currentPath, renderApp, screen } from './support/render'

describe('board list', () => {
  it('shows favorite and recent boards in separate sections', async () => {
    seedBoard('Ranked', [], { is_favorite: true })
    seedBoard('Turbo', [])
    renderApp('/')

    const favorites = (await screen.findByText('Favorite Boards')).parentElement!
    const recent = screen.getByText('Recent Boards').parentElement!
    expect(within(favorites).getByText('Ranked')).toBeInTheDocument()
    expect(within(recent).getByText('Turbo')).toBeInTheDocument()
    expect(within(recent).queryByText('Ranked')).not.toBeInTheDocument()
  })

  it('favorites a board from the list', async () => {
    const board = seedBoard('Turbo', [])
    const { user } = renderApp('/')

    const recent = (await screen.findByText('Recent Boards')).parentElement!
    const item = within(recent).getByText('Turbo').closest('a')!.parentElement!
    await user.click(within(item).getByRole('button'))

    const favorites = (await screen.findByText('Favorite Boards')).parentElement!
    expect(within(favorites).getByText('Turbo')).toBeInTheDocument()
    expect(db.boards.find((b) => b.id === board.id)!.is_favorite).toBe(true)
  })

  it('creates a board with two starter categories and opens it', async () => {
    const { user } = renderApp('/')

    const newBoard = await screen.findByRole('button', { name: 'New Board' })
    await waitFor(() => expect(newBoard).toBeEnabled()) // waits for the hero list
    await user.click(newBoard)

    expect(await screen.findByDisplayValue('Mid Farming')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Suntukan Offlane')).toBeInTheDocument()
    expect(db.boards).toHaveLength(1)
    expect(currentPath()).toBe(`/b/${db.boards[0].id}`)
  })

  it('opens a board from the list', async () => {
    seedBoard('Turbo', [{ name: 'Carries', heroes: ['Axe'] }])
    const { user } = renderApp('/')

    await user.click(await screen.findByText('Turbo'))

    expect(await screen.findByDisplayValue('Carries')).toBeInTheDocument()
  })

  it('sends unknown URLs to the board list', async () => {
    renderApp('/no-such-page')

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })
})
