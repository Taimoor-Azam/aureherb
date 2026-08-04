import { Metadata } from "next"

import LegalPage from "@modules/content/components/legal-page"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using the AureHerb website and store.",
}

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Terms of Use" lastUpdated="August 4, 2026">
      <p>
        Welcome to AureHerb. By accessing or using{" "}
        <a href="https://www.aureherb.com">www.aureherb.com</a> (the
        &quot;Site&quot;), you agree to these Terms of Use. If you do not agree,
        please do not use the Site.
      </p>

      <h2>Using the Site</h2>
      <p>
        You may use the Site to browse products, place orders, manage your
        account, and track orders. You agree to provide accurate information and
        not to misuse the Site, interfere with its operation, or attempt
        unauthorized access to our systems or other users&apos; data.
      </p>

      <h2>Accounts</h2>
      <p>
        You may create an account with email and password or sign in with
        Google. You are responsible for keeping your login credentials secure
        and for activity that occurs under your account. Please contact us
        promptly if you believe your account has been compromised.
      </p>

      <h2>Products and orders</h2>
      <p>
        Product descriptions, prices, and availability may change without
        notice. When you place an order, you offer to purchase the listed items
        under these Terms. We may accept, decline, or cancel an order if a
        product is unavailable, pricing is incorrect, or we suspect fraud or
        misuse.
      </p>
      <p>
        Cash on delivery (COD) and other payment options shown at checkout are
        subject to availability in your area. You agree to pay the total amount
        due for accepted orders, including shipping where applicable.
      </p>

      <h2>Shipping and delivery</h2>
      <p>
        Delivery times are estimates and may vary based on location, courier
        capacity, and other factors outside our control. Risk of loss passes to
        you when the order is delivered according to the shipping details you
        provide.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on the Site — including branding, text, images, and product
        materials — is owned by AureHerb or its licensors and is protected by
        applicable intellectual property laws. You may not copy, modify, or
        distribute Site content without our prior written permission.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The Site and products are provided on an &quot;as is&quot; and
        &quot;as available&quot; basis. To the fullest extent permitted by law,
        we disclaim warranties of merchantability, fitness for a particular
        purpose, and non-infringement. Product information is for general
        guidance and is not medical advice.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, AureHerb is not liable for
        indirect, incidental, special, consequential, or punitive damages, or
        for any loss of profits, data, or goodwill arising from your use of the
        Site or products. Our total liability for any claim related to the Site
        or an order is limited to the amount you paid for the products giving
        rise to the claim.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Site
        after changes are posted means you accept the updated Terms. The
        &quot;Last updated&quot; date at the top of this page will change when
        we revise them.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:info.aure.herb@gmail.com">info.aure.herb@gmail.com</a>.
      </p>
    </LegalPage>
  )
}
