<?php

if (!defined('ABSPATH')) {
    exit;
}

function aureherb_seo_maybe_seed()
{
    if (!get_option('aureherb_seo_seeded_v1')) {
        aureherb_seo_seed_content();
        aureherb_seo_enable_reviews();
        flush_rewrite_rules(false);
        update_option('aureherb_seo_seeded_v1', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v2')) {
        aureherb_seo_fix_front_page();
        aureherb_seo_configure_rank_math();
        flush_rewrite_rules(false);
        update_option('aureherb_seo_seeded_v2', gmdate('c'), false);
        update_option('aureherb_seo_rankmath_configured_v1', '1', false);
    }

    if (!get_option('aureherb_seo_rankmath_configured_v1') && (defined('RANK_MATH_VERSION') || class_exists('RankMath'))) {
        aureherb_seo_configure_rank_math();
        update_option('aureherb_seo_rankmath_configured_v1', '1', false);
    }

    if (!get_option('aureherb_seo_seeded_v3')) {
        aureherb_seo_configure_rank_math();
        aureherb_seo_enable_reviews();
        aureherb_seo_ping_sitemap();
        update_option('aureherb_seo_seeded_v3', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v4')) {
        aureherb_seo_fix_product_excerpt();
        update_option('aureherb_seo_seeded_v4', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v5')) {
        aureherb_seo_seed_track_order_page();
        update_option('aureherb_seo_seeded_v5', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v6')) {
        aureherb_seo_seed_remaining_v6();
        update_option('aureherb_seo_seeded_v6', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v7')) {
        update_option('aureherb_seo_gsc_meta', 'YaDeGZfLyXKu35tnwJ1OHdO5kJgN8EQXhESR2d9KxJM', false);
        update_option('aureherb_seo_seeded_v7', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v8')) {
        update_option('aureherb_seo_bing_meta', 'FB426DCAB8445497A76CE50C64E9E3A7', false);
        update_option('aureherb_seo_seeded_v8', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v9')) {
        aureherb_seo_seed_legal_pages_v9();
        flush_rewrite_rules(false);
        update_option('aureherb_seo_seeded_v9', gmdate('c'), false);
    }

    if (!get_option('aureherb_seo_seeded_v10')) {
        aureherb_seo_seed_track_order_page();
        aureherb_seo_update_free_shipping_copy_v10();
        update_option('aureherb_seo_seeded_v10', gmdate('c'), false);
    }
}

function aureherb_seo_update_free_shipping_copy_v10()
{
    $product = get_page_by_path('hair-growth-oil', OBJECT, 'product');
    if ($product instanceof WP_Post) {
        wp_update_post([
            'ID' => $product->ID,
            'post_excerpt' => 'AureHerb Hair Growth Oil blends rosemary, castor, and black seed oils to nourish the scalp and support healthier-looking hair. Cash on delivery in Pakistan with free shipping.',
        ]);
    }

    $shipping = get_page_by_path('shipping', OBJECT, 'page');
    if ($shipping instanceof WP_Post && function_exists('aureherb_seo_page_shipping')) {
        wp_update_post([
            'ID' => $shipping->ID,
            'post_content' => aureherb_seo_page_shipping(),
        ]);
    }
}

function aureherb_seo_fix_product_excerpt()
{
    $product = get_page_by_path('hair-growth-oil', OBJECT, 'product');
    if (!($product instanceof WP_Post)) {
        return;
    }
    wp_update_post([
        'ID' => $product->ID,
        'post_excerpt' => 'AureHerb Hair Growth Oil blends rosemary, castor, and black seed oils to nourish the scalp and support healthier-looking hair. Cash on delivery in Pakistan. Free shipping with cash on delivery in Pakistan.',
        'comment_status' => 'open',
    ]);
}

function aureherb_seo_seed_track_order_page()
{
    $body = '<p>Enter your order number and the billing email from your confirmation to see status. Status matches the shop admin.</p>' . "\n" . '[woocommerce_order_tracking]';
    aureherb_seo_upsert_page('track-order', 'Track Your Order', $body, [
        'title' => 'Track Your Order | AureHerb',
        'description' => 'Track an AureHerb order with the order number from your confirmation. Status matches the shop admin.',
        'keyword' => 'track AureHerb order',
    ]);
}

function aureherb_seo_seed_legal_pages_v9()
{
    $privacy_id = aureherb_seo_upsert_page('privacy-policy', 'Privacy Policy', aureherb_seo_page_privacy(), [
        'title' => 'Privacy Policy | AureHerb',
        'description' => 'How AureHerb collects, uses, and protects personal information for accounts, orders, and Google sign-in.',
        'keyword' => 'AureHerb privacy policy',
    ]);
    $terms_id = aureherb_seo_upsert_page('terms-of-use', 'Terms of Use', aureherb_seo_page_terms(), [
        'title' => 'Terms of Use | AureHerb',
        'description' => 'Terms for using the AureHerb website and store, including orders, cash on delivery, and accounts.',
        'keyword' => 'AureHerb terms of use',
    ]);

    if ($privacy_id) {
        update_option('wp_page_for_privacy_policy', $privacy_id);
    }
    if ($terms_id) {
        update_option('woocommerce_terms_page_id', (string) $terms_id);
    }
}

function aureherb_seo_seed_remaining_v6()
{
    aureherb_seo_upsert_page('about', 'About AureHerb', aureherb_seo_page_about(), [
        'title' => 'About AureHerb | AureHerb',
        'description' => 'AureHerb is a Pakistan botanical hair-care shop. Flagship product: AureHerb Hair Growth Oil with cash on delivery.',
        'keyword' => 'AureHerb',
    ]);
    aureherb_seo_upsert_page('ingredients', 'AureHerb Hair Growth Oil ingredients', aureherb_seo_page_ingredients(), [
        'title' => 'AureHerb Hair Growth Oil ingredients | AureHerb',
        'description' => 'Rosemary, castor, and black seed oils in AureHerb Hair Growth Oil, explained in plain language.',
        'keyword' => 'AureHerb ingredients',
    ]);
    aureherb_seo_upsert_page('how-to-use', 'How to use AureHerb Hair Growth Oil', aureherb_seo_page_howto(), [
        'title' => 'How to use AureHerb Hair Growth Oil | AureHerb',
        'description' => 'Warm a few drops of AureHerb Hair Growth Oil, massage the scalp, leave on, then wash. Two to three times a week.',
        'keyword' => 'how to use hair growth oil',
    ]);
    aureherb_seo_upsert_page('faq', 'AureHerb FAQ', aureherb_seo_page_faq(), [
        'title' => 'AureHerb FAQ | AureHerb',
        'description' => 'Answers about AureHerb Hair Growth Oil, ingredients, how to use, and cash on delivery in Pakistan.',
        'keyword' => 'AureHerb FAQ',
    ]);

    $product = get_page_by_path('hair-growth-oil', OBJECT, 'product');
    if ($product instanceof WP_Post) {
        wp_update_post([
            'ID' => $product->ID,
            'post_content' => aureherb_seo_product_description(),
            'comment_status' => 'open',
        ]);
    }

    foreach (aureherb_seo_guides() as $guide) {
        aureherb_seo_upsert_post($guide['slug'], $guide['title'], $guide['content'], [
            'title' => $guide['title'] . ' | AureHerb',
            'description' => $guide['description'],
            'keyword' => $guide['keyword'],
        ]);
    }

    aureherb_seo_optimize_product_image();
    aureherb_seo_ping_sitemap();

    update_option('aureherb_seo_aeo_spotcheck', [
        'at' => gmdate('c'),
        'notes' => "Sep 2026 remaining-items check: site:aureherb.com still returns no Google results — Search Console verification and sitemap submit are the bottleneck, not more on-site copy. Brand query “AureHerb Hair Growth Oil Pakistan” does not surface aureherb.com; results mix similarly named products (Aureal, Hairlux, Just Amna). “Best hair growth oil Pakistan” still lists Dango, Belo, Desi Khazanay, IK Organics, Hairlux — not AureHerb. Product JSON-LD has one Product + Offer (PKR 1200, InStock); FAQPage is on /faq/ and /how-to-use/ only, not on the product. Hero video stays preload=metadata (2.8MB); LCP is the 116KB banner poster until the canvas has a frame. Product gallery original was ~1.8MB PNG, converted to JPEG. ChatGPT / Perplexity / AI Overview: re-check the five questions after GSC verifies and pages are indexed. Goal remains indexation + citable pages, not ranking in AI Overviews.",
    ], false);
}

function aureherb_seo_optimize_product_image()
{
    if (get_option('aureherb_seo_product_image_jpg_v1')) {
        return;
    }

    $rel_png = '2026/08/ChatGPT-Image-Aug-31-2026-01_12_27-AM.png';
    $rel_jpg = '2026/08/ChatGPT-Image-Aug-31-2026-01_12_27-AM.jpg';
    $uploads = wp_get_upload_dir();
    if (!empty($uploads['error']) || empty($uploads['basedir'])) {
        return;
    }

    $png = trailingslashit($uploads['basedir']) . $rel_png;
    $jpg = trailingslashit($uploads['basedir']) . $rel_jpg;
    if (!file_exists($png) && !file_exists($jpg)) {
        return;
    }

    if (!file_exists($jpg) && file_exists($png)) {
        $editor = wp_get_image_editor($png);
        if (is_wp_error($editor)) {
            return;
        }
        $editor->set_quality(72);
        $saved = $editor->save($jpg, 'image/jpeg');
        if (is_wp_error($saved) || empty($saved['path'])) {
            return;
        }
        $jpg = $saved['path'];
        $basedir = trailingslashit(str_replace('\\', '/', $uploads['basedir']));
        $saved_path = str_replace('\\', '/', $saved['path']);
        if (strpos($saved_path, $basedir) === 0) {
            $rel_jpg = ltrim(substr($saved_path, strlen($basedir)), '/');
        }
    }

    $attachments = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'meta_key' => '_wp_attached_file',
        'meta_value' => $rel_png,
        'fields' => 'ids',
    ]);
    if (!$attachments) {
        update_option('aureherb_seo_product_image_jpg_v1', 'missing-attachment', false);
        return;
    }

    $id = (int) $attachments[0];
    require_once ABSPATH . 'wp-admin/includes/image.php';
    wp_update_post([
        'ID' => $id,
        'post_mime_type' => 'image/jpeg',
        'guid' => trailingslashit($uploads['baseurl']) . $rel_jpg,
    ]);
    update_post_meta($id, '_wp_attached_file', $rel_jpg);
    $meta = wp_generate_attachment_metadata($id, $jpg);
    if (is_array($meta)) {
        wp_update_attachment_metadata($id, $meta);
    }
    update_option('aureherb_seo_product_image_jpg_v1', gmdate('c'), false);
}

function aureherb_seo_fix_front_page()
{
    $home_id = aureherb_seo_upsert_page('home', 'Home', '', [
        'title' => 'AureHerb Hair Growth Oil | Botanical hair care in Pakistan',
        'description' => 'AureHerb is a Pakistan botanical hair-care shop. Buy AureHerb Hair Growth Oil with cash on delivery.',
        'keyword' => 'hair growth oil Pakistan',
    ]);
    $journal = get_page_by_path('journal');
    if ($home_id) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
    }
    if ($journal instanceof WP_Post) {
        update_option('page_for_posts', $journal->ID);
    }

    $hello = get_page_by_path('hello-world', OBJECT, 'post');
    if ($hello instanceof WP_Post) {
        wp_trash_post($hello->ID);
    }
}

function aureherb_seo_enable_reviews()
{
    update_option('woocommerce_enable_reviews', 'yes');
    update_option('woocommerce_enable_review_rating', 'yes');
    update_option('woocommerce_review_rating_required', 'yes');
    update_option('woocommerce_enable_review_rating_required', 'yes');
}

function aureherb_seo_find_page_by_slug($slug)
{
    $pages = get_posts([
        'name' => $slug,
        'post_type' => 'page',
        'post_status' => ['publish', 'draft', 'pending', 'private'],
        'numberposts' => 1,
    ]);
    if ($pages && $pages[0] instanceof WP_Post) {
        return $pages[0];
    }
    return null;
}

function aureherb_seo_upsert_page($slug, $title, $content, $meta)
{
    $existing = aureherb_seo_find_page_by_slug($slug);
    $data = [
        'post_title' => $title,
        'post_name' => $slug,
        'post_content' => $content,
        'post_status' => 'publish',
        'post_type' => 'page',
        'post_excerpt' => isset($meta['description']) ? $meta['description'] : '',
    ];
    if ($existing instanceof WP_Post) {
        $data['ID'] = $existing->ID;
        $id = wp_update_post($data, true);
    } else {
        $id = wp_insert_post($data, true);
    }
    if (is_wp_error($id) || !$id) {
        return 0;
    }
    aureherb_seo_set_rank_meta((int) $id, $meta);
    return (int) $id;
}

function aureherb_seo_upsert_post($slug, $title, $content, $meta)
{
    $existing = get_page_by_path($slug, OBJECT, 'post');
    $data = [
        'post_title' => $title,
        'post_name' => $slug,
        'post_content' => $content,
        'post_status' => 'publish',
        'post_type' => 'post',
        'post_excerpt' => isset($meta['description']) ? $meta['description'] : '',
    ];
    if ($existing instanceof WP_Post) {
        $data['ID'] = $existing->ID;
        $id = wp_update_post($data, true);
    } else {
        $id = wp_insert_post($data, true);
    }
    if (is_wp_error($id) || !$id) {
        return 0;
    }
    aureherb_seo_set_rank_meta((int) $id, $meta);
    return (int) $id;
}

function aureherb_seo_set_rank_meta($id, $meta)
{
    if (isset($meta['title'])) {
        update_post_meta($id, 'rank_math_title', $meta['title']);
    }
    if (isset($meta['description'])) {
        update_post_meta($id, 'rank_math_description', $meta['description']);
    }
    if (isset($meta['keyword'])) {
        update_post_meta($id, 'rank_math_focus_keyword', $meta['keyword']);
    }
}

function aureherb_seo_seed_content()
{
    $pages = [
        ['about', 'About AureHerb', aureherb_seo_page_about(), 'AureHerb', 'AureHerb is a Pakistan botanical hair-care shop. Flagship product: AureHerb Hair Growth Oil with cash on delivery.'],
        ['ingredients', 'AureHerb Hair Growth Oil ingredients', aureherb_seo_page_ingredients(), 'AureHerb ingredients', 'Rosemary, castor, and black seed oils in AureHerb Hair Growth Oil, explained in plain language.'],
        ['how-to-use', 'How to use AureHerb Hair Growth Oil', aureherb_seo_page_howto(), 'how to use hair growth oil', 'Warm a few drops of AureHerb Hair Growth Oil, massage the scalp, leave on, then wash. Two to three times a week.'],
        ['shipping', 'Shipping, cash on delivery, and returns', aureherb_seo_page_shipping(), 'cash on delivery Pakistan', 'AureHerb ships across Pakistan with COD. Free shipping with cash on delivery.'],
        ['faq', 'AureHerb FAQ', aureherb_seo_page_faq(), 'AureHerb FAQ', 'Answers about AureHerb Hair Growth Oil, ingredients, how to use, and cash on delivery in Pakistan.'],
        ['contact', 'Contact AureHerb', aureherb_seo_page_contact(), 'contact AureHerb', 'Contact AureHerb on WhatsApp or Instagram. Online hair-care shop serving Pakistan.'],
        ['journal', 'AureHerb Journal', aureherb_seo_page_journal(), 'AureHerb journal', 'Guides on oiling rituals, botanical oils, and buying hair oil with cash on delivery in Pakistan.'],
    ];

    $journal_id = 0;
    foreach ($pages as $page) {
        $id = aureherb_seo_upsert_page($page[0], $page[1], $page[2], [
            'title' => $page[1] . ' | AureHerb',
            'description' => $page[4],
            'keyword' => $page[3],
        ]);
        if ($page[0] === 'journal') {
            $journal_id = $id;
        }
    }

    if ($journal_id) {
        if (!(int) get_option('page_on_front')) {
            update_option('show_on_front', 'page');
        }
        update_option('page_for_posts', $journal_id);
        update_option('permalink_structure', '/%postname%/');
    }

    foreach (aureherb_seo_guides() as $guide) {
        aureherb_seo_upsert_post($guide['slug'], $guide['title'], $guide['content'], [
            'title' => $guide['title'] . ' | AureHerb',
            'description' => $guide['description'],
            'keyword' => $guide['keyword'],
        ]);
    }

    $product = get_page_by_path('hair-growth-oil', OBJECT, 'product');
    if ($product instanceof WP_Post) {
        wp_update_post([
            'ID' => $product->ID,
            'post_content' => aureherb_seo_product_description(),
            'comment_status' => 'open',
        ]);
        aureherb_seo_set_rank_meta($product->ID, [
            'title' => 'AureHerb Hair Growth Oil | Rosemary, Castor & Black Seed | COD',
            'description' => 'Buy AureHerb Hair Growth Oil in Pakistan. Rosemary, castor, and black seed botanical blend. Cash on delivery. Free shipping with cash on delivery in Pakistan.',
            'keyword' => 'hair growth oil Pakistan',
        ]);
    }

    $front = (int) get_option('page_on_front');
    if ($front) {
        aureherb_seo_set_rank_meta($front, [
            'title' => 'AureHerb Hair Growth Oil | Botanical hair care in Pakistan',
            'description' => 'AureHerb is a Pakistan botanical hair-care shop. Buy AureHerb Hair Growth Oil with cash on delivery.',
            'keyword' => 'hair growth oil Pakistan',
        ]);
    }

    $shop = function_exists('wc_get_page_id') ? (int) wc_get_page_id('shop') : 0;
    if ($shop > 0) {
        aureherb_seo_set_rank_meta($shop, [
            'title' => 'Shop AureHerb | Hair Growth Oil',
            'description' => 'Shop AureHerb Hair Growth Oil. Botanical hair care with cash on delivery in Pakistan.',
            'keyword' => 'AureHerb shop',
        ]);
    }

    update_option('aureherb_seo_aeo_spotcheck', [
        'at' => gmdate('c'),
        'notes' => "Baseline (Aug 2026): Web search for “AureHerb Hair Growth Oil Pakistan” returned no third-party citations. “Best hair growth oil Pakistan” / COD lists competitors (Belo, Dango, Grow & Glow, Desi Khazanay, The Organic Store) — AureHerb is not named. Goal: index new FAQ/guides, then re-check ChatGPT, Perplexity, and Google AI Overviews monthly for the five questions on WooCommerce → SEO & AEO.",
    ], false);
}

function aureherb_seo_configure_rank_math()
{
    if (!defined('RANK_MATH_VERSION') && !class_exists('RankMath')) {
        return;
    }

    update_option('rank_math_wizard_completed', '1');
    update_option('rank_math_registration_skip', true);

    $modules = get_option('rank_math_modules');
    if (!is_array($modules)) {
        $modules = [];
    }
    foreach (['sitemap', 'rich-snippet', 'schema', 'woocommerce', 'redirections', 'instant-indexing'] as $module) {
        if (!in_array($module, $modules, true)) {
            $modules[] = $module;
        }
    }
    if (class_exists('\RankMath\Helper') && method_exists('\RankMath\Helper', 'update_modules')) {
        \RankMath\Helper::update_modules([
            'sitemap' => 'on',
            'rich-snippet' => 'on',
            'schema' => 'on',
            'woocommerce' => 'on',
            'redirections' => 'on',
            'instant-indexing' => 'on',
        ]);
    }

    update_option('rank_math_modules', $modules);

    $titles = get_option('rank-math-options-titles', []);
    if (!is_array($titles)) {
        $titles = [];
    }
    $titles['knowledgegraph_type'] = 'company';
    $titles['knowledgegraph_name'] = 'AureHerb';
    $titles['website_name'] = 'AureHerb';
    $titles['homepage_title'] = 'AureHerb Hair Growth Oil | Botanical hair care in Pakistan';
    $titles['homepage_description'] = 'AureHerb is a Pakistan botanical hair-care shop. Buy AureHerb Hair Growth Oil with cash on delivery.';
    $titles['social_url_facebook'] = 'https://www.facebook.com/share/1HPAidoQoY/';
    $titles['social_url_instagram'] = 'https://www.instagram.com/aureherbofficial';
    $titles['noindex_archive_author'] = 'on';
    update_option('rank-math-options-titles', $titles);

    $general = get_option('rank-math-options-general', []);
    if (!is_array($general)) {
        $general = [];
    }
    $general['breadcrumbs'] = 'on';
    $general['canonical_url'] = home_url('/');
    update_option('rank-math-options-general', $general);
}

function aureherb_seo_ping_sitemap()
{
    $sitemap = home_url('/sitemap_index.xml');
    wp_remote_get('https://www.google.com/ping?sitemap=' . rawurlencode($sitemap), [
        'timeout' => 8,
        'blocking' => false,
    ]);
    wp_remote_get('https://www.bing.com/ping?sitemap=' . rawurlencode($sitemap), [
        'timeout' => 8,
        'blocking' => false,
    ]);
}
