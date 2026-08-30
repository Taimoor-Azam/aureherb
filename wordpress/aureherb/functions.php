<?php
/**
 * AureHerb WooCommerce theme.
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AUREHERB_VERSION', '1.0.0');

function aureherb_asset($path)
{
    return get_template_directory_uri() . '/assets/' . ltrim($path, '/');
}

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', [
        'height' => 72,
        'width' => 72,
        'flex-height' => true,
        'flex-width' => true,
    ]);
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    register_nav_menus([
        'primary' => __('Primary', 'aureherb'),
        'footer' => __('Footer help', 'aureherb'),
    ]);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'aureherb-fonts',
        'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Source+Sans+3:wght@400;500;600&display=swap',
        [],
        null
    );
    wp_enqueue_style('aureherb-style', get_stylesheet_uri(), ['aureherb-fonts'], AUREHERB_VERSION);
    wp_enqueue_script('aureherb-nav', aureherb_asset('js/nav.js'), [], AUREHERB_VERSION, true);
    wp_enqueue_script('aureherb-testimonials', aureherb_asset('js/testimonials.js'), [], AUREHERB_VERSION, true);
    if (is_front_page()) {
        wp_enqueue_script('aureherb-hero', aureherb_asset('js/hero-video.js'), [], AUREHERB_VERSION, true);
    }
});

add_filter('woocommerce_enqueue_styles', function ($styles) {
    return $styles;
});

add_action('after_switch_theme', function () {
    if (get_option('aureherb_setup_done')) {
        return;
    }

    update_option('woocommerce_currency', 'PKR');
    update_option('woocommerce_default_country', 'PK');
    update_option('woocommerce_currency_pos', 'left');
    update_option('woocommerce_price_thousand_sep', ',');
    update_option('woocommerce_price_decimal_sep', '.');
    update_option('woocommerce_price_num_decimals', '0');
    update_option('aureherb_setup_done', 1);
});

add_action('woocommerce_after_add_to_cart_button', function () {
    echo '<p class="cod-note">Cash on delivery available in Pakistan. Shipping Rs 249, free on orders Rs 3,000+.</p>';
});

function aureherb_cart_count()
{
    if (!function_exists('WC') || !WC()->cart) {
        return 0;
    }
    return WC()->cart->get_cart_contents_count();
}

function aureherb_shop_url()
{
    if (function_exists('wc_get_page_permalink')) {
        return wc_get_page_permalink('shop');
    }
    return home_url('/shop/');
}
