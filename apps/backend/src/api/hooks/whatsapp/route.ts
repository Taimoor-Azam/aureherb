import { createHmac, timingSafeEqual } from "crypto"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { extractInboundMessages, handleInboundWhatsApp } from "../../../lib/whatsapp/handler"
import { isWhatsAppConfigured } from "../../../lib/whatsapp/client"

function getRawBody(req: MedusaRequest): string {
  const anyReq = req as MedusaRequest & { rawBody?: Buffer | string }
  if (typeof anyReq.rawBody === "string") {
    return anyReq.rawBody
  }
  if (Buffer.isBuffer(anyReq.rawBody)) {
    return anyReq.rawBody.toString("utf8")
  }
  // Fallback: re-serialize parsed JSON (less ideal than true raw body)
  return typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {})
}

function verifyMetaSignature(req: MedusaRequest): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) {
    // Meta challenge works without this; set WHATSAPP_APP_SECRET in production.
    return true
  }

  const signatureHeader = req.headers["x-hub-signature-256"]
  const signature = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader

  if (!signature?.startsWith("sha256=")) {
    return false
  }

  const expected = createHmac("sha256", appSecret)
    .update(getRawBody(req), "utf8")
    .digest("hex")
  const received = signature.slice("sha256=".length)

  try {
    const a = Buffer.from(expected, "hex")
    const b = Buffer.from(received, "hex")
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Meta webhook verification challenge.
 * GET https://api.aureherb.com/hooks/whatsapp
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
    res.status(200).send(String(challenge ?? ""))
    return
  }

  res.sendStatus(403)
}

/**
 * Inbound WhatsApp Cloud API events.
 * Respond 200 quickly, then process messages asynchronously.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  if (!verifyMetaSignature(req)) {
    logger.warn("whatsapp webhook: invalid signature")
    res.sendStatus(401)
    return
  }

  // Acknowledge immediately so Meta does not retry
  res.sendStatus(200)

  if (!isWhatsAppConfigured()) {
    logger.warn("whatsapp webhook: received event but WhatsApp env is not configured")
    return
  }

  const messages = extractInboundMessages(req.body)
  if (!messages.length) {
    return
  }

  // Fire-and-forget processing (errors logged inside handler)
  void (async () => {
    for (const message of messages) {
      await handleInboundWhatsApp(req.scope, message)
    }
  })().catch((error) => {
    logger.error("whatsapp webhook async processing failed", error)
  })
}
