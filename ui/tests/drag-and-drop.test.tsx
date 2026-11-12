import { beforeEach, describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { db, heroNamesIn, seedBoard, type DbBoard } from './support/db'
import { installFakeLayout } from './support/layout'
import { renderApp } from './support/render'
import { findCategory, heroesShownIn } from './support/workspace'

// Drags use dnd-kit's keyboard controls: Space to pick up, arrows to move, Space to drop.

let board: DbBoard

beforeEach(() => {
  installFakeLayout()
  board = seedBoard('Ranked', [
    { name: 'Carries', heroes: ['Anti-Mage', 'Juggernaut', 'Axe'] },
    { name: 'Supports', heroes: ['Crystal Maiden'] }
  ])
})

const heroTile = (card: HTMLElement, name: string) =>
  within(card)
    .getAllByRole('button')
    .find((el) => el.getAttribute('aria-roledescription') === 'sortable' && el.querySelector(`img[src*="${name.toLowerCase()}"]`))!

describe('drag and drop', () => {
  it('reorders a hero within its category', async () => {
    const { user } = renderApp(`/b/${board.id}`)
    const carries = await findCategory('Carries')

    heroTile(carries, 'Anti-Mage').focus()
    await user.keyboard('[Space]')
    await user.keyboard('[ArrowRight]')
    await user.keyboard('[Space]')

    await waitFor(() => expect(heroesShownIn(carries)).toEqual(['Juggernaut', 'Anti-Mage', 'Axe']))
    await waitFor(() => expect(heroNamesIn('Carries', board.id)).toEqual(['Juggernaut', 'Anti-Mage', 'Axe']))
  })

  it('moves a hero to another category', async () => {
    const { user } = renderApp(`/b/${board.id}`)
    const carries = await findCategory('Carries')
    const supports = await findCategory('Supports')

    heroTile(carries, 'Axe').focus()
    await user.keyboard('[Space]')
    await user.keyboard('[ArrowRight]')
    await user.keyboard('[Space]')

    await waitFor(() => expect(heroesShownIn(supports)).toContain('Axe'))
    expect(heroesShownIn(carries)).toEqual(['Anti-Mage', 'Juggernaut'])
    await waitFor(() => expect(heroNamesIn('Supports', board.id)).toContain('Axe'))
    expect(heroNamesIn('Carries', board.id)).toEqual(['Anti-Mage', 'Juggernaut'])
  })

  // React 18+ renders after each pointer event rather than during it, and dnd-kit applies moves after
  // that render. user-event leaves time between steps, like a real drag spread over frames.
  it('moves a category by dragging its handle', async () => {
    const { user } = renderApp(`/b/${board.id}`)
    const supports = await findCategory('Supports')
    const handle = supports.querySelector('svg')!.parentElement!

    await user.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: { clientX: 10, clientY: 10 } },
      { coords: { clientX: 160, clientY: 60 } },
      { coords: { clientX: 310, clientY: 110 } },
      { keys: '[/MouseLeft]' }
    ])

    await waitFor(() => {
      const category = db.categories.find((c) => c.name === 'Supports')!
      expect({ x: category.x_position, y: category.y_position }).toEqual({ x: 300, y: 300 })
    })
  })
})
