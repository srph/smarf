// @TODO: Should remove unused/redundant variables

export const CATEGORY_HERO_ASPECT_RATIO = '4:5'
export const CATEGORY_HERO_ASPECT_RATIO_MULTIPLIER = 5 / 4
export const CATEGORY_HERO_WIDTH = 200
export const CATEGORY_HERO_HEIGHT = CATEGORY_HERO_WIDTH * CATEGORY_HERO_ASPECT_RATIO_MULTIPLIER
export const CATEGORY_HERO_X_TOTAL_PADDING = 16
export const CATEGORY_HERO_Y_TOTAL_PADDING = 32
export const CATEGORY_HERO_TOTAL_WIDTH = CATEGORY_HERO_WIDTH + CATEGORY_HERO_X_TOTAL_PADDING
export const CATEGORY_HERO_TOTAL_HEIGHT = CATEGORY_HERO_HEIGHT + CATEGORY_HERO_Y_TOTAL_PADDING
export const CATEGORY_HERO_CONTAINER_PADDING = 16

export const CATEGORY_HERO_INITIAL_COUNT = 3
export const CATEGORY_ROW_WIDTH = CATEGORY_HERO_TOTAL_WIDTH * (CATEGORY_HERO_INITIAL_COUNT + 1) // The + 1 comes from the "new" placeholder
export const CATEGORY_ROW_HEIGHT = CATEGORY_HERO_HEIGHT + CATEGORY_HERO_Y_TOTAL_PADDING
export const CATEGORY_BODY_INITIAL_WIDTH = CATEGORY_ROW_WIDTH + CATEGORY_HERO_Y_TOTAL_PADDING
export const CATEGORY_BODY_INITIAL_HEIGHT = CATEGORY_ROW_HEIGHT + CATEGORY_HERO_Y_TOTAL_PADDING

export const CATEGORY_SPACING = 96