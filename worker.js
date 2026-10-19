/* MovieBox — complete Cloudflare Worker: API + mobile UI in one file.
 * Paste the ENTIRE file into dash.cloudflare.com > Workers & Pages > your worker > Edit code > Deploy.
 */

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>MovieBox API</title>
<style>
:root{
  --bg:#000; --surface:#161616; --surface2:#1f1f1f;
  --text:#fff; --dim:#9a9a9a; --line:#262626;
  --yellow:#f5c518; --green:#4caf50; --hint:#7ee787;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:640px;margin:0 auto;min-height:100vh}
.view{display:none;min-height:100vh}
.view.active{display:block}
/* ---------- search view ---------- */
.hd{position:sticky;top:0;background:rgba(0,0,0,.96);padding:12px 16px;z-index:10;border-bottom:1px solid var(--line)}
.hd h1{font-size:18px;font-weight:700}
.hd h1 .thin{color:#888;font-weight:400}
.hd .pill{font-size:10px;background:#1c1c1c;border:1px solid var(--line);border-radius:20px;padding:2px 8px;color:var(--dim);vertical-align:middle;margin-left:6px;font-weight:400}
.hd .on{color:var(--green);border-color:rgba(76,175,80,.45)}
.sbar{display:flex;gap:8px;padding:12px 16px}
.sbox{flex:1;display:flex;align-items:center;background:var(--surface2);border-radius:24px;padding:0 6px 0 14px}
.sbox input{flex:1;background:none;border:none;outline:none;color:var(--text);font-size:15px;padding:12px 8px;min-width:0}
.sbox input::placeholder{color:#666}
.sbtn{background:#fff;color:#000;border:none;border-radius:24px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer}
.tabs{display:flex;gap:20px;padding:2px 16px 0;border-bottom:1px solid var(--line);overflow-x:auto}
.tab{background:none;border:none;color:var(--dim);font-size:15px;padding:10px 2px;white-space:nowrap;cursor:pointer}
.tab.sel{color:var(--text);font-weight:700;border-bottom:2px solid #fff}
.sec{padding:14px 16px 4px;font-size:12px;color:var(--dim);text-transform:uppercase;letter-spacing:.6px}
/* rectangular detail tiles */
.tile{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #141414;cursor:pointer}
.tile:active{background:#0d0d0d}
.poster{position:relative;flex:none;width:58px;height:86px;border-radius:6px;overflow:hidden;background:#222}
.poster img{width:100%;height:100%;object-fit:cover;display:block}
.badge{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.78);color:var(--hint);font-size:10px;text-align:center;padding:2px 0}
.tinfo{flex:1;min-width:0}
.tt{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tt .hindi{color:var(--hint);font-weight:400;font-size:13px}
.tmeta{display:flex;align-items:center;gap:6px;margin-top:7px;font-size:12.5px;color:var(--dim);flex-wrap:wrap}
.tmeta .star{color:var(--yellow);font-weight:700}
.tmeta .sep{color:#4a4a4a}
.playbtn{flex:none;width:44px;height:44px;border-radius:50%;background:#2c2c2c;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer}
.playbtn:active{background:#3d3d3d}
.empty{padding:26px 16px;color:var(--dim);font-size:14px;text-align:center}
/* endpoints hidden under a button */
.apibtn{display:block;width:calc(100% - 32px);margin:20px 16px 24px;background:var(--surface2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:13px;font-size:14px;font-weight:600;cursor:pointer}
#apiPanel{display:none;padding:0 16px 28px}
#apiPanel.open{display:block}
.eptable{width:100%;border-collapse:collapse;font-size:12px}
.eptable td{padding:9px 6px;border-bottom:1px solid var(--line);vertical-align:top}
.eptable .p{font-family:monospace;color:var(--hint);word-break:break-all}
.tbtn{display:inline-block;background:#2c2c2c;color:#fff;text-decoration:none;border-radius:6px;padding:5px 12px;font-size:12px}
/* ---------- watch view (separate screen) ---------- */
.whd{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(0,0,0,.96);z-index:10}
.back{background:none;border:none;padding:6px;cursor:pointer;display:flex}
.wt{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.player{background:#000;aspect-ratio:16/9;width:100%}
.player video{width:100%;height:100%;display:block;background:#000}
.wmeta{padding:14px 16px 6px}
.wmeta .t{font-size:17px;font-weight:700}
.wmeta .m{margin-top:7px;font-size:13px;color:var(--dim)}
.wmeta .m .star{color:var(--yellow);font-weight:700}
.wmeta .m .sep{color:#4a4a4a}
.selrow{display:none;gap:10px;padding:10px 16px 12px}
.selrow.show{display:flex}
.selrow select{flex:1;background:var(--surface2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:11px;font-size:14px}
.qrow{display:flex;gap:8px;padding:0 16px 12px;flex-wrap:wrap}
.qbtn{background:var(--surface2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:9px 15px;font-size:13px;cursor:pointer}
.qbtn.sel{background:#fff;color:#000;font-weight:700;border-color:#fff}
.wstatus{padding:0 16px 20px;font-size:12.5px;color:var(--dim)}
.spin{width:28px;height:28px;border:3px solid #333;border-top-color:#fff;border-radius:50%;margin:30px auto;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.err{padding:40px 20px;text-align:center;color:var(--dim);font-size:14px}
</style>
</head>
<body>

<!-- ================= SEARCH SCREEN ================= -->
<div id="vSearch" class="view active">
  <div class="hd"><h1>MovieBox <span class="thin">API</span><span class="pill">v2.5.0</span><span class="pill on">&#9679; Online</span></h1></div>
  <div class="sbar">
    <div class="sbox">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input id="q" placeholder="Search movies &amp; shows..." autocomplete="off" enterkeyhint="search">
    </div>
    <button class="sbtn" id="goBtn">Go</button>
  </div>
  <div class="tabs" id="tabs">
    <button class="tab sel" data-t="all">All</button>
    <button class="tab" data-t="Movie">Movies</button>
    <button class="tab" data-t="Series">TV Series</button>
  </div>
  <div id="resHindi"></div>
  <div id="resOrig"></div>
  <div id="resEmpty"></div>
  <button class="apibtn" id="apiBtn">&#9656; Developer API Endpoints</button>
  <div id="apiPanel"></div>
</div>

<!-- ================= WATCH SCREEN (separate) ================= -->
<div id="vWatch" class="view">
  <div class="whd">
    <button class="back" id="backBtn" aria-label="Back">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div class="wt" id="wTitle">--</div>
  </div>
  <div class="player"><video id="v" controls playsinline preload="metadata"></video></div>
  <div class="wmeta">
    <div class="t" id="wName"></div>
    <div class="m" id="wMeta"></div>
  </div>
  <div class="selrow" id="selRow">
    <select id="sSeason" aria-label="Season"></select>
    <select id="sEp" aria-label="Episode"></select>
  </div>
  <div class="qrow" id="qRow"></div>
  <div class="wstatus" id="wStatus"></div>
</div>

<script>
"use strict";
const API = ""; /* same-origin backend */
let tab = "all";
let cache = [];
let cur = { hindi: [], orig: [] };
let W = { id: "", type: "Movie", title: "", seasons: [], streams: [] };
const $ = id => document.getElementById(id);
const esc = s => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------- separate watch screen (hash routing) ---------- */
function show(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $("v" + name).classList.add("active");
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => {
  if (location.hash === "#/watch") show("Watch"); else show("Search");
});
$("backBtn").onclick = () => { if (history.length > 1) history.back(); else location.hash = "#/"; };
if (location.hash === "#/watch") show("Watch");

/* ---------- search ---------- */
$("goBtn").onclick = doSearch;
$("q").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
document.querySelectorAll("#tabs .tab").forEach(t => t.onclick = () => {
  document.querySelectorAll("#tabs .tab").forEach(x => x.classList.remove("sel"));
  t.classList.add("sel");
  tab = t.dataset.t;
  render();
});

async function doSearch() {
  const q = $("q").value.trim();
  if (!q) return;
  $("resHindi").innerHTML = $("resOrig").innerHTML = "";
  $("resEmpty").innerHTML = '<div class="spin"></div>';
  try {
    const [r1, r2] = await Promise.all([
      fetch(API + "/search?q=" + encodeURIComponent(q) + "&per_page=20").then(r => r.json()),
      fetch(API + "/search?q=" + encodeURIComponent(q + " hindi") + "&per_page=20").then(r => r.json())
    ]);
    const seen = new Set(), hindi = [], orig = [];
    for (const r of (r1.results || []).concat(r2.results || [])) {
      if (!r.subject_id || r.subject_id === "None" || seen.has(r.subject_id)) continue;
      seen.add(r.subject_id);
      (/hindi/i.test(r.title || "") ? hindi : orig).push(r);
    }
    cur = { hindi, orig };
    render();
  } catch (e) {
    $("resEmpty").innerHTML = '<div class="err">Search failed. Check connection and try again.</div>';
  }
}

function passTab(r) { return tab === "all" || r.type === tab; }

function tile(r, i) {
  const isH = /hindi/i.test(r.title || "");
  const yr = (r.release_date || "").slice(0, 4);
  const parts = [
    '<span><span class="star">&#9733;</span> ' + (r.imdb_rating || "--") + '</span>',
    esc(yr), esc(r.country || ""), esc(r.genre || "")
  ].filter(p => p.replace(/<[^>]*>/g, "").trim() !== "");
  return '<div class="tile" onclick="openTile(' + i + ')">' +
    '<div class="poster">' +
      (r.cover ? '<img src="' + r.cover + '" loading="lazy" alt="">' : "") +
      (isH ? '<div class="badge">Hindi</div>' : "") +
    '</div>' +
    '<div class="tinfo">' +
      '<div class="tt">' + esc(r.title) + (isH ? ' <span class="hindi">[Hindi]</span>' : "") + '</div>' +
      '<div class="tmeta">' + parts.join(' <span class="sep">|</span> ') + '</div>' +
    '</div>' +
    '<button class="playbtn" aria-label="Play"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></button>' +
  '</div>';
}

function render() {
  cache = [];
  const H = cur.hindi.filter(passTab), O = cur.orig.filter(passTab);
  const tiles = list => list.map(r => { cache.push(r); return tile(r, cache.length - 1); }).join("");
  $("resHindi").innerHTML = H.length ? '<div class="sec">Hindi Dubbed</div>' + tiles(H) : "";
  $("resOrig").innerHTML = O.length ? '<div class="sec">Original</div>' + tiles(O) : "";
  $("resEmpty").innerHTML = (!H.length && !O.length) ? '<div class="empty">No results. Try another title.</div>' : "";
}

/* ---------- watch screen ---------- */
async function openTile(i) {
  const r = cache[i];
  if (!r) return;
  W = { id: r.subject_id, type: r.type || "Movie", title: r.title, seasons: [], streams: [] };
  $("wTitle").textContent = r.title;
  $("wName").textContent = r.title;
  const yr = (r.release_date || "").slice(0, 4);
  $("wMeta").innerHTML = '<span class="star">&#9733;</span> ' + (r.imdb_rating || "--") +
    ' <span class="sep">|</span> ' + esc(yr) +
    ' <span class="sep">|</span> ' + esc(r.genre || "") +
    ' <span class="sep">|</span> ' + esc(r.type || "");
  $("selRow").classList.remove("show");
  $("qRow").innerHTML = "";
  setSt("");
  location.hash = "#/watch";
  const v = $("v");
  v.pause(); v.removeAttribute("src"); v.load();
  if (W.type === "Series") {
    setSt("Loading seasons...");
    try {
      const d = await fetch(API + "/episodes/" + W.id).then(x => x.json());
      W.seasons = d.seasons || [];
    } catch (e) { W.seasons = []; }
    if (W.seasons.length) {
      $("sSeason").innerHTML = W.seasons.map((s, ix) =>
        '<option value="' + ix + '">Season ' + s.season + '</option>').join("");
      fillEp(0);
      $("selRow").classList.add("show");
    }
  }
  playEp(0, 0);
}

function fillEp(si) {
  const s = W.seasons[si] || { episode_count: 1 };
  let o = "";
  for (let e = 1; e <= (s.episode_count || 1); e++) o += '<option value="' + (e - 1) + '">Episode ' + e + '</option>';
  $("sEp").innerHTML = o;
}
$("sSeason").onchange = () => { const si = +($("sSeason").value || 0); fillEp(si); playEp(si, 0); };
$("sEp").onchange = () => playEp(+($("sSeason").value || 0), +($("sEp").value || 0));

async function playEp(si, ei) {
  const isS = W.type === "Series";
  const s = W.seasons[si] || {};
  const se = isS ? (s.season || si + 1) : 0;
  const ep = isS ? (ei + 1) : 0;
  const label = isS ? ("S" + se + " E" + ep) : "";
  setSt(isS ? ("Loading " + label + "...") : "Loading...");
  try {
    const d = await fetch(API + "/stream/" + W.id + "?se=" + se + "&ep=" + ep).then(x => x.json());
    const mp4 = (d.streams || []).filter(x => (x.format || "").toUpperCase() === "MP4");
    if (!mp4.length) { setSt("No playable streams found."); return; }
    W.streams = mp4;
    renderQ(-1);
    loadStream(0, label);
  } catch (e) { setSt("Failed to load streams."); }
}

function renderQ(sel) {
  $("qRow").innerHTML = W.streams.map((s, i) =>
    '<button class="qbtn' + (i === sel ? " sel" : "") + '" onclick="loadStream(' + i + ')">' + esc(s.quality) + '</button>').join("");
}

function loadStream(i, label) {
  const st = W.streams[i];
  if (!st) return;
  renderQ(i);
  const h = st.headers || {};
  const qs = "url=" + encodeURIComponent(st.url) +
    "&referer=" + encodeURIComponent(h.Referer || h.referer || "") +
    "&ua=" + encodeURIComponent(h["User-Agent"] || "");
  const v = $("v");
  v.src = API + "/proxy?" + qs;
  const tag = (label ? label + " \\u2022 " : "") + st.quality + " " + st.format + " \\u2022 " + (st.size_mb || "?") + " MB";
  setSt(tag + " \\u2014 tap play");
  v.play().then(() => setSt(tag + " \\u2014 playing")).catch(() => {});
}

function setSt(t) { $("wStatus").textContent = t; }

/* ---------- endpoints under a button ---------- */
const EPS = [
  ["/search?q=Avatar", "Search catalog"],
  ["/search/suggest?q=Avatar", "Search suggestions"],
  ["/detail/8906247916759695608", "Title details + metadata"],
  ["/episodes/6207982430134357800", "Seasons & episode counts"],
  ["/stream/8906247916759695608", "Movie streams"],
  ["/stream/6207982430134357800?se=1&ep=1", "Series episode streams"],
  ["/stream/8906247916759695608/captions", "Subtitles"],
  ["/home", "Home feed"],
  ["/movies", "Movies list"],
  ["/tv-series", "TV series list"]
];
$("apiBtn").onclick = () => {
  const p = $("apiPanel"), open = p.classList.toggle("open");
  $("apiBtn").innerHTML = (open ? "&#9662;" : "&#9656;") + " Developer API Endpoints";
  if (open && !p.dataset.done) {
    p.dataset.done = "1";
    p.innerHTML = '<table class="eptable">' + EPS.map(([u, d]) =>
      '<tr><td class="p">' + esc(u) + '</td><td style="color:var(--dim)">' + esc(d) +
      '</td><td style="text-align:right;white-space:nowrap"><a class="tbtn" href="' + u + '" target="_blank">Test</a></td></tr>'
    ).join("") + '</table>' +
    '<div style="margin-top:12px"><a class="tbtn" href="/docs" target="_blank">Swagger Docs</a></div>';
  }
};
</script>
</body>
</html>
`;

const DOCS_HTML = `<!DOCTYPE html><html><head><meta name=viewport content='width=device-width,initial-scale=1'>
<title>MovieBox API docs</title><style>body{background:#000;color:#fff;font-family:sans-serif;max-width:640px;margin:0 auto;padding:16px}a{color:#7ee787}</style></head><body>
<h1>MovieBox API <small style=color:#888>v1.0.0-worker</small></h1>
<p>Metadata API (Cloudflare Worker). Try:</p><ul>
<li><a href='/health'>/health</a> - token + region check</li>
<li><a href='/search?q=Avatar'>/search?q=Avatar</a></li>
<li><a href='/search/suggest?q=Avatar'>/search/suggest?q=Avatar</a></li>
<li><a href='/detail/8906247916759695608'>/detail/{id}</a></li>
<li><a href='/episodes/6207982430134357800'>/episodes/{id}</a></li>
<li><a href='/stream/8906247916759695608'>/stream/{id}</a> (+ ?se=1&ep=1 for series)</li>
<li><a href='/stream/8906247916759695608/captions'>/stream/{id}/captions</a></li>
<li><a href='/home'>/home</a> <a href='/movies'>/movies</a> <a href='/tv-series'>/tv-series</a></li>
</ul><p><a href='/'>Back to app</a></p></body></html>`;

/* MovieBox API — Cloudflare Worker (metadata only, no video relay).
 * Port of the FastAPI MovieBoxEngine: HMAC-signed requests to MovieBox's
 * own servers, same JSON shapes as the Python API.
 * Endpoints: / /health /search /search/suggest /detail/{id} /episodes/{id}
 *             /stream/{id} /stream/{id}/captions /home /movies /tv-series
 */

const SECRET_DEFAULT_B64 = "NzZpUmwwN3MweFNOOWpxbUVXQXQ3OUVCSlp1bElRSXNWNjRGWnIyTw==";
const SECRET_ALT_B64 = "WHFuMm5uTzQxL0w5Mm8xaXVYaFNMSFRiWHZZNFo1Wlo2Mm04bVNMQQ==";
const MODERN_UA = "com.community.mbox.in/50020130 (Linux; U; Android 14; en_IN; Pixel 8; Build/UD1A.230803.041; Cronet/145.0.7582.0)";
const WEB_UA = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36";
const API_BASE = "https://h5-api.aoneroom.com/wefeed-h5api-bff";
const NATIVE_BASE = "https://api3.aoneroom.com";
const BOOTSTRAP_URL = "https://apig.inmoviebox.com/wefeed-mobile-bff/tab/ranking-list?tabId=0&categoryType=4516404531735022304&page=1&perPage=1";
const WEB_DOMAINS = [
  "https://123moviesfree.club",
  "https://movie-box.co",
  "https://movieboxonline.net",
  "https://sflix.film",
  "https://h5-api.aoneroom.com",
  "https://netnaija.film",
  "https://movieboxhd.net",
];
const VERSION = "1.0.0-worker";

/* ---------------- MD5 (pure JS — SubtleCrypto has no MD5) ---------------- */
function md5Bytes(input) {
  const msg = input instanceof Uint8Array ? input : new TextEncoder().encode(input);
  const origLen = msg.length, bitLen = origLen * 8;
  const withOne = origLen + 1;
  const padLen = (withOne % 64 <= 56) ? (56 - (withOne % 64)) : (120 - (withOne % 64));
  const total = withOne + padLen + 8;
  const buf = new Uint8Array(total);
  buf.set(msg); buf[origLen] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 8, bitLen >>> 0, true);
  dv.setUint32(total - 4, Math.floor(bitLen / 4294967296), true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const K = []; for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const rl = (x, c) => (x << c) | (x >>> (32 - c));
  for (let off = 0; off < total; off += 64) {
    const M = [];
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rl(F, S[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const out = new Uint8Array(16), odv = new DataView(out.buffer);
  odv.setUint32(0, a0, true); odv.setUint32(4, b0, true);
  odv.setUint32(8, c0, true); odv.setUint32(12, d0, true);
  return out;
}
const md5Hex = d => [...md5Bytes(d)].map(b => b.toString(16).padStart(2, "0")).join("");
function hmacMd5(keyBytes, msgBytes) {
  const BS = 64;
  let k = keyBytes.length > BS ? md5Bytes(keyBytes) : keyBytes;
  const kp = new Uint8Array(BS); kp.set(k);
  const ipad = new Uint8Array(BS), opad = new Uint8Array(BS);
  for (let i = 0; i < BS; i++) { ipad[i] = kp[i] ^ 0x36; opad[i] = kp[i] ^ 0x5c; }
  const inner = new Uint8Array(BS + msgBytes.length);
  inner.set(ipad); inner.set(msgBytes, BS);
  const ih = md5Bytes(inner);
  const outer = new Uint8Array(BS + 16);
  outer.set(opad); outer.set(ih, BS);
  return md5Bytes(outer);
}
const b64enc = bytes => btoa(String.fromCharCode(...bytes));
function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function getSecretBytes(alt = false) {
  const inner = new TextDecoder().decode(b64urlDecode(alt ? SECRET_ALT_B64 : SECRET_DEFAULT_B64));
  return b64urlDecode(inner);
}

/* ---------------- signing ---------------- */
/* NOTE: generated lazily (not at module top level) — Workers forbid
   crypto.getRandomValues() in global scope (validation error 10021). */
let _DEVICE_ID = null;
function deviceId() {
  if (!_DEVICE_ID) _DEVICE_ID = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
  return _DEVICE_ID;
}
function clientInfo() {
  return JSON.stringify({
    package_name: "com.community.mbox.in", version_name: "4.0.03.0920.03",
    version_code: 50020130, os: "android", os_version: "14", device_id: deviceId(),
    install_store: "official", gaid: "1b2212c1-dadf-43c3-a0c8-bd6ce48ae22d",
    brand: "Google", model: "Pixel 8", system_language: "en", net: "NETWORK_WIFI",
    region: "IN", timezone: "Asia/Calcutta", sp_code: "",
  });
}
function buildCanonical(method, accept, contentType, url, body, ts) {
  const u = new URL(url);
  let cu = u.pathname || "/";
  if (u.search) {
    const pairs = [];
    for (const seg of u.search.slice(1).split("&")) {
      if (!seg) continue;
      const i = seg.indexOf("=");
      pairs.push(i === -1 ? [seg, ""] : [seg.slice(0, i), seg.slice(i + 1)]);
    }
    pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    cu += "?" + pairs.map(p => p[0] + "=" + p[1]).join("&");
  }
  let bl = "", bh = "";
  if (body) {
    const bb = new TextEncoder().encode(body);
    bl = String(bb.length);
    bh = md5Hex(bb.slice(0, 102400));
  }
  return [method.toUpperCase(), accept || "", contentType || "", bl, String(ts), bh, cu].join("\n");
}
function xTrSignature(method, accept, contentType, url, body, ts, alt = false) {
  const canon = buildCanonical(method, accept, contentType, url, body, ts);
  const digest = hmacMd5(getSecretBytes(alt), new TextEncoder().encode(canon));
  return ts + "|2|" + b64enc(digest);
}
function authHeaders(method, url, { body = null, token = null, contentType = "application/json", accept = "application/json" } = {}) {
  const ts = Date.now();
  const rev = String(ts).split("").reverse().join("");
  return {
    "user-agent": MODERN_UA,
    "accept": accept,
    "content-type": contentType,
    "x-client-token": ts + "," + md5Hex(new TextEncoder().encode(rev)),
    "x-tr-signature": xTrSignature(method, accept, contentType, url, body, ts),
    "x-client-info": clientInfo(),
    "x-client-status": "0",
    ...(token ? { "authorization": "Bearer " + token } : {}),
  };
}

/* ---------------- engine ---------------- */
let bearerToken = null;
async function bootstrapToken(force = false) {
  if (bearerToken && !force) return bearerToken;
  const headers = authHeaders("GET", BOOTSTRAP_URL);
  const resp = await fetch(BOOTSTRAP_URL, { headers, signal: AbortSignal.timeout(20000) });
  const xUser = resp.headers.get("x-user");
  if (!xUser) throw new Error("Failed to bootstrap MovieBox token");
  const token = JSON.parse(xUser).token;
  if (!token) throw new Error("Empty token in upstream header");
  bearerToken = token;
  return token;
}
async function apiRequest(method, pathOrUrl, bodyDict = null, useToken = true, retryAuth = true) {
  const fullUrl = /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : NATIVE_BASE + pathOrUrl;
  if (useToken && !bearerToken) await bootstrapToken();
  const bodyStr = bodyDict !== null ? JSON.stringify(bodyDict) : null;
  const headers = authHeaders(method, fullUrl, { body: bodyStr, token: useToken ? bearerToken : null });
  const resp = await fetch(fullUrl, {
    method: method.toUpperCase(),
    headers,
    body: method.toUpperCase() === "POST" ? bodyStr : undefined,
    signal: AbortSignal.timeout(25000),
  });
  if ((resp.status === 401 || resp.status === 441) && retryAuth) {
    await bootstrapToken(true);
    return apiRequest(method, pathOrUrl, bodyDict, useToken, false);
  }
  if (resp.status !== 200) throw new Error("API returned HTTP " + resp.status);
  return resp.json();
}
const qval = resStr => {
  for (const q of [2160, 1440, 1080, 720, 480, 360, 240])
    if (String(resStr).includes(String(q))) return q;
  return 0;
};
const isFull = s => (s.duration_sec || 0) > 300 || (s.size_mb || 0) > 100;

async function engSearch(query, page = 1, perPage = 20) {
  const data = (await apiRequest("POST", "/wefeed-mobile-bff/subject-api/search",
    { keyword: query, page, perPage })).data || {};
  const items = data.items || data.list || [];
  return items.map(item => {
    const sub = item.subject || item;
    const cover = sub.cover;
    return {
      subject_id: String(sub.subjectId),
      title: sub.title,
      type: sub.subjectType === 1 ? "Movie" : "Series",
      subject_type: sub.subjectType,
      release_date: sub.releaseDate,
      imdb_rating: sub.imdbRatingValue,
      genre: sub.genre,
      cover: cover && typeof cover === "object" ? cover.url : null,
      detail_path: sub.detailPath,
      language: sub.language,
    };
  });
}
async function engSuggest(q) {
  const url = API_BASE + "/subject/search-suggest";
  const resp = await fetch(url, {
    method: "POST",
    headers: { "User-Agent": WEB_UA, "Referer": "https://moviebox.ph/", "content-type": "application/json" },
    body: JSON.stringify({ keyword: q, perPage: 10 }),
    signal: AbortSignal.timeout(15000),
  });
  const raw = (await resp.json()).data?.items || [];
  const out = [];
  for (const item of raw) {
    const sub = item.subject || {};
    const sid = sub.subjectId || item.subjectId;
    if (!sid) continue; // skip ID-less items (v2 fix)
    out.push({ title: sub.title || item.word || item.title, slug: sub.detailPath || item.detailPath, subject_id: String(sid) });
  }
  return out;
}
async function engDetails(subjectId) {
  const data = (await apiRequest("GET", "/wefeed-mobile-bff/subject-api/get?subjectId=" + subjectId)).data || {};
  const durl = data.detailUrl || "";
  const dpath = durl.includes("/") ? durl.split("/").pop() : durl;
  const cover = data.cover;
  return {
    subject_id: String(data.subjectId),
    title: data.title,
    subject_type: data.subjectType,
    type: data.subjectType === 1 ? "Movie" : "Series",
    description: data.description,
    release_date: data.releaseDate,
    duration: data.duration,
    imdb_rating: data.imdbRatingValue,
    genre: data.genre,
    country: data.countryName,
    language: data.language,
    cover: cover && typeof cover === "object" ? cover.url : null,
    detail_path: dpath,
    dubs: (data.dubs || []).map(d => ({ subject_id: String(d.subjectId), lang_name: d.lanName, language: d.language })),
  };
}
async function engEpisodes(subjectId) {
  const data = (await apiRequest("GET", "/wefeed-mobile-bff/subject-api/season-info?subjectId=" + subjectId)).data || {};
  return (data.seasons || []).map(s => ({ season: s.se ?? 1, episode_count: s.maxEp ?? 1, resolutions: s.resolutions || [] }));
}
function extractPolicyResource(signCookie) {
  if (!signCookie) return null;
  let m = signCookie.match(/Edge-Cache-Cookie=urlprefix=([^:;\s]+)/);
  if (m) {
    try { return new TextDecoder().decode(b64urlDecode(m[1])).replace(/\/$/, "") + "/index.mpd"; } catch (e) {}
  }
  m = signCookie.match(/CloudFront-Policy=([^;]+)/);
  if (m) {
    const raw = m[1];
    for (const t of ["cf", "std"]) {
      try {
        let b = t === "cf" ? raw.replace(/-/g, "+").replace(/_/g, "=") : raw;
        while (b.length % 4) b += "=";
        const data = JSON.parse(new TextDecoder().decode(b64urlDecode(b)));
        for (const s of data.Statement || []) {
          if (s.Resource) return s.Resource.replace(/\*$/, "").replace(/\/$/, "") + "/index.mpd";
        }
      } catch (e) {}
    }
  }
  return null;
}
function parseWebStreams(domain, data, seen) {
  const out = [];
  for (const st of data.streams || []) {
    const url = st.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const resStr = String(st.resolutions ?? "unknown");
    const qv = qval(resStr);
    const sizeB = parseInt(st.size || 0, 10);
    out.push({
      source: "Web CDN (" + domain + ")",
      format: st.format || "MP4",
      quality: qv ? qv + "p" : resStr,
      quality_value: qv, resolution_tag: resStr, url,
      size_mb: sizeB ? Math.round(sizeB / 104857.6) / 10 : 0,
      codec: st.codecName, duration_sec: st.duration,
      headers: { "User-Agent": "Mozilla/5.0", "Referer": domain + "/", "Origin": domain },
    });
  }
  for (const d of data.dash || []) {
    const cookie = d.signCookie;
    const finalUrl = (cookie && extractPolicyResource(cookie)) || d.url;
    if (!finalUrl || seen.has(finalUrl)) continue;
    seen.add(finalUrl);
    const resTag = String(d.resolutions ?? "adaptive");
    out.push({
      source: "Web DASH (" + domain + ")",
      format: "DASH",
      quality: resTag.includes("1080") ? "1080p (Adaptive)" : "Adaptive",
      quality_value: resTag.includes("1080") ? 1080 : 999,
      resolution_tag: resTag, url: finalUrl, size_mb: 0,
      codec: "hevc/h264", duration_sec: null, cookie,
      headers: { "User-Agent": "Mozilla/5.0", "Referer": domain + "/", "Origin": domain },
    });
  }
  return out;
}
async function fetchWebDomain(domain, subjectId, season, episode, detailPath, token) {
  const playUrl = domain + "/wefeed-h5api-bff/subject/play?subjectId=" + subjectId +
    "&se=" + season + "&ep=" + episode + "&detailPath=" + encodeURIComponent(detailPath || "") +
    "&streamSignType=1&supportCodecs%5Bhevc%5D=1&supportCodecs%5Bh264%5D=1";
  const headers = {
    "User-Agent": WEB_UA,
    "Referer": domain + "/movies/" + (detailPath || "") + "?id=" + subjectId + "&type=/movie/detail&detailSe=&detailEp=&lang=en",
    "Accept": "application/json",
    "x-client-info": '{"timezone":"Asia/Calcutta"}',
    "x-request-lang": "en",
    "x-vip-restrict": "0",
    "x-no-high-risk-restrict": "0",
    "x-source": "moviebox",
    "Authorization": "Bearer " + token,
  };
  const resp = await fetch(playUrl, { headers, signal: AbortSignal.timeout(8000) });
  if (resp.status !== 200) return [];
  return (await resp.json()).data || {};
}
async function engStreams(subjectId, season = 0, episode = 0, detailPath = null) {
  if (!detailPath) {
    try { detailPath = (await engDetails(subjectId)).detail_path || ""; }
    catch (e) { detailPath = ""; }
  }
  const token = await bootstrapToken();
  const streams = [], seen = new Set();
  // native play-info first (usually fastest + has full streams)
  try {
    const ndata = (await apiRequest("GET",
      "/wefeed-mobile-bff/subject-api/play-info?subjectId=" + subjectId + "&se=" + season + "&ep=" + episode)).data || {};
    for (const st of ndata.streams || []) {
      const rawUrl = st.url;
      if (!rawUrl || rawUrl.includes("b164fbfb4347792950bdfbfb563d39d9")) continue;
      const finalUrl = (st.signCookie && extractPolicyResource(st.signCookie)) || rawUrl;
      if (seen.has(finalUrl)) continue;
      seen.add(finalUrl);
      const resStr = String(st.resolutions ?? "");
      const qv = qval(resStr);
      const sizeB = parseInt(st.size || 0, 10);
      const isDash = (st.signCookie && extractPolicyResource(st.signCookie)) || finalUrl.includes(".mpd");
      streams.push({
        source: "Mobile Native CDN",
        format: isDash ? "DASH" : (st.format || "MP4"),
        quality: qv ? qv + "p" : (resStr || "Default"),
        quality_value: qv, resolution_tag: resStr, url: finalUrl,
        size_mb: sizeB ? Math.round(sizeB / 104857.6) / 10 : 0,
        codec: st.codecName, duration_sec: st.duration,
        headers: { "User-Agent": MODERN_UA, "Referer": "https://api3.aoneroom.com/" },
      });
    }
  } catch (e) {}
  // web-domain fallback, all in parallel — first domain (in list order) with streams wins
  const settled = await Promise.allSettled(WEB_DOMAINS.map(d => fetchWebDomain(d, subjectId, season, episode, detailPath, token)));
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value) {
      const parsed = parseWebStreams(WEB_DOMAINS[settled.indexOf(r)], r.value, seen);
      if (parsed.length) { streams.push(...parsed); break; }
    }
  }
  // full-length streams first, then quality (v2 sort)
  streams.sort((a, b) => ((isFull(b) ? 1 : 0) - (isFull(a) ? 1 : 0)) || (b.quality_value - a.quality_value));
  return streams;
}
async function engSubtitles(subjectId, streamId = null, season = 0, episode = 0) {
  const subs = [], seen = new Set();
  const add = item => {
    const u = item.url;
    if (u && !seen.has(u)) {
      seen.add(u);
      subs.push({ id: String(item.id ?? ""), language: item.lanName || item.language || "English", code: item.lan || "", url: u, size: item.size });
    }
  };
  if (!streamId) {
    try {
      const rs = (await apiRequest("GET",
        "/wefeed-mobile-bff/subject-api/play-info?subjectId=" + subjectId + "&se=" + season + "&ep=" + episode)).data?.streams || [];
      if (rs[0]?.id) streamId = String(rs[0].id);
    } catch (e) {}
  }
  if (streamId) {
    try {
      const data = (await apiRequest("GET",
        "/wefeed-mobile-bff/subject-api/get-stream-captions?subjectId=" + subjectId + "&streamId=" + streamId)).data || {};
      const caps = Array.isArray(data) ? data : data.extCaptions || data.captions || [];
      for (const s of caps) if (s && typeof s === "object") add(s);
    } catch (e) {}
  }
  try {
    const data = (await apiRequest("GET",
      "/wefeed-mobile-bff/subject-api/get-ext-captions?subjectId=" + subjectId + "&resourceId=" + (streamId || "0") + "&episode=" + episode)).data || {};
    const ext = Array.isArray(data) ? data : data.extCaptions || data.captions || [];
    for (const s of ext) if (s && typeof s === "object") add(s);
  } catch (e) {}
  return subs;
}
async function engList(tabId, page, perPage, sort) {
  const url = API_BASE + "/subject/filter";
  const resp = await fetch(url, {
    method: "POST",
    headers: { "User-Agent": WEB_UA, "Referer": "https://moviebox.ph/", "content-type": "application/json" },
    body: JSON.stringify({ tabId, filter: { sort, genre: "ALL", country: "ALL", year: "ALL", language: "ALL" }, page, perPage }),
    signal: AbortSignal.timeout(20000),
  });
  const data = (await resp.json()).data || {};
  const raw = data.items || data.subjects || [];
  return {
    page, per_page: perPage,
    total: data.pager?.totalCount || raw.length,
    items: raw.map(s => ({
      title: s.title, subject_id: String(s.subjectId), detail_path: s.detailPath,
      cover: s.cover && typeof s.cover === "object" ? s.cover.url : null,
      rating: s.imdbRatingValue,
      year: s.releaseDate ? s.releaseDate.slice(0, 4) : null,
    })),
  };
}

/* ---------------- router ---------------- */
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "*" };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } });
const err = (detail, status = 502) => json({ detail }, status);

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const u = new URL(req.url);
    const p = u.pathname.replace(/\/$/, "") || "/";
    const qp = name => u.searchParams.get(name);
    try {
      if (p === "/") {
        return new Response(DASHBOARD_HTML, { headers: { "content-type": "text/html;charset=utf-8", ...CORS } });
      }
      if (p === "/docs") {
        return new Response(DOCS_HTML, { headers: { "content-type": "text/html;charset=utf-8", ...CORS } });
      }
      if (p === "/proxy") {
        const target = qp("url");
        if (!target) return err("missing url", 400);
        let uh;
        try { uh = new URL(target); } catch (e) { return err("bad url", 400); }
        if (!/(^|\.)(aoneroom\.com|hakunaymatata\.com)$/.test(uh.hostname)) return err("domain not allowed", 403);
        const ph = {};
        const ref = qp("referer"); if (ref) ph["Referer"] = ref;
        const uag = qp("ua"); if (uag) ph["User-Agent"] = uag;
        const rg = req.headers.get("range"); if (rg) ph["Range"] = rg;
        const up = await fetch(target, { headers: ph, signal: AbortSignal.timeout(30000) });
        const rh = {};
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
          const v = up.headers.get(h); if (v) rh[h] = v;
        }
        return new Response(up.body, { status: up.status, headers: { ...rh, ...CORS } });
      }
      if (p === "/health") {
        await bootstrapToken();
        const r = await engSearch("Avatar", 1, 1);
        return json({ status: "ok", version: VERSION, token: "bootstrapped", region_test: r.length ? "PASS (" + r.length + " result)" : "EMPTY" });
      }
      if (p === "/search") {
        const q = qp("q");
        if (!q) return err("missing q", 400);
        return json({ query: q, page: +(qp("page") || 1), results: await engSearch(q, +(qp("page") || 1), +(qp("per_page") || 20)) });
      }
      if (p === "/search/suggest") {
        const q = qp("q");
        if (!q) return err("missing q", 400);
        return json({ suggestions: await engSuggest(q) });
      }
      let m;
      if ((m = p.match(/^\/detail\/([^/]+)$/))) return json(await engDetails(m[1]));
      if ((m = p.match(/^\/episodes\/([^/]+)$/))) return json({ subject_id: m[1], seasons: await engEpisodes(m[1]) });
      if ((m = p.match(/^\/stream\/([^/]+)\/captions$/))) {
        const subs = await engSubtitles(m[1], qp("stream_id"), +(qp("se") || 0), +(qp("ep") || 0));
        return json({ subject_id: m[1], season: +(qp("se") || 0), episode: +(qp("ep") || 0), count: subs.length, captions: subs });
      }
      if ((m = p.match(/^\/stream\/([^/]+)$/))) {
        const streams = await engStreams(m[1], +(qp("se") || 0), +(qp("ep") || 0), qp("detail_path"));
        return json({ subject_id: m[1], season: +(qp("se") || 0), episode: +(qp("ep") || 0), count: streams.length, streams });
      }
      if (p === "/home") {
        const resp = await fetch(API_BASE + "/home?host=moviebox.ph",
          { headers: { "User-Agent": WEB_UA, "Referer": "https://moviebox.ph/" }, signal: AbortSignal.timeout(20000) });
        return json(await resp.json());
      }
      if (p === "/movies") return json(await engList(2, +(qp("page") || 1), +(qp("per_page") || 24), qp("sort") || "RECOMMEND"));
      if (p === "/tv-series") return json(await engList(5, +(qp("page") || 1), +(qp("per_page") || 24), qp("sort") || "RECOMMEND"));
      return err("not found", 404);
    } catch (e) {
      return err(String(e.message || e));
    }
  },
};
