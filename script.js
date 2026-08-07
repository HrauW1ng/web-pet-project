const CONFIG_KEY = "dashboardConfig-v2";

const defaultConfig = {
  lang: "en",
  search: {
    placeholder: "Search the web…",
    urlTemplate: "https://www.google.com/search?q={query}",
  },
  links: [
    { label: "SoundCloud", url: "https://soundcloud.com" },
    { label: "FunPay", url: "https://funpay.com" },
    { label: "YouTube", url: "https://youtube.com" },
    { label: "GitHub", url: "https://github.com" },
    { label: "Gmail", url: "https://mail.google.com" },
    { label: "Gemini", url: "https://gemini.google.com" },
    { label: "Roblox", url: "https://www.roblox.com" },
    {
      label: "Osu Maps",
      url: "https://osu.ppy.sh/beatmapsets?m=0&nsfw=true",
    },
  ],
};

const TRANSLATIONS = {
  en: {
    modalTitle: "Settings",
    closeBtn: "Close",
    dockSettings: "Settings",
    dockAccount: "Account",
    tabCustomization: "Customization",
    tabWidgets: "Widgets",
    tabGeneral: "General",
    customizationDesc: "Background selection, blur level, and theme options...",
    widgetsDesc: "Clock settings, element ordering, and layout controls...",
    languageLabel: "Language",
    searchPlaceholder: "Search the web…",
  },
  ru: {
    modalTitle: "Настройки",
    closeBtn: "Закрыть",
    dockSettings: "Настройки",
    dockAccount: "Аккаунт",
    tabCustomization: "Кастомизация",
    tabWidgets: "Виджеты",
    tabGeneral: "Общие",
    customizationDesc: "Выбор фона, настройка размытия и визуальные темы...",
    widgetsDesc: "Управление часами, порядок элементов и виджеты...",
    languageLabel: "Язык",
    searchPlaceholder: "Поиск в сети…",
  },
};

let currentConfig = loadConfig();

function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
  } catch {
    /* ignore invalid saved config */
  }
  return structuredClone(defaultConfig);
}

function saveConfig() {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(currentConfig));
  } catch {
    /* ignore save errors */
  }
}

function updateLanguage(lang) {
  currentConfig.lang = lang;
  saveConfig();

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Обновление текстовых узлов с data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Обновление атрибутов title с data-i18n-title
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (dict[key]) {
      el.title = dict[key];
    }
  });

  // Обновление плейсхолдера поиска и перерисовка карточки
  currentConfig.search.placeholder = dict.searchPlaceholder;
  const dashboard = document.getElementById("dashboard");
  if (dashboard) {
    renderHeroCard(dashboard, currentConfig);
  }

  // Синхронизация значения в селекте
  const langSelect = document.getElementById("lang-select");
  if (langSelect && langSelect.value !== lang) {
    langSelect.value = lang;
  }
}

function renderHeroCard(container, config) {
  container.innerHTML = "";

  const card = document.createElement("article");
  card.className = "hero-card";

  const form = document.createElement("form");
  form.className = "hero-search";
  form.setAttribute("role", "search");

  const input = document.createElement("input");
  input.type = "search";
  input.name = "q";
  input.className = "hero-search__input";
  input.placeholder = config.search.placeholder;
  input.autocomplete = "off";
  input.required = true;

  form.append(input);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    const url = config.search.urlTemplate.replace(
      "{query}",
      encodeURIComponent(query),
    );
    window.location.href = url;
  });

  const linksNav = document.createElement("nav");
  linksNav.className = "quick-links";
  linksNav.setAttribute("aria-label", "Quick links");

  for (const link of config.links) {
    const a = document.createElement("a");
    a.className = "quick-link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const label = document.createElement("span");
    label.className = "quick-link__label";
    label.textContent = link.label;
    a.append(label);
    linksNav.append(a);
  }

  card.append(form, linksNav);
  container.append(card);
}

// --- Инициализация интерфейса ---
const dashboard = document.getElementById("dashboard");
if (dashboard) {
  renderHeroCard(dashboard, currentConfig);
}

// Применяем сохранённый язык при старте
updateLanguage(currentConfig.lang || "en");

// --- Управление Dockbar и модальным окном настроек ---
const dockbar = document.getElementById("dockbar");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");

function closeSettingsModal() {
  if (
    !settingsModal ||
    !settingsModal.open ||
    settingsModal.classList.contains("is-closing")
  ) {
    return;
  }

  settingsModal.classList.add("is-closing");

  const handleAnimationEnd = (e) => {
    if (e.target !== settingsModal) return;
    settingsModal.classList.remove("is-closing");
    settingsModal.close();
    settingsModal.removeEventListener("animationend", handleAnimationEnd);
  };

  settingsModal.addEventListener("animationend", handleAnimationEnd);
}

if (dockbar) {
  dockbar.addEventListener("click", (e) => {
    const btn = e.target.closest(".dock-btn");
    if (!btn) return;

    if (btn.id === "dock-settings") {
      if (settingsModal) {
        settingsModal.showModal();
      }
    } else if (btn.id === "dock-account") {
      console.log("Open account menu");
    }
  });
}

if (settingsModal) {
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", () => {
      closeSettingsModal();
    });
  }

  // Переключение языков через select
  const langSelect = document.getElementById("lang-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      updateLanguage(e.target.value);
    });
  }

  // Переключение вкладок в сайдбаре
  const settingsSidebar = settingsModal.querySelector(".settings-sidebar");
  if (settingsSidebar) {
    settingsSidebar.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".nav-tab");
      if (!tabBtn) return;

      const targetTab = tabBtn.dataset.tab;

      settingsModal
        .querySelectorAll(".nav-tab")
        .forEach((btn) => btn.classList.remove("active"));
      settingsModal
        .querySelectorAll(".tab-pane")
        .forEach((pane) => pane.classList.remove("active"));

      tabBtn.classList.add("active");
      const activePane = settingsModal.querySelector(`#tab-${targetTab}`);
      if (activePane) activePane.classList.add("active");
    });
  }

  // Закрытие при клике по бэкдропу
  settingsModal.addEventListener("click", (e) => {
    const rect = settingsModal.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      closeSettingsModal();
    }
  });

  // Перехват Esc
  settingsModal.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeSettingsModal();
  });
}