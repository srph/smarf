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
  is_favorite: string
  categories: Category[]
  created_at: string
  updated_at: string
}

export interface User {
  id: ID
  email: string
  name: string
  avatar: string
}
