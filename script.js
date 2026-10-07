/*
  ApnaJanwar.co - page behaviour

  1. Helpers
  2. Data (photos, categories, listings) - replace with your real API later
  3. Rendering
  4. Filtering and search
  5. Click handling
  6. Animations (GSAP + ScrollTrigger)
  7. Start
*/

/* ---------- 1. Helpers ---------- */

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Only animate when GSAP loaded and the visitor has not asked for reduced motion.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canAnimate = Boolean(window.gsap && window.ScrollTrigger) && !prefersReducedMotion;
const hasHover = window.matchMedia("(hover: hover)").matches;

const icon = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;
const formatPrice = (amount) => "Rs " + amount.toLocaleString("en-PK");

// Hide any photo that fails to load, so the tinted logo placeholder underneath shows instead.
document.addEventListener(
  "error",
  (event) => {
    if (event.target.tagName === "IMG") event.target.style.display = "none";
  },
  true,
);

/* ---------- 2. Data ---------- */

// Unsplash photo ids grouped by animal. A photo is referenced as "pool:index", e.g. "cow:0".
const photoPool = {
  cow: [
    "photo-1596733430284-f7437764b1a9",
    "photo-1593768697824-f31b967e6c55",
    "photo-1527153857715-3908f2bae5e8",
    "photo-1598715685267-0f45367d8071",
  ],
  buffalo: [
    "premium_photo-1661835557655-99a912d26132",
    "photo-1619452104266-0d23df2119ac",
    "premium_photo-1664302669447-d63f6c898f2f",
    "photo-1603966474815-85d21585ffb9",
  ],
  goat: [
    "photo-1560819400-434c188f63ef",
    "premium_photo-1681882343875-0c709293d624",
    "photo-1624806972468-ea9c923a425e",
    "photo-1621948812859-39fcf9d7fcf2",
    "photo-1524024973431-2ad916746881",
    "photo-1604076150017-48b528308aa3",
    "photo-1588466585717-f8041aec7875",
  ],
  horse: [
    "photo-1553284965-83fd3e82fa5a?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ], // no horse photos yet: add Unsplash ids here, e.g. "photo-xxxxxxxx", and they appear everywhere
  hen: [
    "photo-1556316918-880f9e893822",
    "photo-1694984716506-525271247a72",
    "photo-1606443589134-2c65a11ac828",
    "photo-1553161170-0c3481941f27",
    "photo-1554740760-5db7aca3ec66",
    "photo-1605490552919-bb0a239812c1",
    "photo-1715689236212-69a951c04e19",
  ],
};

// Builds the image URL for a "pool:index" key at the requested width ("" if that photo does not exist yet).
function photoFor(key, width = 600) {
  const [pool, index] = key.split(":");
  const id = (photoPool[pool] || [])[index];
  if (!id) return "";
  const host = id.startsWith("premium_photo") ? "plus" : "images";
  return `https://${host}.unsplash.com/${id}?w=${width}&q=75&auto=format&fit=crop`;
}

// Categories are used by the hero search dropdown. "tint" is the colour behind a photo while it loads.
const categories = {
  cattle: { label: "Cattle and buffalo", tint: "#E7EDF6" },
  goat: { label: "Goats and sheep", tint: "#FDECEC" },
  poultry: { label: "Poultry and birds", tint: "#EDEFF3" },
  horse: { label: "Horses", tint: "#EEF3E6" },
};

// The small round photos above the featured list. "photo" is the picture shown in the circle.
const animals = {
  cow: { label: "Cows", category: "cattle", photo: "cow:0" },
  buffalo: { label: "Buffalo", category: "cattle", photo: "buffalo:1" },
  goat: { label: "Goats", category: "goat", photo: "goat:0" },
  horse: { label: "Horses", category: "horse", photo: "horse:0" },
  hen: { label: "Hens", category: "poultry", photo: "hen:1" },
};

// The photo tiles in "Find animals in your city".
const cities = {
  Islamabad: { photo: "goat:1", blurb: "Milking goats, hens and farm stock near the capital." },
  Rawalpindi: { photo: "goat:0", blurb: "Beetal bakras, horses and hens from the twin-city mandis." },
  Lahore: { photo: "cow:0", blurb: "Sahiwal cows, buffalo and top dairy breeds." },
  Karachi: { photo: "goat:2", blurb: "Qurbani bakras, cows and more from Sindh." },
};
const otherCities = ["Faisalabad", "Multan", "Peshawar"];

// One row per ad: title, city, detail, price, animal, posted, photo, featured (1 = shown in "Featured animals").
const rawListings = [
  ["Sahiwal cow, 3 years", "Lahore", "Gives 14 L milk a day", 285000, "cow", "2 hrs ago", "cow:0", 1],
  ["Nili Ravi buffalo, 4 years", "Faisalabad", "18 L milk a day", 340000, "buffalo", "5 hrs ago", "buffalo:1", 1],
  ["Beetal bakra, 18 months", "Rawalpindi", "62 kg, ready for Qurbani", 148000, "goat", "1 day ago", "goat:0", 1],
  ["Marwari horse, 6 years", "Lahore", "Trained for riding", 410000, "horse", "8 hrs ago", "horse:0", 1],
  ["Cholistani cow with calf", "Multan", "Calf is 2 months old", 230000, "cow", "1 day ago", "cow:1", 1],
  ["Teddy bakra pair", "Karachi", "Both 1 year, vaccinated", 96000, "goat", "3 hrs ago", "goat:2", 1],
  ["Desi hens, set of 6", "Islamabad", "Laying, vaccinated", 9600, "hen", "4 hrs ago", "hen:1", 1],
  ["Kamori goat, 2 years", "Islamabad", "Milking, 3 L a day", 78000, "goat", "2 days ago", "goat:1", 1],
  ["Azakheli buffalo, 5 years", "Peshawar", "16 L milk a day", 310000, "buffalo", "6 hrs ago", "buffalo:0", 0],
  ["Red Sindhi cow", "Karachi", "Calm, 10 L a day", 240000, "cow", "1 day ago", "cow:3", 0],
  ["Kathiawari horse, 4 years", "Rawalpindi", "Healthy, good for shows", 360000, "horse", "2 days ago", "horse:1", 0],
  ["Fancy hens, pair", "Rawalpindi", "Healthy, 8 months old", 12500, "hen", "6 hrs ago", "hen:0", 0],
  ["Barbari goat, 1 year", "Karachi", "Vaccinated, 38 kg", 72000, "goat", "5 hrs ago", "goat:3", 0],
  ["Nili Ravi buffalo calf", "Lahore", "3 months old", 120000, "buffalo", "1 day ago", "buffalo:2", 0],
  ["Aseel hens, set of 4", "Lahore", "Show quality", 14800, "hen", "1 hr ago", "hen:2", 0],
  ["Beetal goat pair", "Islamabad", "Both 2 years", 135000, "goat", "3 days ago", "goat:5", 0],
  ["Sahiwal bull, 3 years", "Rawalpindi", "Strong, 420 kg", 195000, "cow", "2 days ago", "cow:2", 0],
];

const listings = rawListings.map(([title, city, detail, price, animal, posted, photo, isFeatured]) => ({
  title,
  city,
  detail,
  price,
  animal,
  category: animals[animal].category,
  posted,
  photo,
  tag: "Verified",
  featured: Boolean(isFeatured),
}));

const recentListings = [
  {
    title: "Holstein Friesian heifer",
    city: "Okara",
    price: 265000,
    category: "cattle",
    posted: "6 min ago",
    photo: "cow:3",
  },
  {
    title: "Barbari goat, 1 year",
    city: "Sargodha",
    price: 72000,
    category: "goat",
    posted: "14 min ago",
    photo: "goat:3",
  },
  {
    title: "Azakheli buffalo",
    city: "Peshawar",
    price: 310000,
    category: "cattle",
    posted: "28 min ago",
    photo: "buffalo:0",
  },
  {
    title: "Teddy bakra, 1 year",
    city: "Karachi",
    price: 58000,
    category: "goat",
    posted: "41 min ago",
    photo: "goat:4",
  },
  {
    title: "Aseel hens, set of 4",
    city: "Lahore",
    price: 14800,
    category: "poultry",
    posted: "1 hr ago",
    photo: "hen:2",
  },
  { title: "Sahiwal bull", city: "Sahiwal", price: 195000, category: "cattle", posted: "2 hrs ago", photo: "cow:2" },
];

// Extra ads that appear one by one in the "Fresh ads, posted live" list.
const liveFeedPool = [
  { title: "Nili Ravi buffalo calf", city: "Sargodha", price: 120000, category: "cattle", photo: "buffalo:2" },
  { title: "Beetal goat pair", city: "Lahore", price: 135000, category: "goat", photo: "goat:5" },
  { title: "Desi hens, set of 8", city: "Faisalabad", price: 15200, category: "poultry", photo: "hen:3" },
  { title: "Red Sindhi cow", city: "Hyderabad", price: 240000, category: "cattle", photo: "cow:0" },
  { title: "Barbari bakra", city: "Islamabad", price: 88000, category: "goat", photo: "goat:6" },
  { title: "Golden hens, pair", city: "Multan", price: 11000, category: "poultry", photo: "hen:4" },
];

/* ---------- 3. Rendering ---------- */

// Fills every <img data-photo="pool:index"> in the HTML (used by the call-to-action photos).
function fillStaticPhotos() {
  qsa("img[data-photo]").forEach((img) => {
    img.src = photoFor(img.dataset.photo, Number(img.dataset.w) || 600);
  });
}

// One listing card (used in "Featured animals" and in "Find animals in your city").
// The logo placeholder sits under the photo, so a missing photo still looks fine.
function listingCardHTML(listing) {
  const category = categories[listing.category];
  const photo = photoFor(listing.photo, 640);

  return `
    <article class="card">
      <div class="thumb" style="--t:${category.tint}">
        <i class="art zoom ${listing.category}"></i>
        ${photo ? `<img src="${photo}" alt="${listing.title}" loading="lazy">` : ""}
        <span class="badge">${icon("shield")}${listing.tag}</span>
        <button class="heart" aria-label="Save ad">${icon("heart")}</button>
      </div>
      <div class="body">
        <span class="price">${formatPrice(listing.price)}</span>
        <h3>${listing.title}</h3>
        <p>${listing.detail}</p>
        <div class="meta">
          <span>${icon("pin")} ${listing.city}</span>
          <span>${icon("clock")} ${listing.posted}</span>
        </div>
        <a class="call" href="#">${icon("phone")} Call seller</a>
      </div>
    </article>`;
}

// One row in the "Recently added" list.
function recentRowHTML(listing) {
  const category = categories[listing.category];

  return `
    <div class="row">
      <span class="tb" style="--t:${category.tint}"><img src="${photoFor(listing.photo, 200)}" alt="${listing.title}" loading="lazy"></span>
      <div>
        <h3>${listing.title}</h3>
        <p>${icon("pin")} ${listing.city}</p>
      </div>
      <div class="r">
        <b>${formatPrice(listing.price)}</b>
        <span>${listing.posted}</span>
      </div>
    </div>`;
}

// The city photo tiles (same accordion design as before, one tile per city).
function renderCityTiles() {
  qs("#cityTiles").innerHTML = Object.entries(cities)
    .map(([name, city]) => {
      const count = listings.filter((listing) => listing.city === name).length;
      return `
      <a class="tile city-tile" href="#cityList" data-city="${name}">
        <img src="${photoFor(city.photo, 900)}" alt="" loading="lazy">
        <div class="tile-body">
          <div>
            <h3>${name}</h3>
            <small>${count} animals for sale</small>
            <span class="blurb">${city.blurb}</span>
          </div>
          <span class="go">${icon("arrow")}</span>
        </div>
      </a>`;
    })
    .join("");
}

// Small buttons for the other cities.
function renderCityPills() {
  qs("#cityPills").insertAdjacentHTML(
    "beforeend",
    otherCities.map((name) => `<button class="pill city-pill" data-city="${name}">${name}</button>`).join(""),
  );
}

// Category options inside the hero search dropdown.
function renderCategoryOptions() {
  const options = Object.entries(categories)
    .map(([key, category]) => `<option value="${key}">${category.label}</option>`)
    .join("");

  qs("#sc").insertAdjacentHTML("beforeend", options);
}

// Small round animal photos above the featured grid ("All" plus one per animal).
function renderAnimalAvatars() {
  const photoAvatars = Object.entries(animals)
    .map(([key, animal]) => {
      const photo = photoFor(animal.photo, 160);
      return `
      <button class="avatar" data-animal="${key}" aria-pressed="false">
        <span class="avatar-img" style="--t:${categories[animal.category].tint}">
          <i class="art zoom ${animal.category}"></i>${photo ? `<img src="${photo}" alt="">` : ""}
        </span>
        <span>${animal.label}</span>
      </button>`;
    })
    .join("");

  qs("#avatars").innerHTML = `
    <button class="avatar" data-animal="all" aria-pressed="true">
      <span class="avatar-img"><i class="art"></i></span><span>All</span>
    </button>${photoAvatars}`;
}

function renderRecentList() {
  qs("#rec").innerHTML = recentListings.map(recentRowHTML).join("");
}

/* ---------- 4. Filtering and search ---------- */

// Filters for the "Featured animals" grid. "all" or an empty string means "do not filter on this".
const freshFilters = (changes = {}) => ({ category: "all", animal: "all", keyword: "", city: "", ...changes });
let filters = freshFilters();

// The city picked in "Find animals in your city" ("" = every city).
let selectedCity = "";

function matchesFilters(listing) {
  const keyword = filters.keyword.toLowerCase();
  const searchableText =
    `${listing.title} ${listing.city} ${listing.detail} ${animals[listing.animal].label}`.toLowerCase();

  return (
    (filters.category === "all" || listing.category === filters.category) &&
    (filters.animal === "all" || listing.animal === filters.animal) &&
    (!filters.city || listing.city === filters.city) &&
    (!keyword || searchableText.includes(keyword))
  );
}

// Shown in the featured grid when no listing matches the current search.
function emptyStateHTML() {
  const forKeyword = filters.keyword ? ` for "${filters.keyword}"` : "";

  return `
    <div class="empty">
      <p>No ads${forKeyword} match yet. Be the first to post one, or try another search.</p>
      <a class="btn" href="#post">Post free ad</a>
      <button class="btn" style="background:var(--navy)" id="reset">Show all ads</button>
    </div>`;
}

// The page got taller or shorter, so tell ScrollTrigger (the pinned "How it works" section needs this).
function refreshScrollPositions() {
  if (canAnimate) ScrollTrigger.refresh();
}

// Redraws the featured grid. Pass animate = true to play the entrance animation.
function renderFeatured(animate) {
  // With no filters the grid shows only the hand-picked (featured) ads.
  const isDefaultView = JSON.stringify(filters) === JSON.stringify(freshFilters());
  const matches = listings
    .filter((listing) => matchesFilters(listing) && (!isDefaultView || listing.featured))
    .slice(0, 8);

  // Highlight the active animal avatar.
  qsa(".avatar").forEach((avatar) => {
    const isOn = avatar.dataset.animal === filters.animal;
    avatar.classList.toggle("on", isOn);
    avatar.setAttribute("aria-pressed", isOn);
  });

  qs("#grid").innerHTML = matches.length ? matches.map(listingCardHTML).join("") : emptyStateHTML();

  if (canAnimate && hasHover) setupCardTilt(qs("#grid"));
  if (animate && canAnimate && matches.length) {
    gsap.from("#grid .card", {
      y: 60,
      rotationX: -14,
      opacity: 0,
      transformPerspective: 900,
      stagger: 0.07,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "all",
    });
  }
  if (animate) refreshScrollPositions();
}

// Redraws the city list under the city tiles, using the selected city.
function renderCityList(animate) {
  const matches = listings.filter((listing) => !selectedCity || listing.city === selectedCity).slice(0, 8);

  qs("#cityTitle").textContent = selectedCity ? `Animals in ${selectedCity}` : "Animals in Pakistan";
  qs("#cityCount").textContent = selectedCity
    ? `${matches.length} animals for sale in ${selectedCity}`
    : "Pick a city above to see only the animals for sale there.";
  qs("#cityReset").hidden = !selectedCity;

  // Mark the chosen city tile / button.
  qsa(".city-tile, .city-pill").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.city === selectedCity);
  });

  qs("#cityGrid").innerHTML = matches.length
    ? matches.map(listingCardHTML).join("")
    : `<div class="empty"><p>No animals listed in ${selectedCity} yet. Be the first to post one.</p>
         <a class="btn" href="#post">Post free ad</a><button class="btn city-reset" style="background:var(--navy)">Show all cities</button></div>`;

  if (canAnimate && hasHover) setupCardTilt(qs("#cityGrid"));
  if (animate && canAnimate && matches.length) {
    gsap.from("#cityGrid .card", {
      y: 50,
      opacity: 0,
      scale: 0.96,
      stagger: 0.07,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "all",
    });
  }
  if (animate) refreshScrollPositions();
}

// A city was chosen (or "" for all cities): filter the list and scroll down to it.
function selectCity(city) {
  selectedCity = city;
  renderCityList(true);
  qs("#cityList").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
}

// Apply new featured filters, redraw, and scroll down to the results.
function applyFiltersAndScroll(newFilters) {
  filters = newFilters;
  renderFeatured(true);
  qs("#featured").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

/* ---------- 5. Click handling ---------- */

function setMenuOpen(isOpen) {
  const burger = qs("#burger");
  qs("#nav").classList.toggle("open", isOpen);
  burger.setAttribute("aria-expanded", isOpen); // the CSS turns the three lines into a cross when this is "true"
  burger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

// Escape closes the mobile menu.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

// Hero search form.
qs("#search").addEventListener("submit", (event) => {
  event.preventDefault();

  applyFiltersAndScroll(
    freshFilters({ category: qs("#sc").value, city: qs("#sw").value, keyword: qs("#sq").value.trim() }),
  );
});

// One listener handles every button on the page (event delegation).
document.addEventListener("click", (event) => {
  const target = event.target.closest(
    ".avatar, .city-tile, .city-pill, .city-reset, .tg, .heart, #reset, #all, #burger, #menu a",
  );
  if (!target) return;

  if (target.matches(".avatar")) {
    // Round animal photo: filter the featured grid (it is right below, so no scrolling)
    filters = freshFilters({ animal: target.dataset.animal });
    renderFeatured(true);
  } else if (target.matches(".city-tile, .city-pill")) {
    // City tile or button
    event.preventDefault();
    selectCity(target.dataset.city);
  } else if (target.matches(".city-reset")) {
    selectCity("");
  } else if (target.matches(".tg")) {
    // Popular search button
    applyFiltersAndScroll(freshFilters({ keyword: target.dataset.q }));
  } else if (target.matches("#reset, #all")) {
    // "Show all ads" / "View all ads"
    applyFiltersAndScroll(freshFilters());
  } else if (target.matches(".heart")) {
    // Save / unsave an ad
    target.classList.toggle("on");
    if (canAnimate) {
      gsap.fromTo(target, { scale: 0.5 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
    }
  } else if (target.matches("#burger")) {
    // Mobile menu button
    setMenuOpen(!qs("#nav").classList.contains("open"));
  } else {
    // A link inside the mobile menu
    setMenuOpen(false);
  }
});

/* ---------- 6. Animations ---------- */

// Shared ScrollTrigger settings: play once when the element reaches the lower part of the screen.
const onScroll = (trigger, start = "top 85%") => ({ trigger, start, once: true });

// Splits a heading into words, each inside a mask, so the words can slide up one by one.
function splitWords(element) {
  const words = element.textContent.trim().split(/\s+/);
  element.innerHTML = words.map((word) => `<span class="w"><span>${word}</span></span>`).join(" ");
  return qsa(".w > span", element);
}

/* 6a. Page loader: red curtain with the logo drawing itself, then it lifts away. */
function playLoader(onDone) {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = '<i class="art"></i>';
  document.body.append(loader);

  gsap
    .timeline({ onComplete: () => loader.remove() })
    .fromTo(
      ".loader .art",
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power2.inOut" },
    )
    .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.15")
    .add(onDone, "-=0.5");
}

/* 6b. Hero: headline lines, photo collage reveal, floating cards, parallax. */
function playHeroIntro() {
  const sellerCount = qs("#vs");
  sellerCount.textContent = "0";

  gsap
    .timeline({ defaults: { ease: "power4.out" } })
    .from(".nav", { yPercent: -100, duration: 0.8 })
    .from(".ln > span", { yPercent: 115, duration: 1.1, stagger: 0.12 }, "<0.1")
    .from(".sub", { y: 24, opacity: 0, duration: 0.8 }, "-=0.7")
    .from(".hero-swoosh path", { strokeDashoffset: 1, duration: 1, ease: "power2.inOut" }, "-=0.6")
    .from(".hero-cta .btn", { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.8")
    .from(".v-blob", { scale: 0, duration: 1.2, ease: "elastic.out(1, 0.6)" }, "-=1")
    .fromTo(
      ".ph",
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.2 },
      "-=0.9",
    )
    .from(".ph img", { scale: 1.45, duration: 1.8, stagger: 0.2 }, "<")
    .from(".spin", { scale: 0, rotate: -120, duration: 1, ease: "back.out(1.8)" }, "-=1")
    .from(".float", { scale: 0.4, opacity: 0, duration: 0.8, stagger: 0.15, ease: "back.out(2)" }, "-=0.7")
    .from(".search", { y: 50, opacity: 0, duration: 0.9 }, "-=1.1")
    .from(".under > *", { y: 20, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.6")
    .add(() => {
      // Floating cards bob gently forever (yPercent so it does not fight the mouse parallax).
      qsa(".float").forEach((card, index) => {
        gsap.to(card, {
          yPercent: index ? 8 : -8,
          duration: 2.4 + index * 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Count up the verified sellers number.
      const counter = { value: 0 };
      gsap.to(counter, {
        value: 7200,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          sellerCount.textContent = Math.round(counter.value).toLocaleString() + "+";
        },
      });

      setupRotatingWord();
      setupHeroParallax();
    }, "-=0.6");
}

// The red word in the headline slides between cows, goats, buffalo and hens.
function setupRotatingWord() {
  const wrapper = qs(".rot");
  const stack = qs(".rot-in");
  const words = qsa(".rot-in span");
  let current = 0;

  const widthOf = (index) => words[index].getBoundingClientRect().width;
  gsap.set(wrapper, { width: widthOf(0) });
  window.addEventListener("resize", () => gsap.set(wrapper, { width: widthOf(current) }));

  setInterval(() => {
    current = (current + 1) % words.length;
    gsap.to(stack, { yPercent: (-100 * current) / words.length, duration: 0.8, ease: "power4.inOut" });
    gsap.to(wrapper, { width: widthOf(current), duration: 0.8, ease: "power4.inOut" });
  }, 2400);
}

// Photos, badge and cards drift at different speeds as the mouse moves, and the whole collage scrolls slower than the page.
function setupHeroParallax() {
  if (hasHover) {
    const layers = [
      [".ph-cow", 18],
      [".ph-buf", -28],
      [".f1", 36],
      [".f2", -24],
      [".spin", 16],
    ];

    qs(".hero").addEventListener("pointermove", (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      layers.forEach(([selector, depth]) => {
        gsap.to(selector, { x: x * depth, y: y * depth, duration: 0.9, ease: "power2.out", overwrite: "auto" });
      });
    });
  }

  gsap.to(".vis", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
}

/* 6c. Navbar: hides when scrolling down, returns when scrolling up; red progress bar on top. */
function setupNavbar() {
  const nav = qs("#nav");
  const progressBar = qs("#progress");

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const scrolled = self.scroll();
      nav.classList.toggle("scrolled", scrolled > 10);
      nav.classList.toggle("hide", self.direction === 1 && scrolled > 240 && !nav.classList.contains("open"));
      progressBar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

/* 6d. City marquee: loops forever and speeds up while the page is scrolling. */
function setupMarquee() {
  const track = qs("#mq");
  track.innerHTML += track.innerHTML; // duplicate so the loop has no gap

  const loop = gsap.to(track, { xPercent: -50, duration: 34, ease: "none", repeat: -1 });

  ScrollTrigger.create({
    onUpdate: (self) => {
      gsap.killTweensOf(loop);
      const boost = 1 + Math.abs(self.getVelocity()) / 250;
      gsap.to(loop, {
        timeScale: boost,
        duration: 0.2,
        onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.2 }),
      });
    },
  });
}

/* 6e. Section headings, animal avatars, city tiles, city list and featured cards. */
function setupSectionReveals() {
  // Every heading marked data-split slides up word by word.
  qsa("[data-split]").forEach((heading) => {
    gsap.from(splitWords(heading), {
      yPercent: 110,
      rotate: 4,
      duration: 0.9,
      stagger: 0.07,
      ease: "power4.out",
      scrollTrigger: onScroll(heading, "top 88%"),
    });
  });
  qsa(".head p").forEach((text) => {
    gsap.from(text, { y: 20, opacity: 0, duration: 0.8, scrollTrigger: onScroll(text, "top 92%") });
  });

  // Featured: round animal photos pop in, then the cards.
  gsap.from(".avatar", {
    scale: 0.5,
    opacity: 0,
    y: 20,
    stagger: 0.08,
    duration: 0.6,
    ease: "back.out(2)",
    scrollTrigger: onScroll("#avatars", "top 92%"),
  });
  gsap.from("#grid .card", {
    y: 80,
    rotationX: -14,
    opacity: 0,
    transformPerspective: 900,
    stagger: 0.08,
    duration: 0.9,
    ease: "power3.out",
    clearProps: "all",
    scrollTrigger: onScroll("#grid"),
  });

  // Cities: tiles are revealed with a clip, and each photo drifts inside its tile while scrolling.
  gsap.fromTo(
    ".city-tile",
    { clipPath: "inset(100% 0% 0% 0% round 30px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 30px)",
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      clearProps: "clipPath",
      scrollTrigger: onScroll("#cityTiles"),
    },
  );
  qsa(".city-tile img").forEach((image) => {
    gsap.fromTo(
      image,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: image.closest(".tile"), start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });
  gsap.from(".city-pill", {
    scale: 0.7,
    opacity: 0,
    stagger: 0.06,
    duration: 0.5,
    ease: "back.out(2)",
    scrollTrigger: onScroll("#cityPills", "top 92%"),
  });
  gsap.from(".city-head > *", {
    y: 24,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    scrollTrigger: onScroll(".city-head", "top 88%"),
  });
  gsap.from("#cityGrid .card", {
    y: 70,
    rotationX: -12,
    opacity: 0,
    transformPerspective: 900,
    stagger: 0.07,
    duration: 0.9,
    ease: "power3.out",
    clearProps: "all",
    scrollTrigger: onScroll("#cityGrid", "top 88%"),
  });
}

// 3D tilt: each card leans towards the mouse and settles back when it leaves.
function setupCardTilt(scope = document) {
  qsa(".card", scope).forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      gsap.to(card, {
        rotationY: x * 10,
        rotationX: -y * 10,
        transformPerspective: 900,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "power3.out" });
    });
  });
}

/* 6f. Recently added: rows slide in, the counter counts up, and a new ad drops in every few seconds. */
function setupRecentSection() {
  const list = qs("#rec");
  const todayCount = qs("#todayCount");
  let adsToday = 1248;
  let feedIndex = 0;

  gsap.from(".recent-side p, .live, #all", {
    y: 24,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    scrollTrigger: onScroll(".recent-side", "top 80%"),
  });
  gsap.from(".row", {
    x: 60,
    opacity: 0,
    stagger: 0.09,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: onScroll("#rec", "top 88%"),
  });

  // Count up the first time the section is seen.
  const counter = { value: 0 };
  gsap.to(counter, {
    value: adsToday,
    duration: 2.2,
    ease: "power2.out",
    scrollTrigger: onScroll(".live", "top 90%"),
    onUpdate: () => {
      todayCount.textContent = Math.round(counter.value).toLocaleString();
    },
  });

  setInterval(() => {
    if (document.hidden) return;

    const next = { ...liveFeedPool[feedIndex % liveFeedPool.length], posted: "Just now" };
    feedIndex += 1;
    list.insertAdjacentHTML("afterbegin", recentRowHTML(next));
    const newRow = list.firstElementChild;

    // The new row grows open and flashes red-tinted; the oldest row collapses away.
    gsap.from(newRow, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(
      newRow,
      { backgroundColor: "#FDECEC" },
      { backgroundColor: "rgba(253,236,236,0)", duration: 3, clearProps: "backgroundColor" },
    );

    if (list.children.length > recentListings.length) {
      const oldest = list.lastElementChild;
      gsap.to(oldest, {
        height: 0,
        opacity: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.6,
        onComplete: () => oldest.remove(),
      });
    }

    adsToday += 1;
    todayCount.textContent = adsToday.toLocaleString();
  }, 5500);
}

// Buttons with the "magnetic" class lean towards the cursor.
function setupMagneticButtons() {
  if (!hasHover) return;

  qsa(".magnetic").forEach((button) => {
    const moveX = gsap.quickTo(button, "x", { duration: 0.5, ease: "power3" });
    const moveY = gsap.quickTo(button, "y", { duration: 0.5, ease: "power3" });

    button.addEventListener("pointermove", (event) => {
      const box = button.getBoundingClientRect();
      moveX((event.clientX - box.left - box.width / 2) * 0.35);
      moveY((event.clientY - box.top - box.height / 2) * 0.35);
    });
    button.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

/* 6g. Call to action and footer. */
function setupCtaAndFooter() {
  gsap.from(".cta", {
    scale: 0.92,
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: onScroll(".cta", "top 92%"),
  });
  gsap.from(".cta p, .cta .btns", {
    y: 30,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    scrollTrigger: onScroll(".cta", "top 70%"),
  });

  // The three photos start stacked and fan out as the block scrolls into view.
  const spread = () => (window.innerWidth < 480 ? 56 : window.innerWidth < 700 ? 80 : 140);
  qsa(".fan figure").forEach((photo, index) => {
    const offset = index - 1; // -1, 0, 1
    gsap.fromTo(
      photo,
      { x: 0, y: 30, rotation: 0 },
      {
        x: () => offset * spread(),
        y: Math.abs(offset) * 14,
        rotation: offset * 9,
        ease: "none",
        scrollTrigger: { trigger: ".cta", start: "top 85%", end: "center 55%", scrub: 0.6, invalidateOnRefresh: true },
      },
    );
  });

  gsap.from(".fg > div", {
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: onScroll(".fg", "top 90%"),
  });
  gsap.from(".mega", {
    yPercent: 70,
    opacity: 0,
    duration: 1.4,
    ease: "power4.out",
    scrollTrigger: onScroll(".mega", "top 100%"),
  });
}

/* 6h. Seller testimonials: arrows, dots, swipe, keyboard and autoplay.
   Works without animation too (reduced motion, or GSAP not loaded): the slides just swap. */

// Puts every animated part of a slide into its hidden starting state.
function prepareSlide(slide) {
  const part = (selector) => qsa(selector, slide);

  gsap.set(part(".testimonial-label, .testimonial-rating"), { y: 20, opacity: 0 });
  gsap.set(part(".quote-mark"), { scale: 0, rotation: -20, opacity: 0 });
  gsap.set(part("blockquote"), { y: 35, opacity: 0 });
  gsap.set(part(".seller-info"), { y: 25, opacity: 0 });
  gsap.set(part(".visual-circle"), { scale: 0.75, opacity: 0 });
  gsap.set(part(".visual-card-main"), { y: 80, rotation: 5, opacity: 0 });
  gsap.set(part(".visual-card-small"), { x: -40, opacity: 0 });
  gsap.set(part(".floating-dot"), { scale: 0, opacity: 0 });
}

// Brings the parts of a slide in one after another.
function animateSlideContent(slide) {
  const part = (selector) => qsa(selector, slide);

  return gsap
    .timeline()
    .to(part(".testimonial-label, .testimonial-rating"), {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    })
    .to(part(".quote-mark"), { scale: 1, rotation: 0, opacity: 1, duration: 0.65, ease: "back.out(1.7)" }, "-=0.3")
    .to(part("blockquote"), { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.4")
    .to(part(".seller-info"), { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.35")
    .to(part(".visual-circle"), { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.75")
    .to(part(".visual-card-main"), { y: 0, rotation: 0, opacity: 1, duration: 0.85, ease: "power3.out" }, "-=0.6")
    .to(part(".visual-card-small"), { x: 0, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }, "-=0.5")
    .to(part(".floating-dot"), { scale: 1, opacity: 1, duration: 0.45, stagger: 0.1, ease: "back.out(2)" }, "-=0.45");
}

function setupTestimonials() {
  const section = qs(".testimonial-section");
  if (!section) return;

  const slider = qs(".testimonial-slider");
  const slides = qsa(".testimonial-slide");
  const dots = qsa(".testimonial-dot");
  const counter = qs(".testimonial-counter b");
  const progressLine = qs(".testimonial-line span");

  let current = 0;
  let isAnimating = false;
  let autoplay = null;

  // Dots, counter, progress bar and screen-reader flags.
  function updateUI(index) {
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    slides.forEach((slide, slideIndex) => slide.setAttribute("aria-hidden", slideIndex !== index));
    counter.textContent = String(index + 1).padStart(2, "0");

    const width = `${((index + 1) / slides.length) * 100}%`;
    if (canAnimate) gsap.to(progressLine, { width, duration: 0.45, ease: "power2.out" });
    else progressLine.style.width = width;
  }

  // Change slide. direction: 1 = next (slides in from the right), -1 = previous.
  function goTo(nextIndex, direction = 1) {
    if (isAnimating || nextIndex === current) return;

    // No animation available: just swap which slide is visible.
    if (!canAnimate) {
      slides.forEach((slide, index) => slide.classList.toggle("active", index === nextIndex));
      current = nextIndex;
      updateUI(nextIndex);
      return;
    }

    isAnimating = true;
    const currentSlide = slides[current];
    const nextSlide = slides[nextIndex];

    prepareSlide(nextSlide);
    gsap.set(nextSlide, { xPercent: direction > 0 ? 100 : -100, autoAlpha: 1, zIndex: 2 });
    gsap.set(currentSlide, { zIndex: 1 });

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(currentSlide, { autoAlpha: 0, xPercent: 0 });
          nextSlide.classList.add("active");
          currentSlide.classList.remove("active");
          current = nextIndex;
          isAnimating = false;
        },
      })
      .to(currentSlide, { xPercent: direction > 0 ? -30 : 30, autoAlpha: 0, duration: 0.7, ease: "power3.inOut" })
      .to(nextSlide, { xPercent: 0, duration: 0.85, ease: "power3.out" }, "<0.08")
      .add(animateSlideContent(nextSlide), "-=0.5");

    updateUI(nextIndex);
  }

  const next = () => goTo((current + 1) % slides.length, 1);
  const previous = () => goTo((current - 1 + slides.length) % slides.length, -1);

  // Any manual action restarts the autoplay countdown.
  let inView = false;
  let hovering = false;
  const syncAutoplay = () => autoplay && autoplay.paused(!inView || hovering);
  const restartAutoplay = () => {
    if (!autoplay) return;
    autoplay.restart(true);
    syncAutoplay();
  };

  qs(".testimonial-next").addEventListener("click", () => {
    next();
    restartAutoplay();
  });
  qs(".testimonial-prev").addEventListener("click", () => {
    previous();
    restartAutoplay();
  });
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goTo(index, index > current ? 1 : -1);
      restartAutoplay();
    });
  });

  // Arrow keys only work while keyboard focus is inside this section (so they never hijack the page).
  section.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      next();
      restartAutoplay();
    }
    if (event.key === "ArrowLeft") {
      previous();
      restartAutoplay();
    }
  });

  // Swipe left / right on touch screens.
  let swipeStartX = null;
  slider.addEventListener("pointerdown", (event) => {
    swipeStartX = event.clientX;
  });
  slider.addEventListener("pointercancel", () => {
    swipeStartX = null;
  });
  slider.addEventListener("pointerup", (event) => {
    if (swipeStartX === null) return;
    const distance = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) < 50) return;

    if (distance < 0) next();
    else previous();
    restartAutoplay();
  });

  updateUI(0);
  if (!canAnimate) return;

  /* ----- Animated extras (only when motion is allowed) ----- */

  // First slide: hidden until the section scrolls into view.
  slides.forEach((slide, index) => gsap.set(slide, { autoAlpha: index === 0 ? 1 : 0 }));
  prepareSlide(slides[0]);
  gsap.set(".testimonial-wrap", { y: 70, opacity: 0 });

  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    once: true,
    onEnter: () => {
      gsap.to(".testimonial-wrap", { y: 0, opacity: 1, duration: 1, ease: "power3.out" });
      gsap.delayedCall(0.15, () => animateSlideContent(slides[0]));
    },
  });

  // Decorations float gently on every slide.
  slides.forEach((slide) => {
    gsap.to(qs(".visual-card-small", slide), { y: -10, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(qs(".dot-one", slide), { y: -15, x: 8, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(qs(".dot-two", slide), { y: 12, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  });

  // Autoplay: advances every 5.5 s, but only while the section is on screen and not hovered with a mouse.
  autoplay = gsap.delayedCall(5.5, () => {
    next();
    restartAutoplay();
  });
  autoplay.pause();

  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      inView = self.isActive;
      syncAutoplay();
    },
  });
  section.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") {
      hovering = true;
      syncAutoplay();
    }
  });
  section.addEventListener("pointerleave", () => {
    hovering = false;
    syncAutoplay();
  });
}

/* 6i. How Apna Janwar works: the section pins to the screen and the three cards slide up one after another. */
function setupProcessCards() {
  const section = qs(".aj-process");
  const stage = qs(".aj-process-stage");
  const cards = qsa(".aj-process-card");
  if (!section || !stage || !cards.length) return;

  // Switches the CSS from the simple stacked layout to the pinned layout.
  section.classList.add("is-live");

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + window.innerHeight * cards.length, // one screen of scrolling per card
      scrub: true,
      pin: stage, // GSAP adds the scroll distance itself, so the section needs no fixed height in CSS
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Each card starts fully below the stage (so no edge peeks out) and rises into place.
  cards.forEach((card) => {
    timeline.fromTo(card, { y: () => stage.offsetHeight }, { y: 0, duration: 1, ease: "none" });
  });

  // Short pause so the last card rests on screen before the page scrolls on.
  timeline.to({}, { duration: 0.35 });
}

/* ---------- 7. Start ---------- */

fillStaticPhotos();
renderCityTiles();
renderCityPills();
renderCategoryOptions();
renderAnimalAvatars();
renderRecentList();
renderFeatured(false);
renderCityList(false);

if (canAnimate) {
  gsap.registerPlugin(ScrollTrigger);

  setupNavbar();
  setupMarquee();
  setupSectionReveals();
  setupRecentSection();
  setupProcessCards();
  setupMagneticButtons();
  setupCtaAndFooter();
  playLoader(playHeroIntro);

  // Photos and fonts can change the layout, so recalculate the scroll positions once everything is loaded.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// The testimonial slider works with or without animation.
setupTestimonials();