<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
</main>

<footer class="site-footer">
  <div class="content-container">
    <div class="footer-cols">
      <div>
        <h2><?php esc_html_e('Social Media', 'aureherb'); ?></h2>
        <div class="socials">
          <a href="https://www.facebook.com/share/1HPAidoQoY/" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e('AureHerb on Facebook', 'aureherb'); ?>">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.174 2.097 15.943 2 14.643 2 11.928 2 10 3.657 10 6.7V9.5H7v4h3V22h4v-8.5z" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/aureherbofficial" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e('AureHerb on Instagram', 'aureherb'); ?>">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </div>
      <div>
        <h2><?php esc_html_e('Learn', 'aureherb'); ?></h2>
        <ul>
          <li><a href="<?php echo esc_url(home_url('/about/')); ?>"><?php esc_html_e('About', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/contact/')); ?>"><?php esc_html_e('Contact', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/faq/')); ?>"><?php esc_html_e('FAQ', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/how-to-use/')); ?>"><?php esc_html_e('How to use', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/ingredients/')); ?>"><?php esc_html_e('Ingredients', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/shipping/')); ?>"><?php esc_html_e('Shipping', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/journal/')); ?>"><?php esc_html_e('Journal', 'aureherb'); ?></a></li>
        </ul>
      </div>
      <div>
        <h2><?php esc_html_e('Help', 'aureherb'); ?></h2>
        <ul>
          <li><a href="<?php echo esc_url(home_url('/track-order/')); ?>"><?php esc_html_e('Track Your Order', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(aureherb_shop_url()); ?>"><?php esc_html_e('Shop all', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('cart') : home_url('/cart/')); ?>"><?php esc_html_e('Cart', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/')); ?>"><?php esc_html_e('Account', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/privacy-policy/')); ?>"><?php esc_html_e('Privacy Policy', 'aureherb'); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/terms-of-use/')); ?>"><?php esc_html_e('Terms of Use', 'aureherb'); ?></a></li>
        </ul>
      </div>
    </div>
    <p class="copyright">&copy; <?php echo esc_html(gmdate('Y')); ?> AureHerb.</p>
  </div>
</footer>

<a
  class="whatsapp-fab"
  href="https://wa.me/923137022646?text=<?php echo rawurlencode("Welcome to aureherb, Premium Hair herbel oil.\nhow can we assist you ?"); ?>"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="<?php esc_attr_e('Chat on WhatsApp', 'aureherb'); ?>"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
</a>

<?php wp_footer(); ?>
</body>
</html>
