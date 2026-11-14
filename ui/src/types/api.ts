export type ID = string

export type HeroAttribute = 'strength' | 'agility' | 'intelligence'

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

export interface HeroAttributeGroup {
  id: ID
  name: string
  heroes: Hero[]
}

export interface Category {
  id: ID
  name: string
  heroes: HeroCategoryPivot[]
  x_position: number
  y_position: number
  width: number
  height: number
  created_at: string
  updated_at: string
}

export interface Board {
  id: ID
  name: string
  is_favorite: boolean
  // When the board was last favorited (ISO 8601); null when it isn't a favorite.
  favorited_at: string | null
  categories: Category[]
  created_at: string
  updated_at: string
}

/** A board as `GET /boards` lists it: no categories, but how many it has and how many heroes they hold. */
export type BoardSummary = Omit<Board, 'categories'> & {
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
