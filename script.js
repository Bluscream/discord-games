let gamesData = [];
let filteredData = [];

// Discord API configuration
const discordApiUrl = "https://discord.com/api/v9/applications/detectable";

// CORS Proxy configuration
const proxyList = [
  { name: "corsproxy.io", url: "https://corsproxy.io/?{url}" },
  {
    name: "api.allorigins.win",
    url: "https://api.allorigins.win/raw?url={url}",
  },
  {
    name: "api.codetabs.com",
    url: "https://api.codetabs.com/v1/proxy?quest={url}",
  },
  {
    name: "thingproxy.freeboard.io",
    url: "https://thingproxy.freeboard.io/fetch/{url}",
  },
  {
    name: "cors-anywhere.herokuapp.com",
    url: "https://cors-anywhere.herokuapp.com/{url}",
  },
];

// Helper functions for creating table cells
function createIconCell(game) {
  const iconCell = document.createElement("td");
  iconCell.className = "text-center";
  if (game.icon_hash) {
    const iconImg = document.createElement("img");
    iconImg.src = `https://cdn.discordapp.com/app-icons/${game.id}/${game.icon_hash}.png`;
    iconImg.alt = `${game.name} icon`;
    iconImg.className = "rounded";
    iconImg.style.width = "32px";
    iconImg.style.height = "32px";
    iconImg.style.objectFit = "cover";
    iconImg.onerror = function () {
      this.style.display = "none";
      const fallback = document.createElement("span");
      fallback.className = "text-muted";
      fallback.textContent = "📱";
      fallback.style.fontSize = "24px";
      iconCell.appendChild(fallback);
    };
    iconCell.appendChild(iconImg);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "text-muted";
    fallback.textContent = "📱";
    fallback.style.fontSize = "24px";
    iconCell.appendChild(fallback);
  }
  return iconCell;
}

function createNameCell(game) {
  const nameCell = document.createElement("td");
  const nameStrong = document.createElement("strong");
  nameStrong.textContent = game.name;
  nameCell.appendChild(nameStrong);
  return nameCell;
}

function createAliasesCell(game) {
  const aliasesCell = document.createElement("td");
  if (game.aliases && game.aliases.length > 0) {
    aliasesCell.textContent = game.aliases.join(", ");
  } else {
    aliasesCell.textContent = "-";
    aliasesCell.className = "text-muted";
  }
  return aliasesCell;
}

function createIdCell(game) {
  const idCell = document.createElement("td");
  idCell.textContent = game.id;
  idCell.className = "font-monospace small";
  return idCell;
}

function createExecutablesCell(game) {
  const executablesCell = document.createElement("td");
  const allExecutables = game.executables || [];

  if (allExecutables.length > 0) {
    // Group executables by OS
    const executablesByOS = {};
    allExecutables.forEach((exec) => {
      if (!executablesByOS[exec.os]) {
        executablesByOS[exec.os] = [];
      }
      executablesByOS[exec.os].push(exec.name);
    });

    // Create formatted display
    const osNames = { win32: "Windows", darwin: "macOS", linux: "Linux" };
    const lines = [];

    Object.keys(executablesByOS).forEach((os) => {
      const osDisplayName = osNames[os] || os;
      const executables = executablesByOS[os];

      if (executables.length > 0) {
        const codeElements = executables
          .map((execName) => {
            const code = document.createElement("code");
            code.textContent = execName;
            return code.outerHTML;
          })
          .join(", ");

        lines.push(`${osDisplayName}: ${codeElements}`);
      }
    });

    if (lines.length > 0) {
      executablesCell.innerHTML = lines.join("<br>");
    } else {
      executablesCell.textContent = "-";
      executablesCell.className = "text-muted";
    }
  } else {
    executablesCell.textContent = "-";
    executablesCell.className = "text-muted";
  }
  return executablesCell;
}

function createThemesCell(game) {
  const themesCell = document.createElement("td");
  if (game.themes && game.themes.length > 0) {
    game.themes.forEach((theme) => {
      const badge = document.createElement("span");
      badge.className = "badge bg-secondary theme-badge me-1";
      badge.textContent = theme;
      themesCell.appendChild(badge);
    });
  } else {
    themesCell.textContent = "-";
    themesCell.className = "text-muted";
  }
  return themesCell;
}

function createBooleanCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value ? "✅" : "❌";
  cell.className = "text-center";
  return cell;
}

function createOverlayMethodsCell(game) {
  const overlayMethodsCell = document.createElement("td");
  if (game.overlay_methods && game.overlay_methods.length > 0) {
    game.overlay_methods.forEach((method) => {
      const badge = document.createElement("span");
      badge.className = "badge bg-info me-1";
      badge.textContent = method;
      overlayMethodsCell.appendChild(badge);
    });
  } else {
    overlayMethodsCell.textContent = "-";
    overlayMethodsCell.className = "text-muted";
  }
  return overlayMethodsCell;
}

function createIconHashCell(game) {
  const iconHashCell = document.createElement("td");
  if (game.icon_hash) {
    iconHashCell.textContent = game.icon_hash;
    iconHashCell.className = "font-monospace small";
  } else {
    iconHashCell.textContent = "-";
    iconHashCell.className = "text-muted";
  }
  return iconHashCell;
}

function createGameRow(game) {
  const row = document.createElement("tr");

  // Create all cells using helper functions
  row.appendChild(createIconCell(game));
  row.appendChild(createNameCell(game));
  row.appendChild(createAliasesCell(game));
  row.appendChild(createIdCell(game));
  row.appendChild(createExecutablesCell(game));
  row.appendChild(createThemesCell(game));
  row.appendChild(createBooleanCell(game.hook));
  row.appendChild(createBooleanCell(game.overlay));
  row.appendChild(createBooleanCell(game.overlay_compatibility_hook));
  row.appendChild(createOverlayMethodsCell(game));
  row.appendChild(createBooleanCell(game.overlay_warn));
  row.appendChild(createIconHashCell(game));

  return row;
}

let selectedProxy = proxyList[0].url; // Default to first proxy (corsproxy.io)
const proxyDropdown = document.getElementById("proxyDropdown");
const proxyMenu = document.getElementById("proxyMenu");
const loadGamesBtn = document.getElementById("loadGames");
const clearDataBtn = document.getElementById("clearData");
const loadingSpinner = document.getElementById("loadingSpinner");
const resultsCard = document.getElementById("resultsCard");
const errorAlert = document.getElementById("errorAlert");
const errorMessage = document.getElementById("errorMessage");

// Filter elements
const searchInput = document.getElementById("searchInput");
const filterDropdown = document.getElementById("filterDropdown");
const filterMenu = document.getElementById("filterMenu");
const sortSelect = document.getElementById("sortSelect");
// Game count element removed - no longer needed
const gamesTableBody = document.getElementById("gamesTableBody");

// Current filter/sort state
let currentTheme = "";
let currentOS = "";
let currentSort = "name";

// Populate proxy menu
function populateProxyMenu() {
  const directItem = proxyMenu.querySelector('[data-proxy="direct"]');
  const customItem = proxyMenu.querySelector('[data-proxy="custom"]');

  // Clear existing proxy items (keep direct and custom)
  const existingItems = proxyMenu.querySelectorAll(
    '[data-proxy]:not([data-proxy="direct"]):not([data-proxy="custom"])'
  );
  existingItems.forEach((item) => item.remove());

  // Add proxy items from the list
  const divider = directItem.nextElementSibling;
  proxyList.forEach((proxy) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "dropdown-item";
    a.href = "#";
    a.setAttribute("data-proxy", proxy.url);
    a.textContent = proxy.name;
    li.appendChild(a);
    proxyMenu.insertBefore(li, customItem.parentElement);
  });

  // Set default proxy button text
  proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> ' + proxyList[0].name;
}

// Handle proxy dropdown selection
document.querySelectorAll("[data-proxy]").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const proxy = this.getAttribute("data-proxy");
    console.log("🔄 Proxy selection changed to:", proxy);

    if (proxy === "custom") {
      const customUrl = prompt(
        "Enter custom proxy URL ({url} will be replaced)\n\nExample: https://myproxy.com/fetch?url={url}"
      );
      if (customUrl) {
        selectedProxy = customUrl;
        proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> Custom Proxy';
        updateUrl();
      }
    } else if (proxy === "direct") {
      selectedProxy = "direct";
      proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> Direct (No Proxy)';
      updateUrl();
    } else {
      selectedProxy = proxy;
      // Find the proxy name from the list
      const proxyName =
        proxyList.find((p) => p.url === proxy)?.name || this.textContent;
      proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> ' + proxyName;
      updateUrl();
    }
  });
});

// Handle filter dropdown
document.querySelectorAll("[data-filter]").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const filterType = this.getAttribute("data-filter");
    const filterValue = this.getAttribute("data-value");

    if (filterType === "theme") {
      currentTheme = filterValue;
    } else if (filterType === "os") {
      currentOS = filterValue;
    }

    updateFilterButton();
    applyFilters();
  });
});

// Handle sort dropdown
document.querySelectorAll("[data-sort]").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    currentSort = this.getAttribute("data-sort");
    sortSelect.innerHTML =
      '<i class="bi bi-sort-alpha-down"></i> ' + this.textContent;
    applyFilters();
  });
});

// Update filter button text
function updateFilterButton() {
  let buttonText = "Filter";
  const filters = [];

  if (currentTheme) {
    filters.push(`Theme: ${currentTheme}`);
  }
  if (currentOS) {
    const osNames = { win32: "Windows", darwin: "macOS", linux: "Linux" };
    filters.push(`OS: ${osNames[currentOS] || currentOS}`);
  }

  if (filters.length > 0) {
    buttonText = filters.join(", ");
  }

  filterDropdown.innerHTML = '<i class="bi bi-funnel"></i> ' + buttonText;
}

// Update URL with current proxy
function updateUrl() {
  const url = new URL(window.location);
  url.searchParams.set("proxy", selectedProxy);
  window.history.replaceState({}, "", url);
}

// Load proxy from URL parameters
function loadProxyFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const proxyParam = urlParams.get("proxy");
  const loadParam = urlParams.get("load");

  if (proxyParam) {
    selectedProxy = proxyParam;

    if (proxyParam === "direct") {
      proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> Direct (No Proxy)';
    } else {
      // Find the proxy name from the list
      const proxyName =
        proxyList.find((p) => p.url === proxyParam)?.name || "Custom Proxy";
      proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> ' + proxyName;
    }

    if (loadParam === "true" || loadParam === "1") {
      // Auto-load with the specified proxy
      loadGames();
    }
  }
}

// Load games function
async function loadGames() {
  console.log("🎮 Starting loadGames function");
  console.log("📡 Selected proxy:", selectedProxy);
  console.log("🌐 Discord API URL:", discordApiUrl);

  let proxyUrl = selectedProxy;

  // Show loading state
  console.log("⏳ Showing loading state");
  loadingSpinner.style.display = "block";
  resultsCard.style.display = "none";
  errorAlert.style.display = "none";
  loadGamesBtn.disabled = true;

  // Update loading text to show we're fetching
  const loadingText = loadingSpinner.querySelector(".loading-text");
  if (loadingText) {
    loadingText.textContent = "Fetching games from Discord API...";
  }

  try {
    let fetchUrl;

    if (proxyUrl === "direct") {
      // Direct request without proxy
      fetchUrl = discordApiUrl;
      console.log("🌐 Using direct connection to:", fetchUrl);
    } else if (proxyUrl.includes("{url}")) {
      // Proxy format: replace {url} with encoded Discord API URL
      fetchUrl = proxyUrl.replace("{url}", encodeURIComponent(discordApiUrl));
      console.log("🔄 Using proxy:", proxyUrl);
      console.log("🔗 Final URL:", fetchUrl);
    } else {
      // Fallback for old format (should not happen with new system)
      fetchUrl = proxyUrl + discordApiUrl;
      console.log("⚠️ Using fallback URL construction:", fetchUrl);
    }

    console.log("📡 Making fetch request to:", fetchUrl);
    const response = await fetch(fetchUrl);
    console.log("📊 Response status:", response.status, response.statusText);
    console.log(
      "📋 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      console.error(
        "❌ Response not OK:",
        response.status,
        response.statusText
      );
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse JSON response
    console.log("📦 Parsing JSON response");
    gamesData = await response.json();
    console.log("📊 Parsed games data:", gamesData.length, "games");

    // Update page title and navbar title with game count
    const gameCount = gamesData.length;
    document.title = `Discord Games Browser (${gameCount})`;
    const navbarTitle = document.querySelector(".navbar-brand");
    if (navbarTitle) {
      navbarTitle.textContent = `🎮 Discord Games Browser (${gameCount})`;
    }

    // Update loading text with game count right after parsing
    const loadingText = loadingSpinner.querySelector(".loading-text");
    if (loadingText) {
      loadingText.textContent = `Processing ${gamesData.length} games...`;
    }

    // Use setTimeout to break up the work and keep UI responsive
    setTimeout(() => {
      console.log("🔄 Starting async processing");
      filteredData = [...gamesData];
      populateFilters();

      // Render table in chunks to prevent UI blocking
      renderTableAsync();
    }, 0);

    resultsCard.style.display = "block";
  } catch (error) {
    console.error("❌ Error loading games:", error);
    console.error("❌ Error stack:", error.stack);
    showError(`Failed to load games: ${error.message}`);
  } finally {
    console.log("🏁 Load games function completed");
    loadingSpinner.style.display = "none";
    loadGamesBtn.disabled = false;
  }
}

// Show error function
function showError(message) {
  errorMessage.textContent = message;
  errorAlert.style.display = "block";
}

// Populate filter options
function populateFilters() {
  const themes = new Set();
  gamesData.forEach((game) => {
    if (game.themes) {
      game.themes.forEach((theme) => themes.add(theme));
    }
  });

  // Update theme filter menu
  const themeSection =
    filterMenu.querySelector("li:first-child").nextElementSibling;
  themeSection.innerHTML =
    '<a class="dropdown-item" href="#" data-filter="theme" data-value="">All Themes</a>';

  Array.from(themes)
    .sort()
    .forEach((theme) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "dropdown-item";
      a.href = "#";
      a.setAttribute("data-filter", "theme");
      a.setAttribute("data-value", theme);
      a.textContent = theme;
      li.appendChild(a);
      themeSection.appendChild(li);
    });

  // Re-attach event listeners for new items
  document.querySelectorAll("[data-filter]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const filterType = this.getAttribute("data-filter");
      const filterValue = this.getAttribute("data-value");

      if (filterType === "theme") {
        currentTheme = filterValue;
      } else if (filterType === "os") {
        currentOS = filterValue;
      }

      updateFilterButton();
      applyFilters();
    });
  });
}

// Render table
function renderTable() {
  // Clear existing rows
  while (gamesTableBody.firstChild) {
    gamesTableBody.removeChild(gamesTableBody.firstChild);
  }

  filteredData.forEach((game) => {
    const row = createGameRow(game);
    gamesTableBody.appendChild(row);
  });

  // Game count display removed
}

// Render table asynchronously in chunks to prevent UI blocking
function renderTableAsync() {
  console.log(
    "🎨 Starting async table rendering with",
    filteredData.length,
    "games"
  );
  gamesTableBody.innerHTML = "";

  const chunkSize = Math.max(1, Math.floor(filteredData.length * 0.1)); // Process 10% of games at a time
  let currentIndex = 0;

  function processChunk() {
    const endIndex = Math.min(currentIndex + chunkSize, filteredData.length);
    console.log(
      `📊 Processing games ${currentIndex + 1}-${endIndex} of ${
        filteredData.length
      }`
    );

    // Update loading text with progress
    const loadingText = loadingSpinner.querySelector(".loading-text");
    if (loadingText) {
      loadingText.textContent = `Processing ${
        currentIndex + 1
      }-${endIndex} of ${filteredData.length} games...`;
    }

    for (let i = currentIndex; i < endIndex; i++) {
      const game = filteredData[i];
      const row = createGameRow(game);
      gamesTableBody.appendChild(row);
    }

    currentIndex = endIndex;

    if (currentIndex < filteredData.length) {
      // Continue processing next chunk
      setTimeout(processChunk, 0);
    } else {
      // Finished processing all games
      console.log("✅ Async table rendering completed");
      // Game count display removed

      // Hide loading spinner
      loadingSpinner.style.display = "none";
    }
  }

  // Start processing
  processChunk();
}

// Filter and sort functions
function applyFilters() {
  console.log("🔍 Applying filters");
  const searchTerm = searchInput.value.toLowerCase();
  console.log("🔎 Search term:", searchTerm);
  console.log("🎨 Current theme filter:", currentTheme);
  console.log("💻 Current OS filter:", currentOS);

  filteredData = gamesData.filter((game) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      game.name.toLowerCase().includes(searchTerm) ||
      game.id.toLowerCase().includes(searchTerm) ||
      (game.aliases &&
        Array.isArray(game.aliases) &&
        game.aliases.some((alias) =>
          alias.toLowerCase().includes(searchTerm)
        )) ||
      (game.executables &&
        game.executables.some(
          (exec) =>
            exec.os === "win32" && exec.name.toLowerCase().includes(searchTerm)
        )) ||
      (game.themes &&
        game.themes.some((theme) =>
          theme.toLowerCase().includes(searchTerm)
        )) ||
      (game.overlay_methods &&
        Array.isArray(game.overlay_methods) &&
        game.overlay_methods.some((method) =>
          method.toLowerCase().includes(searchTerm)
        )) ||
      (game.icon_hash && game.icon_hash.toLowerCase().includes(searchTerm));

    // Theme filter
    const matchesTheme =
      !currentTheme || (game.themes && game.themes.includes(currentTheme));

    // OS filter
    const matchesOS =
      !currentOS ||
      (game.executables &&
        game.executables.some((exec) => exec.os === currentOS));

    return matchesSearch && matchesTheme && matchesOS;
  });

  console.log(
    "📊 Filtered results:",
    filteredData.length,
    "out of",
    gamesData.length,
    "games"
  );

  // Apply sorting
  console.log("🔄 Applying sort:", currentSort);
  filteredData.sort((a, b) => {
    switch (currentSort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "id":
        return a.id.localeCompare(b.id);
      case "id-desc":
        return b.id.localeCompare(a.id);
      case "executables":
        const aExecs = a.executables ? a.executables.length : 0;
        const bExecs = b.executables ? b.executables.length : 0;
        return bExecs - aExecs;
      case "themes":
        const aThemes = a.themes ? a.themes.length : 0;
        const bThemes = b.themes ? b.themes.length : 0;
        return bThemes - aThemes;
      case "hook":
        return (b.hook ? 1 : 0) - (a.hook ? 1 : 0);
      case "overlay":
        return (b.overlay ? 1 : 0) - (a.overlay ? 1 : 0);
      default:
        return 0;
    }
  });

  console.log("🎯 Rendering filtered table with", filteredData.length, "games");
  renderTable();
}

// Event listeners
loadGamesBtn.addEventListener("click", loadGames);
clearDataBtn.addEventListener("click", () => {
  gamesData = [];
  filteredData = [];
  resultsCard.style.display = "none";
  errorAlert.style.display = "none";
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applyFilters();
  }
});

// Initialize proxy menu and URL parameters
console.log("🚀 Initializing application");
console.log("📋 Populating proxy menu");
populateProxyMenu();
console.log("🔗 Loading proxy from URL parameters");
loadProxyFromUrl();

// Re-attach event listeners after populating menu
document.querySelectorAll("[data-proxy]").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const proxy = this.getAttribute("data-proxy");

    if (proxy === "custom") {
      const customUrl = prompt(
        "Enter custom proxy URL ({url} will be replaced)\n\nExample: https://myproxy.com/fetch?url={url}"
      );
      if (customUrl) {
        selectedProxy = customUrl;
        proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> Custom Proxy';
        updateUrl();
      }
    } else if (proxy === "direct") {
      selectedProxy = "direct";
      proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> Direct (No Proxy)';
      updateUrl();
    } else {
      selectedProxy = proxy;
      // Find the proxy name from the list
      const proxyName =
        proxyList.find((p) => p.url === proxy)?.name || this.textContent;
      proxyDropdown.innerHTML = '<i class="bi bi-globe"></i> ' + proxyName;
      updateUrl();
    }
  });
});
