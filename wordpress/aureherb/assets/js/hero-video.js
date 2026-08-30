(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const video = document.querySelector("[data-hero-video]");
  const canvas = document.querySelector("[data-hero-canvas]");
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const FADE_HEIGHT_PX = 20;
  let frameId = 0;
  let running = true;

  const paint = () => {
    if (!running) return;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width > 0 && height > 0) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.drawImage(video, 0, 0, width, height);
      const displayHeight = canvas.clientHeight || height;
      const fadeHeight = Math.max(
        FADE_HEIGHT_PX,
        Math.round((FADE_HEIGHT_PX / displayHeight) * height)
      );
      const gradient = ctx.createLinearGradient(0, height - fadeHeight, 0, height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.25, "rgba(0,0,0,0.55)");
      gradient.addColorStop(0.7, "rgba(0,0,0,0.85)");
      gradient.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - fadeHeight, width, fadeHeight);
    }
    frameId = requestAnimationFrame(paint);
  };

  const start = () => {
    video.play().catch(() => {});
    paint();
  };

  if (video.readyState >= 2) {
    start();
  } else {
    video.addEventListener("loadeddata", start, { once: true });
  }
})();
