// 英语板块逻辑：浏览器端 SQLite + 单词卡 + 句型 + 听力测验 + 学习进度本地持久化
(function () {
  const LS_KEY = "mickey_english_progress_v1";
  let progress = {};          // key -> {learned, fav}
  let curTab = "word";
  let curCat = "all";
  // 测验
  let pool = [], qItem = null, qTotal = 0, qRight = 0, qScore = 0, qBest = 0, qMode = "listen";

  const $ = (id) => document.getElementById(id);
  const listEl = $("list");

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function speak(text, lang) {
    if (!("speechSynthesis" in window)) { alert("当前浏览器不支持发音，请换 Safari 或 Chrome 试试～"); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "en-US"; u.rate = 0.9; u.pitch = 1;
    speechSynthesis.speak(u);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ===== 进度持久化 =====
  function loadProgress() {
    if (DB.ok) {
      DB.all("SELECT key,learned,fav FROM progress").forEach((r) => { progress[r.key] = { learned: r.learned ? 1 : 0, fav: r.fav ? 1 : 0 }; });
    } else {
      try { progress = JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch (e) { progress = {}; }
    }
  }
  function saveProgress(key, field, val) {
    progress[key] = progress[key] || { learned: 0, fav: 0 };
    progress[key][field] = val;
    if (DB.ok) {
      DB.run("INSERT INTO progress(key,learned,fav) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET learned=excluded.learned, fav=excluded.fav",
        [key, progress[key].learned, progress[key].fav]);
      DB.save();
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(progress));
    }
  }
  function getBest(mode) {
    if (DB.ok) { const r = DB.all("SELECT best FROM quiz WHERE key=?", ["best_" + mode]); return r.length ? r[0].best : 0; }
    try { return parseInt(localStorage.getItem("eng_best_" + mode) || "0", 10); } catch (e) { return 0; }
  }
  function setBest(mode, val) {
    if (DB.ok) { DB.run("INSERT INTO quiz(key,best) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET best=excluded.best", ["best_" + mode, val]); DB.save(); }
    else localStorage.setItem("eng_best_" + mode, String(val));
  }

  // ===== 数据获取 =====
  function getWords(q, grade, cat) {
    if (DB.ok) {
      const conds = [], params = [];
      if (q) { const lk = "%" + q + "%"; conds.push("(word LIKE ? OR zh LIKE ?)"); params.push(lk, lk); }
      if (grade && grade !== "all") { conds.push("grade <= ?"); params.push(grade); }
      if (cat && cat !== "all") { conds.push("cat = ?"); params.push(cat); }
      const sql = "SELECT * FROM vocab" + (conds.length ? " WHERE " + conds.join(" AND ") : "") + " ORDER BY grade, id";
      return DB.all(sql, params);
    }
    return window.VOCAB.filter((v) => {
      const mq = !q || v.w.toLowerCase().includes(q.toLowerCase()) || v.zh.includes(q);
      const mg = !grade || grade === "all" || v.g <= parseInt(grade, 10);
      const mc = !cat || cat === "all" || v.cat === cat;
      return mq && mg && mc;
    }).map((v, i) => ({ id: i, word: v.w, ph: v.ph, zh: v.zh, cat: v.cat, grade: v.g, ex: v.ex }));
  }
  function getPhrases(q, cat) {
    if (DB.ok) {
      const conds = [], params = [];
      if (q) { const lk = "%" + q + "%"; conds.push("(en LIKE ? OR zh LIKE ?)"); params.push(lk, lk); }
      if (cat && cat !== "all") { conds.push("cat = ?"); params.push(cat); }
      const sql = "SELECT * FROM phrases" + (conds.length ? " WHERE " + conds.join(" AND ") : "") + " ORDER BY id";
      return DB.all(sql, params);
    }
    return window.PHRASES.filter((p) => {
      const mq = !q || p.en.toLowerCase().includes(q.toLowerCase()) || p.zh.includes(q);
      const mc = !cat || cat === "all" || p.cat === cat;
      return mq && mc;
    }).map((p, i) => ({ id: i, en: p.en, zh: p.zh, g: p.g, cat: p.cat }));
  }

  // ===== 渲染 =====
  function pState(key) { return progress[key] || { learned: 0, fav: 0 }; }

  function renderWords() {
    const q = $("wordSearch").value.trim();
    const g = $("wordGrade").value;
    const rows = getWords(q, g, curCat);
    listEl.innerHTML = "";
    $("empty").style.display = rows.length ? "none" : "block";
    rows.forEach((v) => {
      const key = "word:" + v.word;
      const st = pState(key);
      const d = document.createElement("div");
      d.className = "card wcard";
      d.innerHTML = `
        <div class="w-en">${escapeHtml(v.word)}</div>
        <div class="w-ph">${escapeHtml(v.ph || "")}</div>
        <div class="w-zh">${escapeHtml(v.zh)}</div>
        <div class="w-cat">${escapeHtml(v.cat)} · ${v.grade}年级</div>
        <div class="w-ex">📝 ${escapeHtml(v.ex || "")}</div>
        <div class="actions">
          <button class="act" data-act="speak">🔊</button>
          <button class="act ${st.learned ? "on" : ""}" data-act="learned">✅ 已掌握</button>
          <button class="act ${st.fav ? "on" : ""}" data-act="fav">⭐</button>
        </div>`;
      d.querySelector('[data-act="speak"]').onclick = () => speak(v.word, "en-US");
      d.querySelector('[data-act="learned"]').onclick = (e) => { const on = !pState(key).learned; saveProgress(key, "learned", on ? 1 : 0); e.target.classList.toggle("on", on); renderStats(); };
      d.querySelector('[data-act="fav"]').onclick = (e) => { const on = !pState(key).fav; saveProgress(key, "fav", on ? 1 : 0); e.target.classList.toggle("on", on); renderStats(); };
      listEl.appendChild(d);
    });
  }

  function renderPhrases() {
    const q = $("phraseSearch").value.trim();
    const c = $("phraseCat").value;
    const rows = getPhrases(q, c);
    listEl.innerHTML = "";
    $("empty").style.display = rows.length ? "none" : "block";
    rows.forEach((p) => {
      const d = document.createElement("div");
      d.className = "card pcard";
      d.innerHTML = `
        <div class="p-en">${escapeHtml(p.en)}</div>
        <div class="p-zh">${escapeHtml(p.zh)}</div>
        <div class="actions"><button class="act" data-act="speak" style="flex:0 0 auto;padding:8px 14px;border-radius:12px;border:1px solid var(--border);background:var(--panel-strong);color:var(--text);cursor:pointer">🔊 朗读</button></div>`;
      d.querySelector('[data-act="speak"]').onclick = () => speak(p.en, "en-US");
      listEl.appendChild(d);
    });
  }

  function renderStats() {
    const totalWords = DB.ok ? DB.all("SELECT COUNT(*) c FROM vocab")[0].c : window.VOCAB.length;
    const totalPhrases = DB.ok ? DB.all("SELECT COUNT(*) c FROM phrases")[0].c : window.PHRASES.length;
    let lw = 0, fav = 0;
    for (const k in progress) {
      if (progress[k].learned && k.indexOf("word:") === 0) lw++;
      if (progress[k].fav) fav++;
    }
    $("stats").innerHTML = `
      <div class="stat"><b>${totalWords}</b><span>单词（个）</span></div>
      <div class="stat"><b>${lw}</b><span>已掌握单词</span></div>
      <div class="stat"><b>${totalPhrases}</b><span>常用句型</span></div>
      <div class="stat"><b>${fav}</b><span>⭐ 收藏</span></div>`;
  }

  // ===== 测验 =====
  function startQuiz() {
    qMode = $("quizMode").value;
    qTotal = 0; qRight = 0; qScore = 0; qBest = getBest(qMode);
    $("qBest").textContent = qBest;
    pool = DB.ok ? DB.all("SELECT word,zh,ph FROM vocab").map((r) => ({ w: r.word, zh: r.zh, ph: r.ph }))
                 : window.VOCAB.map((v) => ({ w: v.w, zh: v.zh, ph: v.ph }));
    nextQuiz();
  }
  function nextQuiz() {
    if (!pool.length) return;
    qItem = pool[Math.floor(Math.random() * pool.length)];
    const opts = [qItem];
    while (opts.length < 4) { const c = pool[Math.floor(Math.random() * pool.length)]; if (c !== qItem && !opts.includes(c)) opts.push(c); }
    shuffle(opts);
    const showWord = qMode === "see";
    $("qWord").textContent = showWord ? qItem.w : "🔊";
    $("qPrompt").textContent = qMode === "spell" ? "听发音，选出正确拼写" : (showWord ? "看单词，选出意思" : "听发音，选出意思");
    if (qMode !== "see") speak(qItem.w, "en-US");
    const optsEl = $("qOpts");
    optsEl.innerHTML = "";
    opts.forEach((o) => {
      const b = document.createElement("button");
      b.textContent = qMode === "spell" ? o.w : o.zh;
      b.onclick = () => answer(o, b);
      optsEl.appendChild(b);
    });
  }
  function answer(o, btn) {
    if (btn.disabled) return;
    qTotal++;
    const correct = o === qItem;
    if (correct) { btn.classList.add("ok"); qRight++; qScore += 10; }
    else {
      btn.classList.add("no"); qScore = Math.max(0, qScore - 5);
      [...$("qOpts").children].forEach((x) => { if ((qMode === "spell" ? x.textContent === qItem.w : x.textContent === qItem.zh)) x.classList.add("ok"); });
    }
    [...$("qOpts").children].forEach((x) => (x.disabled = true));
    if (qScore > qBest) { qBest = qScore; setBest(qMode, qBest); $("qBest").textContent = qBest; }
    $("qScore").textContent = qScore; $("qRight").textContent = qRight; $("qTotal").textContent = qTotal;
  }

  // ===== 初始化 =====
  function buildCats() {
    const seen = [];
    window.VOCAB.forEach((v) => { if (!seen.includes(v.cat)) seen.push(v.cat); });
    const wrap = $("wordCats");
    wrap.innerHTML = "";
    const mk = (label, val) => {
      const b = document.createElement("button");
      b.className = "cat-chip" + (val === curCat ? " sel" : "");
      b.textContent = label;
      b.onclick = () => { curCat = val; wrap.querySelectorAll(".cat-chip").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); renderWords(); };
      wrap.appendChild(b);
    };
    mk("全部", "all"); seen.forEach((c) => mk(c, c));

    const pc = $("phraseCat");
    const pseen = [];
    window.PHRASES.forEach((p) => { if (!pseen.includes(p.cat)) pseen.push(p.cat); });
    pseen.forEach((c) => { const o = document.createElement("option"); o.value = c; o.textContent = c; pc.appendChild(o); });
  }

  function bind() {
    $("tabs").querySelectorAll(".tab").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll(".tab").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        curTab = b.dataset.t;
        $("toolWord").style.display = curTab === "word" ? "flex" : "none";
        $("toolPhrase").style.display = curTab === "phrase" ? "flex" : "none";
        $("toolQuiz").style.display = curTab === "quiz" ? "flex" : "none";
        $("quizPanel").style.display = curTab === "quiz" ? "block" : "none";
        if (curTab === "word") renderWords();
        else if (curTab === "phrase") renderPhrases();
        else startQuiz();
      };
    });
    $("wordSearch").oninput = renderWords;
    $("wordGrade").onchange = renderWords;
    $("phraseSearch").oninput = renderPhrases;
    $("phraseCat").onchange = renderPhrases;
    $("quizMode").onchange = startQuiz;
    $("quizRestart").onclick = startQuiz;
    $("qSpeak").onclick = () => qItem && speak(qItem.w, "en-US");
  }

  async function start() {
    bind();
    buildCats();
    await DB.init({
      key: "english_v1",
      build: (db) => {
        db.run("CREATE TABLE vocab(id INTEGER PRIMARY KEY, word TEXT, ph TEXT, zh TEXT, cat TEXT, grade INTEGER, ex TEXT);");
        db.run("CREATE TABLE phrases(id INTEGER PRIMARY KEY, en TEXT, zh TEXT, g INTEGER, cat TEXT);");
        db.run("CREATE TABLE progress(key TEXT PRIMARY KEY, learned INTEGER DEFAULT 0, fav INTEGER DEFAULT 0);");
        db.run("CREATE TABLE quiz(key TEXT PRIMARY KEY, best INTEGER DEFAULT 0);");
        const iv = db.prepare("INSERT INTO vocab(word,ph,zh,cat,grade,ex) VALUES(?,?,?,?,?,?)");
        window.VOCAB.forEach((v) => iv.run([v.w, v.ph, v.zh, v.cat, v.g, v.ex]));
        iv.free();
        const ip = db.prepare("INSERT INTO phrases(en,zh,g,cat) VALUES(?,?,?,?)");
        window.PHRASES.forEach((p) => ip.run([p.en, p.zh, p.g, p.cat]));
        ip.free();
      },
    });
    loadProgress();
    renderStats();
    renderWords();
    if (!DB.ok) console.info("提示：当前为降级模式，进度仅保存在本机 localStorage。");
  }

  start();
})();
