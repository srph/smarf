import { beforeEach, describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { db, heroNamesIn, seedBoard, type DbBoard } from './support/db'
import { server } from './support/handlers'
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
    .find(
      (el) =>
        el.getAttribute('aria-roledescription') === 'sortable' && el.querySelector(`img[src*="${name.toLowerCase()}"]`)
    )!

/** Every request other than a GET, as "METHOD /path", from now until the test ends. */
const recordWrites = () => {
  const writes: string[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method !== 'GET') writes.push(`${request.method} ${new URL(request.url).pathname}`)
  })
  return writes
}

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

  it('shows a reorder in one step on drop, without the old order in between', async () => {
    const { user } = renderApp(`/b/${board.id}`)
    const carries = await findCategory('Carries')

    heroTile(carries, 'Anti-Mage').focus()
    await user.keyboard('[Space]')
    await user.keyboard('[ArrowRight]')

    // Every order the category shows from the drop on.
    const shown: string[] = []
    const observer = new MutationObserver(() => shown.push(heroesShownIn(carries).join(',')))
    observer.observe(carries, { subtree: true, childList: true, attributes: true })
    await user.keyboard('[Space]')
    await waitFor(() => expect(heroesShownIn(carries)).toEqual(['Juggernaut', 'Anti-Mage', 'Axe']))
    observer.disconnect()

    expect(shown).not.toContain('Anti-Mage,Juggernaut,Axe')
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

  it('puts a hero back where it was when a drag into another category is cancelled', async () => {
    const { user } = renderApp(`/b/${board.id}`)
    const carries = await findCategory('Carries')
    const supports = await findCategory('Supports')

    heroTile(carries, 'Juggernaut').focus()
    await user.keyboard('[Space]')
    await user.keyboard('[ArrowRight]')
    await user.keyboard('[ArrowRight]') // over Supports now
    await waitFor(() => expect(heroesShownIn(supports)).toContain('Juggernaut'))
    await user.keyboard('[Escape]')

    await waitFor(() => expect(heroesShownIn(carries)).toEqual(['Anti-Mage', 'Juggernaut', 'Axe']))
    expect(heroesShownIn(supports)).toEqual(['Crystal Maiden'])
    await waitFor(() => expect(heroNamesIn('Carries', board.id)).toEqual(['Anti-Mage', 'Juggernaut', 'Axe']))
  })

  it('saves a move into another category once, on drop', async () => {
    const writes = recordWrites()
    const { user } = renderApp(`/b/${board.id}`)
    const carries = await findCategory('Carries')
    const supports = await findCategory('Supports')

    heroTile(carries, 'Juggernaut').focus()
    await user.keyboard('[Space]')
    await user.keyboard('[ArrowRight]')
    await user.keyboard('[ArrowRight]') // over Supports now
    await waitFor(() => expect(heroesShownIn(supports)).toContain('Juggernaut'))

    // Shown in Supports, but nothing saved until the drop.
    expect(writes).toEqual([])
    await user.keyboard('[Space]')

    await waitFor(() => expect(heroNamesIn('Supports', board.id)).toContain('Juggernaut'))
    expect(heroNamesIn('Carries', board.id)).toEqual(['Anti-Mage', 'Axe'])
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(writes).toHaveLength(1)
    expect(writes[0]).toMatch(/^PUT \/api\/categories\/.+\/heroes\/.+$/)
  })

  it('saves nothing when a drag into another category is cancelled', async () => {
    const writes = recordWrites()
    const { user } = renderApp(`/b/${board.id}`)
    const carries = await findCategory('Carries')
    const supports = await findCategory('Supports')

    heroTile(carries, 'Juggernaut').focus()
    await user.keyboard('[Space]')
    await user.keyboard('[ArrowRight]')
    await user.keyboard('[ArrowRight]') // over Supports now
    await waitFor(() => expect(heroesShownIn(supports)).toContain('Juggernaut'))
    await user.keyboard('[Escape]')

    await waitFor(() => expect(heroesShownIn(carries)).toEqual(['Anti-Mage', 'Juggernaut', 'Axe']))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(writes).toEqual([])
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

  it("stops a dragged category at the workspace's right edge", async () => {
    // A 1000px workspace: Supports is 300px wide, so its left edge can go no further than 700px.
    installFakeLayout({ workspaceWidth: 1000 })
    const { user } = renderApp(`/b/${board.id}`)
    const supports = await findCategory('Supports')
    const handle = supports.querySelector('svg')!.parentElement!

    await user.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: { clientX: 10, clientY: 10 } },
      { coords: { clientX: 510, clientY: 10 } },
      { coords: { clientX: 1210, clientY: 10 } },
      { keys: '[/MouseLeft]' }
    ])

    await waitFor(() => {
      const category = db.categories.find((c) => c.name === 'Supports')!
      expect({ x: category.x_position, y: category.y_position }).toEqual({ x: 700, y: 200 })
    })
  })
})
