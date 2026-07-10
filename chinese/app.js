// 语文板块逻辑：浏览器端 SQLite + 拼音标注 + 朗读 + 学习进度本地持久化
(function () {
  let PINYIN = null;
  const _py = window.pinyinPro || window.pinyin;
  if (_py) PINYIN = (typeof _py === "function") ? { pinyin: _py } : _py;
  const LS_KEY = "mickey_chinese_progress_v1";
  let progress = {};   // key -> {learned:0/1, fav:0/1}
  let curTab = "poem";

  const $ = (id) => document.getElementById(id);
  const listEl = $("list");

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function pyOf(ch) {
    if (!PINYIN) return "";
    try { return PINYIN.pinyin(ch, { toneType: "symbol", type: "string" }).trim(); }
    catch (e) { return ""; }
  }
  function rubyLine(line) {
    let html = "";
    for (const ch of line) {
      if (PINYIN && /[一-鿿]/.test(ch)) {
        html += `<ruby>${escapeHtml(ch)}<rt>${pyOf(ch) || " "}</rt></ruby>`;
      } else {
        html += `<span>${escapeHtml(ch)}</span>`;
      }
    }
    return html;
  }
  function rubricWord(word) {
    let html = "";
    for (const ch of word) {
      if (PINYIN && /[一-鿿]/.test(ch)) html += `<ruby>${escapeHtml(ch)}<rt>${pyOf(ch) || " "}</rt></ruby>`;
      else html += escapeHtml(ch);
    }
    return html;
  }

  function speak(text, lang) {
    if (!("speechSynthesis" in window)) { alert("当前浏览器不支持发音，请换 Safari 或 Chrome 试试～"); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "zh-CN"; u.rate = 0.85; u.pitch = 1;
    speechSynthesis.speak(u);
  }

  // ===== 进度持久化 =====
  function loadProgress() {
    if (DB.ok) {
      DB.all("SELECT key,learned,fav FROM progress").forEach((r) => {
        progress[r.key] = { learned: r.learned ? 1 : 0, fav: r.fav ? 1 : 0 };
      });
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

  // ===== 数据获取（优先走 SQLite） =====
  function normalizePoem(r) {
    return { id: r.id, title: r.title, author: r.author, dynasty: r.dynasty, grade: r.grade,
      lines: typeof r.lines === "string" ? JSON.parse(r.lines) : r.lines, yi: r.yi };
  }
  function getPoems(q, grade) {
    if (DB.ok) {
      const conds = [], params = [];
      if (q) { const lk = "%" + q + "%"; conds.push("(title LIKE ? OR author LIKE ? OR yi LIKE ?)"); params.push(lk, lk, lk); }
      if (grade && grade !== "all") { conds.push("grade=?"); params.push(grade); }
      const sql = "SELECT * FROM poems" + (conds.length ? " WHERE " + conds.join(" AND ") : "") + " ORDER BY grade, id";
      return DB.all(sql, params).map(normalizePoem);
    }
    return window.POEMS.filter((p) => {
      const mq = !q || p.t.includes(q) || p.a.includes(q) || (p.yi || "").includes(q);
      const mg = !grade || grade === "all" || String(p.g) === String(grade);
      return mq && mg;
    }).map((p, i) => ({ id: i, title: p.t, author: p.a, dynasty: p.d, grade: p.g, lines: p.lines, yi: p.yi }));
  }
  function getIdioms(q) {
    if (DB.ok) {
      const conds = [], params = [];
      if (q) { const lk = "%" + q + "%"; conds.push("(word LIKE ? OR yi LIKE ? OR li LIKE ?)"); params.push(lk, lk, lk); }
      const sql = "SELECT * FROM idioms" + (conds.length ? " WHERE " + conds.join(" AND ") : "") + " ORDER BY id";
      return DB.all(sql, params);
    }
    return window.IDIOMS.filter((c) => {
      if (!q) return true;
      return c.w.includes(q) || (c.yi || "").includes(q) || (c.li || "").includes(q);
    }).map((c, i) => ({ id: i, word: c.w, yi: c.yi, src: c.src, li: c.li }));
  }

  // ===== 渲染 =====
  function pState(key) { return progress[key] || { learned: 0, fav: 0 }; }

  function renderPoems() {
    const q = $("poemSearch").value.trim();
    const g = $("poemGrade").value;
    const rows = getPoems(q, g);
    listEl.innerHTML = "";
    $("empty").style.display = rows.length ? "none" : "block";
    rows.forEach((p) => {
      const key = "poem:" + p.title;
      const st = pState(key);
      const d = document.createElement("div");
      d.className = "card poem";
      d.innerHTML = `
        <h3>${escapeHtml(p.title)}<span class="badge-grade">${p.grade}年级</span></h3>
        <div class="author">〔${escapeHtml(p.dynasty)}〕${escapeHtml(p.author)}</div>
        <div class="lines">${p.lines.map((l) => "<div>" + rubyLine(l) + "</div>").join("")}</div>
        <div class="mean">📖 ${escapeHtml(p.yi || "")}</div>
        <div class="actions">
          <button class="act" data-act="speak">🔊 朗读</button>
          <button class="act ${st.learned ? "on" : ""}" data-act="learned">✅ 已学会</button>
          <button class="act ${st.fav ? "on" : ""}" data-act="fav">⭐ 收藏</button>
        </div>`;
      d.querySelector('[data-act="speak"]').onclick = () => speak(p.lines.join("").replace(/[，。、？！；：]/g, " "), "zh-CN");
      d.querySelector('[data-act="learned"]').onclick = (e) => {
        const on = !pState(key).learned; saveProgress(key, "learned", on ? 1 : 0); e.target.classList.toggle("on", on); renderStats();
      };
      d.querySelector('[data-act="fav"]').onclick = (e) => {
        const on = !pState(key).fav; saveProgress(key, "fav", on ? 1 : 0); e.target.classList.toggle("on", on); renderStats();
      };
      listEl.appendChild(d);
    });
  }

  function renderIdioms() {
    const q = $("idiomSearch").value.trim();
    const rows = getIdioms(q);
    listEl.innerHTML = "";
    $("empty").style.display = rows.length ? "none" : "block";
    rows.forEach((c) => {
      const key = "idiom:" + c.word;
      const st = pState(key);
      const d = document.createElement("div");
      d.className = "card idiom-card";
      d.innerHTML = `
        <div class="idiom-word">${rubricWord(c.word)}</div>
        <div class="src">${escapeHtml(c.src || "—")}</div>
        <p>释义：${escapeHtml(c.yi || "")}</p>
        <p class="muted">例句：${escapeHtml(c.li || "")}</p>
        <div class="actions">
          <button class="act" data-act="speak">🔊 朗读</button>
          <button class="act ${st.learned ? "on" : ""}" data-act="learned">✅ 已学会</button>
          <button class="act ${st.fav ? "on" : ""}" data-act="fav">⭐ 收藏</button>
        </div>`;
      d.querySelector('[data-act="speak"]').onclick = () => speak(c.word, "zh-CN");
      d.querySelector('[data-act="learned"]').onclick = (e) => {
        const on = !pState(key).learned; saveProgress(key, "learned", on ? 1 : 0); e.target.classList.toggle("on", on); renderStats();
      };
      d.querySelector('[data-act="fav"]').onclick = (e) => {
        const on = !pState(key).fav; saveProgress(key, "fav", on ? 1 : 0); e.target.classList.toggle("on", on); renderStats();
      };
      listEl.appendChild(d);
    });
  }

  function renderStats() {
    const totalPoems = DB.ok ? DB.all("SELECT COUNT(*) c FROM poems")[0].c : window.POEMS.length;
    const totalIdioms = DB.ok ? DB.all("SELECT COUNT(*) c FROM idioms")[0].c : window.IDIOMS.length;
    let lp = 0, li = 0, fav = 0;
    for (const k in progress) {
      if (progress[k].fav) fav++;
      if (progress[k].learned) { k.indexOf("poem:") === 0 ? lp++ : li++; }
    }
    $("stats").innerHTML = `
      <div class="stat"><b>${totalPoems}</b><span>古诗词（首）</span></div>
      <div class="stat"><b>${lp}</b><span>已学会古诗</span></div>
      <div class="stat"><b>${totalIdioms}</b><span>成语（条）</span></div>
      <div class="stat"><b>${li}</b><span>已学会成语</span></div>
      <div class="stat"><b>${fav}</b><span>⭐ 收藏</span></div>`;
  }

  function render() { curTab === "poem" ? renderPoems() : renderIdioms(); }

  // ===== 初始化 =====
  function bind() {
    $("tabs").querySelectorAll(".tab").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll(".tab").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        curTab = b.dataset.t;
        $("toolPoem").style.display = curTab === "poem" ? "flex" : "none";
        $("toolIdiom").style.display = curTab === "idiom" ? "flex" : "none";
        render();
      };
    });
    $("poemSearch").oninput = renderPoems;
    $("poemGrade").onchange = renderPoems;
    $("idiomSearch").oninput = renderIdioms;
  }

  async function start() {
    bind();
    await DB.init({
      key: "chinese_v1",
      build: (db) => {
        db.run("CREATE TABLE poems(id INTEGER PRIMARY KEY, title TEXT, author TEXT, dynasty TEXT, grade INTEGER, lines TEXT, yi TEXT);");
        db.run("CREATE TABLE idioms(id INTEGER PRIMARY KEY, word TEXT, yi TEXT, src TEXT, li TEXT);");
        db.run("CREATE TABLE progress(key TEXT PRIMARY KEY, learned INTEGER DEFAULT 0, fav INTEGER DEFAULT 0);");
        const ip = db.prepare("INSERT INTO poems(title,author,dynasty,grade,lines,yi) VALUES(?,?,?,?,?,?)");
        window.POEMS.forEach((p) => ip.run([p.t, p.a, p.d, p.g, JSON.stringify(p.lines), p.yi]));
        ip.free();
        const ii = db.prepare("INSERT INTO idioms(word,yi,src,li) VALUES(?,?,?,?)");
        window.IDIOMS.forEach((c) => ii.run([c.w, c.yi, c.src || "", c.li]));
        ii.free();
      },
    });
    loadProgress();
    renderStats();
    render();
    if (!DB.ok) console.info("提示：当前为降级模式，进度仅保存在本机 localStorage，刷新后仍在，但换设备不共享。");
  }

  start();
})();
