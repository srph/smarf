import { START_GAP, type Start, byName, startCategory, startCategoryBottom } from './start'

// Dota2ProTracker's tiers for patch 7.41f, 7000+ MMR, all roles. Update by hand each patch. C and D keep their
// first eight.
const S_TIER = ['Bounty Hunter']
// The four heroes under 44% winrate
const F_TIER = ['Shadow Fiend', 'Underlord', 'Drow Ranger', 'Bristleback']
const TIERS = [
  [
    'A Tier',
    [
      'Outworld Destroyer',
      'Enigma',
      'Spirit Breaker',
      'Slark',
      'Invoker',
      'Nyx Assassin',
      'Phantom Lancer',
      'Winter Wyvern',
      'Pudge'
    ]
  ],
  [
    'B Tier',
    [
      'Dragon Knight',
      'Night Stalker',
      'Techies',
      'Luna',
      'Witch Doctor',
      'Rubick',
      'Earthshaker',
      'Oracle',
      'Earth Spirit',
      'Anti-Mage',
      'Dawnbreaker',
      'Sven',
      'Io',
      'Tinker',
      'Keeper of the Light',
      'Meepo',
      'Visage',
      'Disruptor',
      'Juggernaut'
    ]
  ],
  ['C Tier', ['Ember Spirit', 'Hoodwink', 'Dark Willow', 'Marci', 'Legion Commander', 'Dazzle', 'Lone Druid', 'Lich']],
  [
    'D Tier',
    [
      'Troll Warlord',
      'Skywrath Mage',
      'Clockwerk',
      'Phantom Assassin',
      'Morphling',
      'Silencer',
      'Elder Titan',
      'Treant Protector'
    ]
  ]
] as const

// S (six a row) and F (five a row) share the top row, and S + gap + F is the width of the tiers below them.
const S_WIDTH = 536
const F_WIDTH = 448
const ROW_WIDTH = S_WIDTH + START_GAP + F_WIDTH

/** The patch's meta, ranked S to F. */
const tierListStart: Start = {
  id: 'tier-list',
  name: 'Tier List',
  description: 'Ranked by this patch’s 7000+ MMR meta, S to F.',
  glow: 'Bounty Hunter',
  layout: (heroes) => {
    // Bounty Hunter fills S on his own: five times over.
    const s = startCategory('S Tier', byName(heroes, Array(5).fill(S_TIER[0])), { width: S_WIDTH, x: 0, y: 0 })
    const f = startCategory('F Tier', byName(heroes, F_TIER), { width: F_WIDTH, x: S_WIDTH + START_GAP, y: 0 })

    let y = Math.max(startCategoryBottom(s), startCategoryBottom(f)) + START_GAP
    const tiers = TIERS.map(([name, names]) => {
      const tier = startCategory(name, byName(heroes, names), { width: ROW_WIDTH, x: 0, y })
      y = startCategoryBottom(tier) + START_GAP
      return tier
    })

    return [s, f, ...tiers]
  }
}

/** Every hero name the tier list places, for the test that checks they all exist. */
const TIER_LIST_NAMES = [...S_TIER, ...F_TIER, ...TIERS.flatMap(([, names]) => names)]

export { TIER_LIST_NAMES, tierListStart }
