import { screen, within } from '@testing-library/react'
import { HEROES } from './db'

/** The category card whose title input shows `name`. */
export async function findCategory(name: string) {
  const title = await screen.findByDisplayValue(name)
  const card = title.closest<HTMLElement>('[aria-roledescription="draggable"]')
  if (!card) throw new Error(`No category card around "${name}"`)
  return card
}

/** Hero names shown in a category card, in display order. */
export function heroesShownIn(card: HTMLElement) {
  return Array.from(card.querySelectorAll<HTMLElement>('[aria-roledescription="sortable"]')).map((item) => {
    const src = item.querySelector('img')?.getAttribute('src')
    return HEROES.find((h) => h.thumbnail === src)?.name ?? '?'
  })
}

export const inCategory = (card: HTMLElement) => within(card)
