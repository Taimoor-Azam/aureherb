import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

type ResendNotificationOptions = {
  channels: string[]
  api_key?: string
  from?: string
  reply_to?: string
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend-notification"

  protected logger_: Logger
  protected options_: ResendNotificationOptions

  constructor(
    { logger }: InjectedDependencies,
    options: ResendNotificationOptions
  ) {
    super()
    this.logger_ = logger
    this.options_ = options
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "RESEND_FROM (options.from) is required for the Resend notification provider."
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (!this.options_.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "RESEND_API_KEY is not configured."
      )
    }
    if (!notification.to) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Notification recipient (to) is required."
      )
    }

    const subject =
      notification.content?.subject ||
      (typeof notification.data?.subject === "string"
        ? notification.data.subject
        : notification.template)

    const html =
      notification.content?.html ||
      (typeof notification.data?.html === "string"
        ? notification.data.html
        : undefined)

    const text =
      notification.content?.text ||
      (typeof notification.data?.text === "string"
        ? notification.data.text
        : undefined)

    if (!html && !text) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Notification content.html or content.text is required for Resend emails."
      )
    }

    const body: Record<string, unknown> = {
      from: notification.from || this.options_.from,
      to: [notification.to],
      subject: subject || "AureHerb notification",
    }

    if (html) {
      body.html = html
    }
    if (text) {
      body.text = text
    }
    if (this.options_.reply_to) {
      body.reply_to = this.options_.reply_to
    }

    if (notification.attachments?.length) {
      body.attachments = notification.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, "binary").toString("base64"),
        content_type: attachment.content_type,
      }))
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options_.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      id?: string
      message?: string
      name?: string
    }

    if (!response.ok) {
      const message =
        payload.message || payload.name || `Resend HTTP ${response.status}`
      this.logger_.error(`Resend email failed: ${message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)
    }

    this.logger_.info(
      `Resend email sent to ${notification.to} (id=${payload.id || "unknown"})`
    )

    return {
      id: payload.id,
    }
  }
}

export default ResendNotificationProviderService
