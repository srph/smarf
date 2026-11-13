// In-memory stand-in for the Laravel API's data, shaped like its JSON responses.
// Each test starts from `resetDb()`; tests can seed more with the helpers below.

export interface DbHero {
  id: string
  name: string
  thumbnail: string
  attribute: 'strength' | 'agility' | 'intelligence'
}

export interface DbPivot {
  id: string
  category_id: string
  hero_id: string
  order: number
}

export interface DbCategory {
  id: string
  board_id: string
  name: string
  x_position: number
  y_position: number
  width: number
  height: number
  created_at: string
  updated_at: string
}

export interface DbBoard {
  id: string
  user_id: string
  name: string
  is_favorite: boolean | null
  favorited_at: string | null
  created_at: string
  updated_at: string
}

export interface DbUser {
  id: string
  name: string
  email: string
  password: string
  avatar: string | null
}

const NOW = '2026-11-01T00:00:00.000000Z'

const hero = (name: string, attribute: DbHero['attribute']): DbHero => ({
  id: `hero-${name.toLowerCase().replace(/\W+/g, '-')}`,
  name,
  thumbnail: `https://cdn.test/heroes/${name.toLowerCase()}.png`,
  attribute
})

export const HEROES: DbHero[] = [
  hero('Abaddon', 'strength'),
  hero('Axe', 'strength'),
  hero('Anti-Mage', 'agility'),
  hero('Juggernaut', 'agility'),
  hero('Crystal Maiden', 'intelligence'),
  hero('Lion', 'intelligence')
]

export const TEST_USER: DbUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  avatar: null
}

export const TEST_TOKEN = 'test-token'

let seq = 0
export const nextId = (prefix: string) => `${prefix}-${++seq}`

export const db = {
  users: [] as DbUser[],
  boards: [] as DbBoard[],
  categories: [] as DbCategory[],
  pivots: [] as DbPivot[],
  /** Valid bearer tokens → user id. */
  tokens: new Map<string, string>()
}

export function resetDb() {
  seq = 0
  db.users = [{ ...TEST_USER }]
  db.boards = []
  db.categories = []
  db.pivots = []
  db.tokens = new Map([[TEST_TOKEN, TEST_USER.id]])
}

export function findHero(name: string) {
  const found = HEROES.find((h) => h.name === name)
  if (!found) throw new Error(`No test hero named ${name}`)
  return found
}

/** Seed a board with categories, each listing hero names in order. */
export function seedBoard(
  name: string,
  categories: Array<{ name: string; heroes?: string[]; x?: number; y?: number; width?: number }>,
  opts: { is_favorite?: boolean; favorited_at?: string; updated_at?: string } = {}
): DbBoard {
  const board: DbBoard = {
    id: nextId('board'),
    user_id: TEST_USER.id,
    name,
    is_favorite: opts.is_favorite ?? null,
    favorited_at: opts.is_favorite ? (opts.favorited_at ?? NOW) : null,
    created_at: NOW,
    updated_at: opts.updated_at ?? NOW
  }
  db.boards.push(board)

  categories.forEach((c, i) => {
    const category: DbCategory = {
      id: nextId('category'),
      board_id: board.id,
      name: c.name,
      x_position: c.x ?? 0,
      y_position: c.y ?? i * 200,
      width: c.width ?? 300,
      height: 120,
      created_at: NOW,
      updated_at: NOW
    }
    db.categories.push(category)
    ;(c.heroes ?? []).forEach((heroName, j) => {
      db.pivots.push({
        id: nextId('pivot'),
        category_id: category.id,
        hero_id: findHero(heroName).id,
        order: (j + 1) * 65536
      })
    })
  })

  return board
}

export function boardJson(board: DbBoard) {
  return {
    ...board,
    categories: db.categories.filter((c) => c.board_id === board.id).map(categoryJson)
  }
}

export function categoryJson(category: DbCategory) {
  return {
    ...category,
    heroes: db.pivots
      .filter((p) => p.category_id === category.id)
      .toSorted((a, b) => a.order - b.order)
      .map((p) => ({ ...HEROES.find((h) => h.id === p.hero_id)!, pivot: { ...p } }))
  }
}

/** Hero names in a category, in display order. */
export function heroNamesIn(categoryName: string, boardId?: string) {
  const category = db.categories.find((c) => c.name === categoryName && (!boardId || c.board_id === boardId))
  if (!category) throw new Error(`No category named ${categoryName}`)
  return categoryJson(category).heroes.map((h) => h.name)
}
