// --- 空間紹介 (GALLERY) 無限ループ・自動スクロール × ドラッグハイブリッド ---
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

// --- 背景粒子・波アニメーション (CANVAS EFFECTS) ---
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

  // 1. ヒーローセクションのゆったりとした波線の演出
  let wavePhase = 0;
  setupCanvas(heroCanvas, (canvas, ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(2, 132, 199, 0.04)";
    ctx.lineWidth = 3;
    wavePhase += 0.005;

    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height * 0.6 + Math.sin(x * 0.002 + wavePhase) * 30;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
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
    ctx.fillStyle = "rgba(2, 132, 199, 0.1)";

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
    // ブラウザの自動再生ブロックを回避するためジェスチャーを待つ
    const playVideo = () => {
      video.play();
      window.removeEventListener("click", playVideo);
      window.removeEventListener("touchstart", playVideo);
    };
    window.addEventListener("click", playVideo);
    window.addEventListener("touchstart", playVideo);
  });
})();
