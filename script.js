const CONFIG_KEY = "dashboardConfig-v3";
const IDB_NAME = "DashboardDB";
const IDB_STORE = "assets";
const IDB_KEY_BG = "customBgImage";

const defaultConfig = {
  lang: "en",
  palette: "default",
  uiStyle: "liquid-glass",
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
  links: [],
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
    paletteLabel: "Color Palette",
    paletteDefault: "Default Glass",
    paletteMocha: "Catppuccin Mocha",
    paletteLatte: "Catppuccin Latte (Light)",
    paletteNord: "Nordic Frost",
    paletteSakura: "Sakura Pink",
    paletteOled: "OLED Pitch Dark",
    uiStyleLabel: "Frame & Contour Style",
    uiStyleLiquid: "Glassmorphism (Volume)",
    uiStyleSoftMatte: "Soft Matte (Solid Outline)",
    uiStyleMinimal: "Flat Minimal (Clean Edge)",
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
    customizationDesc: "Background selection, themes, palettes and UI options...",
    widgetsDesc: "Add and manage quick links under search bar.",
    languageLabel: "Language",
    searchPlaceholder: "Search the web…",
    quickLinksTitle: "Quick Links",
    quickLinksDesc: "Add and edit tiles shown under the search bar.",
    addTileBtn: "Add Link",
    addTileTitle: "New Tile",
    editTileTitle: "Edit Tile",
    tileNameLabel: "Title",
    tileNamePlaceholder: "e.g. YouTube",
    tileUrlLabel: "URL",
    cancelBtn: "Cancel",
    saveBtn: "Save",
    deleteBtn: "Delete",
  },
  ru: {
    modalTitle: "Настройки",
    closeBtn: "Закрыть",
    dockSettings: "Настройки",
    dockAccount: "Аккаунт",
    tabCustomization: "Кастомизация",
    tabWidgets: "Виджеты",
    tabGeneral: "Общие",
    paletteLabel: "Цветовая палитра",
    paletteDefault: "Стандартная Glass",
    paletteMocha: "Catppuccin Mocha",
    paletteLatte: "Catppuccin Latte (Светлая)",
    paletteNord: "Nordic Frost",
    paletteSakura: "Sakura Pink",
    paletteOled: "OLED Глубокий темный",
    uiStyleLabel: "Стиль контура и рамок",
    uiStyleLiquid: "Glassmorphism (Объем и блики)",
    uiStyleSoftMatte: "Soft Matte (Четкий контур)",
    uiStyleMinimal: "Flat Minimal (Строгий)",
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
    customizationDesc: "Выбор фона, палитры, стиля меню и эффектов...",
    widgetsDesc: "Управление быстрым доступом и ссылками-плитками.",
    languageLabel: "Язык",
    searchPlaceholder: "Поиск в сети…",
    quickLinksTitle: "Быстрые ссылки",
    quickLinksDesc: "Добавляйте и редактируйте плитки под поисковой строкой.",
    addTileBtn: "Добавить",
    addTileTitle: "Новая плитка",
    editTileTitle: "Редактирование плитки",
    tileNameLabel: "Название",
    tileNamePlaceholder: "Например: YouTube",
    tileUrlLabel: "URL ссылка",
    cancelBtn: "Отмена",
    saveBtn: "Сохранить",
    deleteBtn: "Удалить",
  },
};

let currentConfig = structuredClone(defaultConfig);
let selectedTileIndex = null;
let rafId = null;

// --- Helper IndexedDB ---
function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveImageToIDB(dataUrl) {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    store.put(dataUrl, IDB_KEY_BG);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    console.error("IndexedDB Error:", e);
    return false;
  }
}

async function loadImageFromIDB() {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(IDB_KEY_BG);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || "");
      req.onerror = () => resolve("");
    });
  } catch {
    return "";
  }
}

// --- Вспомогательные функции глубокого слияния объектов ---
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key]) && key in target) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

function setCSSVar(name, value) {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    document.documentElement.style.setProperty(name, value);
  });
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.uiStyle === "rice") {
        parsed.uiStyle = "soft-matte";
      }
      return deepMerge(defaultConfig, parsed);
    }
  } catch (e) {
    console.error("Config load error:", e);
  }
  return structuredClone(defaultConfig);
}

function saveConfig() {
  try {
    const configToSave = structuredClone(currentConfig);
    if (configToSave.bg) {
      delete configToSave.bg.image;
    }
    localStorage.setItem(CONFIG_KEY, JSON.stringify(configToSave));
  } catch (e) {
    console.error("Save config error:", e);
  }
}

function applyThemeSettings() {
  const palette = currentConfig.palette || "default";
  const uiStyle = currentConfig.uiStyle || "liquid-glass";

  document.documentElement.setAttribute("data-palette", palette);
  document.documentElement.setAttribute("data-ui-style", uiStyle);

  const paletteSelect = document.getElementById("palette-select");
  if (paletteSelect) paletteSelect.value = palette;

  const uiStyleSelect = document.getElementById("ui-style-select");
  if (uiStyleSelect) uiStyleSelect.value = uiStyle;
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

  if (gradWrapper) bg.type === "gradient" ? gradWrapper.classList.remove("is-hidden") : gradWrapper.classList.add("is-hidden");
  if (colorWrapper) bg.type === "color" ? colorWrapper.classList.remove("is-hidden") : colorWrapper.classList.add("is-hidden");
  if (imageWrapper) bg.type === "image" ? imageWrapper.classList.remove("is-hidden") : imageWrapper.classList.add("is-hidden");
  if (imgBlurWrapper) bg.type === "image" ? imgBlurWrapper.classList.remove("is-hidden") : imgBlurWrapper.classList.add("is-hidden");
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

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  if (!currentConfig.search) currentConfig.search = { ...defaultConfig.search };
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

  card.append(form);

  if (config.links && config.links.length > 0) {
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
    card.append(linksNav);
  } else {
    form.classList.add("no-margin");
  }

  container.append(card);
}

function renderLinksSettingsGrid() {
  const grid = document.getElementById("links-settings-grid");
  if (!grid) return;

  grid.innerHTML = "";

  currentConfig.links.forEach((link, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tile-setting-btn ${selectedTileIndex === index ? "active" : ""}`;

    const span = document.createElement("span");
    span.textContent = link.label;

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-pen";

    btn.append(span, icon);

    btn.addEventListener("click", () => {
      openTileForm(index);
    });

    grid.append(btn);
  });
}

function openTileForm(mode) {
  selectedTileIndex = mode;
  renderLinksSettingsGrid();

  const form = document.getElementById("tile-edit-form");
  const formTitle = document.getElementById("tile-form-title");
  const nameInput = document.getElementById("tile-name-input");
  const urlInput = document.getElementById("tile-url-input");
  const deleteBtn = document.getElementById("tile-delete-btn");

  if (form && nameInput && urlInput) {
    const dict = TRANSLATIONS[currentConfig.lang] || TRANSLATIONS.en;

    if (mode === "new") {
      nameInput.value = "";
      urlInput.value = "";
      if (formTitle) formTitle.textContent = dict.addTileTitle || "New Tile";
      if (deleteBtn) deleteBtn.classList.add("is-hidden");
    } else {
      const link = currentConfig.links[mode];
      nameInput.value = link.label;
      urlInput.value = link.url;
      if (formTitle) formTitle.textContent = dict.editTileTitle || "Edit Tile";
      if (deleteBtn) deleteBtn.classList.remove("is-hidden");
    }

    form.classList.remove("is-hidden");
    nameInput.focus();
  }
}

function closeTileEditForm() {
  selectedTileIndex = null;
  const form = document.getElementById("tile-edit-form");
  const nameInput = document.getElementById("tile-name-input");
  const urlInput = document.getElementById("tile-url-input");

  if (nameInput) nameInput.value = "";
  if (urlInput) urlInput.value = "";
  if (form) form.classList.add("is-hidden");

  renderLinksSettingsGrid();
}

// --- Инициализация ---
async function initApp() {
  currentConfig = loadConfig();

  const savedBgImage = await loadImageFromIDB();
  if (savedBgImage) {
    currentConfig.bg.image = savedBgImage;
  }

  const dashboard = document.getElementById("dashboard");
  if (dashboard) renderHeroCard(dashboard, currentConfig);

  applyThemeSettings();
  updateLanguage(currentConfig.lang || "en");
  applyBlurSettings();
  applyBgSettings();
  renderLinksSettingsGrid();
}

initApp();

// --- Переключение цветовых палитр и стилей UI ---
const paletteSelect = document.getElementById("palette-select");
if (paletteSelect) {
  paletteSelect.addEventListener("change", (e) => {
    currentConfig.palette = e.target.value;
    saveConfig();
    applyThemeSettings();
  });
}

const uiStyleSelect = document.getElementById("ui-style-select");
if (uiStyleSelect) {
  uiStyleSelect.addEventListener("change", (e) => {
    currentConfig.uiStyle = e.target.value;
    saveConfig();
    applyThemeSettings();
  });
}

// --- События UI блюра ---
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
  blurRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    const display = document.getElementById("blur-val-display");
    if (display) display.textContent = `${val}px`;
    setCSSVar("--backdrop-blur", `${val}px`);
  });

  blurRange.addEventListener("change", (e) => {
    if (!currentConfig.blur) currentConfig.blur = { ...defaultConfig.blur };
    currentConfig.blur.amount = parseInt(e.target.value, 10);
    saveConfig();
  });
}

// --- События фона ---
const bgTypeSelect = document.getElementById("bg-type-select");
if (bgTypeSelect) {
  bgTypeSelect.addEventListener("change", (e) => {
    if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };
    currentConfig.bg.type = e.target.value;
    saveConfig();
    applyBgSettings();
  });
}

const gradPickers = [
  document.getElementById("bg-grad-1"),
  document.getElementById("bg-grad-2"),
  document.getElementById("bg-grad-3"),
];

gradPickers.forEach((picker, index) => {
  if (!picker) return;

  picker.addEventListener("input", () => {
    const c1 = gradPickers[0] ? gradPickers[0].value : "#6b7078";
    const c2 = gradPickers[1] ? gradPickers[1].value : "#52565e";
    const c3 = gradPickers[2] ? gradPickers[2].value : "#3a3d44";
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

const bgFileInput = document.getElementById("bg-file-input");
if (bgFileInput) {
  bgFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileNameSpan = document.getElementById("bg-file-name");
    if (fileNameSpan) fileNameSpan.textContent = file.name;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const imageData = evt.target.result;
      if (!currentConfig.bg) currentConfig.bg = { ...defaultConfig.bg };

      await saveImageToIDB(imageData);
      currentConfig.bg.image = imageData;

      saveConfig();
      applyBgSettings();
    };
    reader.readAsDataURL(file);
  });
}

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

// --- Кнопка "Добавить ссылку" ---
const addTileBtn = document.getElementById("add-tile-btn");
if (addTileBtn) {
  addTileBtn.addEventListener("click", () => {
    openTileForm("new");
  });
}

// --- Обработчики формы плиток ---
const tileSaveBtn = document.getElementById("tile-save-btn");
if (tileSaveBtn) {
  tileSaveBtn.addEventListener("click", () => {
    if (selectedTileIndex === null) return;
    const nameInput = document.getElementById("tile-name-input");
    const urlInput = document.getElementById("tile-url-input");

    if (nameInput && urlInput) {
      const label = nameInput.value.trim();
      let url = urlInput.value.trim();

      if (label && url) {
        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }

        if (selectedTileIndex === "new") {
          currentConfig.links.push({ label, url });
        } else {
          currentConfig.links[selectedTileIndex] = { label, url };
        }

        saveConfig();
        const dashboard = document.getElementById("dashboard");
        if (dashboard) renderHeroCard(dashboard, currentConfig);
        closeTileEditForm();
      }
    }
  });
}

const tileDeleteBtn = document.getElementById("tile-delete-btn");
if (tileDeleteBtn) {
  tileDeleteBtn.addEventListener("click", () => {
    if (typeof selectedTileIndex === "number" && selectedTileIndex >= 0) {
      currentConfig.links.splice(selectedTileIndex, 1);
      saveConfig();
      const dashboard = document.getElementById("dashboard");
      if (dashboard) renderHeroCard(dashboard, currentConfig);
      closeTileEditForm();
    }
  });
}

const tileCancelBtn = document.getElementById("tile-cancel-btn");
if (tileCancelBtn) {
  tileCancelBtn.addEventListener("click", () => {
    closeTileEditForm();
  });
}

// --- Dockbar и Модалка ---
const dockbar = document.getElementById("dockbar");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");

function closeSettingsModal() {
  if (!settingsModal || !settingsModal.open || settingsModal.classList.contains("is-closing")) return;

  closeTileEditForm();
  settingsModal.classList.add("is-closing");

  let isDone = false;
  const finishClose = () => {
    if (isDone) return;
    isDone = true;
    settingsModal.removeEventListener("animationend", handleAnimationEnd);
    settingsModal.classList.remove("is-closing");
    if (settingsModal.open) {
      settingsModal.close();
    }
  };

  const handleAnimationEnd = (e) => {
    if (e.target === settingsModal) {
      finishClose();
    }
  };

  settingsModal.addEventListener("animationend", handleAnimationEnd);

  // Страховочный таймер: гарантирует закрытие при пропуске события браузером на крупном зуме
  setTimeout(finishClose, 220);
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

  settingsModal.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeSettingsModal();
  });
}