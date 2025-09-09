import { NextResponse } from 'next/server'
import path from 'path'
import { readFile } from 'fs/promises'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url') || ''

    // If no URL, serve default
    if (!url) {
      const file = await readDefault()
      const ab = toArrayBuffer(file)
      return new NextResponse(ab, { headers: { 'Content-Type': 'image/png' } })
    }

    // If it's a data URL or local asset, just redirect to it
    if (url.startsWith('data:image')) {
      return NextResponse.redirect(url)
    }
    if (url.startsWith('/')) {
      return NextResponse.redirect(url)
    }

    // Fetch remote image; if not ok, fall back to default
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.ok && res.body) {
        const headers = new Headers(res.headers)
        headers.set('Cache-Control', 'public, max-age=3600')
        return new NextResponse(res.body as unknown as ReadableStream, { headers })
      }
    } catch {}

    const file = await readDefault()
    const ab = toArrayBuffer(file)
    return new NextResponse(ab, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' } })
  } catch {
    const file = await readDefault()
    const ab = toArrayBuffer(file)
    return new NextResponse(ab, { headers: { 'Content-Type': 'image/png' } })
  }
}

async function readDefault(): Promise<Uint8Array> {
  const filePath = path.join(process.cwd(), 'public', 'logo2.png')
  try {
    const buf = await readFile(filePath)
    return new Uint8Array(buf)
  } catch {
    // In case asset missing, return 1x1 png
    const onePx = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAk8B5s3kq/MAAAAASUVORK5CYII=',
      'base64'
    )
    return new Uint8Array(onePx)
  }
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  // Create a detached ArrayBuffer with the same bytes to satisfy TS/runtime
  const copy = new Uint8Array(u8.byteLength)
  copy.set(u8)
  return copy.buffer
}


