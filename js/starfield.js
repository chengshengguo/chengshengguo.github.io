/* 星空背景动画（可复用于所有页面） */
(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, stars = [], shooting = null;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(280, Math.floor((w * h) / 5500));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
      });
    }
  }

  function maybeShoot() {
    if (!shooting && Math.random() < 0.004) {
      shooting = {
        x: Math.random() * w * 0.6,
        y: Math.random() * h * 0.4,
        len: Math.random() * 120 + 80,
        sp: Math.random() * 6 + 8,
        a: 1,
      };
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.y += s.z * 0.14;
      if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      const a = 0.45 + 0.55 * Math.sin(t * 0.001 + s.tw);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a * s.z})`;
      ctx.fill();
    }
    maybeShoot();
    if (shooting) {
      const s = shooting;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.len, s.y - s.len * 0.4);
      grad.addColorStop(0, `rgba(255,255,255,${s.a})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.len, s.y - s.len * 0.4);
      ctx.stroke();
      s.x += s.sp; s.y += s.sp * 0.4; s.a -= 0.012;
      if (s.a <= 0 || s.x > w + 50) shooting = null;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);
})();
