import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  loadReportSnapshots,
  parseDateRange,
  summarizeSnapshots,
} from "../../../../utils/profit-loss"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const range = parseDateRange(
    req.query.from as string | undefined,
    req.query.to as string | undefined
  )

  if (!range) {
    return res.status(400).json({
      message: "from and to query parameters (ISO dates) are required",
    })
  }

  const snapshots = await loadReportSnapshots(req.scope, range)
  const summary = summarizeSnapshots(snapshots)

  res.json({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    ...summary,
  })
}
