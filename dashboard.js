// ============================================================
// DJ RAKUMI UNIVERSITY — Admin dashboard
// Reads leads from Supabase. Only works when logged in as the
// admin email (enforced by a Supabase row-level security policy).
// ============================================================
(function () {
  "use strict";

  var cfg = window.DJR_CONFIG || {};
  var BASE = (cfg.SUPABASE_URL || "").replace(/\/$/, "");
  var ANON = cfg.SUPABASE_ANON_KEY || "";
  var TKEY = "djr_admin_token";

  var loginView = document.getElementById("loginView");
  var dashView = document.getElementById("dashView");
  var loginForm = document.getElementById("loginForm");
  var loginBtn = document.getElementById("loginBtn");
  var loginMsg = document.getElementById("loginMsg");
  var logoutBtn = document.getElementById("logoutBtn");
  var refreshBtn = document.getElementById("refreshBtn");
  var countEl = document.getElementById("count");
  var todayEl = document.getElementById("today");
  var weekEl = document.getElementById("week");
  var withEmailEl = document.getElementById("withEmail");
  var listEl = document.getElementById("leadsList");

  function computeStats(rows) {
    var now = new Date();
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    var today = 0, week = 0, withEmail = 0;
    rows.forEach(function (l) {
      var t = l.created_at ? new Date(l.created_at).getTime() : 0;
      if (t >= startToday) today++;
      if (t >= weekAgo) week++;
      if (l.email) withEmail++;
    });
    countEl.textContent = rows.length;
    todayEl.textContent = today;
    weekEl.textContent = week;
    withEmailEl.textContent = withEmail;
  }

  function getToken() { try { return localStorage.getItem(TKEY); } catch (e) { return null; } }
  function setToken(t) { try { t ? localStorage.setItem(TKEY, t) : localStorage.removeItem(TKEY); } catch (e) {} }

  function showLogin(msg, kind) {
    dashView.classList.add("hidden");
    loginView.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    loginMsg.textContent = msg || "";
    loginMsg.className = "msg " + (kind || "");
  }
  function showDash() {
    loginView.classList.add("hidden");
    dashView.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  // --- Auth ---
  function login(email, password) {
    return fetch(BASE + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "apikey": ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: password })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error_description || data.msg || data.error || "Login failed");
        return data.access_token;
      });
    });
  }

  // --- Data ---
  function loadLeads() {
    var token = getToken();
    if (!token) { showLogin(); return; }
    listEl.innerHTML = '<div class="spinner">Loading…</div>';
    countEl.textContent = "—";
    fetch(BASE + "/rest/v1/leads?select=*&order=created_at.desc", {
      headers: { "apikey": ANON, "Authorization": "Bearer " + token, "Prefer": "count=exact" }
    }).then(function (r) {
      if (r.status === 401 || r.status === 403) { setToken(null); showLogin("An fita. Ka sake shiga.", "err"); throw new Error("unauth"); }
      return r.json();
    }).then(function (rows) {
      if (!Array.isArray(rows)) rows = [];
      computeStats(rows);
      if (rows.length === 0) { listEl.innerHTML = '<div class="empty">Babu wanda ya join tukuna.</div>'; return; }
      listEl.innerHTML = rows.map(function (l) {
        var phone = esc(l.phone || "");
        var email = l.email ? '<div class="row"><span class="k">Email</span> <a href="mailto:' + esc(l.email) + '">' + esc(l.email) + "</a></div>" : "";
        return '<div class="lead">' +
          '<div class="top"><span class="name">' + esc(l.name || "—") + '</span><span class="date">' + esc(fmtDate(l.created_at)) + "</span></div>" +
          '<div class="row"><span class="k">Phone</span> <a href="tel:' + phone + '">' + phone + "</a></div>" +
          email +
        "</div>";
      }).join("");
    }).catch(function (e) {
      if (e.message !== "unauth") { listEl.innerHTML = '<div class="empty">Akwai matsala wajen loading. Ka sake gwadawa.</div>'; }
    });
  }

  // --- Events ---
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    loginBtn.disabled = true; loginBtn.textContent = "…";
    loginMsg.textContent = "";
    login(email, password).then(function (token) {
      setToken(token);
      loginBtn.disabled = false; loginBtn.textContent = "Log In";
      document.getElementById("password").value = "";
      showDash();
      loadLeads();
    }).catch(function (err) {
      loginBtn.disabled = false; loginBtn.textContent = "Log In";
      showLogin(err.message || "Login failed", "err");
    });
  });

  var pwToggle = document.getElementById("pwToggle");
  if (pwToggle) {
    pwToggle.addEventListener("click", function () {
      var pw = document.getElementById("password");
      if (pw.type === "password") { pw.type = "text"; pwToggle.textContent = "Hide"; }
      else { pw.type = "password"; pwToggle.textContent = "Show"; }
    });
  }

  logoutBtn.addEventListener("click", function () { setToken(null); showLogin("An fita.", "ok"); });
  refreshBtn.addEventListener("click", loadLeads);

  // --- Init: if we have a token, try to load straight away ---
  if (getToken()) { showDash(); loadLeads(); } else { showLogin(); }
})();
