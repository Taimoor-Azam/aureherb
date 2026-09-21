<?php

if (!defined('ABSPATH')) {
    exit;
}

function aureherb_seo_organization_ld()
{
    $logo = function_exists('aureherb_asset')
        ? aureherb_asset('images/aureherb-logo.png')
        : home_url('/wp-content/themes/aureherb/assets/images/aureherb-logo.png');

    return [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'AureHerb',
        'url' => home_url('/'),
        'logo' => $logo,
        'sameAs' => [
            'https://www.instagram.com/aureherbofficial',
            'https://www.facebook.com/share/1HPAidoQoY/',
            'https://wa.me/923137022646',
        ],
        'areaServed' => [
            '@type' => 'Country',
            'name' => 'Pakistan',
        ],
    ];
}

function aureherb_seo_website_ld()
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => 'AureHerb',
        'url' => home_url('/'),
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'AureHerb',
            'url' => home_url('/'),
        ],
    ];
}

function aureherb_seo_faq_ld($items)
{
    $entities = [];
    foreach ($items as $item) {
        $entities[] = [
            '@type' => 'Question',
            'name' => $item['q'],
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => $item['a'],
            ],
        ];
    }

    return [
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        'mainEntity' => $entities,
    ];
}

function aureherb_seo_howto_ld()
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'HowTo',
        'name' => 'How to use AureHerb Hair Growth Oil',
        'description' => 'A simple scalp-oiling ritual using AureHerb Hair Growth Oil.',
        'totalTime' => 'PT20M',
        'tool' => [
            ['@type' => 'HowToTool', 'name' => 'AureHerb Hair Growth Oil'],
        ],
        'step' => [
            [
                '@type' => 'HowToStep',
                'position' => 1,
                'name' => 'Start with dry or towel-dried hair',
                'text' => 'Section your hair so you can see the scalp. A little oil goes further on a dry or towel-dried scalp than on soaking-wet hair.',
            ],
            [
                '@type' => 'HowToStep',
                'position' => 2,
                'name' => 'Warm a few drops',
                'text' => 'Place a few drops of AureHerb Hair Growth Oil in your palm and rub your hands together until the oil feels warm.',
            ],
            [
                '@type' => 'HowToStep',
                'position' => 3,
                'name' => 'Massage the scalp',
                'text' => 'Massage the oil into the scalp with your fingertips for several minutes, then smooth leftover oil through the lengths if they feel dry.',
            ],
            [
                '@type' => 'HowToStep',
                'position' => 4,
                'name' => 'Leave on, then wash',
                'text' => 'Leave the oil on for at least 20 minutes, or overnight if your scalp is comfortable. Wash with a gentle shampoo and repeat two to three times a week.',
            ],
        ],
    ];
}

function aureherb_seo_breadcrumbs_ld()
{
    if (is_front_page()) {
        return null;
    }

    $items = [
        ['name' => 'Home', 'url' => home_url('/')],
    ];

    if (function_exists('is_product') && is_product()) {
        $items[] = [
            'name' => 'Shop',
            'url' => function_exists('aureherb_shop_url') ? aureherb_shop_url() : home_url('/shop/'),
        ];
        $items[] = ['name' => get_the_title(), 'url' => get_permalink()];
    } elseif (is_singular('post')) {
        $items[] = ['name' => 'Journal', 'url' => home_url('/journal/')];
        $items[] = ['name' => get_the_title(), 'url' => get_permalink()];
    } elseif (is_home()) {
        $items[] = ['name' => 'Journal', 'url' => home_url('/journal/')];
    } elseif (is_page()) {
        $items[] = ['name' => get_the_title(), 'url' => get_permalink()];
    } elseif (function_exists('is_shop') && is_shop()) {
        $items[] = [
            'name' => 'Shop',
            'url' => function_exists('aureherb_shop_url') ? aureherb_shop_url() : home_url('/shop/'),
        ];
    } else {
        return null;
    }

    $list = [];
    foreach ($items as $i => $item) {
        $list[] = [
            '@type' => 'ListItem',
            'position' => $i + 1,
            'name' => $item['name'],
            'item' => $item['url'],
        ];
    }

    return [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => $list,
    ];
}

function aureherb_seo_print_jsonld()
{
    $graphs = [aureherb_seo_organization_ld(), aureherb_seo_website_ld()];

    $crumbs = aureherb_seo_breadcrumbs_ld();
    if (is_array($crumbs)) {
        $graphs[] = $crumbs;
    }

    if (is_front_page()) {
        $graphs[] = [
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => 'AureHerb Hair Growth Oil',
            'url' => home_url('/'),
            'description' => aureherb_seo_current_description(),
            'isPartOf' => ['@type' => 'WebSite', 'name' => 'AureHerb', 'url' => home_url('/')],
        ];
    }

    if (is_page('faq')) {
        $graphs[] = aureherb_seo_faq_ld(aureherb_seo_product_faqs());
    }

    if (is_page('how-to-use')) {
        $graphs[] = aureherb_seo_howto_ld();
        $graphs[] = aureherb_seo_faq_ld(aureherb_seo_howto_faqs());
    }

    if (is_singular('post')) {
        $graphs[] = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => get_the_title(),
            'datePublished' => get_the_date('c'),
            'dateModified' => get_the_modified_date('c'),
            'author' => [
                '@type' => 'Organization',
                'name' => 'AureHerb',
                'url' => home_url('/'),
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'AureHerb',
                'url' => home_url('/'),
            ],
            'mainEntityOfPage' => get_permalink(),
            'image' => aureherb_seo_share_image(),
        ];
    }

    echo '<script type="application/ld+json">' . wp_json_encode($graphs, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
}

function aureherb_seo_filter_rank_math_ld($data, $jsonld)
{
    unset($jsonld);
    if (!is_array($data)) {
        return $data;
    }

    $drop = ['Organization', 'WebSite', 'BreadcrumbList', 'Person'];
    if (is_front_page() || is_page() || is_singular('post')) {
        $drop[] = 'Article';
        $drop[] = 'BlogPosting';
    }
    if (is_page('faq') || is_page('how-to-use') || (function_exists('is_product') && is_product())) {
        $drop[] = 'FAQPage';
    }

    $strip = static function ($node) use (&$strip, $drop) {
        if (!is_array($node)) {
            return $node;
        }

        if (isset($node['@type'])) {
            $type = is_array($node['@type']) ? implode(',', $node['@type']) : (string) $node['@type'];
            if (in_array($type, $drop, true)) {
                return null;
            }
        }

        if (isset($node['@graph']) && is_array($node['@graph'])) {
            $kept = [];
            foreach ($node['@graph'] as $item) {
                $item = $strip($item);
                if ($item !== null) {
                    $kept[] = $item;
                }
            }
            $node['@graph'] = $kept;
            return $node;
        }

        $is_list = $node === [] || array_keys($node) === range(0, count($node) - 1);
        if ($is_list) {
            $kept = [];
            foreach ($node as $item) {
                $item = $strip($item);
                if ($item !== null) {
                    $kept[] = $item;
                }
            }
            return $kept;
        }

        foreach ($node as $key => $item) {
            if (!is_array($item) || !isset($item['@type'])) {
                continue;
            }
            $type = is_array($item['@type']) ? implode(',', $item['@type']) : (string) $item['@type'];
            if (in_array($type, $drop, true)) {
                unset($node[$key]);
            }
        }
        return $node;
    };

    return $strip($data);
}
