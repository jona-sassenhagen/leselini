#!/usr/bin/env node
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const frontendDir = path.resolve(__dirname, '..')
const repoRoot = path.resolve(frontendDir, '..')
const sourceDir = path.resolve(repoRoot, 'images')
const publicDir = path.resolve(frontendDir, 'public')
const publicImagesDir = path.resolve(publicDir, 'images')
const dataDir = path.resolve(frontendDir, 'src', 'data')
const manifestPath = path.resolve(dataDir, 'images-manifest.json')

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function cleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true })
  await ensureDir(dir)
}

async function scanImages() {
  try {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile())
      .filter((entry) => ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function copyImages(filenames) {
  for (const filename of filenames) {
    const sourcePath = path.resolve(sourceDir, filename)
    const destPath = path.resolve(publicImagesDir, filename)
    await fs.copyFile(sourcePath, destPath)
  }
}

async function writeManifest(filenames) {
  await ensureDir(dataDir)
  const images = filenames.map((filename) => {
    const ext = path.extname(filename)
    const stem = path.basename(filename, ext)
    return {
      filename,
      stem,
      path: `images/${filename}`,
    }
  })
  const manifest = {
    generatedAt: new Date().toISOString(),
    count: images.length,
    images,
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}

async function main() {
  await ensureDir(publicDir)
  const filenames = await scanImages()

  if (!filenames.length) {
    console.warn('[manifest] No images found in images/; generated manifest will be empty')
  }

  await cleanDir(publicImagesDir)
  await copyImages(filenames)
  await writeManifest(filenames)
}

main().catch((error) => {
  console.error('[manifest] Failed to generate manifest:', error)
  process.exit(1)
})
