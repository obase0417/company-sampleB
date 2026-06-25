// --- 数値カウンターのアニメーション ---
document.querySelectorAll(".counter").forEach((c) => {
  let t = +c.dataset.target,
    v = 0;
  const run = () => {
    v += Math.max(1, t / 80);
    if (v < t) {
      c.textContent = Math.floor(v);
      requestAnimationFrame(run);
    } else {
      c.textContent =
        t >= 1000 ? Math.floor(t).toLocaleString() + "+" : t + "+";
    }
  };
  run();
});

// --- 院内・設備 (GALLERY) 自動スクロール × 手動加減速ハイブリッド ---
(() => {
  const slider = document.getElementById("gallery-slider");
  const track = document.getElementById("gallery-track");
  if (!slider || !track) return;

  // ループ空間形成のためにカード群を複製
  const items = Array.from(track.children);
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  let currentX = 0; // 現在の横スクロール位置
  let isDragging = false; // ドラッグ検知フラグ
  let startX = 0; // タッチ・クリック開始時のX
  let dragStartX = 0; // ドラッグ開始時の元の位置
  const autoSpeed = 0.65; // パステル調に合わせて穏やかなスピードに微調整

  // 1セット分の全体の長さを計算
  function getHalfWidth() {
    const card = track.querySelector(".gallery-card");
    if (!card) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseInt(style.gap) || 24;
    return (card.offsetWidth + gap) * items.length;
  }

  // 毎フレームのループアニメーション
  function updateScroll() {
    const halfWidth = getHalfWidth();

    if (!isDragging && halfWidth > 0) {
      // 自動的に左へじわじわ移動
      currentX -= autoSpeed;

      // 1セット分抜けきったら位置をリセット
      if (currentX <= -halfWidth) {
        currentX += halfWidth;
      }
    }

    // 手動で右方向に逆流（巻き戻し）された場合の無限ループ調整
    if (currentX > 0 && halfWidth > 0) {
      currentX -= halfWidth;
    }

    track.style.transform = `translateX(${currentX}px)`;
    requestAnimationFrame(updateScroll);
  }

  // 操作処理
  const dragStart = (x) => {
    isDragging = true;
    startX = x;
    dragStartX = currentX;
  };

  const dragMove = (x) => {
    if (!isDragging) return;
    const deltaX = x - startX;
    currentX = dragStartX + deltaX; // ドラッグ移動量に応じて加減速
  };

  const dragEnd = () => {
    isDragging = false;
  };

  // マウスイベント
  slider.addEventListener("mousedown", (e) => dragStart(e.clientX));
  window.addEventListener("mousemove", (e) => dragMove(e.clientX));
  window.addEventListener("mouseup", dragEnd);

  // スマホ向けタッチイベント
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

// --- キャンバスアニメーション (パステルコンセプト：光パウダー＆オーガニックウェーブ) ---
(() => {
  const configs = [
    {
      el: document.getElementById("hero-canvas"),
      count: 20,
      color: "rgba(186, 226, 245, 0.4)", // 淡い水色の光パウダー
      speedMin: 0.3,
      speedMax: 1.0,
      lengthMin: 4,
      lengthMax: 12,
      isCircle: true,
    },
    {
      el: document.getElementById("bg-canvas"),
      count: 3,
      color: "rgba(186, 226, 245, 0.15)", // 背景全体をゆったり流れる穏やかなウェーブ
      isWave: true,
    },
  ];

  const layers = [];

  configs.forEach((cfg) => {
    const c = cfg.el;
    if (!c) return;
    const ctx = c.getContext("2d");

    const resize = () => {
      c.width = c.clientWidth || window.innerWidth;
      c.height = c.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const items = [];
    if (cfg.isCircle) {
      for (let i = 0; i < cfg.count; i++) {
        items.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          radius:
            cfg.lengthMin + Math.random() * (cfg.lengthMax - cfg.lengthMin),
          speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
        });
      }
    } else if (cfg.isWave) {
      for (let i = 0; i < cfg.count; i++) {
        items.push({
          y: c.height * 0.35 + Math.random() * c.height * 0.3,
          length: 0.001 + Math.random() * 0.0015,
          amplitude: 25 + Math.random() * 40,
          speed: 0.004 + Math.random() * 0.008,
          phase: Math.random() * 50,
        });
      }
    }

    layers.push({ c, ctx, items, cfg });
  });

  function animate() {
    layers.forEach((layer) => {
      const { ctx, c, items, cfg } = layer;
      ctx.clearRect(0, 0, c.width, c.height);

      if (cfg.isCircle) {
        // パウダー粒子がふわふわと上昇する表現
        items.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = cfg.color;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speed;
          if (p.y < -p.radius) {
            p.y = c.height + p.radius;
            p.x = Math.random() * c.width;
          }
        });
      } else if (cfg.isWave) {
        // 穏やかなパステルウェーブの表現
        items.forEach((w) => {
          ctx.beginPath();
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = 2.5;
          w.phase += w.speed;

          for (let x = 0; x < c.width; x++) {
            const y = w.y + Math.sin(x * w.length + w.phase) * w.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }
    });
    requestAnimationFrame(animate);
  }

  if (layers.length > 0) {
    animate();
  }
})();

// --- ヒーロービデオの自動再生ハンドリング ---
(() => {
  const heroVideo = document.querySelector(".hero-video");
  const heroSection = document.querySelector(".hero");
  if (!heroVideo || !heroSection) return;

  heroVideo.muted = true;

  const showPlayButton = () => {
    if (document.querySelector(".hero-play")) return;
    const btn = document.createElement("button");
    btn.className = "hero-play";
    btn.setAttribute("aria-label", "動画再生");
    btn.innerText = "▶";
    btn.addEventListener("click", () => {
      heroVideo.muted = true;
      heroVideo.play().then(() => btn.remove());
    });
    heroSection.appendChild(btn);
  };

  const tryPlay = () => {
    const p = heroVideo.play();
    if (p !== undefined) {
      p.then(() => {
        heroSection.classList.add("video-playing");
      }).catch(() => {
        showPlayButton();
      });
    }
  };

  tryPlay();
  ["click", "touchstart"].forEach((ev) => {
    window.addEventListener(ev, tryPlay, { once: true });
  });
})();
