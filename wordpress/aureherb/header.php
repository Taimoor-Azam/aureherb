<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="<?php echo esc_url(aureherb_asset('images/aureherb-logo.png')); ?>">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header">
  <nav class="site-nav content-container" aria-label="<?php esc_attr_e('Primary', 'aureherb'); ?>">
    <div class="nav-start">
      <a class="nav-logo" href="<?php echo esc_url(home_url('/')); ?>" aria-label="<?php esc_attr_e('AureHerb home', 'aureherb'); ?>">
        <img src="<?php echo esc_url(aureherb_asset('images/aureherb-logo.png')); ?>" alt="AureHerb" width="36" height="36">
      </a>
      <button class="menu-toggle" type="button" data-drawer-open aria-label="<?php esc_attr_e('Open menu', 'aureherb'); ?>">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
          <path d="M1 1h14M1 6h14M1 11h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <a class="nav-wordmark" href="<?php echo esc_url(home_url('/')); ?>">AureHerb</a>

    <div class="nav-end">
      <ul class="nav-links">
        <li><a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/')); ?>"><?php esc_html_e('Account', 'aureherb'); ?></a></li>
      </ul>
      <a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('cart') : home_url('/cart/')); ?>">
        <?php echo esc_html(sprintf(__('Cart (%d)', 'aureherb'), aureherb_cart_count())); ?>
      </a>
    </div>
  </nav>
</header>

<div class="site-drawer" data-drawer>
  <div class="site-drawer-backdrop" data-drawer-close></div>
  <div class="site-drawer-panel" role="dialog" aria-label="<?php esc_attr_e('Menu', 'aureherb'); ?>">
    <button class="site-drawer-close" type="button" data-drawer-close aria-label="<?php esc_attr_e('Close menu', 'aureherb'); ?>">&times;</button>
    <ul>
      <li><a href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Home', 'aureherb'); ?></a></li>
      <li><a href="<?php echo esc_url(aureherb_shop_url()); ?>"><?php esc_html_e('Store', 'aureherb'); ?></a></li>
      <li><a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/')); ?>"><?php esc_html_e('Account', 'aureherb'); ?></a></li>
      <li><a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('cart') : home_url('/cart/')); ?>"><?php esc_html_e('Cart', 'aureherb'); ?></a></li>
    </ul>
  </div>
</div>

<main id="main">
