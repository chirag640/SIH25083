import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

let startTime = Date.now()

export async function GET() {
  const uptimeMs = Date.now() - startTime

  let name = 'migrant-worker-system'
  let version = '0.0.0'

  try {
    const pkgPath = path.join(process.cwd(), 'package.json')
    const raw = await fs.promises.readFile(pkgPath, 'utf-8')
    const parsed = JSON.parse(raw)
    name = parsed.name || name
    version = parsed.version || version
  } catch (err) {
    // fail silently and use defaults
  }

  return NextResponse.json({
    name,
    version,
    uptimeMs,
    status: 'ok',
    now: new Date().toISOString()
  })
}
