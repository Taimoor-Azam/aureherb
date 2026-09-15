#!/usr/bin/env node
/**
 * Deploy wordpress/aureherb to Hostinger WordPress (aureherb.com).
 *
 * Auth (required — without it Hostinger MCP calls hang on OAuth):
 *   export HOSTINGER_API_TOKEN=...   # hPanel → Account → API
 *   # or: npx -y hostinger-api-mcp@latest --login
 *
 * Usage:
 *   node scripts/deploy-hostinger-theme.mjs
 *   node scripts/deploy-hostinger-theme.mjs --domain=aureherb.com
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const themePath = path.join(root, "wordpress", "aureherb")

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  if (hit) return hit.slice(name.length + 3)
  if (process.argv.includes(`--${name}`)) return true
  return fallback
}

const domain = arg("domain", "aureherb.com")
const slug = arg("slug", "aureherb")
const activate = arg("activate", "true") !== "false"

if (!existsSync(path.join(themePath, "style.css"))) {
  console.error(`Theme missing: ${themePath}`)
  process.exit(1)
}

const hasToken = !!(
  process.env.HOSTINGER_API_TOKEN ||
  process.env.API_TOKEN ||
  process.env.APITOKEN
)
const creds = path.join(os.homedir(), ".config", "hostinger-mcp", "credentials.json")
if (!hasToken && !existsSync(creds)) {
  console.error(`Hostinger auth missing.

Every Hostinger MCP API call hangs until OAuth finishes on this machine.

Fix one of:
  1) export HOSTINGER_API_TOKEN=<token from hPanel → Account → API>
  2) npx -y hostinger-api-mcp@latest --login
     (complete browser sign-in, then re-run this script)
`)
  process.exit(2)
}

const transport = new StdioClientTransport({
  command: "npx",
  args: ["--yes", "--package=hostinger-api-mcp@latest", "hostinger-hosting-mcp"],
  env: { ...process.env, USER_AGENT: "aureherb-deploy-script;1.0" },
})

const client = new Client({ name: "aureherb-theme-deploy", version: "1.0.0" })
await client.connect(transport)

console.error(`Deploying theme ${themePath} → ${domain} (activate=${activate})…`)
const result = await client.callTool({
  name: "hosting_deployWordpressTheme",
  arguments: {
    domain,
    slug,
    themePath,
    activate,
  },
})

console.log(JSON.stringify(result, null, 2))
await client.close()

const text = JSON.stringify(result)
if (/error|fail|timed? ?out/i.test(text) && !/successful/i.test(text)) {
  process.exit(1)
}
