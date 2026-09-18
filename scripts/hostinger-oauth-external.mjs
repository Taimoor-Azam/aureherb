#!/usr/bin/env node
/**
 * Hostinger OAuth for an external browser (your laptop).
 *
 * After login, copy the full callback URL from your address bar and run complete.
 */
import { createHash, randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const ISSUER = "https://auth.hostinger.com"
const REGISTER_PATH = "/api/external/v1/oauth-server/register"
const AUTHORIZE_PATH = "/api/external/v1/oauth-server/authorize"
const TOKEN_PATH = "/api/external/v1/oauth-server/token"
const CLIENT_NAME = "hostinger-mcp"
const EXPIRY_BUFFER_SECONDS = 60
const PENDING_PATH = "/tmp/hostinger-oauth-pending.json"
const REDIRECT_PORT = 40193

async function postForm(url, params) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })
  const text = await resp.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { status: resp.status, data }
}

async function postJson(url, body) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await resp.json()
  return { status: resp.status, data }
}

function credentialsPath() {
  return path.join(os.homedir(), ".config", "hostinger-mcp", "credentials.json")
}

async function loadCreds() {
  try {
    return JSON.parse(await readFile(credentialsPath(), "utf8"))
  } catch {
    return {}
  }
}

async function saveCreds(creds) {
  const p = credentialsPath()
  await mkdir(path.dirname(p), { recursive: true })
  await writeFile(p, JSON.stringify(creds, null, 2), { mode: 0o600 })
}

function pkce() {
  const verifier = randomBytes(32).toString("base64url")
  const challenge = createHash("sha256").update(verifier).digest("base64url")
  return { verifier, challenge }
}

async function registerClient(redirectUri) {
  const { status, data } = await postJson(`${ISSUER}${REGISTER_PATH}`, {
    client_name: CLIENT_NAME,
    redirect_uris: [redirectUri],
  })
  if (status >= 400 || !data?.client_id) {
    throw new Error(`Client registration failed (${status}): ${JSON.stringify(data)}`)
  }
  return data.client_id
}

async function start() {
  let creds = await loadCreds()
  const redirectUri = `http://127.0.0.1:${REDIRECT_PORT}/oauth/callback`

  if (!creds.client_id) {
    creds.client_id = await registerClient(redirectUri)
    await saveCreds({ client_id: creds.client_id })
  }

  const { verifier, challenge } = pkce()
  const state = randomBytes(16).toString("hex")

  const authorizeUrl = new URL(`${ISSUER}${AUTHORIZE_PATH}`)
  authorizeUrl.searchParams.set("client_id", creds.client_id)
  authorizeUrl.searchParams.set("redirect_uri", redirectUri)
  authorizeUrl.searchParams.set("state", state)
  authorizeUrl.searchParams.set("code_challenge", challenge)
  authorizeUrl.searchParams.set("code_challenge_method", "S256")
  authorizeUrl.searchParams.set("response_type", "code")

  await writeFile(
    PENDING_PATH,
    JSON.stringify(
      {
        client_id: creds.client_id,
        redirect_uri: redirectUri,
        code_verifier: verifier,
        state,
        authorize_url: authorizeUrl.toString(),
      },
      null,
      2
    )
  )

  console.log(`
=== Hostinger login (external browser) ===

1. Open this URL on your computer:

${authorizeUrl}

2. Sign in and approve access.

3. When the browser goes to http://127.0.0.1:${REDIRECT_PORT}/oauth/callback?... ,
   copy the ENTIRE address bar URL (connection error is OK).

4. Send that URL in chat, or run on the agent:

   node scripts/hostinger-oauth-external.mjs complete '<paste-url>'
`)
}

async function complete(callbackUrl) {
  const pending = JSON.parse(await readFile(PENDING_PATH, "utf8"))
  const url = new URL(callbackUrl.trim())

  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error) throw new Error(`OAuth error: ${error}`)
  if (!code) throw new Error("No code= in callback URL")
  if (state !== pending.state) throw new Error("OAuth state mismatch — run start again")

  const params = new URLSearchParams()
  params.set("grant_type", "authorization_code")
  params.set("code", code)
  params.set("code_verifier", pending.code_verifier)
  params.set("redirect_uri", pending.redirect_uri)
  params.set("client_id", pending.client_id)

  const { status, data } = await postForm(`${ISSUER}${TOKEN_PATH}`, params)
  if (status >= 400) {
    throw new Error(`Token exchange failed (${status}): ${JSON.stringify(data)}`)
  }

  await saveCreds({
    client_id: pending.client_id,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in - EXPIRY_BUFFER_SECONDS) * 1000,
  })

  console.log("Hostinger OAuth complete:", credentialsPath())
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === "start") await start()
else if (cmd === "complete") {
  if (!arg) {
    console.error("Usage: complete '<callback-url>'")
    process.exit(1)
  }
  await complete(arg)
} else {
  console.error("Usage: start | complete")
  process.exit(1)
}
