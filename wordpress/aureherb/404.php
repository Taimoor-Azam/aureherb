<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
?>
<div class="content-container legal">
  <h1 class="page-title"><?php esc_html_e('Page not found', 'aureherb'); ?></h1>
  <p><?php esc_html_e('The page you tried to access does not exist.', 'aureherb'); ?></p>
  <p><a class="button" href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Go to frontpage', 'aureherb'); ?></a></p>
</div>
<?php
get_footer();
