/*
  The Smarf showcase film. One paused GSAP timeline drives everything on the stage, so the film can be scrubbed, and
  render.mjs can step it frame by frame into a video. Nothing here animates on the wall clock.

  The app is redrawn by hand (not embedded): the sizes below are the app's own, from
  ui/src/contexts/board-list/constants.ts and the components' Tailwind classes.
*/

const RECORD = new URLSearchParams(location.search).has('record')

const CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector))

// ---------- Data ----------

// Heroicons (20/solid, and 16/solid for the check), as the app uses them.
const ICONS = {
  bars: 'M2 6.75A.75.75 0 0 1 2.75 6h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 6.75Zm0 6.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z',
  plus: 'M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z',
  trash:
    'M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z',
  star: 'M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z',
  pencil:
    'm2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z',
  link: 'M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z',
  globe:
    'M16.555 5.412a8.028 8.028 0 0 0-3.503-2.81 14.899 14.899 0 0 1 1.663 4.472 8.547 8.547 0 0 0 1.84-1.662ZM13.326 7.825a13.43 13.43 0 0 0-2.413-5.773 8.087 8.087 0 0 0-1.826 0 13.43 13.43 0 0 0-2.413 5.773A8.473 8.473 0 0 0 10 8.5c1.18 0 2.304-.24 3.326-.675ZM6.514 9.376A9.98 9.98 0 0 0 10 10c1.226 0 2.4-.22 3.486-.624a13.54 13.54 0 0 1-.351 3.759A13.54 13.54 0 0 1 10 13.5c-1.079 0-2.128-.127-3.134-.366a13.538 13.538 0 0 1-.352-3.758ZM5.285 7.074a14.9 14.9 0 0 1 1.663-4.471 8.028 8.028 0 0 0-3.503 2.81c.529.638 1.149 1.199 1.84 1.66ZM17.334 6.798a7.973 7.973 0 0 1 .614 4.115 13.47 13.47 0 0 1-3.178 1.72 15.093 15.093 0 0 0 .174-3.939 10.043 10.043 0 0 0 2.39-1.896ZM2.666 6.798a10.042 10.042 0 0 0 2.39 1.896 15.196 15.196 0 0 0 .174 3.94 13.472 13.472 0 0 1-3.178-1.72 7.973 7.973 0 0 1 .615-4.115ZM10 15c.898 0 1.778-.079 2.633-.23a13.473 13.473 0 0 1-1.72 3.178 8.099 8.099 0 0 1-1.826 0 13.47 13.47 0 0 1-1.72-3.178c.855.151 1.735.23 2.633.23ZM14.357 14.357a14.912 14.912 0 0 1-1.305 3.04 8.027 8.027 0 0 0 4.345-4.345c-.953.542-1.971.981-3.04 1.305ZM6.948 17.397a8.027 8.027 0 0 1-4.345-4.345c.953.542 1.971.981 3.04 1.305a14.912 14.912 0 0 0 1.305 3.04Z',
  dots: 'M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  chevrons:
    'M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z',
  lock: 'M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z',
  clipboard:
    'M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0 1 14.75 19h-9.5A2.25 2.25 0 0 1 3 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 0 1 9 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 0 1 9 2.5h2A1.5 1.5 0 0 1 12.5 4v.5h-5V4Z',
  x: 'M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z',
  search:
    'M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z',
  fire: 'M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 0 1 .572-2.759 6.026 6.026 0 0 1 2.486-2.665c.247-.14.55-.016.677.238A6.967 6.967 0 0 0 13.5 4.938ZM14 12a4 4 0 0 1-4 4c-1.913 0-3.52-1.398-3.91-3.182-.093-.429.44-.643.814-.413a4.043 4.043 0 0 0 1.601.564c.303.038.531-.24.51-.544a5.975 5.975 0 0 1 1.315-4.192.447.447 0 0 1 .431-.16A4.001 4.001 0 0 1 14 12Z',
  bolt: 'M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z',
  check16:
    'M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z'
}

const icon = (name, size = 20) => {
  const box = name.endsWith('16') ? 16 : 20
  const rule = EVEN_ODD.includes(name) ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${box} ${box}" fill="currentColor"><path${rule} d="${ICONS[name]}"/></svg>`
}

// The icons Heroicons draws with the even-odd rule.
const EVEN_ODD = ['bars', 'trash', 'star', 'chevrons', 'lock', 'clipboard', 'search', 'fire', 'check16']

// The selector's first two groups, sorted by name as the API returns them: [name, image key].
const pairs = (list) => list.split('|').map((entry) => entry.split('='))

const STRENGTH = pairs(
  'Alchemist=alchemist|Axe=axe|Bristleback=bristleback|Centaur Warrunner=centaur|Chaos Knight=chaos_knight|Clockwerk=rattletrap|Dawnbreaker=dawnbreaker|Doom=doom_bringer|Dragon Knight=dragon_knight|Earth Spirit=earth_spirit|Earthshaker=earthshaker|Elder Titan=elder_titan|Huskar=huskar|Kunkka=kunkka|Largo=largo|Legion Commander=legion_commander|Lifestealer=life_stealer|Lycan=lycan|Mars=mars|Night Stalker=night_stalker|Ogre Magi=ogre_magi|Omniknight=omniknight|Phoenix=phoenix|Primal Beast=primal_beast|Pudge=pudge|Slardar=slardar|Spirit Breaker=spirit_breaker|Sven=sven|Tidehunter=tidehunter|Timbersaw=shredder|Tiny=tiny|Treant Protector=treant|Tusk=tusk|Underlord=abyssal_underlord|Undying=undying|Wraith King=skeleton_king'
)

// The selector scrolls; only Agility's first two rows show.
const AGILITY = pairs(
  'Anti-Mage=antimage|Bloodseeker=bloodseeker|Bounty Hunter=bounty_hunter|Broodmother=broodmother|Clinkz=clinkz|Drow Ranger=drow_ranger|Ember Spirit=ember_spirit|Faceless Void=faceless_void|Gyrocopter=gyrocopter|Hoodwink=hoodwink|Juggernaut=juggernaut|Kez=kez|Lone Druid=lone_druid|Luna=luna|Medusa=medusa|Meepo=meepo|Mirana=mirana|Monkey King=monkey_king|Morphling=morphling|Naga Siren=naga_siren|Phantom Assassin=phantom_assassin|Phantom Lancer=phantom_lancer|Razor=razor|Riki=riki|Shadow Fiend=nevermore|Slark=slark'
)

// The board: a tier list, like the app's Tier List start. x and y are workspace coordinates; cols is how many heroes
// fit a row. A tier that spans the board is 996 wide (S + the gap + F), a little more than its eleven cells.
const CATEGORIES = [
  { id: 's', name: 'S Tier', x: 142, y: 24, cols: 6, heroes: ['bounty_hunter', 'obsidian_destroyer', 'enigma'] },
  { id: 'f', name: 'F Tier', x: 690, y: 24, cols: 5, heroes: ['nevermore', 'abyssal_underlord', 'drow_ranger', 'bristleback'] },
  { id: 'a', name: 'A Tier', x: 142, y: 133, cols: 11, width: 996, heroes: ['spirit_breaker', 'invoker', 'slark', 'nyx_assassin', 'phantom_lancer', 'winter_wyvern', 'pudge', 'dragon_knight'] },
  { id: 'b', name: 'B Tier', x: 142, y: 242, cols: 11, width: 996, heroes: ['night_stalker', 'techies', 'luna', 'witch_doctor', 'rubick', 'earthshaker', 'oracle', 'earth_spirit', 'antimage'] },
  { id: 'c', name: 'C Tier', x: 142, y: 351, cols: 6, heroes: ['ember_spirit', 'hoodwink', 'dark_willow', 'marci', 'legion_commander'] },
  // Left out of line and too narrow, for the move and resize scene to tidy up.
  { id: 'd', name: 'D Tier', x: 866, y: 351, cols: 3, heroes: ['troll_warlord', 'skywrath_mage', 'rattletrap', 'phantom_assassin'] }
]

const EXTRA_BACKDROP = ['pangolier', 'void_spirit', 'windrunner', 'lich', 'grimstroke', 'snapfire', 'lion', 'axe', 'keeper_of_the_light', 'storm_spirit', 'puck', 'queenofpain', 'crystal_maiden', 'juggernaut', 'mars', 'zuus']

// A hero cell is 80x45 with 4px of padding all round; the tray adds 4px more. The header is 36px tall.
const CELL_W = 88
const CELL_H = 53
const HEADER = 36
const WS_TOP = 80

// ---------- The beat ----------

// The film is cut to its music (music.mp3: "Product Advertisement" by ViacheslavStarostin, from Pixabay): 150.35 BPM,
// first beat at 0.23s, measured from the file. The beat comes in on beat 16 (6.6s), where the board assembles; the
// track drops on beat 100 (40.1s), where the reel starts. Change the track and these two numbers change with it.
const BEAT = 60 / 150.35
const FIRST_BEAT = 0.23
const beatAt = (count) => FIRST_BEAT + count * BEAT

// ---------- Geometry ----------

const cardWidth = (cols) => cols * CELL_W + 8
const rowsFor = (cat) => Math.ceil((cat.heroes.length + 1) / cat.cols) // + 1: the plus takes a cell
const trayHeight = (cat) => rowsFor(cat) * CELL_H + 8

/** Where the hero at `index` sits, in workspace coordinates. */
const slot = (cat, index) => ({
  x: cat.x + 8 + (index % cat.cols) * CELL_W,
  y: cat.y + HEADER + 8 + Math.floor(index / cat.cols) * CELL_H
})

/** The same cell, measured from the tray's padding box (for the plus, which lives in the tray). */
const traySlot = (cat, index) => ({
  x: 7 + (index % cat.cols) * CELL_W,
  y: 7 + Math.floor(index / cat.cols) * CELL_H
})

/** An element's box in app coordinates, from layout alone (transforms don't count). */
const box = (element) => {
  let x = 0
  let y = 0
  for (let node = element; node && node.id !== 'app'; node = node.offsetParent) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y, w: element.offsetWidth, h: element.offsetHeight }
}

const center = (element) => {
  const b = box(element)
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 }
}

// ---------- DOM ----------

const make = (tag, className, html = '') => {
  const element = document.createElement(tag)
  if (className) element.className = className
  element.innerHTML = html
  return element
}

const cats = {}
const heroEls = {}

const makeHero = (key) => {
  const hero = make(
    'div',
    'hero',
    `<div class="hero-out"></div><div class="hero-img"><img src="${CDN}${key}.png" alt=""></div><span class="hero-trash">${icon('trash', 14)}</span>`
  )
  $('#heroes').append(hero)
  heroEls[key] = hero
  gsap.set($('.hero-trash', hero), { scale: 0 })
  return hero
}

const buildBoard = () => {
  for (const data of CATEGORIES) {
    const cat = { ...data, heroes: [...data.heroes] }
    cat.el = make(
      'div',
      'card',
      `<div class="card-head">${icon('bars')}<span>${cat.name}</span></div>
       <div class="tray"><div class="plus">${icon('plus')}<span class="plus-on">${icon('plus')}</span></div><span class="pill"></span></div>
       <div class="card-ring"></div>`
    )
    $('#cards').append(cat.el)
    cat.tray = $('.tray', cat.el)
    cat.plus = $('.plus', cat.el)
    cat.ring = $('.card-ring', cat.el)
    cat.pill = $('.pill', cat.el)
    gsap.set(cat.el, { x: cat.x, y: cat.y, width: cat.width ?? cardWidth(cat.cols) })
    gsap.set(cat.tray, { height: trayHeight(cat) })
    gsap.set(cat.plus, traySlot(cat, cat.heroes.length))
    cat.heroes.forEach((key, index) => gsap.set(makeHero(key), slot(cat, index)))
    cats[cat.id] = cat
  }
}

const buildDock = () => {
  $('#dockwrap').innerHTML = `
    <div id="dock">
      <div id="share"><div class="share-in">
        <div class="share-head"><h2>Share board</h2><span>${icon('x')}</span></div>
        <div class="opts">
          <span class="opt-hl"></span>
          <div class="opt" id="opt-private"><span class="opt-ic">${icon('lock', 18)}</span><span><b>Private</b><i>Only you can see it</i></span><span class="opt-ck">${icon('check16', 16)}</span></div>
          <div class="opt" id="opt-public"><span class="opt-ic">${icon('globe', 18)}</span><span><b>Public</b><i>Anyone with the link can view</i></span><span class="opt-ck">${icon('check16', 16)}</span></div>
        </div>
        <div id="linkwrap"><div class="linkf">
          ${icon('link', 14)}
          <div class="linkbody"><span id="linktext">https://smarf.kierb.com/b/3f6b1c9e-8a2d-4e7f-b5c0-1d9a7e42f6b3</span><span id="shimmer"></span></div>
          <span id="copy"><span id="copy-on"></span><span id="copy-clip">${icon('clipboard', 16)}</span><span id="copy-check">${icon('check16', 16)}</span></span>
        </div></div>
      </div></div>
      <div id="dockrow"><div class="dockrow-in">
        <div class="switcher"><span class="dot"></span><span class="name">Meta tier list</span>${icon('chevrons', 16)}</div>
        <div class="dock-btns">
          <span class="ibtn" id="btn-star"><span class="ibtn-hover"></span><span class="star">${icon('star')}</span><span class="burst">${'<i></i>'.repeat(6)}</span></span>
          <span class="ibtn">${icon('pencil')}</span>
          <span class="ibtn" id="btn-share"><span class="ibtn-hover"></span><span class="share-link">${icon('link')}</span><span class="share-globe">${icon('globe')}</span></span>
          <span class="ibtn">${icon('dots')}</span>
        </div>
      </div></div>
    </div>
    <div class="metal" id="newcat"><span class="sheen"></span>${icon('plus')}<span>New category</span></div>`
}

const tiles = {}

const buildSelector = () => {
  const group = (name, color, glyph, heroes) => `
    <div class="grp-label"><span style="background:${color}">${icon(glyph)}</span>${name}</div>
    <div class="grp-tiles">${heroes
      .map(([heroName, key]) => `<div class="tile" data-name="${heroName.toLowerCase()}" data-key="${key}"><div><img src="${CDN}${key}.png" alt=""></div></div>`)
      .join('')}</div>`

  $('#selector').innerHTML = `
    <div class="sel-head">Select Hero
      <div class="search">${icon('search', 16)}<span class="typed"><span>s</span><span>v</span></span><span class="caret"></span><span class="ph">Search heroes…</span></div>
    </div>
    <div class="sel-body">${group('Strength', 'var(--red)', 'fire', STRENGTH)}${group('Agility', 'var(--green)', 'bolt', AGILITY)}</div>`

  for (const tile of $$('#selector .tile')) tiles[tile.dataset.key] = tile
}

const allImageKeys = () => {
  const keys = new Set(EXTRA_BACKDROP)
  for (const cat of CATEGORIES) cat.heroes.forEach((key) => keys.add(key))
  for (const [, key] of [...STRENGTH, ...AGILITY]) keys.add(key)
  return [...keys]
}

const buildBackdrop = () => {
  // A fixed shuffle, so every render of the film is the same.
  const keys = allImageKeys()
  let seed = 7
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const shuffled = keys
    .map((key) => [next(), key])
    .sort((a, b) => a[0] - b[0])
    .map(([, key]) => key)

  let index = 0
  for (let column = 0; column < 13; column++) {
    const col = make('div', 'col')
    for (let row = 0; row < 18; row++) {
      col.append(make('img', '', ''))
      col.lastChild.src = `${CDN}${shuffled[index++ % shuffled.length]}.png`
      col.lastChild.alt = ''
    }
    $('#columns').append(col)
  }
}

const preload = () =>
  Promise.all(
    allImageKeys().map((key) => {
      const image = new Image()
      image.src = `${CDN}${key}.png`
      // A missing portrait shouldn't hold the film up.
      return image.decode().catch(() => {})
    })
  )

// ---------- The reel ----------

const ARROW =
  '<svg class="arrow" width="26" height="26" viewBox="0 0 26 26"><path d="M5 2.5v18l4.6-4.1 3.1 6.9 3-1.3-3.1-6.8h6.2z" fill="#0b0b0f" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'

const portraits = (keys) => keys.map((key) => `<img src="${CDN}${key}.png" alt="">`).join('')

/** A category as a start's preview draws it: static, at (x, y), `width` wide. */
const miniCard = (name, x, y, width, keys) =>
  `<div class="mc" style="left:${x}px;top:${y}px"><div class="mc-h">${icon('bars')}<span>${name}</span></div><div class="mc-t" style="width:${width}px">${portraits(keys)}<i>${icon('plus')}</i></div></div>`

const dockRow = (name) =>
  `<div class="dockrow-in"><div class="switcher"><span class="dot"></span><span class="name">${name}</span>${icon('chevrons', 16)}</div><div class="dock-btns"><span class="ibtn">${icon('star')}</span><span class="ibtn">${icon('pencil')}</span><span class="ibtn">${icon('link')}</span><span class="ibtn">${icon('dots')}</span></div></div>`

const boardRow = (name, count, { current = false, favorite = false } = {}) =>
  `<div class="row${current ? ' cur' : ''}"><span class="row-ck">${current ? icon('check16', 14) : ''}</span><span class="row-n">${name}</span><span class="row-c">${count} heroes</span>${favorite ? `<span class="row-s">${icon('star', 14)}</span>` : ''}</div>`

/** One close-up: its verb behind, the piece of UI (drawn at the app's size, then scaled up) and its label. */
const makeShot = (id, word, label, scale, html) => {
  const shot = make(
    'div',
    'shot',
    `<div class="shot-word">${word}</div>
     <div class="shot-mid"><div class="shot-ui">${html}<div class="rc"><span class="ripple"></span>${ARROW}</div></div></div>
     <h2 class="shot-label">${label}</h2>`
  )
  shot.id = `shot-${id}`
  shot.dataset.scale = scale
  $('#reel').append(shot)
}

const buildReel = () => {
  const keysOf = (list, count) => list.slice(0, count).map(([, key]) => key)
  const tiers = Object.fromEntries(CATEGORIES.map((cat) => [cat.id, cat.heroes]))

  // The app's three starts, with their own names and descriptions.
  const starts = [
    ['default', 'Default', 'The in-game grid: every hero, by attribute.', 'axe', miniCard('Strength', 0, 0, 448, keysOf(STRENGTH, 14)) + miniCard('Agility', 480, 0, 448, keysOf(AGILITY, 14))],
    [
      'tier',
      'Tier List',
      'Ranked by this patch’s 7000+ MMR meta, S to F.',
      'bounty_hunter',
      miniCard('S Tier', 0, 0, 536, Array(5).fill('bounty_hunter')) +
        miniCard('F Tier', 548, 0, 448, tiers.f) +
        miniCard('A Tier', 0, 109, 996, [...tiers.a, 'enigma']) +
        miniCard('B Tier', 0, 218, 996, [...tiers.b, 'dawnbreaker', 'sven'])
    ],
    ['blank', 'Blank Slate', 'Two small categories to rename, fill or delete.', 'lion', miniCard('Pubstomp', 0, 0, 272, ['lion', 'bounty_hunter']) + miniCard('Grief Squad', 304, 0, 272, ['keeper_of_the_light', 'techies'])]
  ]

  makeShot(
    'new',
    'New board',
    'Start a board from a template',
    1.9,
    `<div class="nb">
      <div class="nb-in">
        <div class="nb-head">Start this board with</div>
        <div class="nb-starts">${starts
          .map(
            ([id, name, note, glow, cards]) =>
              `<div class="start" id="start-${id}"><div class="pv"><img class="pv-glow" src="${CDN}${glow}.png" alt=""><div class="pv-board">${cards}</div></div><b>${name}</b><small>${note}</small></div>`
          )
          .join('')}</div>
      </div>
      <p class="nb-creating">Creating Tier List</p>
    </div>`
  )

  makeShot(
    'switch',
    'Switch',
    'Jump between boards',
    2.2,
    `<div class="sw">
      <div class="pop">
        <div class="pop-top"><div class="pop-search">${icon('search', 16)}<span>Find a board…</span></div><span class="pop-new">${icon('plus')}</span></div>
        <div class="pop-label">Favorites</div>
        ${boardRow('Meta tier list', 33, { current: true, favorite: true })}
        ${boardRow('Captains Mode bans', 21, { favorite: true })}
        <div class="pop-label">All boards</div>
        ${boardRow('Offlane pool', 14)}
        ${boardRow('Turbo picks', 9)}
        ${boardRow('Party queue', 18)}
      </div>
      <div class="glass">${dockRow('<span class="n1">Meta tier list</span><span class="n2">Turbo picks</span>')}</div>
    </div>`
  )

  makeShot(
    'rename',
    'Rename',
    'Rename in place',
    2.9,
    `<div class="glass rn">
      <div class="panel rn-form">
        <div class="panel-head"><h3>Rename board</h3><span>${icon('x')}</span></div>
        <div class="rn-input"><span class="rn-sel">Meta tier list</span><span class="rn-typed">${'7.41 meta'
          .split('')
          .map((letter) => `<span>${letter === ' ' ? '&nbsp;' : letter}</span>`)
          .join('')}</span><span class="rn-caret"></span></div>
        <div class="panel-foot"><span class="btn-quiet">Cancel</span><span class="metal metal-sm">Save</span></div>
      </div>
      <div class="rn-row">${dockRow('<span class="glint">7.41 meta</span>')}</div>
    </div>`
  )

  makeShot(
    'add',
    'Add',
    'Add a category',
    2.8,
    `<div class="nc">
      <div class="card" style="width:272px"><div class="card-head">${icon('bars')}<span class="nc-name">Untitled</span></div><div class="tray" style="height:61px"><div class="plus" style="top:7px;left:7px">${icon('plus')}</div></div></div>
      <div class="metal"><span class="sheen"></span>${icon('plus')}<span>New category</span></div>
    </div>`
  )

  makeShot(
    'remove',
    'Delete',
    'Delete a category',
    2.4,
    `<div class="card dc" style="width:536px">
      <div class="card-head">${icon('bars')}<span>C Tier</span><span class="dc-trash">${icon('trash', 16)}</span></div>
      <div class="tray dc-tray">${portraits(tiers.c)}</div>
      <div class="dc-confirm"><span class="dc-red"></span><span class="dc-ic">${icon('trash', 16)}</span><p><span>Delete</span> <b>C Tier</b>?</p><div class="dc-btns"><span class="dc-cancel">Cancel</span><span class="dc-del">Delete</span></div></div>
    </div>`
  )

  makeShot(
    'hold',
    'Hold',
    'Hold to delete a board',
    2.9,
    `<div class="glass hd"><div class="panel">
      <div class="panel-head"><h3><span class="light">Delete</span> 7.41 meta</h3><span>${icon('x')}</span></div>
      <p>This will permanently delete this board. Are you sure?</p>
      <div class="panel-foot"><span class="btn-quiet">Cancel</span><span class="hold"><span class="hold-fill"></span><span class="hold-hl"></span><span class="hold-l1">Hold to delete</span><span class="hold-l2"><i class="spin"></i>Deleting…</span></span></div>
    </div></div>`
  )
}

/** Plays the reel on `tl` from `from`: hard cuts, each shot punching in. Returns when it ends. */
const reelScene = (tl, from) => {
  let t = from
  let count = 0

  const cut = (id, length, play) => {
    const shot = $(`#shot-${id}`)
    const ui = $('.shot-ui', shot)
    const pointer = $('.rc', shot)
    const scale = Number(shot.dataset.scale)
    const side = count++ % 2 ? 1 : -1
    const start = t

    gsap.set(shot, { autoAlpha: 0 })
    gsap.set(ui, { xPercent: -50, yPercent: -50, scale })
    gsap.set($('.shot-word', shot), { xPercent: -50 })
    // The pointer is drawn inside the scaled UI, so it's scaled back down to a steady size.
    gsap.set(pointer, { scale: 1.7 / scale, opacity: 0 })

    tl.set(shot, { autoAlpha: 1 }, start)
    tl.set(shot, { autoAlpha: 0 }, start + length)
    tl.fromTo(ui, { scale: scale * 1.24, rotation: side * 1.5 }, { scale, rotation: 0, duration: 0.45, ease: 'expo.out', immediateRender: false }, start)
    tl.to(ui, { scale: scale * 1.05, duration: length - 0.45, ease: 'none' }, start + 0.45)
    tl.fromTo($('.shot-word', shot), { x: side * -150 }, { x: side * 150, duration: length, ease: 'none', immediateRender: false }, start)
    tl.fromTo($('.shot-label', shot), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'expo.out', immediateRender: false }, start)
    tl.fromTo('#reel-flash', { opacity: 0.3 }, { opacity: 0, duration: 0.3, immediateRender: false }, start)

    /** A point on `target`, in the shot's own (unscaled) pixels. */
    const on = (target, fx = 0.5, fy = 0.5) => {
      let x = 0
      let y = 0
      for (let node = target; node && node !== ui; node = node.offsetParent) {
        x += node.offsetLeft
        y += node.offsetTop
      }
      return { x: x + target.offsetWidth * fx, y: y + target.offsetHeight * fy }
    }

    const cur = {
      show: (at, point) => tl.set(pointer, { ...point, opacity: 1 }, start + at),
      move: (at, point, duration = 0.3) => tl.to(pointer, { ...point, duration, ease: 'power2.inOut' }, start + at),
      press: (at) => tl.to($('.arrow', pointer), { scale: 0.82, duration: 0.09 }, start + at),
      release: (at) => tl.to($('.arrow', pointer), { scale: 1, duration: 0.18 }, start + at),
      click: (at) => {
        cur.press(at)
        cur.release(at + 0.11)
        tl.fromTo($('.ripple', pointer), { scale: 0.3, opacity: 0.7 }, { scale: 1.5, opacity: 0, duration: 0.45, immediateRender: false }, start + at)
      },
      hide: (at) => tl.to(pointer, { opacity: 0, duration: 0.12 }, start + at)
    }

    play({ at: (seconds) => start + seconds, on, cur, find: (selector) => $(selector, shot), all: (selector) => $$(selector, shot) })
    t += length
  }

  gsap.set('#reel-note', { opacity: 0 })
  tl.to('#reel-note', { opacity: 1, duration: 0.3 }, from)

  // New board: hover Tier List, choose it, and the tray folds into "Creating Tier List".
  cut('new', 6 * BEAT, ({ at, on, cur, find, all }) => {
    const tray = find('.nb')
    const tier = find('#start-tier')
    const height = tray.offsetHeight
    gsap.set(tray, { width: 840, height })

    cur.show(0, { x: 640, y: height + 14 })
    cur.move(0.12, on(tier, 0.55, 0.62), 0.4)
    tl.to(tier, { backgroundColor: 'rgb(255 255 255 / 0.07)', y: -2, duration: 0.15 }, at(0.45))
    tl.to(all('#start-tier .mc img'), { filter: 'grayscale(0) brightness(1)', duration: 0.25 }, at(0.45))
    tl.to(find('#start-tier .pv-glow'), { opacity: 0.6, duration: 0.25 }, at(0.45))
    cur.click(2 * BEAT)
    cur.hide(0.95)

    tl.to(find('.nb-in'), { opacity: 0, duration: 0.18 }, at(0.88))
    tl.to(tray, { width: 320, height: 46, duration: 0.5, ease: 'power3.out' }, at(0.88))
    tl.to(find('.nb-creating'), { opacity: 1, duration: 0.2 }, at(1.2))
    tl.fromTo(find('.nb-creating'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 0.9, ease: 'sine.inOut', immediateRender: false }, at(1.15))
  })

  // Switch boards: down the list, pick one, and the dock takes its name.
  cut('switch', 4 * BEAT, ({ at, on, cur, find, all }) => {
    const rows = all('.row')
    const hover = 'rgb(255 255 255 / 0.07)'
    cur.show(0, on(rows[1], 0.45))
    tl.set(rows[1], { backgroundColor: hover }, at(0))
    ;[2, 3].forEach((row, step) => {
      const when = 0.25 + step * 0.26
      cur.move(when, on(rows[row], 0.45), 0.18)
      tl.set(rows[row - 1], { backgroundColor: 'transparent' }, at(when + 0.1))
      tl.set(rows[row], { backgroundColor: hover }, at(when + 0.1))
    })
    cur.click(2 * BEAT)
    cur.hide(0.95)
    tl.to(find('.pop'), { opacity: 0, y: 6, duration: 0.15, ease: 'power2.in' }, at(0.92))
    tl.to(find('.sw'), { y: -170, duration: 0.35, ease: 'power3.out' }, at(0.95))
    tl.set(find('.n1'), { display: 'none' }, at(0.98))
    tl.set(find('.n2'), { display: 'inline' }, at(0.98))
    tl.fromTo(find('.glass'), { scale: 1 }, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, at(0.98))
  })

  // Rename: the name is selected, typed over, saved, and glints green in the dock.
  cut('rename', 5 * BEAT, ({ at, on, cur, find, all }) => {
    const panel = find('.rn')
    const save = find('.metal')
    gsap.set(panel, { height: panel.offsetHeight })

    cur.show(0, on(find('.rn-input'), 0.8, 1.5))
    tl.set(find('.rn-sel'), { display: 'none' }, at(0.3))
    all('.rn-typed span').forEach((letter, index) => tl.set(letter, { display: 'inline' }, at(0.3 + index * 0.05)))
    cur.move(0.7, on(save), 0.28)
    cur.click(3 * BEAT)
    cur.hide(1.3)

    tl.to(find('.rn-form'), { opacity: 0, duration: 0.12 }, at(1.27))
    tl.to(panel, { height: 46, duration: 0.3, ease: 'power3.out' }, at(1.27))
    tl.to(find('.rn-row'), { opacity: 1, duration: 0.15 }, at(1.37))
    tl.to(find('.glint'), { backgroundPosition: '0% 0', duration: 0.55, ease: 'sine.inOut' }, at(1.4))
  })

  // New category: the button's sheen, and an untitled card springs in with its name ready to type over.
  cut('add', 3 * BEAT, ({ at, on, cur, find }) => {
    const button = find('.metal')
    const card = find('.card')
    gsap.set(card, { opacity: 0, scale: 0.8, y: 24 })

    cur.show(0, on(button, 0.85, 1.4))
    cur.move(0.05, on(button, 0.6), 0.2)
    cur.click(BEAT)
    tl.fromTo(find('.sheen'), { xPercent: -170, skewX: -20, opacity: 1 }, { xPercent: 360, duration: 0.6, ease: 'power1.out', immediateRender: false }, at(BEAT))
    tl.to(card, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)' }, at(BEAT + 0.08))
  })

  // Delete a category: red fades in over its header, the trash tips, the question rises, then the card goes.
  cut('remove', 4 * BEAT, ({ at, on, cur, find }) => {
    const confirm = find('.dc-confirm')
    const bin = find('.dc-ic')
    const risers = [find('.dc-confirm p'), find('.dc-btns')]
    gsap.set(confirm, { autoAlpha: 0 })
    gsap.set(find('.dc-red'), { opacity: 0 })
    gsap.set(bin, { opacity: 0, scale: 0.6, rotation: -16 })
    gsap.set(risers, { opacity: 0, y: 6 })

    cur.show(0, on(find('.dc-tray'), 0.8, 0.7))
    cur.move(0.05, on(find('.dc-trash')), 0.22)
    cur.click(BEAT)

    tl.set(confirm, { autoAlpha: 1 }, at(0.44))
    tl.to(find('.dc-red'), { opacity: 1, duration: 0.3 }, at(0.44))
    tl.to(bin, { opacity: 1, scale: 1.12, rotation: 5, duration: 0.25 }, at(0.44))
    tl.to(bin, { scale: 1, rotation: 0, duration: 0.17 }, at(0.69))
    tl.to(risers, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 }, at(0.5))

    cur.move(0.78, on(find('.dc-del')), 0.26)
    cur.click(3 * BEAT)
    cur.hide(1.3)
    tl.to(find('.dc'), { scale: 0.92, opacity: 0, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in' }, at(1.27))

    // Delete bursts with the app's poof: a dot every 45°, red and grey in turn, flying out from the button and fading.
    // It sits beside the card, not in it, so it doesn't fade and blur with it.
    const poof = make('div', 'poof dc-poof', '<i></i>'.repeat(8))
    find('.shot-ui').append(poof)
    gsap.set(poof, on(find('.dc-del')))
    $$('i', poof).forEach((dot, index) => {
      const angle = (index / 8) * Math.PI * 2 - Math.PI / 2
      tl.fromTo(
        dot,
        { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6, scale: 1, opacity: 1 },
        { x: Math.cos(angle) * 30, y: Math.sin(angle) * 30, scale: 0.3, opacity: 0, duration: 0.6, ease: 'power3.out', immediateRender: false },
        at(3 * BEAT)
      )
    })
  })

  // Hold to delete: the graphite button fills with red metal while it's held, then the board goes.
  cut('hold', 6 * BEAT, ({ at, on, cur, find }) => {
    const panel = find('.hd')
    const hold = find('.hold')

    cur.show(0, on(hold, 0.2, 1.6))
    cur.move(0.02, on(hold, 0.6, 0.6), 0.22)
    // Held from the second beat to the fifth: 1.2s, the app's own hold.
    const held = 3 * BEAT
    cur.press(BEAT)
    tl.to(find('.hold-fill'), { clipPath: 'inset(0% 0% 0% 0% round 7px)', duration: held, ease: 'none' }, at(BEAT))
    tl.to(hold, { borderColor: 'rgb(255 162 162 / 0.55)', duration: held, ease: 'none' }, at(BEAT))
    tl.to(panel, { scale: 1.07, duration: held, ease: 'power1.in' }, at(BEAT))

    cur.release(4 * BEAT)
    tl.to(find('.hold-l1'), { opacity: 0, duration: 0.12 }, at(4 * BEAT))
    tl.to(find('.hold-l2'), { opacity: 1, duration: 0.12 }, at(4 * BEAT + 0.04))
    tl.to(find('.spin'), { rotation: 720, duration: 0.8, ease: 'none' }, at(4 * BEAT))
    cur.hide(1.8)
    tl.to(panel, { scale: 0.8, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power3.in' }, at(2.05))
  })

  tl.to('#reel-note', { opacity: 0, duration: 0.2 }, t - 0.25)
  return t
}

// ---------- The timeline ----------

const camera = { z: 1, cx: 640, cy: 360 }

/** Puts the app point (cx, cy) at the middle of the window at zoom z, without showing past the app's edges. */
const applyCamera = () => {
  const scale = 1.2 * camera.z
  const clamp = (value, min) => Math.min(0, Math.max(min, value))
  const x = clamp(768 - camera.cx * scale, 1536 - 1280 * scale)
  const y = clamp(432 - camera.cy * scale, 864 - 720 * scale)
  $('#cam').style.transform = `translate(${x}px, ${y}px) scale(${scale})`
}

const build = () => {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })

  const cursor = $('#cursor')
  const arrow = $('#cursor .arrow')
  const ripple = $('#cursor .ripple')

  // --- Small verbs the scenes are written in ---

  const cam = (at, z, cx, cy, duration = 1.2) =>
    tl.to(camera, { z, cx, cy, duration, ease: 'power3.inOut', onUpdate: applyCamera }, at)

  const caption = (from, to, title, note) => {
    const el = make('div', 'caption', `<h2>${title}</h2><p>${note}</p>`)
    $('#captions').append(el)
    gsap.set(el, { y: 12, filter: 'blur(8px)' })
    tl.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55 }, from)
    tl.to(el, { opacity: 0, y: -8, filter: 'blur(8px)', duration: 0.35, ease: 'power2.in' }, to)
  }

  const moveCursor = (at, point, duration = 0.8, ease = 'power2.inOut') =>
    tl.to(cursor, { x: point.x, y: point.y, duration, ease }, at)

  const press = (at) => tl.to(arrow, { scale: 0.82, duration: 0.09 }, at)
  const release = (at) => tl.to(arrow, { scale: 1, duration: 0.18 }, at)

  const click = (at) => {
    press(at)
    release(at + 0.11)
    tl.fromTo(
      ripple,
      { scale: 0.3, opacity: 0.7 },
      { scale: 1.5, opacity: 0, duration: 0.5, immediateRender: false },
      at
    )
  }

  /** Slides a category's heroes, plus and tray to match its model. */
  const reflow = (cat, at, duration = 0.22, skip = null) => {
    cat.heroes.forEach((key, index) => {
      if (key !== skip) tl.to(heroEls[key], { ...slot(cat, index), duration }, at)
    })
    tl.to(cat.plus, { ...traySlot(cat, cat.heroes.length), duration }, at)
    tl.to(cat.tray, { height: trayHeight(cat), duration }, at)
  }

  const ringOn = (cat, at) => tl.to(cat.ring, { opacity: 1, duration: 0.15 }, at)
  const ringOff = (cat, at) => tl.to(cat.ring, { opacity: 0, duration: 0.25 }, at)

  const heroCenter = (cat, index) => {
    const p = slot(cat, index)
    return { x: p.x + 40, y: p.y + 22.5 + WS_TOP }
  }

  const lift = (hero, at) => {
    tl.set(hero, { zIndex: 20 }, at)
    tl.to(hero, { scale: 1.08, rotation: 2, boxShadow: '0 14px 28px rgb(0 0 0 / 0.55)', duration: 0.18 }, at)
  }

  const settle = (hero, at, point) => {
    tl.to(hero, { ...point, scale: 1, rotation: 0, boxShadow: '0 0 0 rgb(0 0 0 / 0)', duration: 0.22 }, at)
    tl.set(hero, { zIndex: 0 }, at + 0.22)
  }

  // --- Opening states ---

  applyCamera()
  gsap.set('#loading', { display: 'none' })
  gsap.set(['#backdrop', '#win', '#hood', '#outro', '#tagline'], { opacity: 0 })
  gsap.set('#hood', { visibility: 'hidden' })
  gsap.set('#win', { y: 70, scale: 0.95 })

  // ===== 1. Intro: the sign-in backdrop and the lockup =====

  const columns = $$('#columns .col')
  columns.forEach((col, index) => {
    // Starts low and drifts up, with enough column above and below to cover the stage through both scenes.
    const start = index % 2 ? 130 : 200
    gsap.set(col, { y: start })
    tl.to(col, { y: start - 150 - 24 * (index % 3), duration: 7.2, ease: 'none' }, 0)
  })

  tl.to('#backdrop', { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0.1)

  const badge = $('#lockup .badge')
  gsap.set(badge, { scale: 0.3, opacity: 0 })
  tl.to(badge, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }, beatAt(0))

  const letters = 'Smarf'.split('').map((letter) => make('span', '', letter))
  $('#wordmark').append(...letters)
  gsap.set(letters, { opacity: 0, yPercent: 45, filter: 'blur(14px)' })
  tl.to(letters, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.75, stagger: 0.07, ease: 'power3.out' }, beatAt(1))

  gsap.set('#tagline', { y: 14, filter: 'blur(8px)' })
  tl.to('#tagline', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, beatAt(4))

  tl.to('#lockup', { opacity: 0, scale: 0.94, filter: 'blur(10px)', duration: 0.55, ease: 'power2.in' }, beatAt(13))
  tl.to('#backdrop', { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, beatAt(13) + 0.1)

  // ===== 2. The board assembles, as the beat comes in =====

  tl.to('#win', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, 6)

  Object.values(cats).forEach((cat, index) => {
    const at = beatAt(16) + index * 0.1
    gsap.set(cat.el, { opacity: 0, scale: 0.94 })
    tl.to(cat.el, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' }, at)
    cat.heroes.forEach((key, heroIndex) => {
      gsap.set(heroEls[key], { opacity: 0, scale: 0.7 })
      tl.to(heroEls[key], { opacity: 1, scale: 1, duration: 0.36, ease: 'back.out(2)' }, at + 0.16 + heroIndex * 0.045)
    })
  })

  gsap.set(['#dock', '#newcat'], { y: 16, opacity: 0 })
  tl.to(['#dock', '#newcat'], { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 7.1)
  tl.fromTo(
    '#newcat .sheen',
    { xPercent: -170, skewX: -20, opacity: 1 },
    { xPercent: 360, duration: 0.85, ease: 'power1.out', immediateRender: false },
    8.1
  )
  tl.set('#newcat .sheen', { opacity: 0 }, 9)

  caption(6.9, beatAt(26) - 0.2, 'Your heroes, laid out like the in-game grid', 'Tier lists, hero pools, ban lists: a board for each')
  tl.to(camera, { z: 1.035, duration: 3.3, ease: 'none', onUpdate: applyCamera }, 7.2)

  // ===== 3. Drag a hero between categories, then drag one off =====

  const D = beatAt(26)
  const { s, f, a, d } = cats

  cam(D, 1.4, 500, 250)
  caption(D + 0.3, D + 10 * BEAT + 0.3, 'Drag heroes between categories', 'The rest shuffle out of the way')

  gsap.set(cursor, { x: 780, y: 470 })
  tl.to(cursor, { opacity: 1, duration: 0.3 }, D + 0.5)

  // Invoker is promoted from A to S.
  const invoker = heroEls.invoker
  const invokerFrom = heroCenter(a, 1)
  const invokerTo = slot(s, 3)
  moveCursor(D + 0.7, invokerFrom)
  press(D + 1.6)
  lift(invoker, D + 1.6)

  moveCursor(D + 1.8, { x: invokerTo.x + 40, y: invokerTo.y + 22.5 + WS_TOP }, 1.1)
  tl.to(invoker, { x: invokerTo.x, y: invokerTo.y, duration: 1.1, ease: 'power2.inOut' }, D + 1.8)

  // Leaving A closes its gap; arriving over S moves its plus along, and its ring turns indigo.
  a.heroes.splice(1, 1)
  reflow(a, D + 2.1)
  s.heroes.push('invoker')
  reflow(s, D + 2.5, 0.22, 'invoker')
  ringOn(s, D + 2.5)

  release(D + 8 * BEAT)
  settle(invoker, D + 8 * BEAT, invokerTo)
  ringOff(s, D + 8 * BEAT + 0.3)

  const R = D + 10 * BEAT
  cam(R, 1.4, 900, 250, 1)
  caption(R + 0.5, R + 3.9, 'Drag one off the board to remove it', 'Saved the moment you let go')

  const fiend = heroEls.nevermore
  const fiendDrop = { x: 1168, y: 96 }
  moveCursor(R + 0.2, heroCenter(f, 0))
  press(R + 3 * BEAT)
  lift(fiend, R + 3 * BEAT)
  moveCursor(R + 1.3, { x: fiendDrop.x + 40, y: fiendDrop.y + 22.5 + WS_TOP }, 0.9)
  tl.to(fiend, { ...fiendDrop, duration: 0.9, ease: 'power2.inOut' }, R + 1.3)

  // Off every category: red outline, trash badge, greyed portrait.
  f.heroes.splice(0, 1)
  reflow(f, R + 1.7)
  tl.to($('.hero-out', fiend), { opacity: 1, duration: 0.15 }, R + 1.9)
  tl.to($('.hero-trash', fiend), { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, R + 1.9)
  tl.to($('.hero-img img', fiend), { filter: 'grayscale(1)', opacity: 0.75, duration: 0.15 }, R + 1.9)

  // Dropped: it puffs out.
  release(R + 7 * BEAT)
  tl.to(fiend, { scale: 0.5, opacity: 0, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, R + 7 * BEAT)
  const poof = make('div', 'poof', '<i></i>'.repeat(7))
  $('#heroes').append(poof)
  gsap.set(poof, { x: fiendDrop.x + 40, y: fiendDrop.y + 22.5 })
  $$('i', poof).forEach((dot, index) => {
    const angle = (index / 7) * Math.PI * 2 + 0.4
    tl.fromTo(
      dot,
      { x: Math.cos(angle) * 14, y: Math.sin(angle) * 10, scale: 1, opacity: 0.9 },
      { x: Math.cos(angle) * 58, y: Math.sin(angle) * 40, scale: 0.3, opacity: 0, duration: 0.6, immediateRender: false },
      R + 7 * BEAT + 0.05
    )
  })

  // ===== 4. Move a category into line, then resize it =====

  const Z = R + 10 * BEAT
  const A = Z + 16 * BEAT
  cam(Z, 1.5, 800, 470, 1.1)
  caption(Z + 0.3, A + 0.2, 'Move and resize categories', 'Heroes reflow to fit the new width')

  // D Tier slides in beside C.
  moveCursor(Z + 0.4, { x: d.x + 18, y: d.y + 18 + WS_TOP })
  press(Z + 3 * BEAT)
  ringOn(d, Z + 3 * BEAT)

  const dTo = { x: 690, y: d.y }
  const dMove = { duration: 1, ease: 'power2.inOut' }
  moveCursor(Z + 1.5, { x: dTo.x + 18, y: dTo.y + 18 + WS_TOP }, 1)
  d.x = dTo.x
  tl.to(d.el, { ...dTo, ...dMove }, Z + 1.5)
  d.heroes.forEach((key, index) => tl.to(heroEls[key], { ...slot(d, index), ...dMove }, Z + 1.5))

  release(Z + 2.6)
  ringOff(d, Z + 2.6)

  // Then its right edge is pulled out to the board's: the width follows the cursor, and heroes wrap each time
  // another cell fits, until they're on one row.
  const edge = (cols, rows) => ({ x: d.x + cardWidth(cols), y: d.y + HEADER + (rows * CELL_H + 8) / 2 + WS_TOP })
  moveCursor(Z + 2.9, edge(3, 2), 0.7)
  tl.to(d.pill, { opacity: 1, duration: 0.15 }, Z + 3.5)
  press(Z + 3.8)
  tl.to(d.pill, { backgroundColor: 'oklch(58.5% 0.233 277.117)', duration: 0.12 }, Z + 3.8)
  ringOn(d, Z + 3.8)

  moveCursor(Z + 4, edge(5, 1), 1.3, 'sine.inOut')
  tl.to(d.el, { width: cardWidth(5), duration: 1.3, ease: 'sine.inOut' }, Z + 4)
  d.cols = 4
  reflow(d, Z + 4.6, 0.18)
  d.cols = 5
  reflow(d, Z + 5.22, 0.2)

  release(Z + 5.5)
  ringOff(d, Z + 5.5)
  tl.to(d.pill, { opacity: 0, duration: 0.25 }, Z + 5.7)

  // ===== 5. Add a hero from the selector =====

  cam(A, 1.15, 620, 400, 1.1)
  caption(A + 0.3, A + 16 * BEAT - 0.2, 'Add heroes from the full roster', 'Every hero, grouped by attribute and searchable')

  const selector = $('#selector')
  gsap.set(selector, { y: -6, scale: 0.985, transformOrigin: '42% 0' })

  moveCursor(A + 0.4, heroCenter(s, 4))
  click(A + 3 * BEAT)
  tl.to($('.plus-on', s.plus), { opacity: 1, duration: 0.15 }, A + 3 * BEAT)
  tl.to(selector, { opacity: 1, y: 0, scale: 1, duration: 0.25 }, A + 3 * BEAT + 0.1)

  // Typing "sv" dims every hero whose name doesn't match.
  const typed = $$('#selector .typed span')
  const dim = (query, at) => {
    for (const tile of Object.values(tiles)) {
      tl.to(tile, { opacity: tile.dataset.name.includes(query) ? 1 : 0.3, duration: 0.15 }, at)
    }
  }
  tl.set('#selector .ph', { display: 'none' }, A + 2.1)
  tl.set('#selector .caret', { marginLeft: -7 }, A + 2.1)
  tl.set(typed[0], { display: 'inline' }, A + 2.1)
  dim('s', A + 2.1)
  tl.set(typed[1], { display: 'inline' }, A + 2.35)
  dim('sv', A + 2.35)

  const sven = tiles.sven
  moveCursor(A + 2.8, center(sven), 0.7)
  tl.to($('div', sven), { borderColor: 'oklch(58.5% 0.233 277.117)', duration: 0.12 }, A + 3.5)
  click(A + 10 * BEAT)

  // Sven lands in S Tier, and the plus moves along.
  const svenHero = makeHero('sven')
  gsap.set(svenHero, { ...slot(s, 4), opacity: 0, scale: 0.6 })
  s.heroes.push('sven')
  tl.to(svenHero, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, A + 10 * BEAT + 0.1)
  reflow(s, A + 10 * BEAT + 0.1, 0.22, 'sven')

  tl.to(selector, { opacity: 0, y: -4, duration: 0.2, ease: 'power2.in' }, A + 5.2)
  tl.to($('.plus-on', s.plus), { opacity: 0, duration: 0.2 }, A + 5.2)

  // ===== 6. Favorite, then share =====

  const H = A + 16 * BEAT
  cam(H, 1.9, 640, 600)
  caption(H + 0.3, H + 7.6, 'Share a board with a link', 'Share it to your friends or even your audience')

  const dock = box($('#dock'))
  const dockBottom = dock.y + dock.h - 1
  const star = $('#btn-star')
  const shareButton = $('#btn-share')

  gsap.set('.share-globe', { opacity: 0 })
  gsap.set('#opt-private', { color: '#fafafa' })
  gsap.set('#opt-private .opt-ic', { color: '#e4e4e7' })
  gsap.set(['#opt-public .opt-ck', '#copy-check'], { opacity: 0, scale: 0.5 })

  moveCursor(H + 0.5, center(star))
  tl.to($('.ibtn-hover', star), { opacity: 1, duration: 0.12 }, H + 1.2)
  click(H + 4 * BEAT)
  tl.set($('.star', star), { color: '#f0b100' }, H + 4 * BEAT)
  tl.fromTo($('.star', star), { scale: 0.55 }, { scale: 1, duration: 0.5, ease: 'back.out(3.2)', immediateRender: false }, H + 4 * BEAT)
  $$('.burst i', star).forEach((dot, index) => {
    const angle = (index / 6) * Math.PI * 2
    tl.fromTo(
      dot,
      { x: Math.sin(angle) * 6, y: -Math.cos(angle) * 6, scale: 1, opacity: 1 },
      { x: Math.sin(angle) * 22, y: -Math.cos(angle) * 22, scale: 0.3, opacity: 0, duration: 0.6, immediateRender: false },
      H + 4 * BEAT + 0.06
    )
  })

  moveCursor(H + 2.1, center(shareButton), 0.5)
  tl.to($('.ibtn-hover', star), { opacity: 0, duration: 0.12 }, H + 2.2)
  tl.to($('.ibtn-hover', shareButton), { opacity: 1, duration: 0.12 }, H + 2.5)
  click(H + 7 * BEAT)

  // The dock grows into the share card from its top edge.
  const grow = { duration: 0.34, ease: 'power3.out' }
  tl.to('#dockrow', { height: 0, opacity: 0, ...grow }, H + 2.85)
  tl.to('#share', { height: 172, ...grow }, H + 2.85)
  tl.to('#share', { opacity: 1, duration: 0.2 }, H + 2.95)

  moveCursor(H + 3.2, { x: dock.x + 150, y: dockBottom - 16 - 26 }, 0.6)
  click(H + 10 * BEAT)

  // Public: the highlight slides down, and the link opens with a shimmer until it's saved.
  const slide = { duration: 0.38, ease: 'power3.out' }
  tl.to('.opt-hl', { y: 54, ...slide }, H + 10 * BEAT)
  tl.to('#opt-private', { color: '#9f9fa9', duration: 0.25 }, H + 10 * BEAT)
  tl.to('#opt-private .opt-ic', { color: '#71717b', duration: 0.25 }, H + 10 * BEAT)
  tl.to('#opt-private .opt-ck', { opacity: 0, scale: 0.5, duration: 0.2 }, H + 10 * BEAT)
  tl.to('#opt-public', { color: '#fafafa', duration: 0.25 }, H + 10 * BEAT)
  tl.to('#opt-public .opt-ic', { color: '#e4e4e7', duration: 0.25 }, H + 10 * BEAT)
  tl.to('#share', { height: 220, ...slide }, H + 4.05)
  tl.to('#linkwrap', { height: 48, ...slide }, H + 4.05)
  tl.to('#linkwrap', { opacity: 1, duration: 0.25 }, H + 4.15)

  gsap.set('#linktext', { opacity: 0, filter: 'blur(4px)' })
  gsap.set('#shimmer', { backgroundPosition: '100% 0' })
  tl.to('#shimmer', { opacity: 0.2, duration: 0.2 }, H + 4.15)
  tl.to('#shimmer', { backgroundPosition: '0% 0', duration: 1.1, ease: 'sine.inOut' }, H + 4.1)
  tl.to('#shimmer', { opacity: 0, duration: 0.25 }, H + 5.1)
  tl.to('#linktext', { opacity: 1, filter: 'blur(0px)', duration: 0.3 }, H + 5.15)
  tl.to('#opt-public .opt-ck', { opacity: 1, scale: 1, duration: 0.3 }, H + 5.2)

  // Copy: the clipboard shrinks out, a green check grows in.
  const copyPoint = { x: dock.x + dock.w - 37, y: dockBottom - 16 - 20 }
  moveCursor(H + 5.5, copyPoint, 0.5)
  click(H + 16 * BEAT)
  tl.to('#copy-clip', { opacity: 0, scale: 0.5, duration: 0.2 }, H + 16 * BEAT)
  tl.to('#copy-check', { opacity: 1, scale: 1, duration: 0.2 }, H + 16 * BEAT + 0.05)
  tl.to('#copy', { color: '#7bf1a8', duration: 0.2 }, H + 16 * BEAT)
  tl.to('#copy-on', { opacity: 1, duration: 0.2 }, H + 16 * BEAT)

  const tooltip = $('#tooltip')
  gsap.set(tooltip, { x: copyPoint.x, y: copyPoint.y - 30, xPercent: -50, yPercent: -100 })
  tl.fromTo(tooltip, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, H + 16 * BEAT + 0.1)

  // Back to the whole board: the card folds away, and the share button is now a globe.
  tl.to([tooltip, cursor], { opacity: 0, duration: 0.2 }, H + 7.1)
  tl.to('#share', { height: 0, opacity: 0, duration: 0.3, ease: 'power3.out' }, H + 7.2)
  tl.to('#dockrow', { height: 44, opacity: 1, duration: 0.3, ease: 'power3.out' }, H + 7.2)
  tl.set('.share-link', { opacity: 0 }, H + 7.2)
  tl.set('.share-globe', { opacity: 1 }, H + 7.2)
  tl.set($('.ibtn-hover', shareButton), { opacity: 0 }, H + 7.2)
  cam(H + 7.2, 1, 640, 360, 1.3)

  // ===== 7. The small interactions, in quick close-ups =====

  // The window is gone by the drop, 22 beats after the share scene began.
  const M = H + 22 * BEAT - 0.6
  tl.to('#win', { opacity: 0, scale: 0.93, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, M)

  // ===== 8. How it's built =====

  const U = reelScene(tl, M + 0.6) - 0.5
  tl.set('#hood', { visibility: 'visible', opacity: 1 }, U + 0.5)

  const lines = $$('.hood-lines p')
  const stackItems = $$('.stack dt, .stack dd')
  gsap.set(['.hood-title', ...lines], { opacity: 0, y: 16, filter: 'blur(8px)' })
  gsap.set(stackItems, { opacity: 0, x: 14 })

  tl.to('.hood-title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, U + 0.5)
  lines.forEach((line, index) => {
    const at = U + 0.5 + index * 8 * BEAT
    tl.to(line, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, at)
    if (index > 0) tl.to(lines[index - 1], { color: '#71717b', duration: 0.5 }, at)
  })
  tl.to(stackItems, { opacity: 1, x: 0, duration: 0.45, stagger: 0.07 }, U + 1.3)
  tl.to('#hood', { opacity: 0, duration: 0.6, ease: 'power2.in' }, U + 0.5 + 16 * BEAT - 0.6)

  // ===== 9. Outro =====

  const O = U + 0.5 + 16 * BEAT
  columns.forEach((col) => tl.to(col, { y: '-=150', duration: 6.6, ease: 'none' }, O))
  tl.to('#backdrop', { opacity: 1, duration: 1.3, ease: 'power1.out' }, O)
  tl.set('#outro', { opacity: 1 }, O)

  const outroBadge = $('#outro .badge')
  const outroText = ['#outro .wordmark-sm', '.outro-url', '.outro-credit', '.outro-repo']
  gsap.set(outroBadge, { scale: 0.3, opacity: 0 })
  gsap.set(outroText, { opacity: 0, y: 16, filter: 'blur(8px)' })
  tl.to(outroBadge, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }, O + BEAT)
  tl.to(outroText, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.3 }, O + BEAT + 0.2)

  // Hold the last frame.
  tl.to({}, { duration: 0.01 }, O + 6.5)

  return tl
}

// ---------- Player ----------

const fit = () => {
  const scale = RECORD ? 1 : Math.min(innerWidth / 1920, innerHeight / 1080)
  $('#stage').style.setProperty('--s', scale)
}

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

const start = async () => {
  document.documentElement.classList.toggle('record', RECORD)
  fit()
  addEventListener('resize', fit)

  buildBoard()
  buildDock()
  buildSelector()
  buildReel()
  buildBackdrop()

  // Widths are measured while building, so the fonts and portraits have to be in first.
  await Promise.all([document.fonts.ready, preload()])
  await Promise.all(['500', '700', '800'].map((weight) => document.fonts.load(`${weight} 16px interstate`).catch(() => {})))

  const tl = build()
  const duration = tl.duration()

  const playButton = $('#play')
  const scrub = $('#scrub')
  const time = $('#time')
  const controls = $('#controls')

  const sync = () => {
    scrub.value = String(Math.round((tl.time() / duration) * 1000))
    time.textContent = `${clock(tl.time())} / ${clock(duration)}`
    playButton.textContent = tl.paused() || tl.time() >= duration ? (tl.time() >= duration ? 'Replay' : 'Play') : 'Pause'
  }

  tl.eventCallback('onUpdate', sync)

  // A music.mp3 beside this page plays along, to try a track against the film before rendering it in. Browsers
  // only start sound after a click or a key, so it joins at the first one.
  const music = RECORD ? null : new Audio('music.mp3')
  const syncMusic = () => {
    if (!music || music.error) return
    const playing = !tl.paused() && tl.time() < duration
    if (Math.abs(music.currentTime - tl.time()) > 0.15) music.currentTime = tl.time()
    if (playing) music.play().catch(() => {})
    else music.pause()
  }
  tl.eventCallback('onComplete', syncMusic)

  const toggle = () => {
    if (tl.time() >= duration) tl.restart()
    else tl.paused(!tl.paused())
    sync()
    syncMusic()
  }

  playButton.addEventListener('click', toggle)
  scrub.addEventListener('input', () => {
    tl.pause()
    tl.time((Number(scrub.value) / 1000) * duration)
    sync()
    syncMusic()
  })

  addEventListener('keydown', (evt) => {
    if (evt.target === scrub) return
    if (evt.key === ' ') {
      evt.preventDefault()
      toggle()
    }
    if (evt.key === 'ArrowRight') tl.time(Math.min(duration, tl.time() + 2))
    if (evt.key === 'ArrowLeft') tl.time(Math.max(0, tl.time() - 2))
    if (evt.key.toLowerCase() === 'r') tl.restart()
    if (evt.key.toLowerCase() === 'f') document.documentElement.requestFullscreen?.()
    syncMusic()
  })

  // The controls show while the pointer moves, then get out of the picture.
  let hide
  addEventListener('pointermove', () => {
    controls.classList.add('on')
    clearTimeout(hide)
    hide = setTimeout(() => controls.classList.remove('on'), 1800)
  })

  // For render.mjs: jump to a time and wait until it's painted.
  window.__film = {
    duration,
    seek: (seconds) => {
      tl.pause()
      tl.time(seconds)
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))
    }
  }

  sync()
  if (!RECORD && !matchMedia('(prefers-reduced-motion: reduce)').matches) tl.play()
}

start()
