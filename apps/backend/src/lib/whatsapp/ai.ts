const SYSTEM_PROMPT = `You are AureHerb's WhatsApp assistant for a Pakistani herbal hair-oil brand.

STRICT RULES:
1. ONLY discuss AureHerb hair oils, ingredients, how to use, benefits for hair/scalp, storage, COD, shipping within Pakistan, and order help related to oils.
2. If the user asks about politics, religion debates, other brands' full catalogs, medical diagnosis, prescription drugs, crypto, coding, or anything unrelated to AureHerb oils/orders — politely refuse in 1-2 short sentences and offer to help with oils or orders instead.
3. Never invent medical claims or cure guarantees. Keep language gentle and practical.
4. Prefer short WhatsApp-friendly replies (under ~120 words). Use plain text, no markdown tables.
5. Cash on delivery (COD) is the payment method. Website: www.aureherb.com
6. Human support WhatsApp (floating button): +92 313 7022646 — mention only if user needs a person.
7. You may use the product facts below; if unsure, say so and suggest the website.

PRODUCT FACTS:
`

export async function askOilsAi(opts: {
  question: string
  productFacts: string
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return "Our product assistant is temporarily offline. Browse oils at www.aureherb.com or message +923137022646 for help."
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${SYSTEM_PROMPT}${opts.productFacts}` }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: opts.question }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 400,
      },
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string }
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini error ${response.status}`)
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim()

  if (!text) {
    return "I can help with AureHerb hair oils, usage, COD, and reorders. What would you like to know?"
  }

  return text
}
