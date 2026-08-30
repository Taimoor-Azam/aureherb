#!/usr/bin/env node
/**
 * Run Next/Medusa CLIs with `node <file>` so Hostinger does not need
 * executable bits on native binaries (turbo-linux-64 EACCES) or pnpm on PATH.
 */
const { spawnSync } = require("node:child_process")
const { createRequire } = require("node:module")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const cmd = process.argv[2]

function resolveFrom(pkgDir, id) {
  const requireFromPkg = createRequire(path.join(root, pkgDir, "package.json"))
  return requireFromPkg.resolve(id)
}

function run(pkgDir, moduleId, args) {
  const bin = resolveFrom(pkgDir, moduleId)
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd: path.join(root, pkgDir),
    stdio: "inherit",
    env: process.env,
  })
  if (result.status) {
    process.exit(result.status)
  }
}

if (cmd === "build") {
  run("apps/backend", "@medusajs/cli/cli.js", ["build"])
  run("apps/storefront", "next/dist/bin/next", ["build"])
} else if (cmd === "start") {
  const port = process.env.PORT || "8000"
  run("apps/storefront", "next/dist/bin/next", ["start", "-p", String(port)])
} else {
  console.error("Usage: node scripts/hostinger-cli.js build|start")
  process.exit(1)
}
