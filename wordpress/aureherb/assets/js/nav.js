(function () {
  const drawer = document.querySelector("[data-drawer]");
  if (!drawer) return;
  const openBtn = document.querySelector("[data-drawer-open]");
  const closers = drawer.querySelectorAll("[data-drawer-close]");

  const open = () => drawer.classList.add("is-open");
  const close = () => drawer.classList.remove("is-open");

  openBtn?.addEventListener("click", open);
  closers.forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
