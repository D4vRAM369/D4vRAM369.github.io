const I18N = {
  es: {
    tagline: "Desarrollador autodidacta. Apps offline-first, herramientas de privacidad y skills de IA para programar aprendiendo.",
    coffee: "Invítame a un café",
    search: "buscar proyecto...",
    footer: "Generado desde repos públicos de GitHub · actualizado",
    all: "todos",
    stars: "stars totales",
    repos: "repos públicos",
    langs: "lenguajes",
    code: "código →",
    demo: "demo →",
    noDesc: "Sin descripción.",
    empty: "Sin resultados.",
  },
  en: {
    tagline: "Self-taught developer. Offline-first apps, privacy tools and AI skills built by learning on the job.",
    coffee: "Buy me a coffee",
    search: "search project...",
    footer: "Generated from public GitHub repos · updated",
    all: "all",
    stars: "total stars",
    repos: "public repos",
    langs: "languages",
    code: "code →",
    demo: "demo →",
    noDesc: "No description.",
    empty: "No results.",
  },
};

function detectLang() {
  const saved = localStorage.getItem("lang");
  if (saved === "es" || saved === "en") return saved;
  return navigator.language && navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

let currentLang = detectLang();

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyStaticI18n() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.setLang === currentLang);
  });
}

function setLang(lang) {
  currentLang = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch (e) {}
  applyStaticI18n();
  if (typeof renderStats === "function") renderStats();
  if (typeof renderFilters === "function") renderFilters();
  if (typeof renderTimeline === "function") renderTimeline();
}

document.addEventListener("DOMContentLoaded", () => {
  applyStaticI18n();
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.setLang));
  });
});
