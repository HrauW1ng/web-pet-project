const CONFIG_KEY = "dashboardConfig-v2";

const defaultConfig = {
  lang: "en",
  blur: {
    enabled: true,
    amount: 10,
  },
  bg: {
    type: "gradient", // 'gradient' | 'color' | 'image'
    color: "#3a3d44",
    gradient: ["#6b7078", "#52565e", "#3a3d44"],
    image: "",
    imgBlur: 8,
  },
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
    blurEnableLabel: "UI Blur Effect",
    blurAmountLabel: "UI Blur Intensity",
    bgTypeLabel: "Background",
    bgTypeGradient: "Gradient",
    bgTypeColor: "Solid Color",
    bgTypeImage: "Custom Image",
    bgGradientLabel: "3-Color Gradient",
    bgColorLabel: "Select Color",
    bgImageLabel: "Select Image",
    bgImgBlurLabel: "Background Image Blur",
    chooseFileBtn: "Choose File",
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
    blurEnableLabel: "Размытие UI (Blur)",
    blurAmountLabel: "Интенсивность UI размытия",
    bgTypeLabel: "Задний фон",
    bgTypeGradient: "Градиент",
    bgTypeColor: "Монотонный цвет",
    bgTypeImage: "Изображение",
    bgGradientLabel: "Градиент из 3 цветов",
    bgColorLabel: "Выбор цвета",
    bgImageLabel: "Файл с ПК",
    bgImgBlurLabel: "Размытие фонового фото",
    chooseFileBtn: "Выбрать файл",
    customizationDesc: "Выбор фона, настройка размытия и визуальные темы...",
    widgetsDesc: "Управление часами, порядок элементов и виджеты...",
    languageLabel: "Язык",
    searchPlaceholder: "Поиск в сети…",
  },
};

let currentConfig = loadConfig();
let rafId = null;

// Оптимизированное обновление CSS-переменных без лагов
function setCSSVar(name, value) {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    document.documentElement.style.setProperty(name, value);
  });
}

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

function applyBlurSettings() {
  const blur = currentConfig.blur || defaultConfig.blur;
  const enabled = blur.enabled;
  const amount = blur.amount;

  setCSSVar("--backdrop-blur", enabled ? `${amount}px` : "0px");

  const toggle = document.getElementById("blur-toggle");
  const range = document.getElementById("blur-range");
  const wrapper = document.getElementById("blur-slider-wrapper");
  const display = document.getElementById("blur-val-display");

  if (toggle) toggle.checked = enabled;
  if (range) range.value = amount;
  if (display) display.textContent = `${amount}px`;

  if (wrapper) {
    if (enabled) {
      wrapper.classList.remove("is-hidden");
    } else {
      wrapper.classList.add("is-hidden");
    }
  }
}

function applyBgSettings() {
  const bg = currentConfig.bg || defaultConfig.bg;
  const pageBg = document.getElementById("page-bg");
  const typeSelect = document.getElementById("bg-type-select");

  const colorWrapper = document.getElementById("bg-color-wrapper");
  const gradWrapper = document.getElementById("bg-gradient-wrapper");
  const imageWrapper = document.getElementById("bg-image-wrapper");
  const imgBlurWrapper = document.getElementById("bg-img-blur-wrapper");

  if (typeSelect) typeSelect.value = bg.type;

  const colorPicker = document.getElementById("bg-color-picker");
  if (colorPicker) colorPicker.value = bg.color || "#3a3d44";

  const gradArr = bg.gradient || defaultConfig.bg.gradient;
  const grad1 = document.getElementById("bg-grad-1");
  const grad2 = document.getElementById("bg-grad-2");
  const grad3 = document.getElementById("bg-grad-3");
  if (grad1) grad1.value = gradArr[0] || "#6b7078";
  if (grad2) grad2.value = gradArr[1] || "#52565e";
  if (grad3) grad3.value = gradArr[2] || "#3a3d44";

  const imgBlurRange = document.getElementById("bg-img-blur-range");
  const imgBlurDisplay = document.getElementById("bg-img-blur-val");
  const imgBlurVal = bg.imgBlur !== undefined ? bg.imgBlur : 8;

  if (imgBlurRange) imgBlurRange.value = imgBlurVal;
  if (imgBlurDisplay) imgBlurDisplay.textContent = `${imgBlurVal}px`;

  if (pageBg) {
    if (bg.type === "color") {
      pageBg.style.backgroundImage = "none";
      pageBg.style.backgroundColor = bg.color || "#3a3d44";
      setCSSVar("--bg-blur", "0px");
    } else if (bg.type === "image" && bg.image) {
      pageBg.style.backgroundImage = `url(${bg.image})`;
      pageBg.style.backgroundColor = "transparent";
      pageBg.style.backgroundSize = "cover";
      pageBg.style.backgroundPosition = "center";
      setCSSVar("--bg-blur", `${imgBlurVal}px`);
    } else if (bg.type === "image" && !bg.image) {
      pageBg.style.backgroundImage = "none";
      pageBg.style.backgroundColor = bg.color || "#3a3d44";
      setCSSVar("--bg-blur", "0px");
    } else {
      const c = bg.gradient || defaultConfig.bg.gradient;
      pageBg.style.backgroundImage = `linear-gradient(145deg, ${c[0]} 0%, ${c[1]} 50%, ${c[2]} 100%)`;
      pageBg.style.backgroundColor = "transparent";
      setCSSVar("--bg-blur", "0px");
    }
  }

  if (gradWrapper) {
    bg.type === "gradient" ? gradWrapper.classList.remove("is-hidden") : gradWrapper.classList.add("is-hidden");
  }
  if (colorWrapper) {
    bg.type === "color" ? colorWrapper.classList.remove("is-hidden") : colorWrapper.classList.add("is-hidden");
  }
  if (imageWrapper) {
    bg.type === "image" ? imageWrapper.classList.remove("is-hidden") : imageWrapper.classList.add("is-hidden");
  }
  if (imgBlurWrapper) {
    bg.type === "image" ? imgBlurWrapper.classList.remove("is-hidden") : imgBlurWrapper.classList.add("is-hidden");
  }
}

function updateLanguage(lang) {
  currentConfig.lang = lang;
  saveConfig();

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (dict[key]) el.title = dict[key];
  });

  currentConfig.search.placeholder = dict.searchPlaceholder;
  const dashboard = document.getElementById("dashboard");
  if (dashboard) renderHeroCard(dashboard, currentConfig);

  const langSelect = document.getElementById("lang-select");
  if (langSelect && langSelect.value !== lang) langSelect.value = lang;
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
    const url = config.search.urlTemplate.replace("{query}", encodeURIComponent(query));
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

// --- Инициализация ---
const dashboard = document.getElementById("dashboard");
if (dashboard) renderHeroCard(dashboard, currentConfig);

updateLanguage(currentConfig.lang || "en");
applyBlurSettings();
applyBgSettings();

// --- Оптимизированные события UI блюра ---
const blurToggle = document.getElementById("blur-toggle");
if (blurToggle) {
  blurToggle.addEventListener("change", (e) => {
    if (!currentConfig.blur) currentConfig.blur = { ...defaultConfig.blur };
    currentConfig.blur.enabled = e.target.checked;
    saveConfig();
    applyBlurSettings();
  });
}

const blurRange = document.getElementById("blur-range");
if (blurRange) {
  // Быстрое обновление стилей без сохранения
  blurRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    const display = document.getElementById("blur-val-display");
    if (display) display.textContent = `${val}px`;
    setCSSVar("--backdrop-blur", `${val}px`);
  });

  // Сохранение в конфиг только по завершению перемещения
  blurRange.addEventListener("change", (e) => {
    if (!currentConfig.blur) currentConfig.blur = { ...defaultConfig.blur };
    currentConfig.blur.amount = parseInt(e.target.value, 10);
    saveConfig();
  });
}

// --- Оптимизированные события фона ---
const bgTypeSelect = document.getElementById("bg-type-select");
if (bgTypeSelect) {
  bgTypeSelect.addEventListener("change", (e) => {
    if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };
    currentConfig.bg.type = e.target.value;
    saveConfig();
    applyBgSettings();
  });
}

// Выбор цвета градиента
const gradPickers = [
  document.getElementById("bg-grad-1"),
  document.getElementById("bg-grad-2"),
  document.getElementById("bg-grad-3"),
];

gradPickers.forEach((picker, index) => {
  if (!picker) return;

  picker.addEventListener("input", () => {
    const c1 = gradPickers[0].value;
    const c2 = gradPickers[1].value;
    const c3 = gradPickers[2].value;
    const pageBg = document.getElementById("page-bg");
    if (pageBg) {
      pageBg.style.backgroundImage = `linear-gradient(145deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
    }
  });

  picker.addEventListener("change", () => {
    if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };
    if (!currentConfig.bg.gradient) currentConfig.bg.gradient = [...defaultConfig.bg.gradient];
    currentConfig.bg.gradient[index] = picker.value;
    saveConfig();
  });
});

// Монотонный цвет
const bgColorPicker = document.getElementById("bg-color-picker");
if (bgColorPicker) {
  bgColorPicker.addEventListener("input", (e) => {
    const pageBg = document.getElementById("page-bg");
    if (pageBg) pageBg.style.backgroundColor = e.target.value;
  });

  bgColorPicker.addEventListener("change", (e) => {
    if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };
    currentConfig.bg.color = e.target.value;
    saveConfig();
  });
}

// Загрузка кастомного изображения
const bgFileInput = document.getElementById("bg-file-input");
if (bgFileInput) {
  bgFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };
      currentConfig.bg.image = evt.target.result;
      saveConfig();
      applyBgSettings();
    };
    reader.readAsDataURL(file);
  });
}

// Оптимизированный ползунок блюра фонового фото
const bgImgBlurRange = document.getElementById("bg-img-blur-range");
if (bgImgBlurRange) {
  bgImgBlurRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    const display = document.getElementById("bg-img-blur-val");
    if (display) display.textContent = `${val}px`;
    setCSSVar("--bg-blur", `${val}px`);
  });

  bgImgBlurRange.addEventListener("change", (e) => {
    if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };
    currentConfig.bg.imgBlur = parseInt(e.target.value, 10);
    saveConfig();
  });
}

// --- Управление Dockbar и модальным окном ---
const dockbar = document.getElementById("dockbar");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");

function closeSettingsModal() {
  if (!settingsModal || !settingsModal.open || settingsModal.classList.contains("is-closing")) return;

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

    if (btn.id === "dock-settings" && settingsModal) {
      settingsModal.showModal();
    }
  });
}

if (settingsModal) {
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", closeSettingsModal);
  }

  const langSelect = document.getElementById("lang-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => updateLanguage(e.target.value));
  }

  const settingsSidebar = settingsModal.querySelector(".settings-sidebar");
  if (settingsSidebar) {
    settingsSidebar.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".nav-tab");
      if (!tabBtn) return;

      const targetTab = tabBtn.dataset.tab;

      settingsModal.querySelectorAll(".nav-tab").forEach((btn) => btn.classList.remove("active"));
      settingsModal.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"));

      tabBtn.classList.add("active");
      const activePane = settingsModal.querySelector(`#tab-${targetTab}`);
      if (activePane) activePane.classList.add("active");
    });
  }

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

  settingsModal.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeSettingsModal();
  });
}