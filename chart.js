let ctx;
let canvas;

export function initChart(chartEl) {
  if (!chartEl) return;

  canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  canvas.setAttribute("aria-hidden", "true");

  chartEl.innerHTML = "";
  chartEl.appendChild(canvas);

  ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.lineWidth = 8;
}

export function updateChart(income, expense) {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (income === 0 && expense === 0) {
    drawCircle("#d8d1df", 1, false);
    return;
  }

  const ratio = income / (expense + income);
  drawCircle("#ffffff", -ratio, true);
  drawCircle("#f0624d", 1 - ratio, false);
}

function drawCircle(color, ratio, anticlockwise) {
  if (!ctx || !canvas) return;

  const radius = 20;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    radius,
    0,
    ratio * 2 * Math.PI,
    anticlockwise
  );
  ctx.stroke();
}
