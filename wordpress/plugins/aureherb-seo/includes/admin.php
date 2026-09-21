<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', static function () {
    add_submenu_page(
        'woocommerce',
        __('SEO & AEO', 'aureherb'),
        __('SEO & AEO', 'aureherb'),
        'manage_woocommerce',
        'aureherb-seo',
        'aureherb_seo_admin_page'
    );
});

add_action('admin_init', static function () {
    register_setting('aureherb_seo', 'aureherb_seo_gsc_meta', [
        'type' => 'string',
        'sanitize_callback' => 'aureherb_seo_sanitize_verify_meta',
        'default' => '',
    ]);
    register_setting('aureherb_seo', 'aureherb_seo_bing_meta', [
        'type' => 'string',
        'sanitize_callback' => 'aureherb_seo_sanitize_verify_meta',
        'default' => '',
    ]);
});

add_action('wp_head', static function () {
    $gsc = (string) get_option('aureherb_seo_gsc_meta', '');
    if ($gsc !== '') {
        echo '<meta name="google-site-verification" content="' . esc_attr($gsc) . '">' . "\n";
    }
    $bing = (string) get_option('aureherb_seo_bing_meta', '');
    if ($bing !== '') {
        echo '<meta name="msvalidate.01" content="' . esc_attr($bing) . '">' . "\n";
    }
}, 0);

function aureherb_seo_sanitize_verify_meta($value)
{
    $value = is_string($value) ? trim($value) : '';
    if ($value === '') {
        return '';
    }
    if (preg_match('/content\s*=\s*["\']([^"\']+)["\']/i', $value, $match)) {
        $value = $match[1];
    }
    return sanitize_text_field($value);
}

function aureherb_seo_admin_page()
{
    if (!current_user_can('manage_woocommerce')) {
        return;
    }

    $seeded = (string) get_option('aureherb_seo_seeded_v1', '');
    $seeded6 = (string) get_option('aureherb_seo_seeded_v6', '');
    $rank = defined('RANK_MATH_VERSION') ? RANK_MATH_VERSION : 'not active';
    $spot = get_option('aureherb_seo_aeo_spotcheck');
    $gsc = (string) get_option('aureherb_seo_gsc_meta', '');
    $bing = (string) get_option('aureherb_seo_bing_meta', '');
    $sitemap = home_url('/sitemap_index.xml');
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('AureHerb SEO & AEO', 'aureherb'); ?></h1>
        <p>Canonical host: <code>https://aureherb.com</code>. Keep www as a 301 to apex.</p>
        <p>Content seed: <?php echo $seeded !== '' ? esc_html($seeded) : 'not run yet'; ?>. Remaining-items seed (v6): <?php echo $seeded6 !== '' ? esc_html($seeded6) : 'pending until this plugin version loads on the site'; ?>. Rank Math: <?php echo esc_html((string) $rank); ?>.</p>

        <h2>1. Google Search Console (you do this)</h2>
        <p><?php echo $gsc !== '' ? '<strong>Meta code is saved.</strong> Go back to Search Console and click Verify. Then submit the sitemap.' : '<strong>No Google code saved yet.</strong> Paste it below after you copy it from Search Console.'; ?></p>
        <ol>
            <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noopener">Google Search Console</a>.</li>
            <li>Add property → <strong>URL prefix</strong> → <code>https://aureherb.com</code> (apex, with https, no www, no trailing path).</li>
            <li>Choose <strong>HTML tag</strong> verification.</li>
            <li>Copy only the <code>content="..."</code> value (or paste the whole meta tag — this form extracts it).</li>
            <li>Paste it in the Google field below and click Save. View the homepage source and confirm <code>google-site-verification</code> is in <code>&lt;head&gt;</code>.</li>
            <li>Return to Search Console and click <strong>Verify</strong>.</li>
            <li>Sitemaps → submit <code><?php echo esc_html($sitemap); ?></code> (Rank Math). Do not submit <code>wp-sitemap.xml</code> unless Rank Math is off.</li>
        </ol>
        <p>Optional: Search Console also offers a DNS TXT record. Prefer this HTML tag unless you would rather add TXT in Hostinger DNS.</p>

        <h2>2. Bing Webmaster (you do this)</h2>
        <p><?php echo $bing !== '' ? '<strong>Meta code is saved.</strong> Click Verify in Bing, then submit the same sitemap.' : '<strong>No Bing code saved yet.</strong> Paste it below after you copy it from Bing Webmaster.'; ?></p>
        <ol>
            <li>Open <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener">Bing Webmaster</a>.</li>
            <li>Add <code>https://aureherb.com</code>.</li>
            <li>Choose HTML meta tag verification. Paste the content value (or the whole tag) in the Bing field below and Save.</li>
            <li>Click <strong>Verify</strong> in Bing, then submit <code><?php echo esc_html($sitemap); ?></code>.</li>
        </ol>

        <form method="post" action="options.php">
            <?php settings_fields('aureherb_seo'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="aureherb_seo_gsc_meta">Google verification content</label></th>
                    <td>
                        <input class="large-text" id="aureherb_seo_gsc_meta" name="aureherb_seo_gsc_meta" type="text" value="<?php echo esc_attr($gsc); ?>" placeholder="Paste content= value or the whole meta tag">
                        <p class="description">Becomes <code>&lt;meta name="google-site-verification" content="…"&gt;</code> on every public page.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="aureherb_seo_bing_meta">Bing verification content</label></th>
                    <td>
                        <input class="large-text" id="aureherb_seo_bing_meta" name="aureherb_seo_bing_meta" type="text" value="<?php echo esc_attr($bing); ?>" placeholder="Paste content= value or the whole meta tag">
                        <p class="description">Becomes <code>&lt;meta name="msvalidate.01" content="…"&gt;</code>.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(__('Save verification codes', 'aureherb')); ?>
        </form>

        <h2>3. Google Merchant Center (after Search Console)</h2>
        <p>Connect only when you are ready. Match the live shop — do not invent an address or pin.</p>
        <ul>
            <li>Currency: <strong>PKR</strong>.</li>
            <li>Shipping: <strong>free</strong> with cash on delivery across Pakistan.</li>
            <li>Payment: cash on delivery, same as checkout.</li>
            <li>Product URL: <code><?php echo esc_html(home_url('/product/hair-growth-oil/')); ?></code>.</li>
            <li>Skip Google Business Profile. There is no public walk-in address, so do not drop a map pin.</li>
            <li>Skip founder / Person schema. Organization + sameAs (Instagram, Facebook, WhatsApp) is enough.</li>
        </ul>

        <h2>4. Genuine citations (no bought links)</h2>
        <p>Use the same brand name, apex URL, and WhatsApp on every profile. Submit only if the listing is real and free or a normal business listing — never paid “SEO backlinks.”</p>
        <table class="widefat striped" style="max-width:52rem;">
            <thead>
                <tr><th>Where</th><th>What to enter</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td><a href="https://www.yellowpages.com.pk/" target="_blank" rel="noopener">Yellow Pages Pakistan</a></td>
                    <td>AureHerb · https://aureherb.com · WhatsApp +92 313 7022646 · category: hair care / cosmetics · online only, no street pin</td>
                </tr>
                <tr>
                    <td><a href="https://www.hotfrog.pk/" target="_blank" rel="noopener">Hotfrog Pakistan</a></td>
                    <td>Same NAP. Description: Pakistan botanical hair-care shop; flagship AureHerb Hair Growth Oil; cash on delivery.</td>
                </tr>
                <tr>
                    <td><a href="https://www.pakbiz.com/" target="_blank" rel="noopener">PakBiz</a></td>
                    <td>Company profile with the same name, URL, and WhatsApp. Do not buy extra directory packages for links.</td>
                </tr>
            </tbody>
        </table>
        <p>Already public: Instagram <a href="https://www.instagram.com/aureherbofficial" target="_blank" rel="noopener">@aureherbofficial</a>, Facebook, WhatsApp. Completed-order email already asks for a product review.</p>

        <h2>5. Monthly AEO questions</h2>
        <p>Ask ChatGPT, Perplexity, and Google (including AI Overview if shown). Note whether AureHerb is named or cited. Goal is indexation and citable pages, not “rank in AI Overviews.”</p>
        <ul>
            <li>What is the best hair growth oil in Pakistan?</li>
            <li>Does rosemary oil help hair?</li>
            <li>AureHerb Hair Growth Oil ingredients</li>
            <li>How to use hair growth oil</li>
            <li>Hair oil cash on delivery Pakistan</li>
        </ul>
        <?php if (is_array($spot) && !empty($spot['at'])) : ?>
            <p><strong>Last automated spot check:</strong> <?php echo esc_html((string) $spot['at']); ?></p>
            <pre style="white-space:pre-wrap;max-width:52rem;"><?php echo esc_html((string) ($spot['notes'] ?? '')); ?></pre>
        <?php endif; ?>
        <p>Public files: <a href="<?php echo esc_url(home_url('/llms.txt')); ?>">llms.txt</a> · <a href="<?php echo esc_url(home_url('/robots.txt')); ?>">robots.txt</a> · <a href="<?php echo esc_url($sitemap); ?>">sitemap_index.xml</a></p>
    </div>
    <?php
}
