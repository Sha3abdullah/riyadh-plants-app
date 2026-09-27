(function () {
  "use strict";

  /* ================= Setup ================= */

  const cityId = Store.setting("city") && CITIES[Store.setting("city")] ? Store.setting("city") : Object.keys(CITIES)[0];
  const CITY = CITIES[cityId];
  const PLANTS = CITY.plants;
  const BY_ID = {};
  PLANTS.forEach(function (p) { BY_ID[p.id] = p; });

  const WHERE = { desert: "Desert", streets: "Streets", gardens: "Gardens & parks", farms: "Farms" };
  const QUIZ_LENGTH = 10;

  const view = document.getElementById("view");
  const topTitle = document.getElementById("topTitle");
  const backBtn = document.getElementById("backBtn");
  const photoInput = document.getElementById("photoInput");

  let cleanup = null; // called when leaving a view

  /* ================= Helpers ================= */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function h(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Weighted random order: plants with a higher weight tend to come first.
  function weightedOrder(plants) {
    return plants
      .map(function (p) { return { p: p, k: Math.pow(Math.random(), 1 / Store.weight(p.id)) }; })
      .sort(function (a, b) { return b.k - a.k; })
      .map(function (x) { return x.p; });
  }

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  function masteredCount() {
    return PLANTS.filter(function (p) { return Store.isMastered(p.id); }).length;
  }

  // All photos of a plant: the downloaded one first, then the learner's own.
  function photosOf(p) {
    const list = [{ src: "images/" + p.id + ".jpg", credit: PHOTO_CREDITS[p.id], mine: false }];
    Store.myPhotos(p.id).forEach(function (m) { list.push({ src: m.url, key: m.key, mine: true }); });
    return list;
  }

  function creditHTML(ph) {
    if (ph.mine) return '<p class="credit">Your photo</p>';
    const c = ph.credit;
    if (!c) return "";
    const lic = c.licenseUrl
      ? '<a href="' + esc(c.licenseUrl) + '" target="_blank" rel="noopener">' + esc(c.license) + "</a>"
      : esc(c.license);
    return '<p class="credit">Photo: <a href="' + esc(c.source) + '" target="_blank" rel="noopener">' +
      esc(c.author) + "</a>, " + lic + ", via Wikimedia Commons</p>";
  }

  function imgHTML(src, alt, eager) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" ' + (eager ? "" : 'loading="lazy" ') + 'decoding="async" draggable="false">';
  }

  function originChip(p) {
    return p.origin === "native"
      ? '<span class="chip chip-native">Native</span>'
      : '<span class="chip chip-introduced">Introduced</span>';
  }

  function whereChips(p) {
    return p.where.map(function (w) { return '<span class="chip">' + esc(WHERE[w] || w) + "</span>"; }).join("");
  }

  function streakHTML(id) {
    const s = Math.min(Store.get(id).streak, Store.MASTERY_STREAK);
    let out = '<span class="streak" aria-label="' + s + ' of 3 correct in a row">';
    for (let i = 0; i < Store.MASTERY_STREAK; i++) out += '<i class="' + (i < s ? "on" : "") + '"></i>';
    return out + "</span>";
  }

  function preload(srcs) {
    srcs.forEach(function (s) { const i = new Image(); i.src = s; });
  }

  /* ================= My photos ================= */

  // Shrink a phone photo so it doesn't fill up browser storage.
  function resizeImage(file, max) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error("Could not read photo")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Could not read photo")); };
      img.src = url;
    });
  }

  function askForPhoto(plantId, done) {
    photoInput.value = "";
    photoInput.onchange = function () {
      const f = photoInput.files && photoInput.files[0];
      if (!f) return;
      resizeImage(f, 1200)
        .then(function (blob) { return Store.addPhoto(plantId, blob); })
        .then(function () { toast("Photo saved"); if (done) done(); })
        .catch(function () { toast("Sorry, that photo couldn't be saved"); });
    };
    photoInput.click();
  }

  /* ================= Router ================= */

  const routes = {
    "": renderHome,
    cards: renderCards,
    quiz: renderQuiz,
    progress: renderProgress,
    plant: renderPlant
  };

  function go(path) { location.hash = "#/" + path; }

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const name = routes[parts[0]] ? parts[0] : "";
    if (cleanup) { cleanup(); cleanup = null; }
    stopConfetti();
    view.innerHTML = "";
    view.classList.remove("view-enter");
    void view.offsetWidth;
    view.classList.add("view-enter");
    backBtn.hidden = name === "";
    document.getElementById("logo").hidden = name !== "";
    routes[name].apply(null, parts.slice(1));
    window.scrollTo(0, 0);
  }

  backBtn.addEventListener("click", function () {
    const inPlant = location.hash.indexOf("#/plant/") === 0;
    if (inPlant && history.length > 1) history.back(); else go("");
  });

  /* ================= Home ================= */

  function renderHome() {
    topTitle.textContent = CITY.name + " Plants";
    const total = PLANTS.length;
    const done = masteredCount();
    const R = 84, C = 2 * Math.PI * R;
    const el = h(
      '<div>' +
      '<section class="home-hero">' +
      '<div class="ring-wrap" role="img" aria-label="' + done + " of " + total + ' plants mastered">' +
      '<svg class="ring" viewBox="0 0 200 200"><circle class="ring-track" cx="100" cy="100" r="' + R + '" fill="none" stroke-width="16"/>' +
      '<circle class="ring-bar" cx="100" cy="100" r="' + R + '" fill="none" stroke-width="16" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/></svg>' +
      '<div class="ring-center"><div class="ring-num">' + done + '<small>/' + total + '</small></div><div class="ring-label">plants mastered</div></div>' +
      "</div>" +
      '<p class="home-sub">Learn the plants of ' + esc(CITY.name) + ' · <span class="ar">نباتات ' + esc(CITY.nameAr) + "</span></p>" +
      "</section>" +
      '<nav class="menu">' +
      menuItem("cards", "Flashcards", "Flip through photos and names",
        '<svg viewBox="0 0 24 24" width="28" height="28"><rect x="3" y="6" width="13" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>') +
      menuItem("quiz", "Quiz", QUIZ_LENGTH + " quick questions",
        '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.2" fill="currentColor"/></svg>') +
      menuItem("progress", "My Progress", "See what you know, browse all plants",
        '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 21c-4.5-2.5-7-6.2-7-10.5C5 7 7.5 4 12 3c4.5 1 7 4 7 7.5 0 4.3-2.5 8-7 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>') +
      "</nav></div>"
    );
    view.appendChild(el);
    el.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { go(b.dataset.go); });
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.querySelector(".ring-bar").style.strokeDashoffset = String(C * (1 - done / total));
      });
    });
  }

  function menuItem(path, title, desc, icon) {
    return '<button class="menu-item" data-go="' + path + '">' +
      '<span class="menu-icon" aria-hidden="true">' + icon + "</span>" +
      '<span class="menu-text"><span class="menu-title">' + title + '</span><span class="menu-desc">' + desc + "</span></span>" +
      '<svg class="menu-chev" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>";
  }

  /* ================= Filter control ================= */

  function filterHTML(current) {
    return '<div class="segmented" role="group" aria-label="Filter plants">' +
      [["all", "All"], ["native", "Native"], ["introduced", "Introduced"]].map(function (f) {
        return '<button data-filter="' + f[0] + '" aria-pressed="' + (current === f[0]) + '">' + f[1] + "</button>";
      }).join("") + "</div>";
  }

  function filtered(f) {
    return f === "all" ? PLANTS : PLANTS.filter(function (p) { return p.origin === f; });
  }

  /* ================= Flashcards ================= */

  function renderCards() {
    topTitle.textContent = "Flashcards";
    let filter = Store.setting("filter") || "all";
    let deck, index, known, learning;

    function start(list) {
      deck = list || weightedOrder(filtered(filter));
      index = 0; known = 0; learning = [];
      draw();
    }

    function draw() {
      view.innerHTML = "";
      view.appendChild(h(filterHTML(filter)));
      view.querySelectorAll("[data-filter]").forEach(function (b) {
        b.addEventListener("click", function () {
          filter = b.dataset.filter;
          Store.setting("filter", filter);
          start();
        });
      });
      if (index >= deck.length) return drawDone();
      drawCard();
    }

    function drawCard() {
      const p = deck[index];
      const photos = photosOf(p);
      let photoIdx = 0;
      const next = deck[index + 1];
      if (next) preload(["images/" + next.id + ".jpg"]);

      const wrap = h(
        '<div style="display:flex;flex-direction:column;flex:1">' +
        '<div class="fc-meta"><span>' + (index + 1) + " / " + deck.length + '</span><span>Tap card to flip · swipe to answer</span></div>' +
        '<div class="fc-stage">' +
        '<div class="card-drag">' +
        '<span class="swipe-label swipe-know">I know it</span><span class="swipe-label swipe-learn">Still learning</span>' +
        '<div class="card" role="button" tabindex="0" aria-label="Flashcard. Tap to flip.">' +
        '<div class="face face-front"><div class="photo">' + imgHTML(photos[0].src, "Mystery plant", true) +
        (photos.length > 1 ? '<div class="photo-dots">' + photos.map(function (_, i) { return '<span class="' + (i === 0 ? "on" : "") + '"></span>'; }).join("") + "</div>" : "") +
        "</div>" +
        '<div class="hint">' + (photos.length > 1 ? "Tap the dots to switch photo · " : "") + "What is this plant?</div></div>" +
        '<div class="face face-back">' +
        '<div class="photo">' + imgHTML(photos[0].src, p.en, true) + "</div>" +
        '<div class="back-body">' +
        '<h2 class="name-en">' + esc(p.en) + "</h2>" +
        '<p class="name-ar ar" lang="ar">' + esc(p.ar) + "</p>" +
        '<p class="name-sci">' + esc(p.sci) + "</p>" +
        '<div class="chips">' + originChip(p) + whereChips(p) + "</div>" +
        '<p class="fact"><b>Fun fact:</b> ' + esc(p.fact) + "</p>" +
        '<div class="photo-actions"><button class="btn btn-soft btn-small" data-act="add">+ Add photo</button>' +
        '<button class="btn btn-soft btn-small" data-act="more">Details</button></div>' +
        '<div class="credit-slot">' + creditHTML(photos[0]) + "</div>" +
        "</div></div>" +
        "</div></div></div>" +
        '<div class="fc-actions">' +
        '<button class="btn btn-bad" data-act="learning">Still learning</button>' +
        '<button class="btn btn-good" data-act="know">I know it</button>' +
        "</div></div>"
      );
      view.appendChild(wrap);

      const drag = wrap.querySelector(".card-drag");
      const card = wrap.querySelector(".card");
      const stage = wrap.querySelector(".fc-stage");
      const lblKnow = wrap.querySelector(".swipe-know");
      const lblLearn = wrap.querySelector(".swipe-learn");
      let busy = false;

      function flip() { card.classList.toggle("flipped"); }

      function showPhoto(i) {
        photoIdx = (i + photos.length) % photos.length;
        const ph = photos[photoIdx];
        wrap.querySelectorAll(".face img").forEach(function (im) { im.src = ph.src; });
        wrap.querySelectorAll(".photo-dots span").forEach(function (d, k) { d.classList.toggle("on", k === photoIdx); });
        wrap.querySelector(".credit-slot").innerHTML = creditHTML(ph);
      }

      function answer(isKnown) {
        if (busy) return;
        busy = true;
        Store.recordCard(p.id, isKnown);
        if (isKnown) known++; else learning.push(p);
        drag.style.transform = "translateX(" + (isKnown ? 130 : -130) + "%) rotate(" + (isKnown ? 18 : -18) + "deg)";
        drag.style.opacity = "0";
        setTimeout(function () { index++; draw(); }, 300);
      }

      wrap.querySelector('[data-act="know"]').addEventListener("click", function () { answer(true); });
      wrap.querySelector('[data-act="learning"]').addEventListener("click", function () { answer(false); });
      wrap.querySelector('[data-act="add"]').addEventListener("click", function (e) {
        e.stopPropagation();
        askForPhoto(p.id, function () {
          photos.push(photosOf(p).pop());
          showPhoto(photos.length - 1);
        });
      });
      wrap.querySelector('[data-act="more"]').addEventListener("click", function (e) {
        e.stopPropagation();
        go("plant/" + p.id);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
        if (e.key === "ArrowRight") answer(true);
        if (e.key === "ArrowLeft") answer(false);
      });

      // Pointer handling: tap flips, horizontal drag answers.
      // On the front, a short swipe across the photo cycles photos if there are several.
      let startX = 0, startY = 0, dx = 0, dy = 0, down = false, dragging = false;

      stage.addEventListener("pointerdown", function (e) {
        if (e.target.closest("button, a")) return;
        down = true; dragging = false;
        startX = e.clientX; startY = e.clientY; dx = dy = 0;
      });
      stage.addEventListener("pointermove", function (e) {
        if (!down) return;
        dx = e.clientX - startX; dy = e.clientY - startY;
        if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          dragging = true;
          drag.classList.add("dragging");
          try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
        if (dragging) {
          drag.style.transform = "translateX(" + dx + "px) rotate(" + dx / 20 + "deg)";
          lblKnow.style.opacity = String(Math.max(0, Math.min(1, dx / 90)));
          lblLearn.style.opacity = String(Math.max(0, Math.min(1, -dx / 90)));
        }
      });
      function end(e) {
        if (!down) return;
        down = false;
        drag.classList.remove("dragging");
        lblKnow.style.opacity = lblLearn.style.opacity = "0";
        if (dragging) {
          if (Math.abs(dx) > 90) return answer(dx > 0);
          drag.style.transform = "";
          return;
        }
        if (e.type === "pointerup" && Math.abs(dx) < 10 && Math.abs(dy) < 10 && !e.target.closest("button, a")) {
          // Tapping the dots area on the front cycles photos; anywhere else flips.
          if (photos.length > 1 && !card.classList.contains("flipped") && e.target.closest(".face-front .photo")) {
            const r = stage.getBoundingClientRect();
            if (e.clientY > r.top + r.height * 0.8) return showPhoto(photoIdx + 1);
          }
          flip();
        }
      }
      stage.addEventListener("pointerup", end);
      stage.addEventListener("pointercancel", end);
    }

    function drawDone() {
      const n = deck.length;
      const el = h(
        '<div class="score">' +
        '<div class="score-big">' + known + "<small>/" + n + "</small></div>" +
        '<p class="score-msg">' + (known === n ? "You knew them all!" : "Deck finished") + "</p>" +
        '<p class="score-sub">' + (learning.length ? learning.length + " still to learn. Go through them again?" : "Try the quiz to lock them in.") + "</p>" +
        '<div class="score-actions">' +
        (learning.length ? '<button class="btn btn-primary btn-block" data-act="again">Review ' + learning.length + " again</button>" : "") +
        '<button class="btn ' + (learning.length ? "btn-soft" : "btn-primary") + ' btn-block" data-act="all">Shuffle all</button>' +
        '<button class="btn btn-soft btn-block" data-act="quiz">Take the quiz</button>' +
        "</div></div>"
      );
      view.appendChild(el);
      if (known === n && n >= 5) confetti();
      const again = el.querySelector('[data-act="again"]');
      if (again) again.addEventListener("click", function () { start(shuffle(learning)); });
      el.querySelector('[data-act="all"]').addEventListener("click", function () { start(); });
      el.querySelector('[data-act="quiz"]').addEventListener("click", function () { go("quiz"); });
    }

    start();
  }

  /* ================= Quiz ================= */

  const QTYPES = [
    { id: "photo-en", prompt: "What is this plant called in English?" },
    { id: "photo-ar", prompt: "What is this plant called in Arabic?" },
    { id: "en-ar", prompt: "Which is the Arabic name?" }
  ];

  function makeQuestions() {
    const chosen = weightedOrder(PLANTS).slice(0, Math.min(QUIZ_LENGTH, PLANTS.length));
    return chosen.map(function (p, i) {
      const type = QTYPES[i % QTYPES.length];
      const others = shuffle(PLANTS.filter(function (o) { return o.id !== p.id; }));
      // Mix look-alikes (same group) with others so it's not too easy.
      const same = others.filter(function (o) { return o.origin === p.origin; });
      const pool = shuffle(same.slice(0, 2).concat(others.filter(function (o) { return same.slice(0, 2).indexOf(o) < 0; }).slice(0, 1)));
      const photo = pick(photosOf(p));
      return { plant: p, type: type, photo: photo, choices: shuffle([p].concat(pool)) };
    });
  }

  function renderQuiz() {
    topTitle.textContent = "Quiz";
    // Shuffle the order of question types, but keep a balanced mix.
    const qs = shuffle(makeQuestions());
    let i = 0, score = 0;
    const missed = [];
    const newlyMastered = [];
    let timer = null;
    cleanup = function () { clearTimeout(timer); };

    preload(qs.map(function (q) { return q.photo.src; }));

    const shell = h(
      '<div style="display:flex;flex-direction:column;flex:1">' +
      '<div class="q-progress"><div class="q-progress-bar" style="width:0%"></div></div>' +
      '<div class="q-meta"><span class="q-count"></span><span class="q-score"></span></div>' +
      '<div class="q-body"></div></div>'
    );
    view.appendChild(shell);
    const body = shell.querySelector(".q-body");

    function label(p, type) { return type.id === "photo-en" ? p.en : p.ar; }

    function show() {
      const q = qs[i];
      const p = q.plant;
      const arabicChoices = q.type.id !== "photo-en";
      shell.querySelector(".q-progress-bar").style.width = (i / qs.length * 100) + "%";
      shell.querySelector(".q-count").textContent = "Question " + (i + 1) + " of " + qs.length;
      shell.querySelector(".q-score").textContent = "Score " + score;

      const stim = q.type.id === "en-ar"
        ? '<div class="q-word"><div class="q-word-text">' + esc(p.en) + '<span class="q-word-sci">' + esc(p.sci) + "</span></div></div>"
        : '<div class="photo q-photo">' + imgHTML(q.photo.src, "Mystery plant", true) + "</div>";

      const panel = h(
        '<div class="q-in">' +
        '<p class="q-prompt">' + q.type.prompt + "</p>" + stim +
        '<div class="choices">' +
        q.choices.map(function (c) {
          return '<button class="choice' + (arabicChoices ? " ar" : "") + '"' + (arabicChoices ? ' lang="ar" dir="rtl"' : "") +
            ' data-id="' + c.id + '">' + esc(label(c, q.type)) + "</button>";
        }).join("") +
        '</div><div class="fb-slot"></div></div>'
      );
      body.innerHTML = "";
      body.appendChild(panel);

      panel.querySelectorAll(".choice").forEach(function (btn) {
        btn.addEventListener("click", function () { choose(btn, panel, q); });
      });
    }

    function choose(btn, panel, q) {
      const p = q.plant;
      const ok = btn.dataset.id === p.id;
      panel.querySelectorAll(".choice").forEach(function (b) {
        b.disabled = true;
        if (b.dataset.id === p.id) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
        else b.classList.add("dim");
      });
      if (navigator.vibrate) navigator.vibrate(ok ? 15 : [30, 40, 30]);
      if (Store.recordQuiz(p.id, ok)) newlyMastered.push(p);
      if (ok) score++; else missed.push(p);
      shell.querySelector(".q-score").textContent = "Score " + score;

      const ph = photosOf(p)[0];
      const fb = h(
        '<div class="feedback"><div class="feedback-row">' +
        (ok && q.type.id !== "en-ar" ? "" : '<div class="photo">' + imgHTML(ph.src, p.en, true) + "</div>") +
        '<div><p class="feedback-title ' + (ok ? "good" : "bad") + '">' + (ok ? "Correct!" : "Not quite. It's:") + "</p>" +
        '<p class="feedback-names">' + esc(p.en) + ' · <span class="ar" lang="ar">' + esc(p.ar) + "</span></p>" +
        '<p class="name-sci" style="margin:0">' + esc(p.sci) + "</p></div></div></div>"
      );
      panel.querySelector(".fb-slot").appendChild(fb);

      const last = i === qs.length - 1;
      const nextBtn = h('<button class="btn btn-primary btn-block q-next">' + (last ? "See my score" : "Next") + "</button>");
      panel.querySelector(".fb-slot").appendChild(nextBtn);
      nextBtn.addEventListener("click", advance);
      nextBtn.focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (ok) timer = setTimeout(advance, 1300);
    }

    function advance() {
      clearTimeout(timer);
      const panel = body.firstElementChild;
      if (!panel || panel.classList.contains("q-out")) return;
      panel.classList.remove("q-in");
      panel.classList.add("q-out");
      timer = setTimeout(function () {
        i++;
        if (i < qs.length) show(); else finish();
      }, 230);
    }

    function finish() {
      shell.querySelector(".q-progress-bar").style.width = "100%";
      const n = qs.length;
      const msg = score === n ? "Perfect score!" : score >= 8 ? "Great job!" : score >= 5 ? "Nice progress!" : "Keep going, you're learning!";
      const seen = {};
      const uniqMissed = missed.filter(function (p) { return seen[p.id] ? false : (seen[p.id] = true); });
      body.innerHTML = "";
      const el = h(
        '<div class="score q-in">' +
        '<div class="score-big">' + score + "<small>/" + n + "</small></div>" +
        '<p class="score-msg">' + msg + "</p>" +
        '<p class="score-sub">' + masteredCount() + " of " + PLANTS.length + " plants mastered" +
        (newlyMastered.length ? " · " + newlyMastered.length + " new this round" : "") + "</p>" +
        (uniqMissed.length ? '<p class="section-title">Review these</p><div class="review-list">' +
          uniqMissed.map(function (p) {
            return '<button class="review-item plant-row" data-id="' + p.id + '"><div class="photo">' + imgHTML("images/" + p.id + ".jpg", p.en) + "</div>" +
              '<div class="plant-row-text"><span class="plant-row-en">' + esc(p.en) + '</span><span class="plant-row-ar ar" lang="ar">' + esc(p.ar) + "</span></div></button>";
          }).join("") + "</div>" : "") +
        '<div class="score-actions">' +
        '<button class="btn btn-primary btn-block" data-act="again">Play again</button>' +
        '<button class="btn btn-soft btn-block" data-act="home">Home</button>' +
        "</div></div>"
      );
      body.appendChild(el);
      el.querySelector('[data-act="again"]').addEventListener("click", function () { route(); });
      el.querySelector('[data-act="home"]').addEventListener("click", function () { go(""); });
      el.querySelectorAll("[data-id]").forEach(function (b) {
        b.addEventListener("click", function () { go("plant/" + b.dataset.id); });
      });
      if (score >= 8) setTimeout(confetti, 250);
    }

    show();
  }

  /* ================= Progress ================= */

  function renderProgress() {
    topTitle.textContent = "My Progress";
    let filter = Store.setting("progressFilter") || "all";

    function draw() {
      const list = filtered(filter);
      const mastered = list.filter(function (p) { return Store.isMastered(p.id); });
      const learning = list.filter(function (p) { return !Store.isMastered(p.id) && Store.isSeen(p.id); })
        .sort(function (a, b) { return Store.weight(b.id) - Store.weight(a.id); });
      const fresh = list.filter(function (p) { return !Store.isSeen(p.id); });

      view.innerHTML = "";
      const el = h(
        "<div>" +
        '<div class="stats">' +
        stat(mastered.length, "Mastered") + stat(learning.length, "Learning") + stat(fresh.length, "Not started") +
        "</div>" +
        filterHTML(filter) +
        section("Needs practice", learning, "Shown more often in quizzes.") +
        section("Not started yet", fresh) +
        section("Mastered", mastered) +
        '<p class="note">A plant counts as mastered after ' + Store.MASTERY_STREAK + " correct quiz answers in a row. A wrong answer resets its streak.</p>" +
        '<button class="danger-link" data-act="reset">Reset progress</button>' +
        "</div>"
      );
      view.appendChild(el);
      el.querySelectorAll("[data-filter]").forEach(function (b) {
        b.addEventListener("click", function () {
          filter = b.dataset.filter;
          Store.setting("progressFilter", filter);
          draw();
        });
      });
      el.querySelectorAll("[data-id]").forEach(function (b) {
        b.addEventListener("click", function () { go("plant/" + b.dataset.id); });
      });
      el.querySelector('[data-act="reset"]').addEventListener("click", function () {
        if (confirm("Reset all progress? Your own photos will be kept.")) {
          Store.resetProgress();
          toast("Progress reset");
          draw();
        }
      });
    }

    function stat(n, label) {
      return '<div class="stat"><div class="stat-num">' + n + '</div><div class="stat-label">' + label + "</div></div>";
    }

    function section(title, list, note) {
      if (!list.length) return "";
      return '<h2 class="section-title">' + title + " (" + list.length + ")</h2>" +
        (note ? '<p class="note" style="margin:-4px 0 8px">' + note + "</p>" : "") +
        '<div class="plant-list">' + list.map(row).join("") + "</div>";
    }

    function row(p) {
      const mine = Store.myPhotos(p.id).length;
      return '<button class="plant-row" data-id="' + p.id + '">' +
        '<div class="photo">' + imgHTML("images/" + p.id + ".jpg", p.en) + "</div>" +
        '<div class="plant-row-text"><span class="plant-row-en">' + esc(p.en) + (mine ? ' <span class="chip" style="font-size:11px;padding:1px 7px">+' + mine + " photo" + (mine > 1 ? "s" : "") + "</span>" : "") +
        '</span><span class="plant-row-ar ar" lang="ar">' + esc(p.ar) + "</span></div>" +
        (Store.isMastered(p.id) ? '<span class="badge-mastered">Mastered</span>' : streakHTML(p.id)) +
        "</button>";
    }

    draw();
  }

  /* ================= Plant detail ================= */

  function renderPlant(id) {
    const p = BY_ID[id];
    if (!p) return go("progress");
    topTitle.textContent = p.en;

    function draw() {
      const photos = photosOf(p);
      const st = Store.get(p.id);
      view.innerHTML = "";
      const el = h(
        "<div>" +
        '<div class="detail-photos">' +
        photos.map(function (ph, k) {
          return '<div class="detail-photo"><div class="photo">' + imgHTML(ph.src, p.en, k === 0) +
            (ph.mine ? '<span class="user-photo-label">My photo</span>' : "") +
            (k === 0 ? '<span class="photo-tag">' + (p.origin === "native" ? "Native" : "Introduced") + "</span>" : "") +
            "</div>" + creditHTML(ph) +
            (ph.mine ? '<button class="btn btn-soft btn-small" style="margin-top:6px" data-del="' + ph.key + '">Delete my photo</button>' : "") +
            "</div>";
        }).join("") +
        "</div>" +
        (photos.length > 1 ? '<p class="note">Swipe sideways to see all ' + photos.length + " photos.</p>" : "") +
        '<div class="detail-body">' +
        '<div class="photo-actions"><button class="btn btn-primary btn-small" data-act="add">+ Add photo</button></div>' +
        '<h2 class="name-en">' + esc(p.en) + "</h2>" +
        '<p class="name-ar ar" lang="ar">' + esc(p.ar) + "</p>" +
        '<p class="name-sci">' + esc(p.sci) + "</p>" +
        '<div class="chips">' + originChip(p) + whereChips(p) + "</div>" +
        '<p class="fact"><b>Fun fact:</b> ' + esc(p.fact) + "</p>" +
        '<div class="stats">' +
        '<div class="stat"><div class="stat-num">' + st.correct + '</div><div class="stat-label">Correct</div></div>' +
        '<div class="stat"><div class="stat-num">' + st.wrong + '</div><div class="stat-label">Wrong</div></div>' +
        '<div class="stat"><div class="stat-num">' + Math.min(st.streak, 3) + '/3</div><div class="stat-label">' + (Store.isMastered(p.id) ? "Mastered" : "Streak") + "</div></div>" +
        "</div></div></div>"
      );
      view.appendChild(el);
      el.querySelector('[data-act="add"]').addEventListener("click", function () {
        askForPhoto(p.id, function () {
          draw();
          const strip = view.querySelector(".detail-photos");
          strip.scrollTo({ left: strip.scrollWidth, behavior: "smooth" });
        });
      });
      el.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (!confirm("Delete this photo?")) return;
          Store.removePhoto(p.id, Number(b.dataset.del)).then(function () { toast("Photo deleted"); draw(); });
        });
      });
    }

    draw();
  }

  /* ================= Confetti ================= */

  let confettiRAF = 0;

  function stopConfetti() {
    cancelAnimationFrame(confettiRAF);
    const c = document.getElementById("confetti");
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  }

  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.getElementById("confetti");
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ["#5f7a3a", "#a5bf70", "#c9a86a", "#e8d5a8", "#d98b5f", "#f2c14e"];
    const parts = [];
    for (let k = 0; k < 110; k++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 80,
        y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 9 - 4,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: pick(colors),
        leaf: Math.random() < 0.4
      });
    }
    const t0 = performance.now();
    cancelAnimationFrame(confettiRAF);
    (function frame(t) {
      const age = (t - t0) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, age - 1.8) / 1.2);
      parts.forEach(function (q) {
        q.vy += 0.22; q.vx *= 0.99; q.x += q.vx; q.y += q.vy; q.r += q.vr;
        ctx.save();
        ctx.translate(q.x, q.y); ctx.rotate(q.r);
        ctx.fillStyle = q.color;
        if (q.leaf) {
          ctx.beginPath(); ctx.ellipse(0, 0, q.w * 0.8, q.h * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
        }
        ctx.restore();
      });
      if (age < 3) confettiRAF = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ================= Theme ================= */

  function applyTheme() {
    const t = Store.setting("theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute("content", dark ? "#1b1e16" : "#f4ecdc");
      m.removeAttribute("media");
    });
  }

  document.getElementById("themeBtn").addEventListener("click", function () {
    const t = Store.setting("theme");
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    Store.setting("theme", dark ? "light" : "dark");
    applyTheme();
  });

  /* ================= Start ================= */

  applyTheme();
  window.addEventListener("hashchange", route);
  Store.loadPhotos().then(route);

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
