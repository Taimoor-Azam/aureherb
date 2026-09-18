<?php
/**
 * Shop archive — uses WooCommerce loop inside the AureHerb layout.
 */
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<div class="content-container woocommerce-page">
  <h1 class="page-title"><?php woocommerce_page_title(); ?></h1>
  <?php
  if (woocommerce_product_loop()) {
      woocommerce_product_loop_start();
      if (wc_get_loop_prop('is_shortcode')) {
          $columns = absint(wc_get_loop_prop('columns'));
          wc_set_loop_prop('columns', $columns);
      }
      if (wc_get_loop_prop('total')) {
          while (have_posts()) {
              the_post();
              wc_get_template_part('content', 'product');
          }
      }
      woocommerce_product_loop_end();
      woocommerce_pagination();
  } else {
      do_action('woocommerce_no_products_found');
  }
  ?>
</div>
<?php
get_footer();
