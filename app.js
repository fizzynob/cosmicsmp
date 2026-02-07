const canvas = document.getElementById("cosmic-canvas");
const ctx = canvas.getContext("2d");

const state = {
  stars: [],
  mouse: { x: 0, y: 0 },
  size: { width: window.innerWidth, height: window.innerHeight },
};

const STAR_COUNT = 140;

const resizeCanvas = () => {
  state.size.width = window.innerWidth;
  state.size.height = window.innerHeight;
  canvas.width = state.size.width * window.devicePixelRatio;
  canvas.height = state.size.height * window.devicePixelRatio;
  canvas.style.width = `${state.size.width}px`;
  canvas.style.height = `${state.size.height}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
};

const createStars = () => {
  state.stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * state.size.width,
    y: Math.random() * state.size.height,
    radius: Math.random() * 1.8 + 0.4,
    alpha: Math.random() * 0.6 + 0.2,
    driftX: (Math.random() - 0.5) * 0.15,
    driftY: (Math.random() - 0.5) * 0.15,
  }));
};

const drawBackground = () => {
  const { width, height } = state.size;
  const gradient = ctx.createRadialGradient(
    width * 0.2,
    height * 0.2,
    80,
    width * 0.6,
    height * 0.8,
    Math.max(width, height)
  );
  gradient.addColorStop(0, "rgba(70, 110, 255, 0.35)");
  gradient.addColorStop(0.4, "rgba(20, 40, 120, 0.4)");
  gradient.addColorStop(1, "rgba(3, 6, 20, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

const render = () => {
  const { width, height } = state.size;
  ctx.clearRect(0, 0, width, height);
  drawBackground();

  const offsetX = (state.mouse.x - width / 2) * 0.01;
  const offsetY = (state.mouse.y - height / 2) * 0.01;

  state.stars.forEach((star) => {
    star.x += star.driftX + offsetX * 0.02;
    star.y += star.driftY + offsetY * 0.02;

    if (star.x < -20) star.x = width + 20;
    if (star.x > width + 20) star.x = -20;
    if (star.y < -20) star.y = height + 20;
    if (star.y > height + 20) star.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(render);
};

const handleMouseMove = (event) => {
  state.mouse.x = event.clientX;
  state.mouse.y = event.clientY;
};

const handleTouchMove = (event) => {
  if (event.touches.length > 0) {
    state.mouse.x = event.touches[0].clientX;
    state.mouse.y = event.touches[0].clientY;
  }
};

const setupCopy = () => {
  const button = document.querySelector(".copy-button");
  const feedback = document.querySelector(".copy-feedback");
  const ip = "cosmic.online";

  const setFeedback = (text) => {
    feedback.textContent = text;
  };

  const fallbackCopy = () => {
    const tempInput = document.createElement("input");
    tempInput.value = ip;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    tempInput.remove();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
    } catch (error) {
      fallbackCopy();
    }
    setFeedback("Copied!");
    window.setTimeout(() => setFeedback("Copy"), 1800);
  };

  button.addEventListener("click", copy);
};

resizeCanvas();
createStars();
render();

window.addEventListener("resize", () => {
  resizeCanvas();
  createStars();
});
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("touchmove", handleTouchMove, { passive: true });

setupCopy();
