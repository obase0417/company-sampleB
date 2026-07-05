// --- 店内紹介 (SALON TOUR) 無限ループ・自動スクロール × ドラッグハイブリッド ---
(() => {
  const slider = document.getElementById("gallery-slider");
  const track = document.getElementById("gallery-track");
  if (!slider || !track) return;

  // 無限スクロール用に要素をクローン
  const items = Array.from(track.children);
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  let currentX = 0;
  let isDragging = false;
  let startX = 0;
  let dragStartX = 0;
  const autoSpeed = 0.6; // スムーズな等速移動スピード

  function getHalfWidth() {
    const card = track.querySelector(".gallery-card");
    if (!card) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseInt(style.gap) || 20;
    return (card.offsetWidth + gap) * items.length;
  }

  function updateScroll() {
    const halfWidth = getHalfWidth();

    if (!isDragging && halfWidth > 0) {
      currentX -= autoSpeed;
      if (currentX <= -halfWidth) {
        currentX += halfWidth; // 左端に達したらリセットしてループ
      }
    }
    if (currentX > 0 && halfWidth > 0) {
      currentX -= halfWidth;
    }

    track.style.transform = `translateX(${currentX}px)`;
    requestAnimationFrame(updateScroll);
  }

  // マウス/タッチドラッグのイベント処理
  const dragStart = (x) => {
    isDragging = true;
    startX = x;
    dragStartX = currentX;
  };

  const dragMove = (x) => {
    if (!isDragging) return;
    const deltaX = x - startX;
    currentX = dragStartX + deltaX;
  };

  const dragEnd = () => {
    isDragging = false;
  };

  slider.addEventListener("mousedown", (e) => dragStart(e.clientX));
  window.addEventListener("mousemove", (e) => dragMove(e.clientX));
  window.addEventListener("mouseup", dragEnd);

  slider.addEventListener(
    "touchstart",
    (e) => dragStart(e.touches[0].clientX),
    { passive: true },
  );
  window.addEventListener("touchmove", (e) => dragMove(e.touches[0].clientX), {
    passive: true,
  });
  window.addEventListener("touchend", dragEnd);

  requestAnimationFrame(updateScroll);
})();

// --- 数値カウンタアニメーション (STATS SECTION) ---
(() => {
  const counters = document.querySelectorAll(".counter");
  if (counters.length === 0) return;

  const startCounter = (el) => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    const duration = 2000; // 2秒かけてカウントアップ
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.innerText = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.innerText = Math.floor(current).toLocaleString();
      }
    }, stepTime);
  };

  // 交差監視（スクロールして画面に入ったら発火）
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => observer.observe(counter));
})();

// --- スクロールでふわっと表示 (REVEAL ANIMATION) ---
(() => {
  const targets = document.querySelectorAll(".reveal");
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
})();

// --- 背景の光の粒・ヒーローの波と光線アニメーション (CANVAS EFFECTS) ---
(() => {
  const heroCanvas = document.getElementById("hero-canvas");
  const bgCanvas = document.getElementById("bg-canvas");

  const setupCanvas = (canvas, drawFn) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.clientWidth || window.innerWidth;
      canvas.height = canvas.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      drawFn(canvas, ctx);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  // 1. ヒーローセクション：木漏れ日の光線と多層のオーガニックウェーブ
  let wavePhase = 0;
  setupCanvas(heroCanvas, (canvas, ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wavePhase += 0.003;

    // A. 差し込む木漏れ日のような光（グラデーションの重なり）
    const lightGrad = ctx.createLinearGradient(
      0,
      0,
      canvas.width * 0.4,
      canvas.height,
    );
    const alpha1 = 0.07 + Math.sin(wavePhase * 2) * 0.02;
    const alpha2 = 0.03 + Math.cos(wavePhase * 1.5) * 0.01;
    lightGrad.addColorStop(0, `rgba(255, 248, 235, ${alpha1})`);
    lightGrad.addColorStop(0.5, `rgba(246, 227, 211, ${alpha2})`);
    lightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width * 0.7, 0);
    ctx.lineTo(canvas.width * 0.3, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    // B. 多層のゆったりとした髪のラインや風を連想させる波線
    const drawWave = (baseY, amplitude, speedMultiplier, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= canvas.width; x += 5) {
        const p = wavePhase * speedMultiplier;
        const y =
          baseY +
          Math.sin(x * 0.0015 + p) * amplitude +
          Math.cos(x * 0.003 - p) * (amplitude * 0.3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // 質感の異なる3本のシアーラインをブレンド
    drawWave(canvas.height * 0.55, 35, 1.0, "rgba(201, 126, 90, 0.08)");
    drawWave(canvas.height * 0.6, 25, 0.7, "rgba(143, 170, 136, 0.06)");
    drawWave(canvas.height * 0.65, 45, 1.2, "rgba(246, 227, 211, 0.12)");
  });

  // 2. 全体背景のやさしい光の粒
  const particles = [];
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      r: 2 + Math.random() * 4,
      speed: 0.0002 + Math.random() * 0.0005,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  setupCanvas(bgCanvas, (canvas, ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(201, 126, 90, 0.12)";

    particles.forEach((p) => {
      const px = p.x * canvas.width;
      const py = p.y * canvas.height;

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.y -= p.speed;
      p.wobble += 0.01;
      p.x += Math.sin(p.wobble) * 0.0002;

      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
    });
  });
})();

// --- ヒーロービデオのモバイル自動再生サポート枠 ---
(() => {
  const video = document.querySelector(".hero-video");
  if (!video) return;
  video.muted = true;
  video.play().catch(() => {
    const playVideo = () => {
      video.play();
      window.removeEventListener("click", playVideo);
      window.removeEventListener("touchstart", playVideo);
    };
    window.addEventListener("click", playVideo);
    window.addEventListener("touchstart", playVideo);
  });
})();

// --- ヒーローテキストの時間差じんわり表示 ---
document.addEventListener("DOMContentLoaded", () => {
  const animatedItems = document.querySelectorAll(
    ".hero-content .animated-item",
  );
  animatedItems.forEach((item, index) => {
    setTimeout(
      () => {
        item.classList.add("is-active");
      },
      300 + index * 250,
    ); // 250msずつずらして心地よいテンポでフェードイン
  });
});
