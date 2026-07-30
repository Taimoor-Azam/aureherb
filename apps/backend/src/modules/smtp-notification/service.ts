import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer, { type Transporter } from "nodemailer"

type InjectedDependencies = {
  logger: Logger
}

type SmtpNotificationOptions = {
  channels: string[]
  host?: string
  port?: number | string
  secure?: boolean | string
  user?: string
  pass?: string
  from?: string
}

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp-notification"

  protected logger_: Logger
  protected options_: SmtpNotificationOptions
  protected transporter_: Transporter

  constructor({ logger }: InjectedDependencies, options: SmtpNotificationOptions) {
    super()
    this.logger_ = logger
    this.options_ = options

    const port = Number(options.port ?? 587)
    const secure =
      options.secure === true ||
      options.secure === "true" ||
      port === 465

    this.transporter_ = nodemailer.createTransport({
      host: options.host || "smtp.gmail.com",
      port,
      secure,
      auth: {
        user: options.user,
        pass: options.pass,
      },
    })
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.user) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP_USER (options.user) is required for the SMTP notification provider."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP_FROM (options.from) is required for the SMTP notification provider."
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (!this.options_.pass) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP_PASS is not configured. Set a Gmail App Password for info.aure.herb@gmail.com."
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
        "Notification content.html or content.text is required for SMTP emails."
      )
    }

    const info = await this.transporter_.sendMail({
      from: notification.from || this.options_.from,
      to: notification.to,
      subject: subject || "AureHerb notification",
      html,
      text,
      attachments: notification.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.content_type,
        contentDisposition: attachment.disposition as "attachment" | "inline" | undefined,
        cid: attachment.id,
      })),
    })

    this.logger_.info(
      `SMTP email sent to ${notification.to} (messageId=${info.messageId})`
    )

    return {
      id: info.messageId,
    }
  }
}

export default SmtpNotificationProviderService
