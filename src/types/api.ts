export type ID = string

export interface Hero {
  id: ID
  name: string
  thumbnail: string
}

export type HeroCategoryPivot = Hero & {
  pivot: { id: ID }
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
}

export interface Board {
  id: ID
  name: string
  categories: Category[]
}
