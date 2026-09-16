#!/usr/bin/env node
/**
 * Deploy wordpress/aureherb using Hostinger OAuth credentials
 * (~/.config/hostinger-mcp/credentials.json) or HOSTINGER_API_TOKEN.
 */
import { createRequire } from "node:module"
import { createReadStream, existsSync, readdirSync, statSync, readFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const themePath = path.join(root, "wordpress", "aureherb")
const DOMAIN = "aureherb.com"
const SLUG = "aureherb"
const ACTIVATE = true
const API = "https://developers.hostinger.com"

const npxPkg = path.join(
  os.homedir(),
  ".npm/_npx/a7204b5813574340/node_modules/hostinger-api-mcp/package.json"
)
const requireFrom = createRequire(npxPkg)
const axios = requireFrom("axios")
const tus = requireFrom("tus-js-client")

function getToken() {
  const env =
    process.env.HOSTINGER_API_TOKEN ||
    process.env.API_TOKEN ||
    process.env.APITOKEN
  if (env) return env
  const credsPath = path.join(os.homedir(), ".config", "hostinger-mcp", "credentials.json")
  const creds = JSON.parse(readFileSync(credsPath, "utf8"))
  if (!creds.access_token) throw new Error("No access_token in credentials.json")
  return creds.access_token
}

function scanDir(dirPath, basePath = dirPath) {
  const files = []
  for (const item of readdirSync(dirPath)) {
    const itemPath = path.join(dirPath, item)
    const stats = statSync(itemPath)
    if (stats.isDirectory()) files.push(...scanDir(itemPath, basePath))
    else if (stats.isFile()) {
      files.push({
        absolutePath: itemPath,
        relativePath: path.relative(basePath, itemPath).replace(/\\/g, "/"),
      })
    }
  }
  return files
}

function randomSuffix(n = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let s = ""
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

async function api(token, method, urlPath, data) {
  const resp = await axios({
    method,
    url: `${API}/${urlPath.replace(/^\//, "")}`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    data,
    timeout: 120000,
    validateStatus: () => true,
  })
  if (resp.status >= 400) {
    throw new Error(`${method} ${urlPath} → ${resp.status}: ${JSON.stringify(resp.data)}`)
  }
  return resp.data
}

function uploadFile(filePath, relativePath, uploadUrl, authRestToken, authToken) {
  return new Promise(async (resolve, reject) => {
    try {
      const stats = statSync(filePath)
      const clean = uploadUrl.replace(/\/$/, "")
      const uploadUrlWithFile = `${clean}/${relativePath}?override=true`
      const headers = {
        "X-Auth": authToken,
        "X-Auth-Rest": authRestToken,
        "upload-length": String(stats.size),
        "upload-offset": "0",
      }

      await axios.post(uploadUrlWithFile, "", {
        headers,
        timeout: 120000,
        validateStatus: (s) => s === 201,
      })

      const upload = new tus.Upload(createReadStream(filePath), {
        uploadUrl: uploadUrlWithFile,
        retryDelays: [1000, 2000, 4000, 8000],
        uploadDataDuringCreation: false,
        parallelUploads: 1,
        chunkSize: 10485760,
        headers,
        removeFingerprintOnSuccess: true,
        uploadSize: stats.size,
        metadata: { filename: path.basename(relativePath) },
        onError: (err) => reject(new Error(`Upload failed ${relativePath}: ${err.message}`)),
        onSuccess: () => resolve(relativePath),
      })
      upload.start()
    } catch (err) {
      reject(err)
    }
  })
}

if (!existsSync(path.join(themePath, "style.css"))) {
  console.error("Theme missing:", themePath)
  process.exit(1)
}

const token = getToken()
console.error("Resolving website…")
const websites = await api(token, "get", `api/hosting/v1/websites?domain=${encodeURIComponent(DOMAIN)}`)
const username = websites.data?.[0]?.username
if (!username) throw new Error("username not found")
console.error("username=", username)

const uploadDirName = `${SLUG}-${randomSuffix()}`
const files = scanDir(themePath)
console.error(`Uploading ${files.length} files to wp-content/themes/${uploadDirName}/`)

const uploadCreds = await api(token, "post", "api/hosting/v1/files/upload-urls", {
  username,
  domain: DOMAIN,
})
const { url: uploadUrl, auth_key: authToken, rest_auth_key: authRestToken } = uploadCreds
if (!uploadUrl || !authToken || !authRestToken) {
  throw new Error("Invalid upload credentials")
}

let ok = 0
for (const f of files) {
  const remote = `wp-content/themes/${uploadDirName}/${f.relativePath}`
  process.stderr.write(`  ${remote}… `)
  await uploadFile(f.absolutePath, remote, uploadUrl, authRestToken, authToken)
  console.error("ok")
  ok++
}

console.error(`Uploaded ${ok}/${files.length}. Activating theme…`)
const deploy = await api(
  token,
  "post",
  `api/hosting/v1/accounts/${username}/websites/${DOMAIN}/wordpress/themes/deploy`,
  {
    slug: SLUG,
    theme_path: uploadDirName,
    is_activated: ACTIVATE,
  }
)

console.log(JSON.stringify({ status: "success", uploadDirName, deploy }, null, 2))
