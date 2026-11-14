import { blankSlateStart } from './blank-slate-start'
import { defaultStart } from './default-start'
import { tierListStart } from './tier-list-start'

/** The starts a new board offers, in the tray's order. */
const STARTS = [defaultStart, tierListStart, blankSlateStart]

export { STARTS }
