type ReorderSession = {
  step: "awaiting_reorder_pick"
  orderIds: string[]
  updatedAt: number
}

const sessions = new Map<string, ReorderSession>()
const TTL_MS = 1000 * 60 * 30

function prune(phone: string) {
  const session = sessions.get(phone)
  if (session && Date.now() - session.updatedAt > TTL_MS) {
    sessions.delete(phone)
  }
}

export function getReorderSession(phone: string): ReorderSession | null {
  prune(phone)
  return sessions.get(phone) || null
}

export function setReorderSession(phone: string, orderIds: string[]) {
  sessions.set(phone, {
    step: "awaiting_reorder_pick",
    orderIds,
    updatedAt: Date.now(),
  })
}

export function clearReorderSession(phone: string) {
  sessions.delete(phone)
}
