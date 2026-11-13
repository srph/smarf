import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { HEROES, boardJson, boardSummaryJson, categoryJson, db, nextId, type DbBoard, type DbCategory } from './db'

export const API = 'http://smarf.test/api'

const NOW = () => new Date().toISOString()

const unauthorized = () => HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 })

/** Resolve the bearer token to a user id, or null when missing/invalid. */
function userIdFrom(request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  return (token && db.tokens.get(token)) || null
}

function ownedBoard(request: Request, id: string): DbBoard | null {
  const userId = userIdFrom(request)
  return db.boards.find((b) => b.id === id && b.user_id === userId) ?? null
}

function ownedCategory(request: Request, id: string): DbCategory | null {
  const category = db.categories.find((c) => c.id === id)
  return category && ownedBoard(request, category.board_id) ? category : null
}

type Json = Record<string, any>

export const handlers = [
  http.post(`${API}/auth/discord`, async ({ request }) => {
    const body = (await request.json()) as Json
    const userId = db.discordCodes.get(body.code)
    if (!userId || body.redirect_uri !== 'http://smarf.test/login/discord') {
      return HttpResponse.json(
        {
          message: "Discord didn't accept the sign-in. Try again.",
          errors: { code: ["Discord didn't accept the sign-in. Try again."] }
        },
        { status: 422 }
      )
    }
    db.discordCodes.delete(body.code)
    const token = nextId('token')
    db.tokens.set(token, userId)
    return HttpResponse.json({ token_type: 'Bearer', access_token: token })
  }),

  http.get(`${API}/auth/me`, ({ request }) => {
    const userId = userIdFrom(request)
    const user = db.users.find((u) => u.id === userId)
    if (!user) return unauthorized()
    return HttpResponse.json({ user })
  }),

  http.get(`${API}/heroes`, () => HttpResponse.json({ heroes: HEROES })),

  http.get(`${API}/boards`, ({ request }) => {
    const userId = userIdFrom(request)
    if (!userId) return unauthorized()
    // Newest first, like the API (created_at desc). Seeded boards share one created_at, so newest = added last.
    return HttpResponse.json({
      boards: db.boards
        .filter((b) => b.user_id === userId)
        .toReversed()
        .map(boardSummaryJson)
    })
  }),

  http.post(`${API}/boards`, async ({ request }) => {
    const userId = userIdFrom(request)
    if (!userId) return unauthorized()
    const body = (await request.json()) as Json
    const board: DbBoard = {
      id: nextId('board'),
      user_id: userId,
      name: body.name,
      is_favorite: null,
      favorited_at: null,
      created_at: NOW(),
      updated_at: NOW()
    }
    db.boards.push(board)
    for (const c of body.categories ?? []) {
      const category: DbCategory = {
        id: nextId('category'),
        board_id: board.id,
        name: c.name,
        x_position: c.x_position,
        y_position: c.y_position,
        width: c.width,
        height: c.height,
        created_at: NOW(),
        updated_at: NOW()
      }
      db.categories.push(category)
      for (const h of c.heroes ?? []) {
        db.pivots.push({ id: nextId('pivot'), category_id: category.id, hero_id: h.id, order: h.order })
      }
    }
    // Like the real API, the created board comes back without categories.
    return HttpResponse.json({ board })
  }),

  http.get(`${API}/boards/:id`, ({ request, params }) => {
    const board = ownedBoard(request, params.id as string)
    if (!board) return HttpResponse.json({}, { status: 404 })
    return HttpResponse.json({ board: boardJson(board) })
  }),

  http.put(`${API}/boards/:id`, async ({ request, params }) => {
    const board = ownedBoard(request, params.id as string)
    if (!board) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    board.name = body.name
    board.updated_at = NOW()
    return HttpResponse.json({ board })
  }),

  http.put(`${API}/boards/:id/favorite`, async ({ request, params }) => {
    const board = ownedBoard(request, params.id as string)
    if (!board) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    board.is_favorite = Boolean(body.is_favorite)
    board.favorited_at = board.is_favorite ? NOW() : null
    return HttpResponse.json({ board })
  }),

  http.post(`${API}/boards/:id/duplicate`, ({ request, params }) => {
    const original = ownedBoard(request, params.id as string)
    if (!original) return HttpResponse.json({}, { status: 404 })
    const board: DbBoard = {
      ...original,
      id: nextId('board'),
      name: original.name,
      created_at: NOW(),
      updated_at: NOW()
    }
    db.boards.push(board)
    for (const c of db.categories.filter((category) => category.board_id === original.id)) {
      const copy = { ...c, id: nextId('category'), board_id: board.id }
      db.categories.push(copy)
      for (const p of db.pivots.filter((pivot) => pivot.category_id === c.id)) {
        db.pivots.push({ ...p, id: nextId('pivot'), category_id: copy.id })
      }
    }
    return HttpResponse.json({ board })
  }),

  http.delete(`${API}/boards/:id`, ({ request, params }) => {
    const board = ownedBoard(request, params.id as string)
    if (!board) return HttpResponse.json({}, { status: 404 })
    const categoryIds = db.categories.filter((c) => c.board_id === board.id).map((c) => c.id)
    db.pivots = db.pivots.filter((p) => !categoryIds.includes(p.category_id))
    db.categories = db.categories.filter((c) => c.board_id !== board.id)
    db.boards = db.boards.filter((b) => b.id !== board.id)
    return HttpResponse.json({ success: true })
  }),

  http.post(`${API}/boards/:id/categories`, async ({ request, params }) => {
    const board = ownedBoard(request, params.id as string)
    if (!board) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    const category: DbCategory = {
      id: nextId('category'),
      board_id: board.id,
      name: body.name,
      x_position: body.x_position,
      y_position: body.y_position,
      width: body.width,
      height: body.height,
      created_at: NOW(),
      updated_at: NOW()
    }
    db.categories.push(category)
    return HttpResponse.json({ category: categoryJson(category) })
  }),

  http.put(`${API}/categories/:id`, async ({ request, params }) => {
    const category = ownedCategory(request, params.id as string)
    if (!category) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    category.name = body.name
    return HttpResponse.json({ category })
  }),

  http.put(`${API}/categories/:id/move`, async ({ request, params }) => {
    const category = ownedCategory(request, params.id as string)
    if (!category) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    category.x_position = body.x_position
    category.y_position = body.y_position
    return HttpResponse.json({ category })
  }),

  http.put(`${API}/categories/:id/resize`, async ({ request, params }) => {
    const category = ownedCategory(request, params.id as string)
    if (!category) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    category.width = body.width
    category.height = body.height
    return HttpResponse.json({ category })
  }),

  http.delete(`${API}/categories/:id`, ({ request, params }) => {
    const category = ownedCategory(request, params.id as string)
    if (!category) return HttpResponse.json({}, { status: 404 })
    db.pivots = db.pivots.filter((p) => p.category_id !== category.id)
    db.categories = db.categories.filter((c) => c.id !== category.id)
    return HttpResponse.json({ success: true })
  }),

  http.post(`${API}/categories/:id/heroes`, async ({ request, params }) => {
    const category = ownedCategory(request, params.id as string)
    if (!category) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    const pivot = { id: nextId('pivot'), category_id: category.id, hero_id: body.hero_id, order: body.hero_order }
    db.pivots.push(pivot)
    category.height = body.category_height
    const hero = HEROES.find((h) => h.id === body.hero_id)
    return HttpResponse.json({ hero: { ...hero, pivot } })
  }),

  // Reorder or move a hero; `:hero` is the pivot id.
  http.put(`${API}/categories/:id/heroes/:pivot`, async ({ request, params }) => {
    const from = ownedCategory(request, params.id as string)
    if (!from) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    const to = ownedCategory(request, body.to_category_id)
    const pivot = db.pivots.find((p) => p.id === params.pivot)
    if (!to || !pivot) return HttpResponse.json({}, { status: 404 })
    pivot.category_id = to.id
    pivot.order = body.hero_order
    from.height = body.from_category_height
    to.height = body.to_category_height
    const hero = HEROES.find((h) => h.id === pivot.hero_id)
    return HttpResponse.json({ hero: { ...hero, pivot } })
  }),

  // Remove one hero from a category; `:pivot` is the pivot id, so a second copy of the hero stays.
  http.delete(`${API}/categories/:id/heroes/:pivot`, async ({ request, params }) => {
    const category = ownedCategory(request, params.id as string)
    if (!category) return HttpResponse.json({}, { status: 404 })
    const body = (await request.json()) as Json
    const pivot = db.pivots.find((p) => p.id === params.pivot && p.category_id === category.id)
    if (!pivot) return HttpResponse.json({}, { status: 404 })
    db.pivots = db.pivots.filter((p) => p !== pivot)
    category.height = body.category_height
    return HttpResponse.json({ category: categoryJson(category) })
  })
]

export const server = setupServer(...handlers)
