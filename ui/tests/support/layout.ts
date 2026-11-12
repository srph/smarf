import { vi } from 'vitest'

// Captured once at import, so re-installing in later tests never falls back to a previous mock.
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect

/**
 * jsdom has no layout, so every element measures 0×0 and dnd-kit can't find drop targets.
 * This gives the board workspace a simple fake layout, based on DOM order:
 *
 * - category cards sit side by side, 1000px apart
 * - each card's hero area (its droppable) is 900×100
 * - heroes are 50×80 tiles in one row, 60px apart
 * - the workspace is huge, so nothing gets clamped
 *
 * Only what dnd-kit measures needs a rect; everything else keeps jsdom's zeros.
 * Call it in `beforeEach`; `tests/setup.ts` restores mocks after every test.
 */
export function installFakeLayout() {
  const rect = (left: number, top: number, width: number, height: number): DOMRect =>
    ({ left, top, width, height, x: left, y: top, right: left + width, bottom: top + height, toJSON() {} }) as DOMRect

  const cards = () => Array.from(document.querySelectorAll('[aria-roledescription="draggable"]'))

  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const allCards = cards()

    // Workspace: the element holding the cards.
    if (allCards.length && allCards[0].parentElement === this) return rect(0, 0, 100_000, 100_000)

    const card = this.closest('[aria-roledescription="draggable"]')
    if (card) {
      const c = allCards.indexOf(card)

      // A hero tile.
      if (this.getAttribute('aria-roledescription') === 'sortable') {
        const i = Array.from(card.querySelectorAll('[aria-roledescription="sortable"]')).indexOf(this)
        return rect(c * 1000 + 10 + i * 60, 100, 50, 80)
      }

      // The card's hero area: first child of the resizable wrapper (second child of the card).
      if (card.children[1]?.children[0] === this) return rect(c * 1000, 90, 900, 100)
    }

    return originalGetBoundingClientRect.call(this)
  })

}
