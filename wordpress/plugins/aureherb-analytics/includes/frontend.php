<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Meta for WooCommerce already sends Pixel + Conversions API with shared event IDs.
 * A second bare Pixel from this plugin breaks Meta deduplication / CAPI coverage.
 */
function aureherb_analytics_meta_handled_elsewhere()
{
    if (!function_exists('is_plugin_active')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    return is_plugin_active('facebook-for-woocommerce/facebook-for-woocommerce.php');
}

function aureherb_analytics_is_enabled()
{
    $s = aureherb_analytics_settings();
    $meta = aureherb_analytics_meta_handled_elsewhere() ? '' : $s['meta_pixel_id'];
    return $s['gtm_id'] !== '' || $s['ga4_id'] !== '' || $meta !== '' || $s['clarity_id'] !== '';
}

add_action('wp_head', 'aureherb_analytics_print_head', 2);
add_action('wp_body_open', 'aureherb_analytics_print_body_open', 1);
add_action('wp_enqueue_scripts', 'aureherb_analytics_enqueue_scripts');

/**
 * One-time: clear stored Meta Pixel ID when Meta for WooCommerce owns tracking.
 */
add_action('init', 'aureherb_analytics_maybe_clear_meta_pixel_id', 20);

function aureherb_analytics_maybe_clear_meta_pixel_id()
{
    if (!aureherb_analytics_meta_handled_elsewhere()) {
        return;
    }
    if (get_option('aureherb_analytics_cleared_meta_for_fbwc')) {
        return;
    }

    $s = aureherb_analytics_settings();
    if (($s['meta_pixel_id'] ?? '') === '') {
        update_option('aureherb_analytics_cleared_meta_for_fbwc', 1, false);
        return;
    }

    foreach (['aureherb_analytics_settings', 'aureherb_analytics'] as $option) {
        $raw = get_option($option, null);
        if (is_array($raw) && array_key_exists('meta_pixel_id', $raw)) {
            $raw['meta_pixel_id'] = '';
            update_option($option, $raw, false);
            break;
        }
    }
    update_option('aureherb_analytics_cleared_meta_for_fbwc', 1, false);
}

function aureherb_analytics_print_head()
{
    if (is_admin() || !aureherb_analytics_is_enabled()) {
        return;
    }

    $s = aureherb_analytics_settings();
    $skip_meta = aureherb_analytics_meta_handled_elsewhere();

    echo "<script>window.dataLayer=window.dataLayer||[];</script>\n";

    if ($s['gtm_id'] !== '') {
        $gtm = esc_js($s['gtm_id']);
        echo "<!-- Google Tag Manager -->\n";
        echo "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','{$gtm}');</script>\n";
        echo "<!-- End Google Tag Manager -->\n";
    } elseif ($s['ga4_id'] !== '') {
        $ga4 = esc_attr($s['ga4_id']);
        $ga4_js = esc_js($s['ga4_id']);
        echo "<!-- Google tag (gtag.js) -->\n";
        echo '<script async src="https://www.googletagmanager.com/gtag/js?id=' . $ga4 . '"></script>' . "\n";
        echo "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','{$ga4_js}');</script>\n";
    }

    if (!$skip_meta && $s['meta_pixel_id'] !== '') {
        $pixel = esc_js($s['meta_pixel_id']);
        echo "<!-- Meta Pixel Code -->\n";
        echo "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{$pixel}');fbq('track','PageView');</script>\n";
        echo '<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=' . esc_attr($s['meta_pixel_id']) . '&ev=PageView&noscript=1" alt=""></noscript>' . "\n";
        echo "<!-- End Meta Pixel Code -->\n";
    }

    if ($s['clarity_id'] !== '') {
        $clarity = esc_js($s['clarity_id']);
        echo "<!-- Microsoft Clarity -->\n";
        echo "<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,\"clarity\",\"script\",\"{$clarity}\");</script>\n";
        echo "<!-- End Microsoft Clarity -->\n";
    }
}

function aureherb_analytics_print_body_open()
{
    if (is_admin() || !aureherb_analytics_is_enabled()) {
        return;
    }

    $s = aureherb_analytics_settings();
    if ($s['gtm_id'] === '') {
        return;
    }

    $gtm = esc_attr($s['gtm_id']);
    echo '<!-- Google Tag Manager (noscript) -->' . "\n";
    echo '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' . $gtm . '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' . "\n";
    echo '<!-- End Google Tag Manager (noscript) -->' . "\n";
}

function aureherb_analytics_enqueue_scripts()
{
    if (is_admin() || !aureherb_analytics_is_enabled()) {
        return;
    }

    $s = aureherb_analytics_settings();
    $has_pixel = !aureherb_analytics_meta_handled_elsewhere() && $s['meta_pixel_id'] !== '';

    wp_enqueue_script(
        'aureherb-analytics',
        AUREHERB_ANALYTICS_URL . 'assets/js/analytics.js',
        ['jquery'],
        AUREHERB_ANALYTICS_VERSION,
        true
    );

    wp_localize_script('aureherb-analytics', 'aureherbAnalytics', [
        'currency' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'PKR',
        'hasGtm' => $s['gtm_id'] !== '',
        'hasGa4' => $s['gtm_id'] === '' && $s['ga4_id'] !== '',
        'hasPixel' => $has_pixel,
        'ga4Id' => $s['ga4_id'],
    ]);
}
