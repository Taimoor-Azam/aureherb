<?php

if (!defined('ABSPATH')) {
    exit;
}

function aureherb_seo_product_faqs()
{
    return [
        [
            'q' => 'What is AureHerb Hair Growth Oil?',
            'a' => 'AureHerb Hair Growth Oil is a botanical scalp oil sold in Pakistan. It blends rosemary, castor, and black seed oils to nourish the scalp and support healthier-looking hair. It is a cosmetic oil, not a medicine, and does not claim to treat disease or guarantee new growth.',
        ],
        [
            'q' => 'How do I use AureHerb Hair Growth Oil?',
            'a' => 'Warm a few drops in your palms, massage into the scalp for several minutes, and leave on for at least 20 minutes or overnight. Wash with a gentle shampoo. Most people use it two to three times a week. See the how-to page for the full ritual.',
        ],
        [
            'q' => 'Do you offer cash on delivery in Pakistan?',
            'a' => 'Yes. AureHerb offers cash on delivery across Pakistan. Shipping is free with cash on delivery across Pakistan. You can also message the shop on WhatsApp before you order.',
        ],
        [
            'q' => 'What is in AureHerb Hair Growth Oil?',
            'a' => 'The oil is a blend of botanical oils and herbal extracts. The hero ingredients called out on the product are rosemary, castor, and black seed oils. They are chosen to moisturize the scalp and hair rather than to act as a drug.',
        ],
        [
            'q' => 'Who is AureHerb Hair Growth Oil for?',
            'a' => 'It is made for people who want a simple oiling ritual — men and women, and most hair types. If your scalp is irritated, patch-test first and stop if discomfort lasts. It is not a substitute for medical care.',
        ],
        [
            'q' => 'How much is shipping?',
            'a' => 'Shipping in Pakistan is free with cash on delivery. Delivery times vary by city; tracking is available from the Track Your Order page after dispatch.',
        ],
    ];
}

function aureherb_seo_howto_faqs()
{
    return [
        [
            'q' => 'How often should I oil my hair?',
            'a' => 'Two to three times a week is a practical starting point for AureHerb Hair Growth Oil. Daily use can feel heavy on some scalps. Adjust based on how your scalp feels after washing.',
        ],
        [
            'q' => 'Can I leave hair growth oil on overnight?',
            'a' => 'Yes, if your scalp is comfortable. Use a towel on your pillow. If you wake with itch or redness, shorten the leave-on time to about 20 minutes before the next wash.',
        ],
    ];
}

function aureherb_seo_faq_html($items)
{
    $html = '<section class="seo-faq" aria-labelledby="seo-faq-heading"><h2 id="seo-faq-heading">Frequently asked questions</h2>';
    foreach ($items as $item) {
        $html .= '<details class="seo-faq-item"><summary>' . esc_html($item['q']) . '</summary><p>' . esc_html($item['a']) . '</p></details>';
    }
    $html .= '</section>';
    return $html;
}

function aureherb_seo_cta()
{
    $url = esc_url(aureherb_seo_product_url());
    return '<p class="seo-cta"><a class="button" href="' . $url . '">Shop AureHerb Hair Growth Oil</a></p>';
}

function aureherb_seo_hub_links()
{
    $product = esc_url(aureherb_seo_product_url());
    return '<p>Continue: <a href="' . $product . '">AureHerb Hair Growth Oil</a> · <a href="' . esc_url(home_url('/how-to-use/')) . '">How to use</a> · <a href="' . esc_url(home_url('/ingredients/')) . '">Ingredients</a> · <a href="' . esc_url(home_url('/faq/')) . '">FAQ</a>.</p>';
}

function aureherb_seo_page_about()
{
    return '<p>AureHerb is an online botanical hair-care shop in Pakistan. The flagship product is AureHerb Hair Growth Oil, a blend of rosemary, castor, and black seed oils made to nourish the scalp and support healthier-looking hair. Orders ship nationwide with cash on delivery.</p>
<p>Healthy-looking hair starts at the roots. AureHerb focuses on a simple oiling ritual rather than a long routine: a few drops, a scalp massage, then a gentle wash. The oil is a cosmetic, not a medicine. It does not treat disease or promise a set amount of new growth.</p>
<p>The shop is digital-first. There is no walk-in counter listed here. Questions go to WhatsApp or Instagram <a href="https://www.instagram.com/aureherbofficial">@aureherbofficial</a>. Shipping is free with cash on delivery across Pakistan.</p>
<h2>Brand name</h2>
<p>Use <strong>AureHerb</strong> for the company and <strong>AureHerb Hair Growth Oil</strong> for the product. That spelling matches the website, Instagram, and packaging.</p>
' . aureherb_seo_hub_links() . aureherb_seo_cta();
}

function aureherb_seo_page_ingredients()
{
    return '<p>AureHerb Hair Growth Oil is a botanical blend. The three oils named on the bottle and site are rosemary, castor, and black seed. Together they moisturize the scalp and hair. They are not drugs, and AureHerb does not sell them as a treatment for hair-loss disease.</p>
<h2>Rosemary oil</h2>
<p>Rosemary is a common herb oil in scalp rituals. In this formula it is used for a light, herbal scent and as part of the blend that helps the scalp feel conditioned after massage.</p>
<h2>Castor oil</h2>
<p>Castor oil is thicker than many hair oils. A small amount helps the blend cling to the scalp and lengths so the ritual does not feel watery or instantly gone.</p>
<h2>Black seed oil</h2>
<p>Black seed (Nigella sativa) oil is used in many traditional hair oils. Here it is one part of a cosmetic blend, not a medical dose.</p>
<h2>How to read this list</h2>
<p>Always patch-test a new oil. If you have a known allergy to any seed or herb oil, do not use the product. For the full ritual, see <a href="' . esc_url(home_url('/how-to-use/')) . '">how to use hair growth oil</a>. Short answers also live in the <a href="' . esc_url(home_url('/faq/')) . '">FAQ</a>.</p>
' . aureherb_seo_cta();
}

function aureherb_seo_page_howto()
{
    $html = '<p>AureHerb Hair Growth Oil is used as a scalp-oiling ritual two to three times a week. Warm a few drops, massage the scalp, leave on, then wash. It nourishes the scalp; it does not replace medical care for hair-loss disease.</p>
<ol class="howto-steps">
<li><strong>Start with dry or towel-dried hair.</strong> Section the hair so you can reach the scalp.</li>
<li><strong>Warm a few drops</strong> in your palms until the oil feels comfortable, not hot.</li>
<li><strong>Massage the scalp</strong> with your fingertips for several minutes. Smooth leftover oil through dry lengths if you want.</li>
<li><strong>Leave on for at least 20 minutes</strong>, or overnight on a towel-covered pillow. Wash with a gentle shampoo.</li>
</ol>
<p>If the scalp stings or stays red, rinse and stop. Patch-test before the first full use.</p>
<p>A longer walkthrough lives in the journal: <a href="' . esc_url(home_url('/sunday-oiling-ritual/')) . '">how to do a Sunday oiling ritual</a>. Named oils are listed on <a href="' . esc_url(home_url('/ingredients/')) . '">ingredients</a>.</p>';
    $html .= aureherb_seo_faq_html(aureherb_seo_howto_faqs());
    $html .= aureherb_seo_cta();
    return $html;
}

function aureherb_seo_page_shipping()
{
    return '<p>AureHerb ships Hair Growth Oil across Pakistan. Cash on delivery is available. Shipping is free with cash on delivery.</p>
<h2>Cash on delivery</h2>
<p>Pay the courier when the parcel arrives. If you need to confirm an address or a city before checkout, message the shop on <a href="https://wa.me/923137022646">WhatsApp</a>.</p>
<h2>Delivery and tracking</h2>
<p>Dispatch times vary by city and courier load. After your order is handed to the courier, use <a href="' . esc_url(home_url('/track-order/')) . '">Track Your Order</a> with the details from your confirmation.</p>
<h2>Returns</h2>
<p>If the bottle arrives damaged or the order is wrong, contact WhatsApp with your order number and a photo. Unopened, unused products in original packaging may be discussed case by case. Opened cosmetic oils generally cannot be resold, so opened returns are limited.</p>
' . aureherb_seo_cta();
}

function aureherb_seo_page_faq()
{
    $html = '<p>Short answers about AureHerb Hair Growth Oil, cash on delivery in Pakistan, ingredients, and how to use the oil. Shop the <a href="' . esc_url(aureherb_seo_product_url()) . '">product</a>, read <a href="' . esc_url(home_url('/how-to-use/')) . '">how to use</a>, or see <a href="' . esc_url(home_url('/ingredients/')) . '">ingredients</a>.</p>';
    $html .= aureherb_seo_faq_html(aureherb_seo_product_faqs());
    $html .= aureherb_seo_cta();
    return $html;
}

function aureherb_seo_page_contact()
{
    return '<p>AureHerb is an online shop serving Pakistan. There is no public walk-in address on this page. For order questions, ingredients, or delivery, use WhatsApp or Instagram.</p>
<ul>
<li>WhatsApp: <a href="https://wa.me/923137022646">+92 313 7022646</a></li>
<li>Instagram: <a href="https://www.instagram.com/aureherbofficial">@aureherbofficial</a></li>
<li>Facebook: <a href="https://www.facebook.com/share/1HPAidoQoY/">AureHerb on Facebook</a></li>
</ul>
<p>Please include your order number if you already checked out. For shipping rules see <a href="' . esc_url(home_url('/shipping/')) . '">shipping, COD, and returns</a>.</p>';
}

function aureherb_seo_page_journal()
{
    return '<p>Guides from AureHerb on oiling rituals, botanical oils, and buying hair oil with cash on delivery in Pakistan. Each article answers one question in plain language and links back to <a href="' . esc_url(aureherb_seo_product_url()) . '">AureHerb Hair Growth Oil</a>.</p>';
}

function aureherb_seo_page_privacy()
{
    $site = esc_url(home_url('/'));
    $mail = 'info.aure.herb@gmail.com';
    return '<p>Last updated: 1 September 2026</p>
<p>AureHerb ("we", "us", or "our") operates <a href="' . $site . '">aureherb.com</a>. This Privacy Policy explains how we collect, use, and share personal information when you browse our store, create an account, place an order, or contact us.</p>
<h2>Information we collect</h2>
<p>We may collect:</p>
<ul>
<li>Account details such as name, email address, phone number, and password (if you register with email/password).</li>
<li>Order and shipping details such as delivery address, order contents, and payment method (including cash on delivery information).</li>
<li>Support messages you send us by email, WhatsApp, or other channels.</li>
<li>Basic technical data such as browser type, device information, and pages visited, used to keep the site secure and working.</li>
</ul>
<h2>Google sign-in</h2>
<p>If you choose <strong>Continue with Google</strong>, Google shares limited profile information with us (typically your name and email address) so we can create or sign you into your AureHerb account. We do not receive your Google password. You can disconnect Google access from your Google Account settings at any time.</p>
<h2>How we use your information</h2>
<ul>
<li>To process and fulfill orders, including delivery and updates.</li>
<li>To create and manage your customer account.</li>
<li>To respond to questions, returns, and support requests.</li>
<li>To improve our website, products, and customer experience.</li>
<li>To detect and prevent fraud or misuse of our services.</li>
</ul>
<h2>How we share information</h2>
<p>We do not sell your personal information. We may share information with trusted service providers who help us operate the store, such as:</p>
<ul>
<li>Hosting and infrastructure providers</li>
<li>Email and notification providers</li>
<li>Shipping and courier partners</li>
<li>Payment or authentication providers (including Google for SSO)</li>
</ul>
<p>These partners may only use your information to perform services for us and must protect it appropriately. We may also disclose information if required by law.</p>
<h2>Cookies and sessions</h2>
<p>We use cookies and similar technologies for essential functions such as keeping you signed in, remembering your cart, and maintaining site security. You can control cookies through your browser settings, but some features may not work if cookies are disabled.</p>
<h2>Data retention</h2>
<p>We keep personal information for as long as needed to fulfill orders, maintain accounts, meet legal or accounting requirements, and resolve disputes. When information is no longer needed, we delete or anonymize it where reasonably possible.</p>
<h2>Your choices</h2>
<p>Depending on applicable law, you may request access to, correction of, or deletion of your personal information. You may also ask us to update your account details or close your account. Contact us using the email below and we will respond as soon as reasonably possible.</p>
<h2>Children</h2>
<p>Our store is not directed to children under 13, and we do not knowingly collect personal information from children.</p>
<h2>Changes to this policy</h2>
<p>We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will change when we do. Please review this page periodically.</p>
<h2>Contact us</h2>
<p>For privacy questions or requests, email <a href="mailto:' . esc_attr($mail) . '">' . esc_html($mail) . '</a>.</p>';
}

function aureherb_seo_page_terms()
{
    $site = esc_url(home_url('/'));
    $mail = 'info.aure.herb@gmail.com';
    return '<p>Last updated: 1 September 2026</p>
<p>Welcome to AureHerb. By accessing or using <a href="' . $site . '">aureherb.com</a> (the "Site"), you agree to these Terms of Use. If you do not agree, please do not use the Site.</p>
<h2>Using the Site</h2>
<p>You may use the Site to browse products, place orders, manage your account, and track orders. You agree to provide accurate information and not to misuse the Site, interfere with its operation, or attempt unauthorized access to our systems or other users\' data.</p>
<h2>Accounts</h2>
<p>You may create an account with email and password or sign in with Google. You are responsible for keeping your login credentials secure and for activity that occurs under your account. Please contact us promptly if you believe your account has been compromised.</p>
<h2>Products and orders</h2>
<p>Product descriptions, prices, and availability may change without notice. When you place an order, you offer to purchase the listed items under these Terms. We may accept, decline, or cancel an order if a product is unavailable, pricing is incorrect, or we suspect fraud or misuse.</p>
<p>Cash on delivery (COD) and other payment options shown at checkout are subject to availability in your area. You agree to pay the total amount due for accepted orders, including shipping where applicable.</p>
<h2>Shipping and delivery</h2>
<p>Delivery times are estimates and may vary based on location, courier capacity, and other factors outside our control. Risk of loss passes to you when the order is delivered according to the shipping details you provide.</p>
<h2>Intellectual property</h2>
<p>All content on the Site — including branding, text, images, and product materials — is owned by AureHerb or its licensors and is protected by applicable intellectual property laws. You may not copy, modify, or distribute Site content without our prior written permission.</p>
<h2>Disclaimer</h2>
<p>The Site and products are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. Product information is for general guidance and is not medical advice.</p>
<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, AureHerb is not liable for indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, or goodwill arising from your use of the Site or products. Our total liability for any claim related to the Site or an order is limited to the amount you paid for the products giving rise to the claim.</p>
<h2>Changes</h2>
<p>We may update these Terms from time to time. Continued use of the Site after changes are posted means you accept the updated Terms. The "Last updated" date at the top of this page will change when we revise them.</p>
<h2>Contact us</h2>
<p>Questions about these Terms can be sent to <a href="mailto:' . esc_attr($mail) . '">' . esc_html($mail) . '</a>.</p>';
}

function aureherb_seo_product_description()
{
    $html = '<p>AureHerb Hair Growth Oil is a botanical scalp oil for people in Pakistan who want a simple oiling ritual. It blends rosemary, castor, and black seed oils to nourish the scalp and support healthier-looking hair. Cash on delivery is available. Shipping is free with cash on delivery across Pakistan.</p>
<h2>Why you will like this oil</h2>
<p>A few drops after washing or on a dry scalp. The blend is made to feel caring rather than heavy and greasy. It is a cosmetic oil, not a drug, and it does not guarantee new hair or treat medical hair loss.</p>
<h2>What’s in the bottle</h2>
<p>Rosemary, castor, and black seed oils plus other botanical oils and herbal extracts. Read the <a href="' . esc_url(home_url('/ingredients/')) . '">ingredients guide</a> for a plain-language breakdown.</p>
<h2>How to use</h2>
<ol>
<li>Warm a few drops in your palms.</li>
<li>Massage into the scalp for several minutes.</li>
<li>Leave on at least 20 minutes or overnight.</li>
<li>Wash with a gentle shampoo, two to three times a week.</li>
</ol>
<p>Full steps: <a href="' . esc_url(home_url('/how-to-use/')) . '">how to use hair growth oil</a>. More answers: <a href="' . esc_url(home_url('/faq/')) . '">FAQ</a>.</p>
<h2>Who it is for</h2>
<p>Men and women, most hair types, anyone building a Sunday or mid-week oiling habit. Patch-test if your scalp is sensitive.</p>
<h2>Delivery in Pakistan</h2>
<p>Cash on delivery. Free shipping with cash on delivery. <a href="' . esc_url(home_url('/shipping/')) . '">Shipping and returns</a>.</p>';
    $html .= aureherb_seo_faq_html(aureherb_seo_product_faqs());
    return $html;
}

function aureherb_seo_guides()
{
    $product = aureherb_seo_product_url();
    $cta = '<p><a href="' . esc_url($product) . '">Shop AureHerb Hair Growth Oil</a> · <a href="' . esc_url(home_url('/how-to-use/')) . '">How to use</a> · <a href="' . esc_url(home_url('/ingredients/')) . '">Ingredients</a> · <a href="' . esc_url(home_url('/faq/')) . '">FAQ</a></p>';

    return [
        [
            'slug' => 'sunday-oiling-ritual',
            'title' => 'How to do a Sunday oiling ritual',
            'keyword' => 'sunday oiling ritual',
            'description' => 'A simple Sunday scalp-oiling ritual with a botanical hair oil: warm a few drops, massage, leave on, then wash. Made for Pakistan home routines.',
            'content' => '<p>A Sunday oiling ritual is a once-a-week scalp massage with a botanical oil, left on before you wash. With AureHerb Hair Growth Oil, warm a few drops, massage the scalp, wait at least 20 minutes, then shampoo. It is a care habit, not a medical treatment.</p>
<h2>What you need</h2>
<p>A bottle of AureHerb Hair Growth Oil, a clip or hair tie, and a towel if you leave the oil on longer. Dry or towel-dried hair is easier to section than wet hair.</p>
<h2>Steps</h2>
<ol>
<li>Section the hair so you can see the scalp.</li>
<li>Warm a few drops in your palms.</li>
<li>Massage for several minutes with your fingertips.</li>
<li>Leave on 20 minutes or overnight on a towel.</li>
<li>Wash with a gentle shampoo.</li>
</ol>
<p>Two to three sessions a week is enough for most people. If Sunday is your only free day, one thorough ritual still counts. Stop if the scalp stays irritated.</p>
' . $cta,
        ],
        [
            'slug' => 'rosemary-vs-castor-oil-for-hair',
            'title' => 'Rosemary vs castor oil for hair',
            'keyword' => 'rosemary vs castor oil for hair',
            'description' => 'Rosemary oil is lighter and herbal; castor oil is thicker and clingy. AureHerb Hair Growth Oil uses both in one botanical blend for scalp oiling.',
            'content' => '<p>Rosemary oil is a lighter, herbal scalp oil. Castor oil is thicker and helps a blend stay on the scalp. AureHerb Hair Growth Oil uses both, with black seed oil, as a cosmetic blend — not as two separate medical treatments.</p>
<table class="seo-table">
<thead><tr><th>Oil</th><th>Feel</th><th>Role in a blend</th></tr></thead>
<tbody>
<tr><td>Rosemary</td><td>Lighter, herbal scent</td><td>Helps the ritual feel fresh and easy to spread</td></tr>
<tr><td>Castor</td><td>Thicker, slower</td><td>Helps the oil cling to scalp and lengths</td></tr>
</tbody>
</table>
<p>You do not have to buy two bottles and guess the ratio. The ready blend is made so a few drops cover the scalp without a greasy leftover for many users. Individual results vary.</p>
<p>More on the formula: <a href="' . esc_url(home_url('/ingredients/')) . '">AureHerb ingredients</a>.</p>
' . $cta,
        ],
        [
            'slug' => 'black-seed-oil-for-hair',
            'title' => 'Black seed oil for hair: what to know',
            'keyword' => 'black seed oil for hair',
            'description' => 'Black seed oil (Nigella sativa) is a traditional hair-oil ingredient. In AureHerb Hair Growth Oil it is one botanical part of a cosmetic blend, not a drug.',
            'content' => '<p>Black seed oil comes from Nigella sativa seeds. Many traditional hair oils include it. In AureHerb Hair Growth Oil it sits beside rosemary and castor as a cosmetic ingredient that helps nourish the scalp. It is not a prescribed medicine and AureHerb does not sell it as a cure for hair-loss disease.</p>
<p>If you have a seed-oil allergy, skip the product and ask a clinician. Patch-test any new oil on a small area first.</p>
<p>For the full list see <a href="' . esc_url(home_url('/ingredients/')) . '">what’s inside AureHerb Hair Growth Oil</a>.</p>
' . $cta,
        ],
        [
            'slug' => 'hair-growth-oil-vs-minoxidil',
            'title' => 'Hair growth oil vs minoxidil',
            'keyword' => 'hair growth oil vs minoxidil',
            'description' => 'Minoxidil is a medicine some clinicians use for hair loss. AureHerb Hair Growth Oil is a cosmetic botanical oil. They are not the same product and this page is not medical advice.',
            'content' => '<p>Minoxidil is a medicine that some clinicians use for certain kinds of hair loss. AureHerb Hair Growth Oil is a cosmetic botanical oil for scalp care. They are not interchangeable. This article is not medical advice and does not tell you to start or stop any medicine.</p>
<h2>What a hair oil is for</h2>
<p>A hair oil such as AureHerb is for massage, moisture, and a regular ritual. It may help hair look and feel better cared for. It does not claim to match a drug’s tested use.</p>
<h2>What to do if you are already on treatment</h2>
<p>Ask the clinician who prescribed your treatment before you add oils, because some leave-on products can sit on the same skin. AureHerb support on WhatsApp cannot prescribe or compare doses.</p>
' . $cta,
        ],
        [
            'slug' => 'cash-on-delivery-hair-oil-pakistan',
            'title' => 'Cash on delivery hair oil in Pakistan',
            'keyword' => 'hair oil cash on delivery Pakistan',
            'description' => 'AureHerb Hair Growth Oil ships across Pakistan with cash on delivery. Shipping is free with cash on delivery across Pakistan.',
            'content' => '<p>Yes: you can buy AureHerb Hair Growth Oil with cash on delivery in Pakistan. Pay the courier when the parcel arrives. Shipping is free with cash on delivery across Pakistan.</p>
<p>Checkout on <a href="' . esc_url($product) . '">the product page</a>, or message <a href="https://wa.me/923137022646">WhatsApp</a> if you want to confirm a city first. After dispatch, use <a href="' . esc_url(home_url('/track-order/')) . '">Track Your Order</a>.</p>
<p>Full policy: <a href="' . esc_url(home_url('/shipping/')) . '">shipping, COD, and returns</a>.</p>
' . $cta,
        ],
        [
            'slug' => 'nourish-dry-scalp-at-home',
            'title' => 'How to nourish a dry scalp at home',
            'keyword' => 'nourish dry scalp at home',
            'description' => 'A dry-feeling scalp often responds to a gentle oil massage and less harsh washing. AureHerb Hair Growth Oil is one botanical option for a home ritual in Pakistan.',
            'content' => '<p>A dry-feeling scalp often does better with a gentle oil massage and milder washing, not with more hot water. Warm a few drops of a botanical oil such as AureHerb Hair Growth Oil, massage the scalp, leave it on, then wash. If skin is broken, infected, or painful, see a clinician instead of oiling over it.</p>
<h2>Home ritual</h2>
<ol>
<li>Use lukewarm water, not very hot.</li>
<li>Oil two to three times a week rather than every night at first.</li>
<li>Choose a mild shampoo when you wash the oil out.</li>
</ol>
<p>This is cosmetic care. It is not a diagnosis of dandruff disease or eczema.</p>
' . $cta,
        ],
        [
            'slug' => 'botanical-hair-oil-buying-guide',
            'title' => 'What to look for in a botanical hair oil',
            'keyword' => 'botanical hair oil buying guide',
            'description' => 'Look for named oils, clear use steps, honest claims, and delivery terms. AureHerb Hair Growth Oil lists rosemary, castor, and black seed, with COD in Pakistan.',
            'content' => '<p>When you shop for a botanical hair oil, look for named oils, clear use steps, honest claims, and delivery terms you can meet. AureHerb Hair Growth Oil lists rosemary, castor, and black seed, explains a simple ritual, and offers cash on delivery in Pakistan.</p>
<h2>Checklist</h2>
<ul>
<li>Ingredients you can read, not only a mood slogan</li>
<li>No promise to cure disease or guarantee a number of new hairs</li>
<li>How to use, how often, and how to wash it out</li>
<li>Price, shipping, and COD in your country</li>
</ul>
<p>Compare that list with the <a href="' . esc_url($product) . '">AureHerb product page</a> and the <a href="' . esc_url(home_url('/ingredients/')) . '">ingredients guide</a>.</p>
' . $cta,
        ],
        [
            'slug' => 'aureherb-hair-growth-oil-ingredients-explained',
            'title' => 'AureHerb Hair Growth Oil ingredients explained',
            'keyword' => 'AureHerb Hair Growth Oil ingredients',
            'description' => 'AureHerb Hair Growth Oil combines rosemary, castor, and black seed oils in a cosmetic blend for scalp oiling in Pakistan. Plain-language ingredient notes.',
            'content' => '<p>AureHerb Hair Growth Oil is a cosmetic blend whose named oils are rosemary, castor, and black seed. They are there to nourish the scalp and hair during an oiling ritual. The product is not a drug and does not list a medical dose.</p>
<p>Rosemary is the lighter, herbal part of the feel. Castor is the thicker part that helps the oil stay put. Black seed is a traditional hair-oil seed oil included as one botanical — not as a standalone treatment.</p>
<p>Read the same facts on the <a href="' . esc_url(home_url('/ingredients/')) . '">ingredients page</a> and the <a href="' . esc_url($product) . '">product page</a>, which also covers cash on delivery in Pakistan.</p>
' . $cta,
        ],
    ];
}
