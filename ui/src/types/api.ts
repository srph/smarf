export type ID = string

/** A board's six-character, case-sensitive slug: its link is /b/<slug>, and the API finds boards by it. */
export type Slug = string

export type HeroAttribute = 'strength' | 'agility' | 'intelligence' | 'universal'

export interface Hero {
  id: ID
  name: string
  thumbnail: string
  attribute: HeroAttribute
}

// @TOOD: Rename to HeroCategoryWithPivot
export type HeroCategoryPivot = Hero & {
  pivot: {
    id: ID
    order: number
  }
}

/** The colours a category's card can take. Keep in step with the API's Category::COLORS. */
export type CategoryColor = 'red' | 'orange' | 'amber' | 'emerald' | 'cyan' | 'blue' | 'violet' | 'pink'

export interface Category {
  id: ID
  name: string
  // Null is the plain grey card.
  color: CategoryColor | null
  heroes: HeroCategoryPivot[]
  x_position: number
  y_position: number
  width: number
  height: number
  created_at: string
  updated_at: string
}

/** Who made a board: all a visitor to a public board learns about them. */
export interface BoardOwner {
  id: ID
  name: string
  avatar: string | null
}

export interface Board {
  id: ID
  slug: Slug
  user_id: ID
  /** Anyone with the link can view it (signed out too); only the owner can edit. */
  is_public: boolean
  owner: BoardOwner
  name: string
  is_favorite: boolean
  // When the board was last favorited (ISO 8601); null when it isn't a favorite.
  favorited_at: string | null
  categories: Category[]
  created_at: string
  updated_at: string
}

/** A board as `GET /boards` lists it: no categories, but how many it has and how many heroes they hold. */
export type BoardSummary = Omit<Board, 'categories' | 'owner'> & {
  categories_count: number
  heroes_count: number
}

export interface User {
  id: ID
  discord_id: string
  /** Discord's unique handle. Null until the user signs in again after it was added. */
  discord_username: string | null
  /** Discord's display name, which is optional. */
  discord_global_name: string | null
  /** Only when Discord has verified it. */
  email: string | null
  name: string
  avatar: string | null
}
