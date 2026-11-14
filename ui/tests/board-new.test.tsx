import { describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { db } from './support/db'
import { currentPath, renderApp, screen } from './support/render'

const tray = () => screen.findByRole('region', { name: 'Start this board with' })

describe('new board', () => {
  it('offers Default, Tier List and Blank Slate, and saves nothing yet', async () => {
    renderApp('/b/new')

    const starts = within(await tray()).getAllByRole('button')
    expect(starts).toHaveLength(3)
    // The previews are decorative, so each button is named by its start's name and description
    expect(starts[0]).toHaveAccessibleName(/^Default/)
    expect(starts[1]).toHaveAccessibleName(/^Tier List/)
    expect(starts[2]).toHaveAccessibleName(/^Blank Slate/)
    expect(db.boards).toHaveLength(0)
  })

  it('creates the board from the chosen start and opens it in place of /b/new', async () => {
    const { user } = renderApp('/')
    await user.click(await screen.findByRole('button', { name: 'New Board' }))

    await user.click(within(await tray()).getByRole('button', { name: /Tier List/ }))

    expect(await screen.findByDisplayValue('A Tier')).toBeInTheDocument()
    expect(db.boards).toHaveLength(1)
    expect(db.categories.map((category) => category.name)).toEqual([
      'S Tier',
      'F Tier',
      'A Tier',
      'B Tier',
      'C Tier',
      'D Tier'
    ])
    expect(currentPath()).toBe(`/b/${db.boards[0].id}`)

    // Back skips /b/new: it goes where New Board was clicked.
    window.history.back()
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('creates nothing when left without choosing', async () => {
    const { user } = renderApp('/b/new')
    await tray()

    await user.click(screen.getByRole('link', { name: /smarf/i }))

    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(db.boards).toHaveLength(0)
  })
})
