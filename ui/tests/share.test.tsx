import { beforeEach, describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/react'
import { delay, http } from 'msw'
import { API, server } from './support/handlers'
import { db, seedBoard, TEST_USER, type DbBoard, type DbUser } from './support/db'
import { currentPath, renderApp, screen } from './support/render'

const OTHER_USER: DbUser = {
  ...TEST_USER,
  id: 'user-2',
  name: 'Rylai',
  discord_id: '1002',
  discord_username: 'rylai',
  discord_global_name: 'Rylai',
  email: null
}

const findBoard = (board: DbBoard) => db.boards.find((b) => b.id === board.id)

const linkTo = (board: DbBoard) => `${window.location.origin}/b/${board.id}`

beforeEach(() => {
  db.users.push({ ...OTHER_USER })
})

describe('sharing a board', () => {
  it('makes the board public from the dock, and copies its link', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries', heroes: ['Axe'] }])
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Share board' }))
    expect(screen.getByRole('radio', { name: /Private/ })).toBeChecked()
    expect(screen.queryByRole('textbox', { name: 'Board link' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Public/ }))

    await waitFor(() => expect(findBoard(board)!.is_public).toBe(true))
    expect(screen.getByRole('radio', { name: /Public/ })).toBeChecked()
    const link = await screen.findByRole('textbox', { name: 'Board link' })
    expect(link).toHaveValue(linkTo(board))

    const copy = screen.getByRole('button', { name: 'Copy link' })
    await waitFor(() => expect(copy).toBeEnabled())
    await user.click(copy)
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toBe(linkTo(board))

    // The dock's share button says it's public once the card closes.
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(await screen.findByRole('button', { name: 'Share board (public)' })).toBeInTheDocument()
  })

  it('holds the copy button until the save lands', async () => {
    // Holds the save until the test lets it through, then passes it on to the usual handler.
    let release: (() => void) | undefined
    const released = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.put(`${API}/boards/:id/public`, async () => {
        await released
        await delay(0)
        return undefined
      })
    )
    const board = seedBoard('Ranked', [{ name: 'Carries' }])
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Share board' }))
    await user.click(screen.getByRole('radio', { name: /Public/ }))

    // The link's field is up, but its copy button waits for the save.
    expect(await screen.findByRole('button', { name: 'Copy link' })).toBeDisabled()

    release?.()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy link' })).toBeEnabled())
  })

  it('makes a public board private again, and the link goes', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries' }], { is_public: true })
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Share board (public)' }))
    expect(screen.getByRole('textbox', { name: 'Board link' })).toHaveValue(linkTo(board))

    await user.click(screen.getByRole('radio', { name: /Private/ }))

    await waitFor(() => expect(findBoard(board)!.is_public).toBe(false))
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Board link' })).not.toBeInTheDocument())
  })
})

describe('visiting a public board', () => {
  it('opens signed out, read-only, with whose it is', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries', heroes: ['Axe', 'Lion'] }], { is_public: true })
    renderApp(`/b/${board.id}`, { loggedIn: false })

    expect(await screen.findByRole('region', { name: 'Carries' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Axe' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Lion' })).toBeInTheDocument()
    expect(screen.getByText(`by ${TEST_USER.name}`)).toBeInTheDocument()
    expect(screen.getByText('View only')).toBeInTheDocument()
    // No editing: no dock, no navigation
    expect(screen.queryByRole('button', { name: /Switch board/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New Board' })).not.toBeInTheDocument()
    expect(currentPath()).toBe(`/b/${board.id}`)
  })

  it('asks a signed-out visitor to log in to copy it', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries' }], { is_public: true })
    const { user } = renderApp(`/b/${board.id}`, { loggedIn: false })

    await user.click(await screen.findByRole('button', { name: 'Copy to my boards' }))

    expect(await screen.findByRole('link', { name: 'Continue with Discord' })).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it("copies someone else's public board to the visitor's boards, private", async () => {
    const board = seedBoard('Rylai picks', [{ name: 'Supports', heroes: ['Crystal Maiden'] }], {
      is_public: true,
      user_id: OTHER_USER.id
    })
    const { user } = renderApp(`/b/${board.id}`)

    expect(await screen.findByText('by Rylai')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Switch board/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Copy to my boards' }))

    // The copy opens in the editor, and it's the visitor's.
    expect(await screen.findByRole('button', { name: /Switch board/ })).toBeInTheDocument()
    const copy = db.boards.at(-1)!
    expect(currentPath()).toBe(`/b/${copy.id}`)
    expect(copy.user_id).toBe(TEST_USER.id)
    expect(copy.is_public).toBe(false)
    expect(findBoard(board)!.user_id).toBe(OTHER_USER.id)
  })
})

describe('a private board', () => {
  it('sends a signed-out visitor to log in', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries' }])
    renderApp(`/b/${board.id}`, { loggedIn: false })

    expect(await screen.findByRole('link', { name: 'Continue with Discord' })).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it("tells a signed-in visitor it's private or doesn't exist", async () => {
    const board = seedBoard('Rylai picks', [{ name: 'Supports' }], { user_id: OTHER_USER.id })
    renderApp(`/b/${board.id}`)

    expect(await screen.findByRole('alert')).toHaveTextContent("This board is private or doesn't exist.")
    expect(screen.getByRole('link', { name: 'Go to your boards' })).toHaveAttribute('href', '/')
  })
})
