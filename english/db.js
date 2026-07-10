// db.js — 浏览器端 SQLite 封装（sql.js / WASM + IndexedDB 持久化）
// 提供：DB.init({key, build})、DB.all / DB.run / DB.save，以及降级（无 WASM 时）标记 DB.ok
window.DB = (function () {
  const CDN = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/";
  const IDB_NAME = "mickey_study_db";
  const STORE = "sqlite_files";
  let SQL = null, db = null, key = "db", ok = false;

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res;
      s.onerror = () => rej(new Error("无法加载 " + src));
      document.head.appendChild(s);
    });
  }

  function idbReq(k, write, val) {
    return new Promise((res, rej) => {
      const r = indexedDB.open(IDB_NAME, 1);
      r.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE);
      r.onsuccess = () => {
        const idb = r.result;
        const tx = idb.transaction(STORE, write ? "readwrite" : "readonly").objectStore(STORE);
        const op = write ? tx.put(val, k) : tx.get(k);
        op.onsuccess = () => res(write ? undefined : op.result);
        op.onerror = () => rej(op.error);
      };
      r.onerror = () => rej(r.error);
    });
  }
  const idbGet = (k) => idbReq(k, false);
  const idbPut = (k, v) => idbReq(k, true, v);

  async function init(opts) {
    key = opts.key || "db";
    try {
      if (!window.initSqlJs) await loadScript(CDN + "sql-wasm.js");
      if (!SQL) SQL = await window.initSqlJs({ locateFile: (f) => CDN + f });
      const cached = await idbGet(key);
      if (cached) {
        db = new SQL.Database(cached);
      } else {
        db = new SQL.Database();
        opts.build(db);
        await idbPut(key, db.export());
      }
      ok = true;
    } catch (e) {
      console.warn("SQLite 不可用，进入无持久化降级模式：", e);
      ok = false; db = null;
    }
    return ok;
  }

  // 参数化查询，返回对象数组
  function all(sql, params) {
    if (!db) return [];
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    const cols = stmt.getColumnNames();
    const rows = [];
    while (stmt.step()) {
      const r = stmt.get();
      const o = {};
      cols.forEach((c, i) => (o[c] = r[i]));
      rows.push(o);
    }
    stmt.free();
    return rows;
  }

  function run(sql, params) {
    if (!db) return;
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    stmt.step();
    stmt.free();
  }

  function save() {
    if (!db) return;
    try { idbPut(key, db.export()); } catch (e) { /* 忽略写入错误 */ }
  }

  return { init, all, run, save, get ok() { return ok; } };
})();
