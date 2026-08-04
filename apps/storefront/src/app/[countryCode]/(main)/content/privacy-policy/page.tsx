import { Metadata } from "next"

import LegalPage from "@modules/content/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how AureHerb collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="August 4, 2026">
      <p>
        AureHerb (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates{" "}
        <a href="https://www.aureherb.com">www.aureherb.com</a>. This Privacy
        Policy explains how we collect, use, and share personal information when
        you browse our store, create an account, place an order, or contact us.
      </p>

      <h2>Information we collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>
          Account details such as name, email address, phone number, and
          password (if you register with email/password).
        </li>
        <li>
          Order and shipping details such as delivery address, order contents,
          and payment method (including cash on delivery information).
        </li>
        <li>
          Support messages you send us by email, WhatsApp, or other channels.
        </li>
        <li>
          Basic technical data such as browser type, device information, and
          pages visited, used to keep the site secure and working.
        </li>
      </ul>

      <h2>Google sign-in</h2>
      <p>
        If you choose <strong>Continue with Google</strong>, Google shares
        limited profile information with us (typically your name and email
        address) so we can create or sign you into your AureHerb account. We do
        not receive your Google password. You can disconnect Google access from
        your Google Account settings at any time.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and fulfill orders, including delivery and updates.</li>
        <li>To create and manage your customer account.</li>
        <li>To respond to questions, returns, and support requests.</li>
        <li>To improve our website, products, and customer experience.</li>
        <li>To detect and prevent fraud or misuse of our services.</li>
      </ul>

      <h2>How we share information</h2>
      <p>
        We do not sell your personal information. We may share information with
        trusted service providers who help us operate the store, such as:
      </p>
      <ul>
        <li>Hosting and infrastructure providers</li>
        <li>Email and notification providers</li>
        <li>Shipping and courier partners</li>
        <li>Payment or authentication providers (including Google for SSO)</li>
      </ul>
      <p>
        These partners may only use your information to perform services for us
        and must protect it appropriately. We may also disclose information if
        required by law.
      </p>

      <h2>Cookies and sessions</h2>
      <p>
        We use cookies and similar technologies for essential functions such as
        keeping you signed in, remembering your cart, and maintaining site
        security. You can control cookies through your browser settings, but
        some features may not work if cookies are disabled.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep personal information for as long as needed to fulfill orders,
        maintain accounts, meet legal or accounting requirements, and resolve
        disputes. When information is no longer needed, we delete or anonymize
        it where reasonably possible.
      </p>

      <h2>Your choices</h2>
      <p>
        Depending on applicable law, you may request access to, correction of,
        or deletion of your personal information. You may also ask us to update
        your account details or close your account. Contact us using the email
        below and we will respond as soon as reasonably possible.
      </p>

      <h2>Children</h2>
      <p>
        Our store is not directed to children under 13, and we do not knowingly
        collect personal information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last
        updated&quot; date at the top of this page will change when we do. Please
        review this page periodically.
      </p>

      <h2>Contact us</h2>
      <p>
        For privacy questions or requests, email{" "}
        <a href="mailto:info.aure.herb@gmail.com">info.aure.herb@gmail.com</a>.
      </p>
    </LegalPage>
  )
}
