<?php
/**
 * Plugin Name: AureHerb SEO and AEO
 * Description: Titles, robots, llms.txt, schema, and one-shot SEO content for AureHerb.
 * Version: 1.0.6
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AUREHERB_SEO_VERSION', '1.0.6');
define('AUREHERB_SEO_FILE', __FILE__);
define('AUREHERB_SEO_DIR', plugin_dir_path(__FILE__));

require_once AUREHERB_SEO_DIR . 'includes/content.php';
require_once AUREHERB_SEO_DIR . 'includes/schema.php';
require_once AUREHERB_SEO_DIR . 'includes/robots.php';
require_once AUREHERB_SEO_DIR . 'includes/setup.php';
require_once AUREHERB_SEO_DIR . 'includes/admin.php';

add_action('init', 'aureherb_seo_register_llms', 5);
add_action('init', 'aureherb_seo_maybe_seed', 30);
add_filter('redirect_canonical', 'aureherb_seo_disable_llms_slash', 10, 2);
add_action('wp_head', 'aureherb_seo_print_meta', 1);
add_filter('document_title_parts', 'aureherb_seo_title_parts');
add_filter('wp_robots', 'aureherb_seo_robots_meta');
add_action('wp_head', 'aureherb_seo_print_jsonld', 30);
add_filter('rank_math/json_ld', 'aureherb_seo_filter_rank_math_ld', 20, 2);
add_filter('woocommerce_email_additional_content_customer_completed_order', 'aureherb_seo_review_request_email', 20, 3);

add_action('wp_enqueue_scripts', static function () {
    wp_enqueue_style(
        'aureherb-seo',
        plugins_url('assets/seo.css', AUREHERB_SEO_FILE),
        [],
        AUREHERB_SEO_VERSION
    );
});

function aureherb_seo_product_url()
{
    $product = get_page_by_path('hair-growth-oil', OBJECT, 'product');
    if ($product instanceof WP_Post) {
        return get_permalink($product);
    }
    return home_url('/product/hair-growth-oil/');
}

function aureherb_seo_register_llms()
{
    add_rewrite_rule('^llms\.txt/?$', 'index.php?aureherb_llms=1', 'top');
    add_rewrite_tag('%aureherb_llms%', '1');
}

function aureherb_seo_disable_llms_slash($redirect, $requested)
{
    unset($requested);
    $uri = isset($_SERVER['REQUEST_URI']) ? (string) wp_unslash($_SERVER['REQUEST_URI']) : '';
    if (preg_match('#/llms\.txt/?(\?.*)?$#', $uri)) {
        return false;
    }
    return $redirect;
}

add_filter('query_vars', static function ($vars) {
    $vars[] = 'aureherb_llms';
    return $vars;
});

add_action('template_redirect', static function () {
    if ((string) get_query_var('aureherb_llms') !== '1') {
        return;
    }
    nocache_headers();
    header('Content-Type: text/plain; charset=utf-8');
    echo aureherb_seo_llms_txt();
    exit;
});

function aureherb_seo_print_meta()
{
    if (defined('RANK_MATH_VERSION')) {
        return;
    }

    $title = wp_get_document_title();
    $desc = aureherb_seo_current_description();
    $url = (is_singular() ? get_permalink() : home_url('/'));
    $image = aureherb_seo_share_image();
    echo '<meta name="description" content="' . esc_attr($desc) . '">' . "\n";
    echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";
    echo '<meta property="og:type" content="' . (is_front_page() ? 'website' : 'article') . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($desc) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
    echo '<meta property="og:image" content="' . esc_url($image) . '">' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
}

function aureherb_seo_share_image()
{
    if (is_singular() && has_post_thumbnail()) {
        $src = wp_get_attachment_image_url(get_post_thumbnail_id(), 'full');
        if (is_string($src) && $src !== '') {
            return $src;
        }
    }
    if (function_exists('aureherb_asset')) {
        return aureherb_asset('images/aureherb-hair-growth-oil-banner.png');
    }
    return home_url('/wp-content/themes/aureherb-old-6a94872045ebb/assets/images/aureherb-hair-growth-oil-banner.png');
}

function aureherb_seo_current_description()
{
    if (is_front_page()) {
        return 'AureHerb is a Pakistan botanical hair-care shop. Buy AureHerb Hair Growth Oil — rosemary, castor, and black seed — with cash on delivery.';
    }
    if (is_singular()) {
        $custom = (string) get_post_meta(get_the_ID(), 'rank_math_description', true);
        if ($custom !== '') {
            return wp_strip_all_tags($custom);
        }
        $excerpt = get_the_excerpt();
        if (is_string($excerpt) && $excerpt !== '') {
            return wp_strip_all_tags($excerpt);
        }
    }
    return 'AureHerb Hair Growth Oil. Botanical hair care with cash on delivery in Pakistan.';
}

function aureherb_seo_title_parts($parts)
{
    if (is_front_page()) {
        $parts['title'] = 'AureHerb Hair Growth Oil | Botanical hair care in Pakistan';
        unset($parts['tagline'], $parts['site']);
    }
    return $parts;
}

function aureherb_seo_robots_meta($robots)
{
    if (function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page())) {
        $robots['noindex'] = true;
        $robots['nofollow'] = true;
    }
    return $robots;
}

function aureherb_seo_review_request_email($content, $order = null, $email = null)
{
    unset($order, $email);
    $url = aureherb_seo_product_url();
    $line = 'How is your Hair Growth Oil? A short review on the product page helps other customers in Pakistan: ' . $url;
    if (is_string($content) && strpos($content, 'How is your Hair Growth Oil?') !== false) {
        return $content;
    }
    return trim((string) $content . "\n\n" . $line);
}
