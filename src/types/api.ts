export type ID = string | number

export interface Hero {
  id: ID
  name: string
  thumbnail: string
}

export interface HeroAttributeGroup {
  id: ID
  name: string
  heroes: Hero[]
}

export interface Category {
  id: ID
  name: string
  heroes: Hero[]
}

export interface Board {
  id: ID
  name: string
  categories: Category[]
}
