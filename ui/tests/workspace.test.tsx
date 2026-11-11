import { beforeEach, describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { db, heroNamesIn, seedBoard, type DbBoard } from './support/db'
import { currentPath, renderApp, screen } from './support/render'
import { findCategory, heroesShownIn } from './support/workspace'

let board: DbBoard

beforeEach(() => {
  board = seedBoard('Ranked', [
    { name: 'Carries', heroes: ['Anti-Mage', 'Juggernaut'] },
    { name: 'Supports', heroes: ['Crystal Maiden'] }
  ])
})

const findBoard = () => db.boards.find((b) => b.id === board.id)

describe('board workspace', () => {
  it('shows the board, its categories, and their heroes', async () => {
    renderApp(`/b/${board.id}`)

    const carries = await findCategory('Carries')
    expect(heroesShownIn(carries)).toEqual(['Anti-Mage', 'Juggernaut'])
    expect(heroesShownIn(await findCategory('Supports'))).toEqual(['Crystal Maiden'])
    expect(await screen.findByRole('option', { name: 'Ranked (Selected)' })).toBeInTheDocument()
  })

  it('renames the board', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Edit board name'))
    const input = await screen.findByPlaceholderText('Ranked')
    await user.clear(input)
    await user.type(input, 'Ranked Solo{Enter}')

    await waitFor(() => expect(findBoard()!.name).toBe('Ranked Solo'))
    expect(await screen.findByRole('option', { name: 'Ranked Solo (Selected)' })).toBeInTheDocument()
  })

  it('favorites the board from the toolbar', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Add board to favorites'))

    expect(await screen.findByTitle('Remove board from favorites')).toBeInTheDocument()
    await waitFor(() => expect(findBoard()!.is_favorite).toBe(true))
  })

  it('duplicates the board and opens the copy', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Duplicate board'))

    await waitFor(() => expect(db.boards).toHaveLength(2))
    const copy = db.boards[1]
    await waitFor(() => expect(currentPath()).toBe(`/b/${copy.id}`))
    expect(heroesShownIn(await findCategory('Carries'))).toEqual(['Anti-Mage', 'Juggernaut'])
  })

  it('deletes the board only after its name is typed', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Delete board'))
    const confirm = await screen.findByRole('button', { name: 'Delete' })
    expect(confirm).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Enter board name (Ranked)'), 'Ranked')
    await user.click(confirm)

    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(db.boards).toHaveLength(0)
  })

  it('adds a category', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('New category'))

    expect(await findCategory('Untitled')).toBeInTheDocument()
    await waitFor(() => expect(db.categories.map((c) => c.name)).toContain('Untitled'))
  })

  it('renames a category', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const title = await screen.findByDisplayValue('Supports')
    await user.clear(title)
    await user.type(title, 'Hard Supports')

    // Saved after a short debounce.
    await waitFor(() => expect(db.categories.map((c) => c.name)).toContain('Hard Supports'))
  })

  it('deletes a category after confirming', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByTitle('Delete category'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByDisplayValue('Supports')).not.toBeInTheDocument())
    await waitFor(() => expect(db.categories.map((c) => c.name)).not.toContain('Supports'))
  })

  it('adds a hero from the hero selector', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByRole('button', { name: 'Add' }))
    await user.click(await screen.findByTitle('Select Lion'))

    expect(heroesShownIn(supports)).toEqual(['Crystal Maiden', 'Lion'])
    await waitFor(() => expect(heroNamesIn('Supports', board.id)).toEqual(['Crystal Maiden', 'Lion']))
  })
})
