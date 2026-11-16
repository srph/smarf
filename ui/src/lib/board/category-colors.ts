import { type CategoryColor } from '~/src/types/api'

/** A category's colours, in the picker's order. Keep in step with the API's Category::COLORS. */
const CATEGORY_COLORS: { key: CategoryColor; name: string }[] = [
  { key: 'red', name: 'Red' },
  { key: 'orange', name: 'Orange' },
  { key: 'amber', name: 'Amber' },
  { key: 'emerald', name: 'Emerald' },
  { key: 'cyan', name: 'Cyan' },
  { key: 'blue', name: 'Blue' },
  { key: 'violet', name: 'Violet' },
  { key: 'pink', name: 'Pink' }
]

/**
 * Each class only sets --category-color; bg-category-fade and bg-category-metal (index.css) read it. Put it on the
 * card, or on a swatch. Written out in full so Tailwind finds them.
 */
const categoryColorClass: Record<CategoryColor, string> = {
  red: '[--category-color:var(--color-red-500)]',
  orange: '[--category-color:var(--color-orange-500)]',
  amber: '[--category-color:var(--color-amber-500)]',
  emerald: '[--category-color:var(--color-emerald-500)]',
  cyan: '[--category-color:var(--color-cyan-500)]',
  blue: '[--category-color:var(--color-blue-500)]',
  violet: '[--category-color:var(--color-violet-500)]',
  pink: '[--category-color:var(--color-pink-500)]'
}

/**
 * The fade in a category's colour, as an element's `before:` layer, under its content. The element needs
 * `relative isolate` (or to be positioned some other way), a categoryColorClass on it or above it, and to say where
 * the layer sits (`before:inset-0`).
 */
const CATEGORY_FADE_LAYER =
  'before:pointer-events-none before:absolute before:-z-10 before:rounded-t-[calc(var(--radius-xl)-1px)] before:bg-category-fade'

/**
 * The fade on a card's header. It sits where the delete confirm's red does: 1px inside the card so the rim still
 * shows, and 12px down under the hero tray so it fills the tray's rounded top corners.
 */
const CATEGORY_HEADER_FADE = `${CATEGORY_FADE_LAYER} before:inset-x-px before:top-px before:-bottom-3`

export { CATEGORY_COLORS, CATEGORY_FADE_LAYER, CATEGORY_HEADER_FADE, categoryColorClass }
