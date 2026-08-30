<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
?>
<div class="content-container">
  <?php while (have_posts()) : the_post(); ?>
    <article class="legal">
      <h1 class="page-title"><?php the_title(); ?></h1>
      <div><?php the_content(); ?></div>
    </article>
  <?php endwhile; ?>
</div>
<?php
get_footer();
