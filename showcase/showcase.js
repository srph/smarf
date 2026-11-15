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

// The board. x and y are workspace coordinates; cols is the tray's width in hero cells.
const CATEGORIES = [
  { id: 'mid', name: 'Mid', x: 40, y: 24, cols: 4, heroes: ['nevermore', 'storm_spirit', 'puck', 'invoker', 'queenofpain'] },
  { id: 'safe', name: 'Safe lane', x: 440, y: 24, cols: 5, heroes: ['juggernaut', 'phantom_assassin', 'morphling'] },
  { id: 'off', name: 'Offlane', x: 928, y: 24, cols: 3, heroes: ['axe', 'mars', 'tidehunter', 'centaur'] },
  { id: 'roam', name: 'Roaming', x: 40, y: 236, cols: 3, heroes: ['earth_spirit', 'tusk', 'mirana', 'bounty_hunter', 'spirit_breaker'] },
  { id: 'sup', name: 'Hard support', x: 640, y: 196, cols: 4, heroes: ['crystal_maiden', 'lion', 'shadow_shaman', 'dazzle', 'witch_doctor', 'oracle', 'jakiro'] },
  // The bottom middle stays clear: the dock sits there, and grows upward into its cards.
  { id: 'comfort', name: 'Comfort picks', x: 40, y: 418, cols: 3, heroes: ['sniper', 'drow_ranger', 'lina', 'zuus', 'viper'] },
  { id: 'ban', name: 'Ban these', x: 980, y: 410, cols: 3, heroes: ['techies', 'tinker', 'broodmother'] }
]

const EXTRA_BACKDROP = ['pangolier', 'void_spirit', 'windrunner', 'rubick', 'lich', 'grimstroke', 'snapfire', 'marci', 'enigma']

// A hero cell is 80x45 with 4px of padding all round; the tray adds 4px more. The header is 36px tall.
const CELL_W = 88
const CELL_H = 53
const HEADER = 36
const WS_TOP = 80

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
    gsap.set(cat.el, { x: cat.x, y: cat.y, width: cardWidth(cat.cols) })
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
        <div class="switcher"><span class="dot"></span><span class="name">Ranked pool</span>${icon('chevrons', 16)}</div>
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
    tl.to(col, { y: start - 150 - 24 * (index % 3), duration: 6, ease: 'none' }, 0)
  })

  tl.to('#backdrop', { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0.1)

  const badge = $('#lockup .badge')
  gsap.set(badge, { scale: 0.3, opacity: 0 })
  tl.to(badge, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0.5)

  const letters = 'Smarf'.split('').map((letter) => make('span', '', letter))
  $('#wordmark').append(...letters)
  gsap.set(letters, { opacity: 0, yPercent: 45, filter: 'blur(14px)' })
  tl.to(letters, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.75, stagger: 0.07, ease: 'power3.out' }, 0.8)

  gsap.set('#tagline', { y: 14, filter: 'blur(8px)' })
  tl.to('#tagline', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 1.8)

  tl.to('#lockup', { opacity: 0, scale: 0.94, filter: 'blur(10px)', duration: 0.55, ease: 'power2.in' }, 4.3)
  tl.to('#backdrop', { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 4.4)

  // ===== 2. The board assembles =====

  tl.to('#win', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, 4.8)

  Object.values(cats).forEach((cat, index) => {
    const at = 5.2 + index * 0.1
    gsap.set(cat.el, { opacity: 0, scale: 0.94 })
    tl.to(cat.el, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' }, at)
    cat.heroes.forEach((key, heroIndex) => {
      gsap.set(heroEls[key], { opacity: 0, scale: 0.7 })
      tl.to(heroEls[key], { opacity: 1, scale: 1, duration: 0.36, ease: 'back.out(2)' }, at + 0.16 + heroIndex * 0.045)
    })
  })

  gsap.set(['#dock', '#newcat'], { y: 16, opacity: 0 })
  tl.to(['#dock', '#newcat'], { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 5.7)
  tl.fromTo(
    '#newcat .sheen',
    { xPercent: -170, skewX: -20, opacity: 1 },
    { xPercent: 360, duration: 0.85, ease: 'power1.out', immediateRender: false },
    6.7
  )
  tl.set('#newcat .sheen', { opacity: 0 }, 7.6)

  caption(5.9, 10.1, 'Your hero pool, laid out like the in-game grid', 'React 19 and TypeScript, styled with Tailwind 4')
  tl.to(camera, { z: 1.035, duration: 4.4, ease: 'none', onUpdate: applyCamera }, 5.8)

  // ===== 3. Drag a hero between categories, then drag one off =====

  const D = 10.3
  const { mid, safe, roam, ban } = cats

  cam(D, 1.45, 460, 332)
  caption(D + 0.3, D + 4.6, 'Drag heroes between categories', 'dnd-kit, with a draft that only saves on drop')

  gsap.set(cursor, { x: 780, y: 500 })
  tl.to(cursor, { opacity: 1, duration: 0.3 }, D + 0.5)

  const mirana = heroEls.mirana
  const miranaFrom = heroCenter(roam, 2)
  const miranaTo = slot(safe, 2)
  moveCursor(D + 0.7, miranaFrom)
  press(D + 1.6)
  lift(mirana, D + 1.6)

  moveCursor(D + 1.8, { x: miranaTo.x + 40, y: miranaTo.y + 22.5 + WS_TOP }, 1.1)
  tl.to(mirana, { x: miranaTo.x, y: miranaTo.y, duration: 1.1, ease: 'power2.inOut' }, D + 1.8)

  // Leaving Roaming closes its gap; arriving over Safe lane opens one, and its ring turns indigo.
  roam.heroes.splice(2, 1)
  reflow(roam, D + 2.1)
  safe.heroes.splice(2, 0, 'mirana')
  reflow(safe, D + 2.5, 0.22, 'mirana')
  ringOn(safe, D + 2.5)

  release(D + 3.1)
  settle(mirana, D + 3.1, miranaTo)
  ringOff(safe, D + 3.4)

  const R = D + 4.3
  caption(R + 0.5, R + 3.9, 'Drag one off the board to remove it', 'One optimistic save, undone if it fails')

  const qop = heroEls.queenofpain
  const qopDrop = { x: 430, y: 168 }
  moveCursor(R + 0.2, heroCenter(mid, 4))
  press(R + 1.1)
  lift(qop, R + 1.1)
  moveCursor(R + 1.3, { x: qopDrop.x + 40, y: qopDrop.y + 22.5 + WS_TOP }, 0.9)
  tl.to(qop, { ...qopDrop, duration: 0.9, ease: 'power2.inOut' }, R + 1.3)

  // Off every category: red outline, trash badge, greyed portrait.
  mid.heroes.splice(4, 1)
  reflow(mid, R + 1.7)
  tl.to($('.hero-out', qop), { opacity: 1, duration: 0.15 }, R + 1.7)
  tl.to($('.hero-trash', qop), { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, R + 1.7)
  tl.to($('.hero-img img', qop), { filter: 'grayscale(1)', opacity: 0.75, duration: 0.15 }, R + 1.7)

  // Dropped: it puffs out.
  release(R + 2.8)
  tl.to(qop, { scale: 0.5, opacity: 0, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, R + 2.8)
  const poof = make('div', 'poof', '<i></i>'.repeat(7))
  $('#heroes').append(poof)
  gsap.set(poof, { x: qopDrop.x + 40, y: qopDrop.y + 22.5 })
  $$('i', poof).forEach((dot, index) => {
    const angle = (index / 7) * Math.PI * 2 + 0.4
    tl.fromTo(
      dot,
      { x: Math.cos(angle) * 14, y: Math.sin(angle) * 10, scale: 1, opacity: 0.9 },
      { x: Math.cos(angle) * 58, y: Math.sin(angle) * 40, scale: 0.3, opacity: 0, duration: 0.6, immediateRender: false },
      R + 2.85
    )
  })

  // ===== 4. Resize a category, then move one =====

  const Z = R + 3.8
  cam(Z, 1.4, 457, 456, 1.1)
  caption(Z + 0.3, Z + 7.1, 'Resize and move categories', 'Heroes reflow to fit the new width')

  const edge = (cols) => ({ x: roam.x + cardWidth(cols), y: roam.y + HEADER + 57 + WS_TOP })
  moveCursor(Z + 0.4, edge(3))
  tl.to(roam.pill, { opacity: 1, duration: 0.15 }, Z + 1.05)
  press(Z + 1.4)
  tl.to(roam.pill, { backgroundColor: 'oklch(58.5% 0.233 277.117)', duration: 0.12 }, Z + 1.4)
  ringOn(roam, Z + 1.4)

  // Width follows the cursor; heroes wrap each time another cell fits.
  moveCursor(Z + 1.6, edge(5), 1.3, 'sine.inOut')
  tl.to(roam.el, { width: cardWidth(5), duration: 1.3, ease: 'sine.inOut' }, Z + 1.6)
  roam.cols = 4
  reflow(roam, Z + 2.2, 0.18)
  roam.cols = 5
  reflow(roam, Z + 2.82, 0.2)

  release(Z + 3.1)
  ringOff(roam, Z + 3.1)
  tl.to(roam.pill, { opacity: 0, duration: 0.25 }, Z + 3.3)

  cam(Z + 3.3, 1.3, 800, 440, 1)
  moveCursor(Z + 3.6, { x: ban.x + 18, y: ban.y + 18 + WS_TOP })
  press(Z + 4.5)
  ringOn(ban, Z + 4.5)

  const banTo = { x: 752, y: 376 }
  const banMove = { duration: 1.1, ease: 'power2.inOut' }
  moveCursor(Z + 4.7, { x: banTo.x + 18, y: banTo.y + 18 + WS_TOP }, 1.1)
  ban.x = banTo.x
  ban.y = banTo.y
  tl.to(ban.el, { ...banTo, ...banMove }, Z + 4.7)
  ban.heroes.forEach((key, index) => tl.to(heroEls[key], { ...slot(ban, index), ...banMove }, Z + 4.7))

  release(Z + 6)
  ringOff(ban, Z + 6)

  // ===== 5. Add a hero from the selector =====

  const A = Z + 6.9
  cam(A, 1.15, 724, 393, 1.1)
  caption(A + 0.3, A + 6.3, 'Add heroes from the full roster', '127 heroes, grouped by attribute and searchable')

  const selector = $('#selector')
  gsap.set(selector, { y: -6, scale: 0.985, transformOrigin: '55% 0' })

  moveCursor(A + 0.4, heroCenter(safe, 4))
  click(A + 1.3)
  tl.to($('.plus-on', safe.plus), { opacity: 1, duration: 0.15 }, A + 1.3)
  tl.to(selector, { opacity: 1, y: 0, scale: 1, duration: 0.25 }, A + 1.4)

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
  tl.to($('div', sven), { borderColor: 'oklch(58.5% 0.233 277.117)', duration: 0.12 }, A + 3.4)
  click(A + 3.8)

  // Sven lands in Safe lane; the plus wraps to a second row.
  const svenHero = makeHero('sven')
  gsap.set(svenHero, { ...slot(safe, 4), opacity: 0, scale: 0.6 })
  safe.heroes.push('sven')
  tl.to(svenHero, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, A + 3.9)
  reflow(safe, A + 3.9, 0.22, 'sven')

  tl.to(selector, { opacity: 0, y: -4, duration: 0.2, ease: 'power2.in' }, A + 5)
  tl.to($('.plus-on', safe.plus), { opacity: 0, duration: 0.2 }, A + 5)

  // ===== 6. Favorite, then share =====

  const H = A + 6.5
  cam(H, 1.9, 640, 600)
  caption(H + 0.3, H + 8.1, 'Share a board with a link', 'Anyone with the link can view. Only you can edit.')

  const dock = box($('#dock'))
  const dockBottom = dock.y + dock.h - 1
  const star = $('#btn-star')
  const shareButton = $('#btn-share')

  gsap.set('.share-globe', { opacity: 0 })
  gsap.set('#opt-private', { color: '#fafafa' })
  gsap.set('#opt-private .opt-ic', { color: 'oklch(78.5% 0.115 274.713)' })
  gsap.set(['#opt-public .opt-ck', '#copy-check'], { opacity: 0, scale: 0.5 })

  moveCursor(H + 0.5, center(star))
  tl.to($('.ibtn-hover', star), { opacity: 1, duration: 0.12 }, H + 1.2)
  click(H + 1.5)
  tl.set($('.star', star), { color: '#f0b100' }, H + 1.5)
  tl.fromTo($('.star', star), { scale: 0.55 }, { scale: 1, duration: 0.5, ease: 'back.out(3.2)', immediateRender: false }, H + 1.5)
  $$('.burst i', star).forEach((dot, index) => {
    const angle = (index / 6) * Math.PI * 2
    tl.fromTo(
      dot,
      { x: Math.sin(angle) * 6, y: -Math.cos(angle) * 6, scale: 1, opacity: 1 },
      { x: Math.sin(angle) * 22, y: -Math.cos(angle) * 22, scale: 0.3, opacity: 0, duration: 0.6, immediateRender: false },
      H + 1.56
    )
  })

  moveCursor(H + 2.1, center(shareButton), 0.5)
  tl.to($('.ibtn-hover', star), { opacity: 0, duration: 0.12 }, H + 2.2)
  tl.to($('.ibtn-hover', shareButton), { opacity: 1, duration: 0.12 }, H + 2.5)
  click(H + 2.8)

  // The dock grows into the share card from its top edge.
  const grow = { duration: 0.34, ease: 'power3.out' }
  tl.to('#dockrow', { height: 0, opacity: 0, ...grow }, H + 2.85)
  tl.to('#share', { height: 172, ...grow }, H + 2.85)
  tl.to('#share', { opacity: 1, duration: 0.2 }, H + 2.95)

  moveCursor(H + 3.2, { x: dock.x + 150, y: dockBottom - 16 - 26 }, 0.6)
  click(H + 4)

  // Public: the highlight slides down, the globe turns, and the link opens with a shimmer until it's saved.
  const slide = { duration: 0.38, ease: 'power3.out' }
  tl.to('.opt-hl', { y: 54, ...slide }, H + 4)
  tl.to('#opt-private', { color: '#9f9fa9', duration: 0.25 }, H + 4)
  tl.to('#opt-private .opt-ic', { color: '#71717b', duration: 0.25 }, H + 4)
  tl.to('#opt-private .opt-ck', { opacity: 0, scale: 0.5, duration: 0.2 }, H + 4)
  tl.to('#opt-public', { color: '#fafafa', duration: 0.25 }, H + 4)
  tl.to('#opt-public .opt-ic', { color: 'oklch(78.5% 0.115 274.713)', rotation: -20, scale: 1.1, duration: 0.4 }, H + 4)
  tl.to('#share', { height: 220, ...slide }, H + 4.05)
  tl.to('#linkwrap', { height: 48, ...slide }, H + 4.05)
  tl.to('#linkwrap', { opacity: 1, duration: 0.25 }, H + 4.15)

  gsap.set('#linktext', { opacity: 0, filter: 'blur(4px)' })
  gsap.set('#shimmer', { backgroundPosition: '100% 0' })
  tl.to('#shimmer', { opacity: 0.2, duration: 0.2 }, H + 4.15)
  tl.to('#shimmer', { backgroundPosition: '0% 0', duration: 1.1, ease: 'sine.inOut' }, H + 4.1)
  tl.to('#shimmer', { opacity: 0, duration: 0.25 }, H + 5.1)
  tl.to('#linktext', { opacity: 1, filter: 'blur(0px)', duration: 0.3 }, H + 5.15)
  tl.to('.linkf', { color: 'oklch(78.5% 0.115 274.713)', duration: 0.25 }, H + 5.15)
  tl.to('#opt-public .opt-ck', { opacity: 1, scale: 1, duration: 0.3 }, H + 5.2)

  // Copy: the clipboard shrinks out, a green check grows in.
  const copyPoint = { x: dock.x + dock.w - 37, y: dockBottom - 16 - 20 }
  moveCursor(H + 5.5, copyPoint, 0.5)
  click(H + 6.2)
  tl.to('#copy-clip', { opacity: 0, scale: 0.5, duration: 0.2 }, H + 6.2)
  tl.to('#copy-check', { opacity: 1, scale: 1, duration: 0.2 }, H + 6.25)
  tl.to('#copy', { color: '#7bf1a8', duration: 0.2 }, H + 6.2)
  tl.to('#copy-on', { opacity: 1, duration: 0.2 }, H + 6.2)

  const tooltip = $('#tooltip')
  gsap.set(tooltip, { x: copyPoint.x, y: copyPoint.y - 30, xPercent: -50, yPercent: -100 })
  tl.fromTo(tooltip, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, H + 6.3)

  // Back to the whole board: the card folds away, and the share button is now an indigo globe.
  tl.to([tooltip, cursor], { opacity: 0, duration: 0.2 }, H + 7.4)
  tl.to('#share', { height: 0, opacity: 0, duration: 0.3, ease: 'power3.out' }, H + 7.5)
  tl.to('#dockrow', { height: 44, opacity: 1, duration: 0.3, ease: 'power3.out' }, H + 7.5)
  tl.set('.share-link', { opacity: 0 }, H + 7.5)
  tl.set('.share-globe', { opacity: 1, color: 'oklch(78.5% 0.115 274.713)' }, H + 7.5)
  tl.set($('.ibtn-hover', shareButton), { opacity: 0 }, H + 7.5)
  cam(H + 7.5, 1, 640, 360, 1.3)

  // ===== 7. How it's built =====

  const U = H + 9
  tl.to('#win', { opacity: 0, scale: 0.93, filter: 'blur(10px)', duration: 0.7, ease: 'power2.in' }, U)
  tl.set('#hood', { visibility: 'visible', opacity: 1 }, U + 0.5)

  const lines = $$('.hood-lines p')
  const stackItems = $$('.stack dt, .stack dd')
  gsap.set(['.hood-title', ...lines], { opacity: 0, y: 16, filter: 'blur(8px)' })
  gsap.set(stackItems, { opacity: 0, x: 14 })

  tl.to('.hood-title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, U + 0.6)
  lines.forEach((line, index) => {
    const at = U + 0.9 + index * 2.7
    tl.to(line, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, at)
    if (index > 0) tl.to(lines[index - 1], { color: '#71717b', duration: 0.5 }, at)
  })
  tl.to(stackItems, { opacity: 1, x: 0, duration: 0.45, stagger: 0.07 }, U + 1.3)
  tl.to('#hood', { opacity: 0, duration: 0.6, ease: 'power2.in' }, U + 9.6)

  // ===== 8. Outro =====

  const O = U + 10.1
  columns.forEach((col) => tl.to(col, { y: '-=150', duration: 6.6, ease: 'none' }, O))
  tl.to('#backdrop', { opacity: 1, duration: 1.3, ease: 'power1.out' }, O)
  tl.set('#outro', { opacity: 1 }, O)

  const outroBadge = $('#outro .badge')
  const outroText = ['#outro .wordmark-sm', '.outro-url', '.outro-credit', '.outro-repo']
  gsap.set(outroBadge, { scale: 0.3, opacity: 0 })
  gsap.set(outroText, { opacity: 0, y: 16, filter: 'blur(8px)' })
  tl.to(outroBadge, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }, O + 0.4)
  tl.to(outroText, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.3 }, O + 0.6)

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

  const toggle = () => {
    if (tl.time() >= duration) tl.restart()
    else tl.paused(!tl.paused())
    sync()
  }

  playButton.addEventListener('click', toggle)
  scrub.addEventListener('input', () => {
    tl.pause()
    tl.time((Number(scrub.value) / 1000) * duration)
    sync()
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
