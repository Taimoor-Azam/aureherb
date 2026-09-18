<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * @param WC_Product $product
 * @return array<string,mixed>
 */
function aureherb_analytics_product_item($product, $quantity = 1)
{
    $quantity = max(1, (int) $quantity);
    $price = (float) wc_get_price_to_display($product);

    return [
        'item_id' => (string) $product->get_id(),
        'item_name' => $product->get_name(),
        'item_brand' => 'AureHerb',
        'price' => round($price, 2),
        'quantity' => $quantity,
    ];
}

/**
 * @param WC_Product $product
 * @return array<string,mixed>
 */
function aureherb_analytics_product_payload($product, $quantity = 1)
{
    $item = aureherb_analytics_product_item($product, $quantity);
    $value = $item['price'] * $item['quantity'];

    return [
        'currency' => get_woocommerce_currency(),
        'value' => round($value, 2),
        'items' => [$item],
        'content_ids' => [(string) $product->get_id()],
        'content_name' => $product->get_name(),
        'content_type' => 'product',
        'contents' => [
            [
                'id' => (string) $product->get_id(),
                'quantity' => $item['quantity'],
                'item_price' => $item['price'],
            ],
        ],
        'num_items' => $item['quantity'],
    ];
}

/**
 * @param WC_Cart $cart
 * @return array<string,mixed>
 */
function aureherb_analytics_cart_payload($cart)
{
    $items = [];
    $contents = [];
    $ids = [];
    $num = 0;

    foreach ($cart->get_cart() as $line) {
        $product = isset($line['data']) && $line['data'] instanceof WC_Product ? $line['data'] : null;
        if (!$product) {
            continue;
        }
        $qty = isset($line['quantity']) ? (int) $line['quantity'] : 1;
        $item = aureherb_analytics_product_item($product, $qty);
        $items[] = $item;
        $ids[] = (string) $product->get_id();
        $contents[] = [
            'id' => (string) $product->get_id(),
            'quantity' => $item['quantity'],
            'item_price' => $item['price'],
        ];
        $num += $item['quantity'];
    }

    return [
        'currency' => get_woocommerce_currency(),
        'value' => round((float) $cart->total, 2),
        'items' => $items,
        'content_ids' => $ids,
        'content_type' => 'product',
        'contents' => $contents,
        'num_items' => $num,
    ];
}

/**
 * @param WC_Order $order
 * @return array<string,mixed>
 */
function aureherb_analytics_order_payload($order)
{
    $items = [];
    $contents = [];
    $ids = [];
    $num = 0;

    foreach ($order->get_items() as $item) {
        if (!$item instanceof WC_Order_Item_Product) {
            continue;
        }
        $product = $item->get_product();
        $product_id = $product instanceof WC_Product ? (string) $product->get_id() : (string) $item->get_product_id();
        $qty = max(1, (int) $item->get_quantity());
        $line_total = (float) $item->get_total();
        $unit = $qty > 0 ? round($line_total / $qty, 2) : $line_total;

        $items[] = [
            'item_id' => $product_id,
            'item_name' => $item->get_name(),
            'item_brand' => 'AureHerb',
            'price' => $unit,
            'quantity' => $qty,
        ];
        $ids[] = $product_id;
        $contents[] = [
            'id' => $product_id,
            'quantity' => $qty,
            'item_price' => $unit,
        ];
        $num += $qty;
    }

    return [
        'transaction_id' => (string) $order->get_order_number(),
        'currency' => $order->get_currency(),
        'value' => round((float) $order->get_total(), 2),
        'shipping' => round((float) $order->get_shipping_total(), 2),
        'tax' => round((float) $order->get_total_tax(), 2),
        'items' => $items,
        'content_ids' => $ids,
        'content_type' => 'product',
        'contents' => $contents,
        'num_items' => $num,
    ];
}

function aureherb_analytics_queue_event($name, array $payload)
{
    if (!aureherb_analytics_is_enabled() || !function_exists('WC') || !WC()->session) {
        return;
    }

    $queued = WC()->session->get('aureherb_analytics_events', []);
    if (!is_array($queued)) {
        $queued = [];}
    $queued[] = [
        'name' => $name,
        'payload' => $payload,
    ];

    WC()->session->set('aureherb_analytics_events', $queued);
}

/**
 * @var array<int,array{name:string,meta:string,payload:array<string,mixed>}>
 */
$GLOBALS['aureherb_analytics_pending_events'] = [];

/**
 * @param array{name:string,meta:string,payload:array<string,mixed>} $event
 */
function aureherb_analytics_push_pending(array $event)
{
    if (!isset($GLOBALS['aureherb_analytics_pending_events']) || !is_array($GLOBALS['aureherb_analytics_pending_events'])) {
        $GLOBALS['aureherb_analytics_pending_events'] = [];
    }
    $GLOBALS['aureherb_analytics_pending_events'][] = $event;
}

add_action('wp_footer', 'aureherb_analytics_print_page_events', 20);

function aureherb_analytics_print_page_events()
{
    if (is_admin() || !aureherb_analytics_is_enabled() || !function_exists('WC')) {
        return;
    }

    $events = [];

    if (function_exists('is_product') && is_product()) {
        global $product;
        if (!$product instanceof WC_Product) {
            $product = wc_get_product(get_the_ID());
        }
        if ($product instanceof WC_Product) {
            $events[] = [
                'name' => 'view_item',
                'meta' => 'ViewContent',
                'payload' => aureherb_analytics_product_payload($product),
            ];
        }
    }

    if (
        function_exists('is_checkout')
        && is_checkout()
        && !is_wc_endpoint_url('order-received')
        && WC()->cart
        && !WC()->cart->is_empty()
    ) {
        $events[] = [
            'name' => 'begin_checkout',
            'meta' => 'InitiateCheckout',
            'payload' => aureherb_analytics_cart_payload(WC()->cart),
        ];
    }

    if (WC()->session) {
        $queued = WC()->session->get('aureherb_analytics_events', []);
        if (is_array($queued) && $queued) {
            foreach ($queued as $row) {
                if (!is_array($row) || empty($row['name']) || empty($row['payload']) || !is_array($row['payload'])) {
                    continue;
                }
                $events[] = [
                    'name' => (string) $row['name'],
                    'meta' => 'AddToCart',
                    'payload' => $row['payload'],
                ];
            }
            WC()->session->set('aureherb_analytics_events', []);
        }
    }

    $pending = isset($GLOBALS['aureherb_analytics_pending_events']) && is_array($GLOBALS['aureherb_analytics_pending_events'])
        ? $GLOBALS['aureherb_analytics_pending_events']
        : [];
    if ($pending) {
        $events = array_merge($events, $pending);
        $GLOBALS['aureherb_analytics_pending_events'] = [];
    }

    if (!$events) {
        return;
    }

    echo '<script>window.aureherbAnalyticsPageEvents=(window.aureherbAnalyticsPageEvents||[]).concat(' . wp_json_encode($events) . ');</script>' . "\n";
}

add_action('woocommerce_add_to_cart', 'aureherb_analytics_on_add_to_cart', 20, 6);

/**
 * @param string $cart_item_key
 */
function aureherb_analytics_on_add_to_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data)
{
    unset($cart_item_key, $variation, $cart_item_data);

    $id = $variation_id ? (int) $variation_id : (int) $product_id;
    $product = wc_get_product($id);
    if (!$product instanceof WC_Product) {
        return;
    }

    aureherb_analytics_queue_event('add_to_cart', aureherb_analytics_product_payload($product, $quantity));
}

add_filter('woocommerce_add_to_cart_fragments', 'aureherb_analytics_add_to_cart_fragment');

/**
 * @param array<string,string> $fragments
 * @return array<string,string>
 */
function aureherb_analytics_add_to_cart_fragment($fragments)
{
    if (!aureherb_analytics_is_enabled() || !function_exists('WC') || !WC()->session) {
        return $fragments;
    }

    $queued = WC()->session->get('aureherb_analytics_events', []);
    if (!is_array($queued) || !$queued) {
        return $fragments;
    }

    $events = [];
    foreach ($queued as $row) {
        if (!is_array($row) || empty($row['name']) || empty($row['payload']) || !is_array($row['payload'])) {
            continue;
        }
        $events[] = [
            'name' => (string) $row['name'],
            'meta' => 'AddToCart',
            'payload' => $row['payload'],
        ];
    }

    WC()->session->set('aureherb_analytics_events', []);

    if (!$events) {
        return $fragments;
    }

    $fragments['script#aureherb-analytics-atc'] = '<script id="aureherb-analytics-atc" type="application/json">' . wp_json_encode($events) . '</script>';