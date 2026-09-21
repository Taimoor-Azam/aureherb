<?php
/**
 * AureHerb WooCommerce theme.
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AUREHERB_VERSION', '1.0.15');
define('AUREHERB_SHIPPING_FLAT', 0);
define('AUREHERB_FREE_SHIPPING_MIN', 0);

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

/**
 * Block checkout ignores classic field filters. Render classic shortcode instead
 * so slim COD fields + trust note work, while keeping sibling page content
 * (e.g. Google sign-in) intact.
 */
add_filter('render_block', function ($block_content, $block) {
    if (($block['blockName'] ?? '') !== 'woocommerce/checkout') {
        return $block_content;
    }
    if (!function_exists('is_checkout') || !is_checkout()) {
        return $block_content;
    }
    return do_shortcode('[woocommerce_checkout]');
}, 10, 2);

/** Hide optional address fields for Pakistan in locale (blocks + classic). */
add_filter('woocommerce_get_country_locale', function ($locale) {
    $hide = ['required' => false, 'hidden' => true];
    foreach (['default', 'PK'] as $key) {
        if (!isset($locale[$key]) || !is_array($locale[$key])) {
            $locale[$key] = [];
        }
        foreach (['postcode', 'company', 'address_2', 'last_name'] as $field) {
            $locale[$key][$field] = array_merge($locale[$key][$field] ?? [], $hide);
        }
        $locale[$key]['first_name'] = array_merge($locale[$key]['first_name'] ?? [], [
            'label' => __('Full name', 'aureherb'),
            'required' => true,
        ]);
        $locale[$key]['state'] = array_merge($locale[$key]['state'] ?? [], [
            'label' => __('Province', 'aureherb'),
            'required' => true,
            'hidden' => false,
        ]);
        $locale[$key]['city'] = array_merge($locale[$key]['city'] ?? [], ['required' => true]);
        $locale[$key]['address_1'] = array_merge($locale[$key]['address_1'] ?? [], [
            'label' => __('Address', 'aureherb'),
            'required' => true,
        ]);
        // Country stays PK; hide from UI (value still posted via checkout field filters).
        $locale[$key]['country'] = array_merge($locale[$key]['country'] ?? [], [
            'required' => false,
            'hidden' => true,
        ]);
    }
    return $locale;
});

/** Default checkout destination to Pakistan so free delivery zone matches. */
add_filter('default_checkout_billing_country', function () {
    return 'PK';
});
add_filter('default_checkout_shipping_country', function () {
    return 'PK';
});
add_filter('woocommerce_customer_default_location', function () {
    return 'PK';
});
add_filter('woocommerce_ship_to_billing_address_only', '__return_true');
add_filter('woocommerce_cart_needs_shipping_address', '__return_false');

/** Prefer the single available rate (free delivery) when Woo has not chosen one yet. */
add_filter('woocommerce_shipping_chosen_method', function ($method, $available_methods, $package = []) {
    if (!empty($method) && isset($available_methods[$method])) {
        return $method;
    }
    if (is_array($available_methods) && count($available_methods) === 1) {
        return (string) array_key_first($available_methods);
    }
    if (is_array($available_methods)) {
        foreach ($available_methods as $id => $rate) {
            if (is_object($rate) && strpos((string) $id, 'free_shipping') === 0) {
                return (string) $id;
            }
        }
        if (!empty($available_methods)) {
            return (string) array_key_first($available_methods);
        }
    }
    return $method;
}, 10, 3);

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
    return __('Buy Now', 'aureherb');
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
        $fields['state']['label'] = __('Province', 'aureherb');
        $fields['state']['required'] = true;
        $fields['state']['hidden'] = false;
        $fields['state']['class'] = ['form-row-wide'];
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
    if (isset($fields['country'])) {
        $fields['country']['required'] = false;
        $fields['country']['hidden'] = true;
        $fields['country']['default'] = 'PK';
    }
    return $fields;
});

add_filter('woocommerce_checkout_fields', function ($fields) {
    $remove_billing = [
        'billing_postcode',
        'billing_company',
        'billing_address_2',
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
        'shipping_country',
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
        $fields['billing']['billing_email']['required'] = true;
        $fields['billing']['billing_email']['priority'] = 25;
    }
    // Keep country select in the DOM (value PK) so province options load; hide via CSS.
    if (isset($fields['billing']['billing_country'])) {
        $fields['billing']['billing_country']['required'] = true;
        $fields['billing']['billing_country']['default'] = 'PK';
        $fields['billing']['billing_country']['class'] = ['form-row-wide', 'aureherb-hidden-country'];
        $fields['billing']['billing_country']['priority'] = 30;
    }
    if (isset($fields['billing']['billing_city'])) {
        $fields['billing']['billing_city']['required'] = true;
        $fields['billing']['billing_city']['priority'] = 40;
    }
    if (isset($fields['billing']['billing_state'])) {
        $fields['billing']['billing_state']['label'] = __('Province', 'aureherb');
        $fields['billing']['billing_state']['required'] = true;
        $fields['billing']['billing_state']['class'] = ['form-row-wide'];
        $fields['billing']['billing_state']['priority'] = 45;
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
    if (empty($data['billing_country'])) {
        $data['billing_country'] = 'PK';
    }
    if (empty($data['shipping_country'])) {
        $data['shipping_country'] = 'PK';
    }
    return $data;
});

add_filter('woocommerce_billing_fields', function ($fields) {
    if (isset($fields['billing_last_name'])) {
        unset($fields['billing_last_name']);
    }
    return $fields;
});

/** Force customer session country to PK so rates calculate before address entry. */
add_action('woocommerce_checkout_init', function () {
    if (!function_exists('WC') || !WC()->customer) {
        return;
    }
    WC()->customer->set_billing_country('PK');
    WC()->customer->set_shipping_country('PK');
}, 5);

add_action('woocommerce_before_calculate_totals', function () {
    if (!function_exists('WC') || !WC()->customer) {
        return;
    }
    if (WC()->customer->get_billing_country() !== 'PK') {
        WC()->customer->set_billing_country('PK');
    }
    if (WC()->customer->get_shipping_country() !== 'PK') {
        WC()->customer->set_shipping_country('PK');
    }
}, 5);

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
    echo '<p class="checkout-trust-note">' . esc_html__('Pay when the parcel arrives · Free shipping on COD.', 'aureherb') . '</p>';
});

/** Prefer guest checkout — no account nudge. */
add_filter('woocommerce_enable_order_notes_field', '__return_false');

/**
 * Keep Track Order working even if the page body is emptied.
 * WooCommerce guest tracking: order ID + billing email.
 */
add_filter('the_content', function ($content) {
    if (is_admin() || !is_page()) {
        return $content;
    }
    if (!is_page('track-order')) {
        return $content;
    }
    if (strpos($content, 'woocommerce_order_tracking') !== false || strpos($content, 'track_order') !== false) {
        return $content;
    }
    $intro = '<p>' . esc_html__('Enter your order number and the email or phone used at checkout to see status.', 'aureherb') . '</p>';
    return $intro . do_shortcode('[woocommerce_order_tracking]');
}, 20);

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
