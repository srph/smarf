/*
  Renders the showcase film to a video, frame by frame: serves this folder on localhost (the font kit only serves
  localhost and the app's own hosts), opens index.html?record in headless Chrome, seeks the timeline to each frame,
  screenshots it, and pipes the frames to ffmpeg. No dependencies beyond Node 22+, Chrome and ffmpeg.

    node render.mjs                      smarf-showcase.mp4 at 60fps
    node render.mjs --fps 30 --out a.mp4
    node render.mjs --stills 2,12.5,40   PNGs of those seconds, into stills/
    node render.mjs --audio track.mp3    with music: trimmed to the film, faded in and out

  A music.mp3 in this folder is used when --audio isn't given (it isn't committed; mind its licence).

  Set CHROME to use a browser other than macOS's Google Chrome.
*/

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, normalize } from 'node:path'
import { once } from 'node:events'

const here = import.meta.dirname
const args = process.argv.slice(2)
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback)

const fps = Number(option('--fps', 60))
const out = option('--out', join(here, 'smarf-showcase.mp4'))
const stills = option('--stills', null)
const audio = option('--audio', existsSync(join(here, 'music.mp3')) ? join(here, 'music.mp3') : null)
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const debugPort = 9333

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' }

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^(\.\.[/\\])+/, '')
  try {
    const body = await readFile(join(here, path === '/' ? 'index.html' : path))
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body)
  } catch {
    res.writeHead(404).end()
  }
})
server.listen(0, 'localhost')
await once(server, 'listening')
const url = `http://localhost:${server.address().port}/index.html?record`

const profile = await mkdtemp(join(tmpdir(), 'smarf-showcase-'))
const browser = spawn(
  chrome,
  [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    '--window-size=1920,1080',
    '--force-device-scale-factor=1',
    '--hide-scrollbars',
    '--no-first-run',
    'about:blank'
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const pageTarget = async () => {
  for (let tries = 0; tries < 100; tries++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
      const page = targets.find((target) => target.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {
      // Chrome isn't listening yet.
    }
    await sleep(100)
  }
  throw new Error("Chrome didn't start")
}

// A minimal DevTools Protocol client.
const socket = new WebSocket(await pageTarget())
await once(socket, 'open')
const pending = new Map()
let lastId = 0
socket.addEventListener('message', (evt) => {
  const message = JSON.parse(evt.data)
  const waiting = pending.get(message.id)
  if (!waiting) return
  pending.delete(message.id)
  if (message.error) waiting.reject(new Error(message.error.message))
  else waiting.resolve(message.result)
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pending.set(++lastId, { resolve, reject })
    socket.send(JSON.stringify({ id: lastId, method, params }))
  })
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value

const close = async () => {
  socket.close()
  browser.kill()
  server.close()
  await rm(profile, { recursive: true, force: true }).catch(() => {})
}

try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url })

  let duration
  for (let tries = 0; tries < 300 && !duration; tries++) {
    await sleep(200)
    duration = await evaluate('window.__film?.duration')
  }
  if (!duration) throw new Error("The film didn't load")

  const frame = async (seconds) => {
    await evaluate(`window.__film.seek(${seconds})`)
    return Buffer.from((await send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64')
  }

  if (option('--eval', null)) {
    await evaluate(`window.__film.seek(${option('--at', 0)})`)
    console.log(await evaluate(option('--eval')))
  } else if (stills) {
    const dir = join(here, 'stills')
    await mkdir(dir, { recursive: true })
    for (const seconds of stills.split(',').map(Number)) {
      await writeFile(join(dir, `${seconds.toFixed(2).padStart(6, '0')}.png`), await frame(seconds))
    }
    console.log(`Stills in ${dir} (the film runs ${duration.toFixed(1)}s)`)
  } else {
    const ffmpeg = spawn(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-'].concat(
        // The music fades in over half a second, and out over the last two and a half.
        audio ? ['-i', audio, '-af', `afade=t=in:d=0.5,afade=t=out:st=${(duration - 2.5).toFixed(2)}:d=2.5`] : [],
        audio ? ['-c:a', 'aac', '-b:a', '256k', '-t', duration.toFixed(3)] : [],
        ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
      ),
      { stdio: ['pipe', 'inherit', 'inherit'] }
    )
    const total = Math.round(duration * fps)
    for (let index = 0; index <= total; index++) {
      if (!ffmpeg.stdin.write(await frame(index / fps))) await once(ffmpeg.stdin, 'drain')
      if (index % (fps * 5) === 0) console.log(`${Math.round((index / total) * 100)}%`)
    }
    ffmpeg.stdin.end()
    await once(ffmpeg, 'close')
    console.log(`Wrote ${out}${audio ? ` with ${audio}` : ' (no music)'}`)
  }
} finally {
  await close()
}
