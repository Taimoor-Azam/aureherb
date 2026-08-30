<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
?>
<div class="content-container woocommerce-page">
  <?php woocommerce_content(); ?>
</div>
<?php
get_footer();
