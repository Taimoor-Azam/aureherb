(function () {
  const root = document.querySelector("[data-testimonials]");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll("[data-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-goto]"));
  if (!slides.length) return;

  let index = 0;

  const show = (next) => {
    index = ((next % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => show(Number(dot.getAttribute("data-goto"))));
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.setInterval(() => show(index + 1), 3000);
})();
