(function () {
  const strip = document.querySelector("[data-bundle-offer]");
  if (!strip) return;

  const qtyInput =
    document.querySelector("form.cart input.qty") ||
    document.querySelector('form.cart input[name="quantity"]');
  const options = Array.from(strip.querySelectorAll("[data-bundle-qty]"));
  const delivered = document.querySelector("[data-delivered-total]");
  const deliveredMain = document.querySelector("[data-delivered-main]");
  const deliveredSub = document.querySelector("[data-delivered-sub]");
  const barPrice = document.querySelector("[data-buy-now-bar-price]");

  const unitPrice = Number(strip.getAttribute("data-unit-price") || "1499");
  const bundlePrice = Number(strip.getAttribute("data-bundle-price") || "2499");
  const save = Number(strip.getAttribute("data-bundle-save") || "499");

  const formatRs = (n) =>
    "Rs " + Math.round(n).toLocaleString("en-PK");

  const totalForQty = (qty) => {
    const q = Math.max(1, Number(qty) || 1);
    const pairs = Math.floor(q / 2);
    return unitPrice * q - pairs * save;
  };

  const setActive = (qty) => {
    options.forEach((btn) => {
      const active = Number(btn.getAttribute("data-bundle-qty")) === qty;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  const syncTotals = (qty) => {
    const q = Math.max(1, Number(qty) || 1);
    const total = totalForQty(q);
    if (deliveredMain) {
      deliveredMain.textContent = "Total with delivery: " + formatRs(total);
    }
    if (deliveredSub) {
      deliveredSub.textContent =
        q >= 2
          ? "Bundle of 2 · Free shipping · Pay on delivery"
          : "Free shipping · Pay on delivery";
    }
    if (barPrice) {
      barPrice.textContent = formatRs(total) + " delivered";
    }
    if (delivered) {
      delivered.setAttribute("data-current-qty", String(q));
    }
  };

  const applyQty = (qty) => {
    const q = qty >= 2 ? 2 : 1;
    if (qtyInput) {
      qtyInput.value = String(q);
      qtyInput.dispatchEvent(new Event("change", { bubbles: true }));
      qtyInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setActive(q);
    syncTotals(q);
  };

  options.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyQty(Number(btn.getAttribute("data-bundle-qty")) || 1);
    });
  });

  if (qtyInput) {
    qtyInput.addEventListener("change", () => {
      const q = Number(qtyInput.value) || 1;
      setActive(q >= 2 ? 2 : 1);
      syncTotals(q);
    });
    qtyInput.addEventListener("input", () => {
      const q = Number(qtyInput.value) || 1;
      syncTotals(q);
    });
  }

  // Initial sync (supports ?bundle=2 prefill).
  const initial = qtyInput ? Number(qtyInput.value) || 1 : 1;
  setActive(initial >= 2 ? 2 : 1);
  syncTotals(initial);
})();
