# AureHerb analytics

GTM / GA4 / Clarity + optional Meta Pixel for WooCommerce funnel events.

When **Meta for WooCommerce** (`facebook-for-woocommerce`) is active, this plugin
**does not** inject Meta Pixel or fire `fbq` events. Meta for WooCommerce owns
Pixel + Conversions API with shared `event_id` / `eventID` keys for deduplication.
