export type ID = string

export interface Hero {
  id: ID
  name: string
  thumbnail: string
}

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
}

export interface Board {
  id: ID
  name: string
  categories: Category[]
}

export interface User {
  id: ID
  email: string
  name: string
}
