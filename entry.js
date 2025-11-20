// ===== CONFIG =====
const WEB_APP_URL = "PUT_YOUR_WEB_APP_URL_HERE"; // from Apps Script deployment
const TOTAL_REGEX = /^(?:[0-9]|[1-9][0-9]{1,2}|1[0-9]{3}|2000)(?:\.0|\.5)?$/;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bcfl-form");
  if (!form) return;

  const steps = Array.from(document.querySelectorAll(".step"));
  const stepLabelEl = document.getElementById("step-label");
  const statusEl = document.getElementById("status");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const tokenInput = document.getElementById("token");

  let currentStep = 0;

  const stepLabels = [
    "Step 1 of 4 – Contact details",
    "Step 2 of 4 – Women’s classes",
    "Step 3 of 4 – Men’s classes",
    "Step 4 of 4 – Best lifters & submit"
  ];

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "text-sm mt-1";
    if (type === "error") statusEl.classList.add("text-red-400");
    else if (type === "success") statusEl.classList.add("text-green-400");
    else statusEl.classList.add("text-gray-300");
  }

  function showStep(idx) {
    steps.forEach((s, i) => s.classList.toggle("hidden", i !== idx));
    currentStep = idx;
    stepLabelEl.textContent = stepLabels[idx] || "";
    backBtn.classList.toggle("invisible", idx === 0);
    nextBtn.textContent = idx === steps.length - 1 ? "Submit" : "Next";
    showStatus("", "");
  }

  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el && typeof val !== "undefined" && val !== null) {
      el.value = String(val);
    }
  }

  // ===== CONFIDENCE DROPDOWNS (1–16 unique) =====
  const confSelects = Array.from(document.querySelectorAll(".conf-select"));
  const CONF_VALUES = Array.from({ length: 16 }, (_, i) => String(i + 1));

  function rebuildConfidenceDropdowns() {
    const chosen = confSelects.map(s => s.value).filter(v => v !== "");
    confSelects.forEach(select => {
      const current = select.value;
      select.innerHTML = '<option value="">Select rating…</option>';
      CONF_VALUES.forEach(val => {
        if (val === current || !chosen.includes(val)) {
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = val;
          if (val === current) opt.selected = true;
          select.appendChild(opt);
        }
      });
    });
  }

  confSelects.forEach(s => s.addEventListener("change", rebuildConfidenceDropdowns));
  rebuildConfidenceDropdowns();

  // ===== BEST LIFTER LISTS =====
  function buildBestLifterLists() {
    const femaleSet = new Set();
    const maleSet = new Set();
    const winnerSelects = Array.from(document.querySelectorAll("select[id^='w']"));
    winnerSelects.forEach(sel => {
      const gender = sel.dataset.gender;
      Array.from(sel.options).forEach(opt => {
        if (!opt.value) return;
        if (gender === "female") femaleSet.add(opt.value);
        if (gender === "male") maleSet.add(opt.value);
      });
    });

    const femaleList = document.getElementById("femaleBestList");
    const maleList = document.getElementById("maleBestList");
    if (!femaleList || !maleList) return;

    femaleList.innerHTML = "";
    maleList.innerHTML = "";

    Array.from(femaleSet).forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      femaleList.appendChild(o);
    });
    Array.from(maleSet).forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      maleList.appendChild(o);
    });
  }
  buildBestLifterLists();

  // ===== VALIDATION =====
  function clearErrors(stepIdx) {
    const stepEl = steps[stepIdx];
    if (!stepEl) return;
    stepEl.querySelectorAll("[id$='Error']").forEach(el => el.textContent = "");
  }

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function validateStep(stepIdx) {
    let ok = true;
    clearErrors(stepIdx);

    if (stepIdx === 0) {
      if (!getValue("email")) {
        setError("emailError", "Please enter a valid email.");
        ok = false;
      }
      if (!getValue("leaderboardName")) {
        setError("leaderboardError", "Please enter a leaderboard name.");
        ok = false;
      }
    }

    if (stepIdx === 1) {
      const requiredWinners = ["w47w","w52w","w57w","w63w","w69w","w76w","w84w","w84pw"];
      const requiredConf = ["c47w","c52w","c57w","c63w","c69w","c76w","c84w","c84pw"];
      requiredWinners.forEach(id => {
        if (!getValue(id)) {
          setError(id + "Error", "Please select a winner.");
          ok = false;
        }
      });
      requiredConf.forEach(id => {
        if (!getValue(id)) {
          setError(id + "Error", "Please choose a confidence rating.");
          ok = false;
        }
      });
      const totals = ["t47w","t52w","t57w","t63w","t69w","t76w","t84w","t84pw"];
      totals.forEach(id => {
        const v = getValue(id);
        if (v !== "" && !TOTAL_REGEX.test(v)) {
          setError(id + "Error", "Total must be 0–2000 in 0.5 steps (e.g. 865 or 865.5).");
          ok = false;
        }
      });
    }

    if (stepIdx === 2) {
      const requiredWinners = ["w59m","w66m","w74m","w83m","w93m","w105m","w120m","w120pm"];
      const requiredConf = ["c59m","c66m","c74m","c83m","c93m","c105m","c120m","c120pm"];
      requiredWinners.forEach(id => {
        if (!getValue(id)) {
          setError(id + "Error", "Please select a winner.");
          ok = false;
        }
      });
      requiredConf.forEach(id => {
        if (!getValue(id)) {
          setError(id + "Error", "Please choose a confidence rating.");
          ok = false;
        }
      });
      const totals = ["t59m","t66m","t74m","t83m","t93m","t105m","t120m","t120pm"];
      totals.forEach(id => {
        const v = getValue(id);
        if (v !== "" && !TOTAL_REGEX.test(v)) {
          setError(id + "Error", "Total must be 0–2000 in 0.5 steps (e.g. 865 or 865.5).");
          ok = false;
        }
      });
    }

    if (stepIdx === 3) {
      if (!getValue("femaleBest")) {
        setError("femaleBestError", "Please enter a female lifter from the list.");
        ok = false;
      }
      if (!getValue("maleBest")) {
        setError("maleBestError", "Please enter a male lifter from the list.");
        ok = false;
      }
    }

    return ok;
  }

  // ===== NAV BUTTONS =====
  backBtn.addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  nextBtn.addEventListener("click", async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    } else {
      // Submit
      await submitForm();
    }
  });

  // ===== SUBMIT =====
  async function submitForm() {
    showStatus("Submitting your entry…", "neutral");
    nextBtn.disabled = true;
    backBtn.disabled = true;

    const data = {};
    const formData = new FormData(form);
    formData.forEach((v, k) => {
      data[k] = v.toString().trim();
    });

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", data })
      });
      const json = await res.json();
      nextBtn.disabled = false;
      backBtn.disabled = false;

      if (!json.ok) {
        showStatus(json.message || "Something went wrong.", "error");
        return;
      }
      showStatus(json.message, "success");
    } catch (err) {
      nextBtn.disabled = false;
      backBtn.disabled = false;
      showStatus("Network error. Please try again.", "error");
    }
  }

  // ===== PREFILL FROM TOKEN (magic link) =====
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  async function maybePrefillFromToken() {
    const token = getQueryParam("token");
    if (!token) {
      showStep(0);
      return;
    }
    showStatus("Loading your saved entry…", "neutral");
    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prefill", token })
      });
      const json = await res.json();
      if (!json.ok) {
        showStatus(json.message || "Could not load entry.", "error");
        showStep(0);
        return;
      }
      const d = json.data || {};
      Object.keys(d).forEach(k => setValue(k, d[k]));
      if (tokenInput) tokenInput.value = token;
      rebuildConfidenceDropdowns();
      showStatus("Entry loaded. You can review and resubmit before the deadline.", "success");

      // skip Spotify gate for edits
      const spotifyLock = document.getElementById("spotify-lock");
      if (spotifyLock) spotifyLock.classList.add("hidden");

      showStep(0);
    } catch (err) {
      showStatus("Error loading entry. You can still submit a new one.", "error");
      showStep(0);
    }
  }

  maybePrefillFromToken();
});
