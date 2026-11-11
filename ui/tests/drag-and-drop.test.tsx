import { beforeEach, describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { heroNamesIn, seedBoard, type DbBoard } from './support/db'
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
})
