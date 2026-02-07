const canvas = document.getElementById("cosmic-canvas");
const ctx = canvas.getContext("2d");

const state = {
  stars: [],
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  size: { width: window.innerWidth, height: window.innerHeight },
};

const STAR_COUNT = 160;
const AVOID_RADIUS = 140;
const AVOID_STRENGTH = 2.4;
const OFFSET_DAMPING = 0.92;

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
    radius: Math.random() * 1.9 + 0.4,
    alpha: Math.random() * 0.6 + 0.25,
    driftX: Math.random() * 0.35 + 0.05,
    driftY: (Math.random() - 0.5) * 0.08,
    offsetX: 0,
    offsetY: 0,
  }));
};

const drawBackground = () => {
  const { width, height } = state.size;
  const gradient = ctx.createRadialGradient(
    width * 0.3,
    height * 0.3,
    120,
    width * 0.7,
    height * 0.9,
    Math.max(width, height)
  );
  gradient.addColorStop(0, "rgba(140, 80, 210, 0.35)");
  gradient.addColorStop(0.45, "rgba(70, 35, 120, 0.45)");
  gradient.addColorStop(1, "rgba(5, 3, 12, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

const applyMouseAvoidance = (star) => {
  const dx = star.x - state.mouse.x;
  const dy = star.y - state.mouse.y;
  const distance = Math.hypot(dx, dy);

  if (distance < AVOID_RADIUS && distance > 0.001) {
    const force = ((AVOID_RADIUS - distance) / AVOID_RADIUS) * AVOID_STRENGTH;
    star.offsetX += (dx / distance) * force;
    star.offsetY += (dy / distance) * force;
  }

  star.offsetX *= OFFSET_DAMPING;
  star.offsetY *= OFFSET_DAMPING;
};

const render = () => {
  const { width, height } = state.size;
  ctx.clearRect(0, 0, width, height);
  drawBackground();

  state.stars.forEach((star) => {
    star.x += star.driftX;
    star.y += star.driftY;
    applyMouseAvoidance(star);

    if (star.x < -20) star.x = width + 20;
    if (star.x > width + 20) star.x = -20;
    if (star.y < -20) star.y = height + 20;
    if (star.y > height + 20) star.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.arc(star.x + star.offsetX, star.y + star.offsetY, star.radius, 0, Math.PI * 2);
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
  const ip = "cosmicsmp.online";

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
    setFeedback("copied!");
    window.setTimeout(() => setFeedback("copy"), 1800);
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
