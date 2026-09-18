<?php
/**
 * Plugin Name: AureHerb analytics
 * Description: GA4 / GTM, Meta Pixel, and Microsoft Clarity with WooCommerce funnel events (ViewContent, AddToCart, InitiateCheckout, Purchase).
 * Version: 1.0.1
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AUREHERB_ANALYTICS_VERSION', '1.0.1');
define('AUREHERB_ANALYTICS_PATH', plugin_dir_path(__FILE__));
define('AUREHERB_ANALYTICS_URL', plugin_dir_url(__FILE__));

require_once AUREHERB_ANALYTICS_PATH . 'includes/settings.php';
require_once AUREHERB_ANALYTICS_PATH . 'includes/frontend.php';
require_once AUREHERB_ANALYTICS_PATH . 'includes/events.php';
