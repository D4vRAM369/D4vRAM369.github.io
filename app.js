(function () {
  const timelineEl = document.getElementById("timeline");
  const filtersEl = document.getElementById("filters");
  const searchEl = document.getElementById("search");
  const statsEl = document.getElementById("hero-stats");
  const lastUpdateEl = document.getElementById("last-update");

  const repos = [...REPOS].sort((a, b) => new Date(b.created) - new Date(a.created));

  const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  let activeLang = "all";
  let query = "";

  function hashHue(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  function secondaryColor(name) {
    const hue = hashHue(name);
    return `hsl(${hue}, 65%, 42%)`;
  }

  function bannerAngle(name) {
    return 100 + (hashHue(name + "a") % 90);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderStats() {
    const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
    statsEl.innerHTML = `
      <div><strong>${repos.length}</strong>${t("repos")}</div>
      <div><strong>${totalStars}</strong>${t("stars")}</div>
      <div><strong>${langs.length}</strong>${t("langs")}</div>
    `;
  }

  function renderFilters() {
    const all = [{ label: t("all"), value: "all" }, ...langs.map((l) => ({ label: l, value: l }))];
    filtersEl.innerHTML = all
      .map(
        (f) =>
          `<button class="filter-btn${f.value === activeLang ? " active" : ""}" data-lang="${f.value}">${f.label}</button>`
      )
      .join("");
    filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeLang = btn.dataset.lang;
        renderFilters();
        renderTimeline();
      });
    });
  }

  function cardHtml(r) {
    const date = new Date(r.created).toLocaleDateString("es-ES", { year: "numeric", month: "short" });
    return `
      <li class="entry" style="--entry-color:${r.color}">
        <div class="entry-date">${date}</div>
        <div class="card">
          <div class="banner" style="background:linear-gradient(${bannerAngle(r.name)}deg, ${r.color} 0%, ${secondaryColor(r.name)} 100%)">
            <span class="icon">${r.icon}</span>
            <span class="banner-name">${escapeHtml(r.name)}</span>
            ${r.stars > 0 ? `<span class="star-badge">★ ${r.stars}</span>` : ""}
          </div>
          <div class="card-body">
            <p class="desc">${escapeHtml(r.description || t("noDesc"))}</p>
            <div class="card-footer">
              ${r.language ? `<span class="lang-badge">${r.language}</span>` : "<span></span>"}
              <div class="links">
                <a class="repo-link" href="${r.url}" target="_blank" rel="noopener">${t("code")}</a>
                ${r.homepage ? `<a href="${r.homepage}" target="_blank" rel="noopener">${t("demo")}</a>` : ""}
              </div>
            </div>
          </div>
        </div>
      </li>`;
  }

  function renderTimeline() {
    const q = query.trim().toLowerCase();
    const filtered = repos.filter((r) => {
      const langOk = activeLang === "all" || r.language === activeLang;
      const qOk = !q || r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q);
      return langOk && qOk;
    });
    timelineEl.innerHTML = filtered.length
      ? filtered.map(cardHtml).join("")
      : `<li class="empty">${t("empty")}</li>`;
  }

  searchEl.addEventListener("input", (e) => {
    query = e.target.value;
    renderTimeline();
  });

  const mostRecent = repos.reduce((max, r) => (r.updated > max ? r.updated : max), "");
  lastUpdateEl.textContent = mostRecent;

  window.renderStats = renderStats;
  window.renderFilters = renderFilters;
  window.renderTimeline = renderTimeline;

  renderStats();
  renderFilters();
  renderTimeline();
})();
