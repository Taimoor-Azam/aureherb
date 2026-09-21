<?php
/**
 * Homepage: hero video, shop rail, testimonials, about.
 */
if (!defined('ABSPATH')) {
    exit;
}

get_header();

$shop_url = aureherb_shop_url();
$video = aureherb_asset('videos/hair-oiling-ritual.mp4');
$poster = aureherb_asset('images/aureherb-hair-growth-oil-banner.png');
$testimonials = [
    [
        'name' => 'Ayesha K.',
        'image' => 'testimonials/ayesha.jpg',
        'quote' => "I've used AureHerb Hair Growth Oil for six weeks and my scalp feels calmer. The ritual is simple and the scent is clean — not heavy.",
        'rating' => 5,
    ],
    [
        'name' => 'Sana R.',
        'image' => 'testimonials/sana.jpg',
        'quote' => "Finally an oil that doesn't leave my hair greasy. A few drops after washing and it feels softer by the next morning.",
        'rating' => 5,
    ],
    [
        'name' => 'Fatima M.',
        'image' => 'testimonials/fatima.jpg',
        'quote' => 'I was skeptical, but consistent use made a real difference around my temples. Packaging feels thoughtful too.',
        'rating' => 4,
    ],
    [
        'name' => 'Hira N.',
        'image' => 'testimonials/hira.jpg',
        'quote' => 'Gentle, botanical, and easy to fit into my Sunday oiling routine. Cash on delivery made trying it easy.',
        'rating' => 5,
    ],
];
?>

<section class="hero">
  <h1 class="screen-reader-text">AureHerb Hair Growth Oil</h1>
  <a class="hero-link" href="<?php echo esc_url($shop_url); ?>" aria-label="<?php esc_attr_e('Shop AureHerb Hair Growth Oil', 'aureherb'); ?>">
    <div class="hero-video-wrap">
      <video data-hero-video muted loop playsinline preload="auto" poster="<?php echo esc_url($poster); ?>" aria-hidden="true">
        <source src="<?php echo esc_url($video); ?>" type="video/mp4">
      </video>
      <canvas data-hero-canvas class="hero-canvas" aria-hidden="true"></canvas>
    </div>
    <img
      class="hero-poster"
      src="<?php echo esc_url($poster); ?>"
      alt="AureHerb Hair Growth Oil — Rosemary, Castor, and Black Seed. Nourish your roots. Grow your confidence."
      width="1024"
      height="426"
    >
  </a>
</section>

<?php if (function_exists('wc_get_products')) : ?>
  <?php
  $products = wc_get_products([
      'status' => 'publish',
      'limit' => 8,
      'orderby' => 'date',
      'order' => 'DESC',
  ]);
  ?>
  <?php if ($products) : ?>
    <section class="section content-container">
      <h2 class="section-title"><?php esc_html_e('Shop', 'aureherb'); ?></h2>
      <ul class="product-grid">
        <?php foreach ($products as $product) : ?>
          <li class="product-card">
            <a href="<?php echo esc_url($product->get_permalink()); ?>">
              <?php echo $product->get_image('woocommerce_single'); ?>
              <div class="product-card-body">
                <h3><?php echo esc_html($product->get_name()); ?></h3>
                <p class="price"><?php echo wp_kses_post($product->get_price_html()); ?></p>
              </div>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>
    </section>
  <?php endif; ?>
<?php endif; ?>

<section class="section content-container" aria-labelledby="testimonials-heading">
  <h2 id="testimonials-heading" class="section-title"><?php esc_html_e('Testimonials', 'aureherb'); ?></h2>
  <p class="section-lead"><?php esc_html_e('What people say about AureHerb Hair Growth Oil.', 'aureherb'); ?></p>
  <div class="testimonial-card" data-testimonials>
    <?php foreach ($testimonials as $i => $item) : ?>
      <article class="testimonial-slide<?php echo $i === 0 ? ' is-active' : ''; ?>" data-slide="<?php echo esc_attr((string) $i); ?>" <?php echo $i === 0 ? '' : 'hidden'; ?>>
        <div class="testimonial-photo">
          <img src="<?php echo esc_url(aureherb_asset($item['image'])); ?>" alt="<?php echo esc_attr($item['name']); ?>" width="96" height="96">
        </div>
        <p class="testimonial-stars" aria-label="<?php echo esc_attr($item['rating'] . ' out of 5 stars'); ?>">
          <?php echo esc_html(str_repeat('★', $item['rating'])); ?><span class="empty"><?php echo esc_html(str_repeat('★', 5 - $item['rating'])); ?></span>
        </p>
        <blockquote class="testimonial-quote">“<?php echo esc_html($item['quote']); ?>”</blockquote>
        <p class="testimonial-name"><?php echo esc_html($item['name']); ?></p>
      </article>
    <?php endforeach; ?>
    <div class="testimonial-dots" role="tablist" aria-label="<?php esc_attr_e('Choose testimonial', 'aureherb'); ?>">
      <?php foreach ($testimonials as $i => $item) : ?>
        <button type="button" role="tab" data-goto="<?php echo esc_attr((string) $i); ?>" class="<?php echo $i === 0 ? 'is-active' : ''; ?>" aria-label="<?php echo esc_attr(sprintf(__('Show testimonial %d', 'aureherb'), $i + 1)); ?>"></button>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="about section" aria-labelledby="about-heading">
  <div class="content-container about-inner">
    <h2 id="about-heading" class="section-title"><?php esc_html_e('Why Choose AureHerb?', 'aureherb'); ?></h2>
    <p><?php esc_html_e('AureHerb is an online store for botanical hair care. Our flagship product is AureHerb Hair Growth Oil — a premium blend of botanical oils and herbal extracts made to nourish the scalp, strengthen hair, and support healthier-looking growth.', 'aureherb'); ?></p>
    <p><?php esc_html_e('At AureHerb, we believe healthy hair begins with healthy roots. Our Hair Growth Oil combines time-honored botanical ingredients with modern formulation techniques to deliver a premium hair care experience.', 'aureherb'); ?></p>
    <p><?php esc_html_e('Unlike ordinary hair oils, AureHerb is enriched with multiple botanical oils and herbal extracts that work together to provide complete scalp and hair nourishment.', 'aureherb'); ?></p>
  </div>
</section>

<?php
// SEO/AEO body content from the Home page (plugin or editor), when present.
while (have_posts()) {
    the_post();
    $seo_body = trim((string) get_the_content());
    if ($seo_body !== '') {
        echo '<section class="section content-container legal seo-home-content" aria-label="' . esc_attr__('More about AureHerb', 'aureherb') . '">';
        echo '<div class="seo-home-inner">';
        the_content();
        echo '</div></section>';
    }
}
?>

<?php
get_footer();
