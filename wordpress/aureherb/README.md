# AureHerb WordPress / WooCommerce theme

This folder is a drop-in theme for Hostinger WordPress. It matches the current Next.js shop look (sand palette, Fraunces, hero video, COD copy). It does **not** replace Medusa until you install WordPress and switch DNS.

## Install on Hostinger

1. In hPanel, install **WordPress** on `aureherb.com` (Auto Installer). Do not use the Node.js “build this repo” app for the live shop.
2. Install the **WooCommerce** plugin.
3. Copy this directory to:

   `public_html/wp-content/themes/aureherb/`

   Zip the `aureherb` folder and upload via Appearance → Themes → Add New → Upload, or copy files over SFTP.
4. Appearance → Themes → **Activate AureHerb**.
5. WooCommerce → Settings:
   - Currency **PKR**, selling location **Pakistan** (the theme sets these on first activate).
   - Payments: enable **Cash on delivery**.
   - Shipping: flat Rs **249**, free shipping at **Rs 3,000**.
6. Add product **AureHerb Hair Growth Oil** with PKR price and images.
7. Pages: WooCommerce creates Shop, Cart, Checkout, My Account. Create:
   - **Privacy Policy** and **Terms of Use** (footer links `/privacy-policy/` and `/terms-of-use/`).
   - **Track Your Order** at `/track-order/` with the `[woocommerce_order_tracking]` shortcode.
8. Point `@` / `www` DNS at this WordPress site. Stop the Hostinger Node.js deploy of this GitHub repo.
9. When the shop is live on WordPress, you can stop Railway and remove the `api` CNAME.

## Hero video

Homepage uses `assets/videos/hair-oiling-ritual.mp4` with the same muted loop and bottom fade as the Next.js site. Visitors with `prefers-reduced-motion` see the static banner instead.

## What is not ported

Google SSO, Medusa admin (profit/cost), and existing Medusa orders. Catalog must be entered in WooCommerce (or imported later).
