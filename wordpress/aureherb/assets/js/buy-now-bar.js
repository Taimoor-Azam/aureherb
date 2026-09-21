(function () {
  const bar = document.querySelector("[data-buy-now-bar]");
  const trigger = document.querySelector("[data-buy-now-trigger]");
  if (!bar || !trigger) return;

  const form =
    document.querySelector("form.cart") ||
    document.querySelector("form.variations_form");
  const mainBtn = form?.querySelector(
    'button.single_add_to_cart_button, button[type="submit"][name="add-to-cart"]'
  );

  const showBar = () => {
    bar.hidden = false;
    document.documentElement.classList.add("has-buy-now-bar");
  };

  const hideBar = () => {
    bar.hidden = true;
    document.documentElement.classList.remove("has-buy-now-bar");
  };

  const syncVisibility = () => {
    if (!mainBtn) {
      hideBar();
      return;
    }
    const rect = mainBtn.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) hideBar();
    else showBar();
  };

  trigger.addEventListener("click", () => {
    if (!form || !mainBtn) return;
    if (typeof mainBtn.scrollIntoView === "function") {
      mainBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Prefer submitting the real WooCommerce form so quantity + product id post correctly.
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit(mainBtn);
    } else {
      mainBtn.click();
    }
  });

  syncVisibility();
  window.addEventListener("scroll", syncVisibility, { passive: true });
  window.addEventListener("resize", syncVisibility, { passive: true });
})();
