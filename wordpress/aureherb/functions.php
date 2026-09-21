<?php
/**
 * AureHerb WooCommerce theme.
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AUREHERB_VERSION', '1.0.13');
define('AUREHERB_SHIPPING_FLAT', 249);
define('AUREHERB_FREE_SHIPPING_MIN', 3000);

function aureherb_asset($path)
{
    return get_template_directory_uri() . '/assets/' . ltrim($path, '/');
}

/**
 * Flat shipping amount for a product (0 when free-shipping threshold met).
 */
function aureherb_product_shipping_amount($product = null)
{
    $price = 0.0;
    if ($product && is_object($product) && method_exists($product, 'get_price')) {
        $price = (float) $product->get_price();
    }
    if ($price >= AUREHERB_FREE_SHIPPING_MIN) {
        return 0;
    }
    return (int) AUREHERB_SHIPPING_FLAT;
}

/**
 * Delivered total for a single product (price + shipping).
 */
function aureherb_product_delivered_total($product = null)
{
    $price = 0.0;
    if ($product && is_object($product) && method_exists($product, 'get_price')) {
        $price = (float) $product->get_price();
    }
    return (int) round($price + aureherb_product_shipping_amount($product));
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
    if (is_front_page()) {
        wp_enqueue_script('aureherb-testimonials', aureherb_asset('js/testimonials.js'), [], AUREHERB_VERSION, true);
        wp_enqueue_script('aureherb-hero', aureherb_asset('js/hero-video.js'), [], AUREHERB_VERSION, true);
    }
    if (function_exists('is_product') && is_product()) {
        wp_enqueue_script('aureherb-buy-now-bar', aureherb_asset('js/buy-now-bar.js'), [], AUREHERB_VERSION, true);
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

/** Buy now label on single product. */
add_filter('woocommerce_product_single_add_to_cart_text', function ($text) {
    return __('Buy now — Cash on delivery', 'aureherb');
});

/** Skip cart: go straight to checkout after add to cart. */
add_filter('woocommerce_add_to_cart_redirect', function ($url) {
    if (function_exists('wc_get_checkout_url')) {
        return wc_get_checkout_url();
    }
    return $url;
});

/** Delivered total + COD copy under Buy now. */
add_action('woocommerce_after_add_to_cart_button', function () {
    global $product;
    if (!$product || !is_object($product)) {
        return;
    }

    $price = (float) $product->get_price();
    $shipping = aureherb_product_shipping_amount($product);
    $total = aureherb_product_delivered_total($product);
    $price_fmt = number_format_i18n($price, 0);
    $ship_fmt = number_format_i18n($shipping, 0);
    $total_fmt = number_format_i18n($total, 0);
    ?>
    <div class="delivered-total" data-delivered-total>
      <p class="delivered-total-main">
        <?php
        echo esc_html(
            sprintf(
                /* translators: %s: delivered total amount */
                __('Total with delivery: Rs %s', 'aureherb'),
                $total_fmt
            )
        );
        ?>
      </p>
      <p class="delivered-total-sub">
        <?php
        if ($shipping > 0) {
            echo esc_html(
                sprintf(
                    /* translators: 1: product price 2: shipping amount */
                    __('Product Rs %1$s + shipping Rs %2$s · Pay on delivery', 'aureherb'),
                    $price_fmt,
                    $ship_fmt
                )
            );
        } else {
            echo esc_html__('Free shipping · Pay on delivery', 'aureherb');
        }
        ?>
      </p>
    </div>
    <?php
});

/** Sticky mobile buy bar on single product pages. */
add_action('wp_footer', function () {
    if (!function_exists('is_product') || !is_product()) {
        return;
    }
    global $product;
    if (!$product || !is_object($product)) {
        $product = wc_get_product(get_the_ID());
    }
    if (!$product) {
        return;
    }

    $total_fmt = number_format_i18n(aureherb_product_delivered_total($product), 0);
    ?>
    <div class="buy-now-bar" data-buy-now-bar hidden>
      <div class="buy-now-bar-inner">
        <p class="buy-now-bar-price">
          <?php
          echo esc_html(
              sprintf(
                  /* translators: %s: delivered total */
                  __('Rs %s delivered', 'aureherb'),
                  $total_fmt
              )
          );
          ?>
        </p>
        <button type="button" class="button buy-now-bar-btn" data-buy-now-trigger>
          <?php esc_html_e('Buy now', 'aureherb'); ?>
        </button>
      </div>
    </div>
    <?php
});

add_filter('woocommerce_default_address_fields', function ($fields) {
    if (isset($fields['postcode'])) {
        $fields['postcode']['required'] = false;
        $fields['postcode']['hidden'] = true;
    }
    if (isset($fields['company'])) {
        $fields['company']['required'] = false;
        $fields['company']['hidden'] = true;
    }
    if (isset($fields['address_2'])) {
        $fields['address_2']['required'] = false;
        $fields['address_2']['hidden'] = true;
    }
    if (isset($fields['state'])) {
        $fields['state']['required'] = false;
        $fields['state']['hidden'] = true;
    }
    if (isset($fields['last_name'])) {
        $fields['last_name']['required'] = false;
        $fields['last_name']['hidden'] = true;
    }
    if (isset($fields['first_name'])) {
        $fields['first_name']['label'] = __('Full name', 'aureherb');
        $fields['first_name']['class'] = ['form-row-wide'];
    }
    if (isset($fields['address_1'])) {
        $fields['address_1']['label'] = __('Address', 'aureherb');
    }
    return $fields;
});

add_filter('woocommerce_checkout_fields', function ($fields) {
    $remove_billing = [
        'billing_postcode',
        'billing_company',
        'billing_address_2',
        'billing_state',
        'billing_last_name',
    ];
    foreach ($remove_billing as $key) {
        unset($fields['billing'][$key]);
    }

    $remove_shipping = [
        'shipping_postcode',
        'shipping_company',
        'shipping_address_2',
        'shipping_state',
        'shipping_last_name',
    ];
    foreach ($remove_shipping as $key) {
        unset($fields['shipping'][$key]);
    }

    if (isset($fields['billing']['billing_first_name'])) {
        $fields['billing']['billing_first_name']['label'] = __('Full name', 'aureherb');
        $fields['billing']['billing_first_name']['class'] = ['form-row-wide'];
        $fields['billing']['billing_first_name']['priority'] = 10;
    }
    if (isset($fields['billing']['billing_phone'])) {
        $fields['billing']['billing_phone']['required'] = true;
        $fields['billing']['billing_phone']['priority'] = 20;
    }
    if (isset($fields['billing']['billing_email'])) {
        $fields['billing']['billing_email']['required'] = false;
        $fields['billing']['billing_email']['priority'] = 25;
    }
    if (isset($fields['billing']['billing_country'])) {
        $fields['billing']['billing_country']['priority'] = 30;
    }
    if (isset($fields['billing']['billing_city'])) {
        $fields['billing']['billing_city']['required'] = true;
        $fields['billing']['billing_city']['priority'] = 40;
    }
    if (isset($fields['billing']['billing_address_1'])) {
        $fields['billing']['billing_address_1']['label'] = __('Address', 'aureherb');
        $fields['billing']['billing_address_1']['required'] = true;
        $fields['billing']['billing_address_1']['priority'] = 50;
    }

    unset($fields['order']['order_comments']);
    unset($fields['account']);

    return $fields;
});

/** Woo often requires last name — fill a placeholder when we only collect full name. */
add_filter('woocommerce_checkout_posted_data', function ($data) {
    if (empty($data['billing_last_name']) && !empty($data['billing_first_name'])) {
        $data['billing_last_name'] = '-';
    }
    if (empty($data['shipping_last_name']) && !empty($data['shipping_first_name'])) {
        $data['shipping_last_name'] = '-';
    }
    if (empty($data['shipping_last_name']) && !empty($data['billing_first_name'])) {
        $data['shipping_last_name'] = '-';
    }
    return $data;
});

add_filter('woocommerce_billing_fields', function ($fields) {
    if (isset($fields['billing_last_name'])) {
        unset($fields['billing_last_name']);
    }
    return $fields;
});

/** Allow guest checkout without email when phone is present. */
add_filter('woocommerce_checkout_fields', function ($fields) {
    if (isset($fields['billing']['billing_email'])) {
        $fields['billing']['billing_email']['required'] = false;
    }
    return $fields;
}, 20);

add_action('woocommerce_after_checkout_validation', function ($data, $errors) {
    if (!$errors instanceof WP_Error) {
        return;
    }
    // Drop last-name errors when we only collect a full name.
    $codes = $errors->get_error_codes();
    foreach ($codes as $code) {
        if (strpos((string) $code, 'billing_last_name') !== false || strpos((string) $code, 'shipping_last_name') !== false) {
            $errors->remove($code);
        }
    }
}, 10, 2);

/** Trust line above Place order. */
add_action('woocommerce_review_order_before_submit', function () {
    echo '<p class="checkout-trust-note">' . esc_html__('Pay when the parcel arrives · Shipping already included in the total above.', 'aureherb') . '</p>';
});

/** Prefer guest checkout — no account nudge. */
add_filter('woocommerce_enable_order_notes_field', '__return_false');

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
