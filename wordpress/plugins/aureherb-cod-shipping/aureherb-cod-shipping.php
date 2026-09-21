<?php
/**
 * Plugin Name: AureHerb COD and shipping
 * Description: Cash on delivery only. Free delivery across Pakistan (no minimum).
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * One-time: COD only + Pakistan free-delivery zone (PK location, no min amount).
 * Re-runs when bumping aureherb_cod_shipping_v2 so prior paid-shipping config is replaced.
 */
add_action('woocommerce_init', static function () {
    if (get_option('aureherb_cod_shipping_v2')) {
        return;
    }

    $cod = get_option('woocommerce_cod_settings', []);
    if (!is_array($cod)) {
        $cod = [];
    }
    $cod['enabled'] = 'yes';
    $cod['title'] = 'Cash on delivery';
    $cod['description'] = 'Pay with cash when your order is delivered in Pakistan.';
    $cod['instructions'] = 'Pay with cash when your order is delivered.';
    $cod['enable_for_virtual'] = 'no';
    update_option('woocommerce_cod_settings', $cod);

    foreach (['bacs', 'cheque', 'paypal'] as $gateway) {
        $settings = get_option('woocommerce_' . $gateway . '_settings', []);
        if (!is_array($settings)) {
            $settings = [];
        }
        $settings['enabled'] = 'no';
        update_option('woocommerce_' . $gateway . '_settings', $settings);
    }

    if (!class_exists('WC_Shipping_Zone') || !class_exists('WC_Shipping_Zones')) {
        return;
    }

    $pakistan_zone = null;
    foreach (WC_Shipping_Zones::get_zones() as $zone_data) {
        if (isset($zone_data['zone_name']) && strcasecmp((string) $zone_data['zone_name'], 'Pakistan') === 0) {
            $pakistan_zone = new WC_Shipping_Zone($zone_data['id']);
            break;
        }
    }

    if (!$pakistan_zone) {
        $pakistan_zone = new WC_Shipping_Zone();
        $pakistan_zone->set_zone_name('Pakistan');
        $pakistan_zone->set_zone_order(0);
        $pakistan_zone->save();
    }

    $pakistan_zone->set_locations([
        ['code' => 'PK', 'type' => 'country'],
    ]);
    $pakistan_zone->save();

    $has_free = false;
    foreach ($pakistan_zone->get_shipping_methods(true) as $method) {
        if ($method->id === 'flat_rate') {
            // Paid delivery no longer used — keep instance but disable.
            global $wpdb;
            $wpdb->update(
                $wpdb->prefix . 'woocommerce_shipping_zone_methods',
                ['is_enabled' => 0],
                [
                    'zone_id' => $pakistan_zone->get_id(),
                    'instance_id' => $method->instance_id,
                ],
                ['%d'],
                ['%d', '%d']
            );
        }
        if ($method->id === 'free_shipping') {
            $has_free = true;
            update_option('woocommerce_free_shipping_' . $method->instance_id . '_settings', [
                'title' => 'Free delivery',
                'requires' => '',
                'min_amount' => '',
                'ignore_discounts' => 'no',
            ]);
            global $wpdb;
            $wpdb->update(
                $wpdb->prefix . 'woocommerce_shipping_zone_methods',
                ['is_enabled' => 1],
                [
                    'zone_id' => $pakistan_zone->get_id(),
                    'instance_id' => $method->instance_id,
                ],
                ['%d'],
                ['%d', '%d']
            );
        }
    }

    if (!$has_free) {
        $instance_id = $pakistan_zone->add_shipping_method('free_shipping');
        if ($instance_id) {
            update_option('woocommerce_free_shipping_' . $instance_id . '_settings', [
                'title' => 'Free delivery',
                'requires' => '',
                'min_amount' => '',
                'ignore_discounts' => 'no',
            ]);
        }
    }

    update_option('woocommerce_enable_shipping_calc', 'yes');
    update_option('woocommerce_shipping_cost_requires_address', 'no');
    update_option('woocommerce_checkout_phone_field', 'required');
    update_option('aureherb_cod_shipping_v2', '1');
}, 20);

/**
 * Keep free delivery available for every COD cart (no Rs 3,000 gate).
 * Drop paid flat-rate rows so checkout only shows Free delivery.
 */
add_filter('woocommerce_package_rates', static function ($rates, $package) {
    foreach ($rates as $rate_id => $rate) {
        $method = isset($rate->method_id) ? $rate->method_id : '';
        if ($method === 'flat_rate') {
            unset($rates[$rate_id]);
        }
    }

    return $rates;
}, 20, 2);
