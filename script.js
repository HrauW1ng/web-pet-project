const CONFIG_KEY = "dashboardConfig-v2";

const defaultConfig = {
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

function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
  } catch {
    /* ignore invalid saved config */
  }
  return structuredClone(defaultConfig);
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

const dashboard = document.getElementById("dashboard");
if (dashboard) {
  renderHeroCard(dashboard, loadConfig());
}

const dockbar = document.getElementById("dockbar");
if (dockbar) {
  dockbar.addEventListener("click", (e) => {
    const btn = e.target.closest(".dock-btn");
    if (!btn) return;

    if (btn.id === "dock-settings") {
      console.log("Open settings modal");
    } else if (btn.id === "dock-theme") {
      console.log("Toggle theme");
    } else if (btn.id === "dock-account") {
      console.log("Open account menu");
    }
  });
}