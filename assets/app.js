(() => {
  const $ = (id) => document.getElementById(id);
  const isMobile = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

  // Cursor
  const cur = $("cursor");
  const dot = $("dot");
  let mx = 0;
  let my = 0;
  let cx = 0;
  let cy = 0;

  if (!isMobile && cur && dot) {
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    });

    function animCur() {
      cx += (mx - cx) * 0.13;
      cy += (my - cy) * 0.13;
      cur.style.left = `${cx}px`;
      cur.style.top = `${cy}px`;
      requestAnimationFrame(animCur);
    }
    animCur();

    function addHover(sel) {
      document.querySelectorAll(sel).forEach((el) => {
        el.addEventListener("mouseenter", () => cur.classList.add("hover"));
        el.addEventListener("mouseleave", () => cur.classList.remove("hover"));
      });
    }
    addHover("button,.ccard,.mcard,.ctabtn,.darch,.dmdoor,.rpbtn,.sbtn,#abtn,.xbtn,.dclose,.ndot,.mnode,.chb,.dcon");
  } else {
    if (cur) cur.style.display = "none";
    if (dot) dot.style.display = "none";
  }

  // Loading
  let loadPct = 0;
  const loadInterval = setInterval(() => {
    loadPct = Math.min(loadPct + Math.random() * 18, 95);
    const pct = $("lpct");
    if (pct) pct.textContent = `${Math.floor(loadPct)}%`;
  }, 100);

  window.addEventListener("load", () => {
    clearInterval(loadInterval);
    const pct = $("lpct");
    const bar = $("lbar");
    if (pct) pct.textContent = "100%";
    if (bar) bar.style.width = "100%";
    setTimeout(() => {
      const loading = $("loading");
      if (!loading) return;
      loading.style.opacity = "0";
      setTimeout(() => {
        loading.style.display = "none";
        initScrollAnims();
        initStory();
        initEndStars();
      }, 950);
    }, 1400);
  });

  // Background canvas
  const bgc = $("bgc");
  const bctx = bgc?.getContext("2d");
  let BW = 0;
  let BH = 0;
  let stars = [];
  const petals = [];
  const orbs = [];

  function resizeBg() {
    if (!bgc) return;
    BW = bgc.width = window.innerWidth;
    BH = bgc.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 140; i += 1) {
      stars.push({
        x: Math.random() * BW,
        y: Math.random() * BH * 0.72,
        r: Math.random() * 1.6 + 0.25,
        a: Math.random(),
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.013 + 0.004
      });
    }
  }

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(init) {
      this.x = Math.random() * BW;
      this.y = init ? Math.random() * BH : -22;
      this.sz = Math.random() * 7 + 3;
      this.vy = Math.random() * 1.4 + 0.45;
      this.vx = (Math.random() - 0.5) * 1.1;
      this.rot = Math.random() * Math.PI * 2;
      this.rs = (Math.random() - 0.5) * 0.06;
      this.op = Math.random() * 0.55 + 0.18;
      this.wb = Math.random() * Math.PI * 2;
      this.ws = Math.random() * 0.03 + 0.01;
    }

    update() {
      this.y += this.vy;
      this.wb += this.ws;
      this.x += this.vx + Math.sin(this.wb) * 0.75;
      this.rot += this.rs;
      if (this.y > BH + 22) this.reset(false);
    }

    draw(c) {
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.rot);
      c.globalAlpha = this.op;
      c.beginPath();
      c.ellipse(0, 0, this.sz, this.sz * 0.46, 0, 0, Math.PI * 2);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, this.sz);
      g.addColorStop(0, "rgba(255,218,228,.92)");
      g.addColorStop(1, "rgba(255,175,195,.15)");
      c.fillStyle = g;
      c.fill();
      c.restore();
    }
  }

  class Orb {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * BW;
      this.y = Math.random() * BH;
      this.r = Math.random() * 3 + 0.8;
      this.vx = (Math.random() - 0.5) * 0.36;
      this.vy = (Math.random() - 0.5) * 0.36;
      this.op = Math.random() * 0.35 + 0.06;
      this.ph = Math.random() * Math.PI * 2;
      this.ps = Math.random() * 0.017 + 0.005;
      this.col = ["rgba(255,209,102,", "rgba(192,132,252,", "rgba(116,185,255,"][Math.floor(Math.random() * 3)];
    }

    update() {
      this.ph += this.ps;
      this.x += this.vx + Math.sin(this.ph * 0.7) * 0.25;
      this.y += this.vy + Math.cos(this.ph * 0.5) * 0.25;
      if (this.x < -25 || this.x > BW + 25 || this.y < -25 || this.y > BH + 25) this.reset();
    }

    draw(c) {
      const a = this.op * (0.5 + 0.5 * Math.sin(this.ph));
      c.save();
      c.globalAlpha = a;
      const g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      g.addColorStop(0, `${this.col}.85)`);
      g.addColorStop(1, `${this.col}0)`);
      c.beginPath();
      c.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
      c.fillStyle = g;
      c.fill();
      c.restore();
    }
  }

  function renderBg() {
    if (!bctx) return;
    bctx.clearRect(0, 0, BW, BH);
    const sf = Math.min(1, window.scrollY / (BH * 2.5));
    stars.forEach((s) => {
      s.ph += s.sp;
      const a = s.a * (0.5 + 0.5 * Math.sin(s.ph)) * (1 - sf * 0.5);
      bctx.beginPath();
      bctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      bctx.fillStyle = `rgba(255,255,255,${a})`;
      bctx.fill();
    });
    petals.forEach((p) => {
      p.update();
      p.draw(bctx);
    });
    orbs.forEach((o) => {
      o.update();
      o.draw(bctx);
    });
    requestAnimationFrame(renderBg);
  }

  if (bgc && bctx) {
    window.addEventListener("resize", resizeBg);
    resizeBg();
    for (let i = 0; i < 42; i += 1) petals.push(new Petal());
    for (let i = 0; i < 26; i += 1) orbs.push(new Orb());
    requestAnimationFrame(renderBg);
  }

  // Landing parallax
  document.addEventListener("mousemove", (e) => {
    if (window.scrollY >= window.innerHeight) return;
    const parX = (e.clientX / window.innerWidth - 0.5) * 2;
    const parY = (e.clientY / window.innerHeight - 0.5) * 2;
    const lcon = $("lcon");
    const sfig = $("sfig");
    const cloudLayer = $("cloudLayer");
    const landArch = $("landArch");
    if (lcon) lcon.style.transform = `translate(${parX * 8}px, ${parY * 5}px)`;
    if (sfig) sfig.style.transform = `translate(${parX * 14}px, ${parY * 9}px)`;
    if (cloudLayer) cloudLayer.style.transform = `translate(${parX * 5}px, ${parY * 3}px)`;
    if (landArch) landArch.style.transform = `translate(-50%, 0) translate(${parX * 10}px, ${parY * 7}px)`;
  });

  // Web audio
  let actx = null;
  let playing = false;
  let dGain = null;
  let dGain2 = null;
  let melTO = null;
  let padGain = null;
  let delay = null;
  let delay2 = null;
  const PENTA = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 784, 880];
  const abtn = $("abtn");
  const awav = $("awav");

  function initAudio() {
    if (actx) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    actx = new AudioCtor();

    delay = actx.createDelay(2.5);
    const dlyG = actx.createGain();
    const dlyG2 = actx.createGain();
    delay.delayTime.value = 0.72;
    dlyG.gain.value = 0.2;
    dlyG2.gain.value = 0.12;
    delay.connect(dlyG);
    dlyG.connect(delay);
    dlyG.connect(actx.destination);

    delay2 = actx.createDelay(1.8);
    delay2.delayTime.value = 0.38;
    dlyG2.connect(delay2);
    delay2.connect(dlyG2);
    dlyG2.connect(actx.destination);

    const d1 = actx.createOscillator();
    const d1g = actx.createGain();
    const d1f = actx.createBiquadFilter();
    d1.type = "sine";
    d1.frequency.value = 65.41;
    d1f.type = "lowpass";
    d1f.frequency.value = 155;
    d1g.gain.value = 0;
    d1.connect(d1f);
    d1f.connect(d1g);
    d1g.connect(actx.destination);
    d1.start();
    dGain = d1g;

    const d2 = actx.createOscillator();
    const d2g = actx.createGain();
    d2.type = "sine";
    d2.frequency.value = 130.81;
    d2g.gain.value = 0;
    d2.connect(d2g);
    d2g.connect(actx.destination);
    d2.start();
    dGain2 = d2g;

    const padFreqs = [261.63, 329.63, 392, 523.25];
    padGain = actx.createGain();
    padGain.gain.value = 0;
    padFreqs.forEach((f) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.value = 0.018;
      o.connect(g);
      g.connect(padGain);
      o.start();
    });
    padGain.connect(actx.destination);
  }

  function startMusic() {
    if (!actx || playing) return;
    playing = true;
    dGain?.gain.linearRampToValueAtTime(0.07, actx.currentTime + 1.5);
    dGain2?.gain.linearRampToValueAtTime(0.032, actx.currentTime + 1.5);
    padGain?.gain.linearRampToValueAtTime(1, actx.currentTime + 2);
    playMelody();
    abtn?.classList.remove("muted");
    awav?.classList.add("on");
  }

  function stopMusic() {
    if (!actx || !playing) return;
    playing = false;
    dGain?.gain.linearRampToValueAtTime(0, actx.currentTime + 0.7);
    dGain2?.gain.linearRampToValueAtTime(0, actx.currentTime + 0.7);
    padGain?.gain.linearRampToValueAtTime(0, actx.currentTime + 0.7);
    clearTimeout(melTO);
    abtn?.classList.add("muted");
    awav?.classList.remove("on");
  }

  function playMelody() {
    if (!actx || !playing) return;
    const octave = Math.random() > 0.45 ? 2 : 1;
    const f = PENTA[Math.floor(Math.random() * PENTA.length)] * octave;
    const o = actx.createOscillator();
    const g = actx.createGain();
    const fl = actx.createBiquadFilter();
    o.type = "triangle";
    o.frequency.value = f;
    fl.type = "lowpass";
    fl.frequency.value = 3200;
    const n = actx.currentTime;
    g.gain.setValueAtTime(0, n);
    g.gain.linearRampToValueAtTime(0.16, n + 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, n + 3.2);
    o.connect(fl);
    fl.connect(g);
    if (delay) g.connect(delay);
    if (delay2) g.connect(delay2);
    g.connect(actx.destination);
    o.start(n);
    o.stop(n + 4);
    melTO = setTimeout(playMelody, 800 + Math.random() * 2800);
  }

  function pling(freq = 880, vol = 0.05, dur = 0.15) {
    if (!actx || !playing) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur + 0.05);
  }

  abtn?.addEventListener("click", () => {
    initAudio();
    if (actx?.state === "suspended") actx.resume();
    playing ? stopMusic() : startMusic();
  });

  document.querySelectorAll(".ccard,.mcard,.ctabtn").forEach((el) => {
    el.addEventListener("mouseenter", () => pling(660, 0.025, 0.08));
    el.addEventListener("click", () => pling(880, 0.05, 0.12));
  });
  document.querySelectorAll(".chb,.sbtn,.ndot").forEach((el) => {
    el.addEventListener("click", () => pling(1100, 0.04, 0.1));
  });

  // Scroll animations
  const SECS = ["land", "map", "chars", "story", "door", "cine", "end"];
  let scrollAnimsStarted = false;

  function initScrollAnims() {
    if (scrollAnimsStarted) return;
    scrollAnimsStarted = true;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("vis");
        const sec = e.target.closest("section");
        if (sec) {
          const i = SECS.indexOf(sec.id);
          if (i >= 0) setNavDot(i);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".rv,.eq,.etit,.esub,.rpbtn,.ecred,.end-divider").forEach((el) => obs.observe(el));

    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.35) {
          const i = SECS.indexOf(e.target.id);
          if (i >= 0) setNavDot(i);
        }
      });
    }, { threshold: 0.35 });

    document.querySelectorAll("section").forEach((s) => so.observe(s));
  }

  function setNavDot(idx) {
    document.querySelectorAll(".ndot").forEach((d, j) => d.classList.toggle("on", j === idx));
  }

  document.querySelectorAll(".ndot").forEach((d, i) => {
    d.addEventListener("click", () => {
      pling(880, 0.04, 0.1);
      $(SECS[i])?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Map popups
  function showPop(el, title, detail) {
    const pop = $("mpop");
    const wrap = el.closest(".mwrap");
    if (!pop || !wrap) return;
    const er = el.getBoundingClientRect();
    const cr = wrap.getBoundingClientRect();
    $("popt").textContent = title;
    $("popd").textContent = detail;
    pop.style.left = `${er.left - cr.left + er.width / 2}px`;
    pop.style.top = `${er.top - cr.top - 14}px`;
    pop.classList.add("show");
    pling(660, 0.022, 0.07);
  }

  function hidePop() {
    $("mpop")?.classList.remove("show");
  }

  // Story
  const CHS = [
    {
      n: "Chapter I",
      name: "The First Door",
      spk: "Suzume",
      txt: "Something called to me from beyond the ruins. A door standing alone in a field of weeds - ancient, weathered, and glowing with a light that had no right to be there. I reached for it before I understood why.",
      bg: "linear-gradient(180deg,#1a0a05 0%,#3d1a05 40%,#8b3622 80%,#1a0a05 100%)",
      pColor: "#f4873f",
      pType: "sparks"
    },
    {
      n: "Chapter II",
      name: "The Closer",
      spk: "Souta Munakata",
      txt: "\"My name is Souta Munakata. I close doors.\" He said it simply, as if sealing catastrophe were just an ordinary occupation. As if the weight of the world could be carried in a single keystone, in a single pair of hands.",
      bg: "linear-gradient(180deg,#050a1e 0%,#0d1b4b 50%,#1e3a5f 100%)",
      pColor: "#74b9ff",
      pType: "rain"
    },
    {
      n: "Chapter III",
      name: "Daijin Awakens",
      spk: "Daijin",
      txt: "\"Now I am free! Now I am free!\" The white cat danced across the rooftops of Japan, scattering chaos like cherry blossoms - beautiful, impossible to catch, and entirely unrepentant about every disaster left in his wake.",
      bg: "linear-gradient(180deg,#0a0520 0%,#1a0540 60%,rgba(220,220,255,.06) 100%)",
      pColor: "#c8d8ff",
      pType: "float"
    },
    {
      n: "Chapter IV",
      name: "Across Japan",
      spk: "Suzume",
      txt: "Every road leads somewhere. This one leads everywhere. I have been passed from kind stranger to kind stranger across this whole country - and I haven't stopped moving, not even once. The chair rattles on every mountain pass.",
      bg: "linear-gradient(180deg,#060918 0%,#0d2a4b 30%,#1a3a1a 70%,#060918 100%)",
      pColor: "#5eead4",
      pType: "drift"
    },
    {
      n: "Chapter V",
      name: "The Ever-After",
      spk: "Narrator",
      txt: "So this is where it all goes - lost places, abandoned buildings, towns the sea swallowed. They come to rest here, in the Ever-After, where time has no claim over things that chose to remember. It is the quietest place I have ever stood.",
      bg: "linear-gradient(180deg,#0a0520 0%,#1e1b4b 50%,#4c1d95 100%)",
      pColor: "#c084fc",
      pType: "stars"
    },
    {
      n: "Chapter VI",
      name: "The Worm Stirs",
      spk: "Souta",
      txt: "\"The worm will rise. And everything will tremble.\" Beneath Japan - beneath all of us - something ancient and enormous coils in its sleep. Every earthquake is just its breath. Every tremor, a half-remembered dream of destruction.",
      bg: "linear-gradient(180deg,#1a0505 0%,#3d0a0a 50%,#600a0a 100%)",
      pColor: "#e55a4a",
      pType: "embers"
    },
    {
      n: "Chapter VII",
      name: "The Keystone",
      spk: "Souta",
      txt: "\"I will become the keystone. To protect everyone.\" Some sacrifices aren't asked for - they are arrived at, quietly, in the space between who you were and who you are willing to become. I understood, then, what it meant to love something enough to stay.",
      bg: "linear-gradient(180deg,#050a1e 0%,#0d1b4b 40%,#1e3a5f 70%,#3d1a5f 100%)",
      pColor: "#74b9ff",
      pType: "rain"
    },
    {
      n: "Chapter VIII",
      name: "Return",
      spk: "Souta",
      txt: "\"Suzume... I'm always with you.\" Not as a promise of forever - but as a truth already written. Every door she has ever opened has led here, to this moment, to this name, to herself. The morning rises over Japan, and the doors are sealed.",
      bg: "linear-gradient(180deg,#0a0520 0%,#1a0f3c 40%,#2d1854 70%,rgba(244,135,63,.2) 100%)",
      pColor: "#ffd166",
      pType: "sparks"
    }
  ];

  let curCh = 0;
  let twTO = null;
  let sceneCtx = null;
  let sceneAnim = null;
  let storyStarted = false;

  function initStory() {
    if (storyStarted) return;
    storyStarted = true;
    const nav = $("chnav");
    if (!nav) return;
    nav.textContent = "";
    CHS.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `chb${i === 0 ? " on" : ""}`;
      b.textContent = String(i + 1);
      b.title = CHS[i].name;
      b.addEventListener("click", () => {
        pling(880, 0.04, 0.1);
        loadCh(i);
      });
      nav.appendChild(b);
    });

    const sc = $("sceneCanvas");
    sceneCtx = sc?.getContext("2d") || null;
    resizeScene();
    window.addEventListener("resize", resizeScene);
    loadCh(0);

    document.querySelector(".chdisp")?.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      nextCh();
    });

    let touchStartX = 0;
    const storyEl = $("story");
    storyEl?.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    storyEl?.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextCh();
        else prevCh();
      }
    });
  }

  function resizeScene() {
    const sc = $("sceneCanvas");
    if (!sc?.parentElement) return;
    sc.width = sc.parentElement.offsetWidth;
    sc.height = sc.parentElement.offsetHeight;
  }

  function loadCh(idx) {
    curCh = idx;
    const c = CHS[idx];
    document.querySelectorAll(".chb").forEach((b, i) => b.classList.toggle("on", i === idx));
    const pbtn = $("pbtn");
    const nbtn = $("nbtn");
    if (pbtn) pbtn.disabled = idx === 0;
    if (nbtn) nbtn.disabled = idx === CHS.length - 1;
    $("sprogr").textContent = `${rom(idx + 1)} / VIII`;
    $("scenum").textContent = c.n.toUpperCase();

    const titleEl = $("scenetitle");
    titleEl?.classList.add("hide");
    setTimeout(() => {
      $("scename").textContent = c.name;
      titleEl?.classList.remove("hide");
    }, 350);

    $("spkn").textContent = `- ${c.spk.toUpperCase()}`;
    const sbg = $("sbg");
    if (sbg) sbg.style.background = c.bg;

    if (sceneAnim) {
      cancelAnimationFrame(sceneAnim);
      sceneAnim = null;
    }
    runSceneParticles(c.pColor, c.pType);

    const dlg = $("dlg");
    if (!dlg) return;
    dlg.classList.add("fade");
    clearTimeout(twTO);
    setTimeout(() => {
      dlg.classList.remove("fade");
      dlg.innerHTML = '<span class="twc"></span>';
      let i = 0;
      function tw() {
        if (i < c.txt.length) {
          dlg.textContent = c.txt.substring(0, i + 1);
          const cursor = document.createElement("span");
          cursor.className = "twc";
          dlg.appendChild(cursor);
          i += 1;
          twTO = setTimeout(tw, 20 + Math.random() * 16);
        } else {
          dlg.textContent = c.txt;
          const cursor = document.createElement("span");
          cursor.className = "twc";
          dlg.appendChild(cursor);
        }
      }
      setTimeout(tw, 80);
    }, 250);
  }

  function runSceneParticles(color, type) {
    const sc = $("sceneCanvas");
    const ctx = sceneCtx;
    if (!sc || !ctx) return;
    const particles = [];

    function mkP() {
      const W = sc.width;
      const H = sc.height;
      const p = { life: 1 };
      switch (type) {
        case "sparks":
          p.x = Math.random() * W;
          p.y = H + 10;
          p.vx = (Math.random() - 0.5) * 2.5;
          p.vy = -(Math.random() * 3 + 1.5);
          p.sz = Math.random() * 3 + 1;
          p.decay = 0.012 + Math.random() * 0.01;
          break;
        case "rain":
          p.x = Math.random() * W;
          p.y = -10;
          p.vx = 0.5;
          p.vy = Math.random() * 6 + 4;
          p.sz = 1;
          p.h = Math.random() * 12 + 6;
          p.decay = 0.018;
          break;
        case "float":
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.vx = (Math.random() - 0.5) * 0.8;
          p.vy = -(Math.random() * 0.8 + 0.2);
          p.sz = Math.random() * 5 + 2;
          p.decay = 0.006;
          break;
        case "drift":
          p.x = -20;
          p.y = Math.random() * H;
          p.vx = Math.random() * 2.5 + 1;
          p.vy = (Math.random() - 0.5) * 0.8;
          p.sz = Math.random() * 4 + 1;
          p.decay = 0.009;
          break;
        case "stars":
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.vx = 0;
          p.vy = 0;
          p.sz = Math.random() * 2 + 0.5;
          p.ph = Math.random() * Math.PI * 2;
          p.decay = 0;
          p.blink = true;
          break;
        default:
          p.x = Math.random() * W;
          p.y = H;
          p.vx = (Math.random() - 0.5) * 3;
          p.vy = -(Math.random() * 4 + 2);
          p.sz = Math.random() * 4 + 1;
          p.decay = 0.014;
          break;
      }
      return p;
    }

    for (let i = 0; i < 55; i += 1) {
      const p = mkP();
      if (type !== "rain") p.life = Math.random();
      particles.push(p);
    }

    function renderScene() {
      const W = sc.width;
      const H = sc.height;
      ctx.clearRect(0, 0, W, H);
      while (particles.length < 55) particles.push(mkP());

      for (let idx = particles.length - 1; idx >= 0; idx -= 1) {
        const p = particles[idx];
        if (p.blink) {
          p.ph += 0.04;
          const a = (0.4 + 0.4 * Math.sin(p.ph)) * 0.7;
          ctx.globalAlpha = a;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.x < -25 || p.x > W + 25 || p.y < -25 || p.y > H + 25) {
          particles.splice(idx, 1);
          continue;
        }

        ctx.globalAlpha = p.life * 0.75;
        if (type === "rain") {
          ctx.strokeStyle = color;
          ctx.lineWidth = p.sz;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + p.h);
          ctx.stroke();
        } else {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 2);
          g.addColorStop(0, color);
          g.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 2, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      sceneAnim = requestAnimationFrame(renderScene);
    }

    renderScene();
  }

  function prevCh() {
    if (curCh > 0) {
      pling(660, 0.04, 0.1);
      loadCh(curCh - 1);
    }
  }

  function nextCh() {
    if (curCh < CHS.length - 1) {
      pling(880, 0.04, 0.1);
      loadCh(curCh + 1);
    }
  }

  function rom(n) {
    return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n - 1] || String(n);
  }

  // Character overlay
  const CD = {
    su: {
      name: "Suzume Iwato",
      jp: "岩戸 鈴芽",
      role: "Protagonist · Door-Closer's Companion",
      art: "🌸",
      ac: "art-su",
      col: "#f4873f",
      desc: "A 17-year-old girl from Miyazaki whose life is upended when she follows a mysterious traveler into a field of ruins - and removes a stone that could unlock the end of the world. Haunted since childhood by a memory she buried deep, Suzume's journey is one of running toward what she lost, and learning to face what she finds.",
      m: ["Removes the keystone from the western door", "Travels all of Japan chasing a walking chair", "Enters the Ever-After to save those she loves", "Confronts her childhood self in the realm of lost things", "Finds peace with the grief she'd long carried alone"]
    },
    so: {
      name: "Souta Munakata",
      jp: "宗像 草太",
      role: "Closer · Guardian of the Doors",
      art: "🪑",
      ac: "art-so",
      col: "#74b9ff",
      desc: "A university student and hereditary Closer who seals the magical doors that prevent catastrophe. Transformed into a three-legged chair by Daijin's mischief, Souta must rely on Suzume - and learn, perhaps for the first time, what it means to be carried rather than to carry.",
      m: ["Seals the Miyazaki door before the worm emerges", "Is cursed into the form of a chair by Daijin", "Chooses to become the eastern keystone to save Tokyo", "Reunited with Suzume after the great journey ends"]
    },
    da: {
      name: "Daijin",
      jp: "大臣",
      role: "Former Keystone · The White Cat",
      art: "🐱",
      ac: "art-da",
      col: "#c8d8e8",
      desc: "Once the keystone of the western door, Daijin chose freedom over duty - transforming into a small white cat and setting the entire adventure in motion. Playful and unpredictable, Daijin's chaos conceals an ancient ache: the longing to be wanted for love, not function.",
      m: ["Freed from the keystone by Suzume's touch", "Curses Souta into a chair with a single gesture", "Leads Suzume across Japan, seemingly at random", "Returns to the keystone when truly understood", "Chooses love over freedom when it matters most"]
    },
    sa: {
      name: "Sadaijin",
      jp: "左大臣",
      role: "Keystone · The Great Black Cat",
      art: "🖤",
      ac: "art-sa",
      col: "#c084fc",
      desc: "The great black cat who serves as the eastern keystone - a counterpart to Daijin, vast and patient where the white cat is small and restless. Sadaijin holds the weight of eastern Japan in silence, a guardian of immense power who chooses, always, to stay.",
      m: ["Appears to Suzume as a massive divine presence", "Reveals the true nature of the keystones and worm", "Holds the eastern door closed through sheer will", "Bears witness to the resolution of the final door"]
    },
    ta: {
      name: "Tamaki Iwato",
      jp: "岩戸 環",
      role: "Suzume's Aunt · Her Anchor",
      art: "💗",
      ac: "art-ta",
      col: "#fda4af",
      desc: "Suzume's maternal aunt, who gave up her own dreams to raise her sister's daughter after the disaster. Tamaki's love is quiet and sometimes clumsy, but it is the realest thing in Suzume's life - a home that moved, so Suzume would always have one.",
      m: ["Raises Suzume alone in Miyazaki after her mother's death", "Drives across Japan when Suzume disappears", "Confronts Suzume about the cost of her own sacrifice", "Finally says what she's always meant to say"]
    }
  };

  function openChar(k) {
    const d = CD[k];
    if (!d) return;
    pling(880, 0.05, 0.14);
    const a = $("covla");
    if (a) {
      a.textContent = d.art;
      a.className = `cart ${d.ac}`;
      a.style.cssText = "width:100px;height:100px;border-radius:50%;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;font-size:3.4rem;";
    }
    $("covln").textContent = d.name;
    $("covln").style.color = d.col;
    $("covljp").textContent = d.jp;
    $("covlr").textContent = d.role;
    $("covld").textContent = d.desc;
    const moments = $("covlm");
    if (moments) {
      moments.textContent = "";
      d.m.forEach((moment) => {
        const item = document.createElement("div");
        item.className = "cmi";
        item.textContent = moment;
        moments.appendChild(item);
      });
    }
    $("chovl")?.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  function closeChar() {
    $("chovl")?.classList.remove("on");
    document.body.style.overflow = "";
    pling(660, 0.04, 0.1);
  }

  $("chovl")?.addEventListener("click", (e) => {
    if (e.target === $("chovl")) closeChar();
  });

  // Door and dimension overlay
  let doorOpen = false;
  let dimCtx = null;
  let dimAnimId = null;

  function handleDoorClick() {
    pling(880, 0.06, 0.18);
    const door = $("dmdoor");
    const hint = $("dmhint");
    if (!doorOpen) {
      doorOpen = true;
      door?.classList.add("open");
      hint?.classList.add("fade");
      setTimeout(openDim, 900);
    } else {
      door?.classList.remove("open");
      doorOpen = false;
      hint?.classList.remove("fade");
    }
  }

  function openDim() {
    const ov = $("dimov");
    ov?.classList.add("on");
    document.body.style.overflow = "hidden";
    pling(523.25, 0.08, 0.4);
    if (!dimCtx) initDimCanvas();
  }

  function closeDim() {
    $("dimov")?.classList.remove("on");
    document.body.style.overflow = "";
    $("dmdoor")?.classList.remove("open");
    $("dmhint")?.classList.remove("fade");
    doorOpen = false;
    pling(440, 0.05, 0.2);
  }

  $("dimov")?.addEventListener("click", (e) => {
    if (e.target === $("dimov") || e.target === $("dimc")) closeDim();
  });

  function initDimCanvas() {
    const canvas = $("dimc");
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    dimCtx = canvas.getContext("2d");
    if (!dimCtx) return;
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ["rgba(192,132,252,", "rgba(116,185,255,", "rgba(94,234,212,", "rgba(255,209,102,", "rgba(253,164,175,", "rgba(255,255,255,"];

    function resetParticle(p) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      p.x = canvas.width / 2;
      p.y = canvas.height / 2;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = Math.random() * 0.6 + 0.4;
      p.maxLife = p.life;
      p.sz = Math.random() * 2.5 + 0.5;
      p.col = colors[Math.floor(Math.random() * colors.length)];
      p.trail = [];
    }

    for (let i = 0; i < 180; i += 1) {
      const p = {};
      resetParticle(p);
      p.life = Math.random();
      particles.push(p);
    }

    const sStars = [];
    for (let i = 0; i < 8; i += 1) {
      sStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: Math.random() * 8 + 4,
        vy: Math.random() * 4 + 2,
        len: Math.random() * 90 + 40,
        life: Math.random()
      });
    }

    const bgStars = [];
    for (let i = 0; i < 260; i += 1) {
      bgStars.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: Math.random() * 1.5 + 0.2,
        a: Math.random() * 0.7 + 0.15,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.02 + 0.005
      });
    }

    let hue = 0;
    let frame = 0;

    function renderDim() {
      const w = canvas.width;
      const h = canvas.height;
      dimCtx.fillStyle = `rgba(3,5,16,${frame < 30 ? 0.3 : 0.15})`;
      dimCtx.fillRect(0, 0, w, h);
      frame += 1;

      bgStars.forEach((s) => {
        s.ph += s.sp;
        const a = s.a * (0.5 + 0.5 * Math.sin(s.ph));
        dimCtx.globalAlpha = a;
        dimCtx.fillStyle = "white";
        dimCtx.beginPath();
        dimCtx.arc((s.x / 2000) * w, (s.y / 1200) * h, s.r, 0, Math.PI * 2);
        dimCtx.fill();
      });

      hue += 0.4;
      for (let i = 0; i < 4; i += 1) {
        const t = Date.now() * 0.0006;
        const y = h * (0.25 + i * 0.12) + Math.sin(t + i * 1.2) * 55;
        const ww = w * (0.5 + Math.sin(t * 0.3 + i) * 0.2);
        const grd = dimCtx.createRadialGradient(w / 2, y, 0, w / 2, y, ww);
        grd.addColorStop(0, `hsla(${(hue + i * 55) % 360},70%,60%,0.09)`);
        grd.addColorStop(1, "transparent");
        dimCtx.globalAlpha = 1;
        dimCtx.fillStyle = grd;
        dimCtx.fillRect(0, 0, w, h);
      }

      const centerX = w / 2;
      const centerY = h / 2;
      const t = Date.now() * 0.001;
      for (let r = 0; r < 5; r += 1) {
        const radius = 80 + r * 28;
        const rotDir = r % 2 === 0 ? 1 : -1;
        const rot = t * (0.5 + r * 0.15) * rotDir;
        dimCtx.globalAlpha = 0.22 - r * 0.025;
        dimCtx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.08) {
          const wobble = Math.sin(a * 6 + t * 2 + r) * 5;
          const px = centerX + (radius + wobble) * Math.cos(a + rot);
          const py = centerY + (radius + wobble) * Math.sin(a + rot) * 0.65;
          if (a === 0) dimCtx.moveTo(px, py);
          else dimCtx.lineTo(px, py);
        }
        dimCtx.closePath();
        dimCtx.strokeStyle = ["#c084fc", "#74b9ff", "#5eead4", "#ffd166", "#fda4af"][r];
        dimCtx.lineWidth = 1.5;
        dimCtx.stroke();
      }

      const coreGrad = dimCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 120);
      coreGrad.addColorStop(0, "rgba(192,132,252,.35)");
      coreGrad.addColorStop(0.4, "rgba(116,185,255,.15)");
      coreGrad.addColorStop(1, "transparent");
      dimCtx.globalAlpha = 1;
      dimCtx.fillStyle = coreGrad;
      dimCtx.beginPath();
      dimCtx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      dimCtx.fill();

      particles.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        if (p.life <= 0) {
          resetParticle(p);
          return;
        }
        const alpha = p.life / p.maxLife;
        for (let i = 1; i < p.trail.length; i += 1) {
          const ta = (i / p.trail.length) * alpha * 0.5;
          dimCtx.globalAlpha = ta;
          dimCtx.strokeStyle = `${p.col}${ta})`;
          dimCtx.lineWidth = p.sz * (i / p.trail.length);
          dimCtx.beginPath();
          dimCtx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          dimCtx.lineTo(p.trail[i].x, p.trail[i].y);
          dimCtx.stroke();
        }
        dimCtx.globalAlpha = alpha * 0.9;
        dimCtx.fillStyle = `${p.col}${alpha})`;
        dimCtx.beginPath();
        dimCtx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        dimCtx.fill();
      });

      sStars.forEach((s) => {
        s.life += 0.008;
        if (s.life > 1) {
          s.x = Math.random() * w;
          s.y = Math.random() * h * 0.5;
          s.life = 0;
        }
        const a = Math.sin(s.life * Math.PI) * 0.8;
        dimCtx.globalAlpha = a;
        const grad = dimCtx.createLinearGradient(s.x, s.y, s.x - s.len, s.y - s.len / 2);
        grad.addColorStop(0, "rgba(255,255,255,.9)");
        grad.addColorStop(1, "transparent");
        dimCtx.strokeStyle = grad;
        dimCtx.lineWidth = 1.5;
        dimCtx.beginPath();
        dimCtx.moveTo(s.x, s.y);
        dimCtx.lineTo(s.x - s.len, s.y - s.len / 2);
        dimCtx.stroke();
        s.x += s.vx * 0.5;
        s.y += s.vy * 0.5;
      });

      dimCtx.globalAlpha = 1;
      dimAnimId = requestAnimationFrame(renderDim);
    }

    if (dimAnimId) cancelAnimationFrame(dimAnimId);
    renderDim();
  }

  // Ending stars
  let endStarsStarted = false;

  function initEndStars() {
    if (endStarsStarted) return;
    endStarsStarted = true;
    const canvas = $("endc");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const starsEnd = [];
    for (let i = 0; i < 200; i += 1) {
      starsEnd.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.8 + 0.2,
        a: Math.random() * 0.8 + 0.1,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.015 + 0.004
      });
    }

    function mkShooter(startAt = Date.now()) {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: Math.random() * 5 + 3,
        vy: Math.random() * 2 + 1,
        life: 0,
        len: Math.random() * 80 + 30,
        delay: startAt + Math.random() * 8000
      };
    }
    const shooters = Array.from({ length: 5 }, () => mkShooter());
    let sunPhase = 0;

    function renderEnd() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      sunPhase += 0.003;

      const sunA = (0.18 + 0.1 * Math.sin(sunPhase)) * 0.4;
      const sg = ctx.createLinearGradient(0, H * 0.65, 0, H);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, `rgba(244,135,63,${sunA})`);
      sg.addColorStop(1, `rgba(255,209,102,${sunA * 0.6})`);
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);

      starsEnd.forEach((s) => {
        s.ph += s.sp;
        const a = s.a * (0.45 + 0.45 * Math.sin(s.ph));
        const x = s.x * W;
        const y = s.y * H;
        ctx.globalAlpha = a;
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 2.5);
        g.addColorStop(0, "rgba(255,255,255,.95)");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      const now = Date.now();
      shooters.forEach((s, idx) => {
        if (now < s.delay) return;
        s.life += 0.012;
        if (s.life > 1) {
          shooters[idx] = mkShooter(now);
          return;
        }
        const a = Math.sin(s.life * Math.PI) * 0.75;
        ctx.globalAlpha = a;
        const grd = ctx.createLinearGradient(s.x, s.y, s.x - s.len, s.y - s.len * 0.4);
        grd.addColorStop(0, "rgba(255,255,255,.9)");
        grd.addColorStop(1, "transparent");
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len, s.y - s.len * 0.4);
        ctx.stroke();
        s.x += s.vx * 0.6;
        s.y += s.vy * 0.6;
      });

      const t = Date.now() * 0.001;
      for (let i = 0; i < 12; i += 1) {
        const x = W * 0.5 + Math.sin(t * 0.4 + i * 0.52) * W * 0.35;
        const y = H * 0.85 + Math.sin(t * 0.3 + i * 0.8) * H * 0.08;
        const a = (0.15 + 0.1 * Math.sin(t + i)) * 0.6;
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(255,209,102,.9)";
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(renderEnd);
    }
    renderEnd();
  }

  function scrollTo1() {
    pling(880, 0.05, 0.14);
    $("map")?.scrollIntoView({ behavior: "smooth" });
  }

  function beginJ() {
    pling(880, 0.06, 0.16);
    initAudio();
    if (actx?.state === "suspended") actx.resume();
    startMusic();
    setTimeout(() => $("map")?.scrollIntoView({ behavior: "smooth" }), 200);
  }

  function replay() {
    pling(880, 0.05, 0.14);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("landArch")?.addEventListener("mouseenter", () => $("landArch")?.classList.add("burst"));
  $("landArch")?.addEventListener("mouseleave", () => $("landArch")?.classList.remove("burst"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextCh();
    else if (e.key === "ArrowLeft") prevCh();
    else if (e.key === "Escape") {
      closeChar();
      closeDim();
    }
  });

  Object.assign(window, {
    beginJ,
    closeChar,
    closeDim,
    handleDoorClick,
    hidePop,
    nextCh,
    openChar,
    prevCh,
    replay,
    scrollTo1,
    showPop
  });
})();
