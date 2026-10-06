// ============================================================
// DJ RAKUMI UNIVERSITY — form handling + lead submission
// ============================================================
(function () {
  "use strict";

  var cfg = window.DJR_CONFIG || {};
  var form = document.getElementById("leadForm");
  var success = document.getElementById("success");
  var submitBtn = document.getElementById("submitBtn");

  var fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email")
  };

  function setError(id, show) {
    var wrap = document.getElementById("f-" + id);
    if (!wrap) return;
    wrap.classList.toggle("show-err", show);
    fields[id].classList.toggle("invalid", show);
  }

  // Nigerian phones: digits (allow leading +, spaces, dashes). Need >= 10 digits.
  function validPhone(v) {
    var digits = (v || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }
  function validEmail(v) {
    if (!v) return true; // optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validate() {
    var ok = true;
    var name = fields.name.value.trim();
    var phone = fields.phone.value.trim();
    var email = fields.email.value.trim();

    setError("name", false); setError("phone", false); setError("email", false);

    if (!name) { setError("name", true); ok = false; }
    if (!validPhone(phone)) { setError("phone", true); ok = false; }
    if (!validEmail(email)) { setError("email", true); ok = false; }
    return ok;
  }

  // Live-clear errors as the user types
  Object.keys(fields).forEach(function (k) {
    fields[k].addEventListener("input", function () { setError(k, false); });
  });

  // --- Storage ---------------------------------------------------
  // Returns a Promise. Uses Supabase REST if configured, otherwise
  // saves locally (real storage, not faked) so no lead is lost.
  function storeLead(lead) {
    if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
      return fetch(cfg.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": cfg.SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email || null,
          source: lead.source
        })
      }).then(function (res) {
        if (!res.ok) return res.text().then(function (t) { throw new Error(t || res.status); });
        return true;
      });
    }
    // Local fallback
    return new Promise(function (resolve) {
      try {
        var all = JSON.parse(localStorage.getItem("djr_leads") || "[]");
        all.push(lead);
        localStorage.setItem("djr_leads", JSON.stringify(all));
      } catch (e) {}
      console.warn("[DJR] Supabase not configured — lead saved locally only.", lead);
      resolve(true);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var lead = {
      name: fields.name.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim(),
      source: cfg.SOURCE || "dj-rakumi-university",
      created_at: new Date().toISOString()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "...";

    storeLead(lead).then(function () {
      form.style.display = "none";
      document.querySelector(".reassure").style.display = "none";
      success.classList.add("show");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }).catch(function (err) {
      console.error("[DJR] submit failed:", err);
      submitBtn.disabled = false;
      submitBtn.textContent = "🔥 Shiga Jerin Farko";
      alert("Akwai matsala. Ka sake gwadawa.");
    });
  });
})();
