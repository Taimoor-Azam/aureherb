<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
?>
<div class="content-container">
  <?php if (have_posts()) : ?>
    <?php while (have_posts()) : the_post(); ?>
      <article <?php post_class('legal'); ?>>
        <h1 class="page-title"><?php the_title(); ?></h1>
        <div><?php the_content(); ?></div>
      </article>
    <?php endwhile; ?>
  <?php else : ?>
    <p><?php esc_html_e('Nothing found.', 'aureherb'); ?></p>
  <?php endif; ?>
</div>
<?php
get_footer();
