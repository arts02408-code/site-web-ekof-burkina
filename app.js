(() => {
  "use strict";

  const config = window.EKOF_CONFIG;
  const view = document.getElementById("app-view");
  const pageSize = 12;
  const currency = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0
  });
  let categories = [];
  let brands = [];
  let categoryLoadError = "";
  let brandLoadError = "";
  let requestVersion = 0;

  document.getElementById("current-year").textContent = String(new Date().getFullYear());

  const phoneHref = (phone) => {
    const digits = String(phone).replace(/\D/g, "");
    return `tel:+${digits.length === 8 ? `226${digits}` : digits}`;
  };

  const populateFooterContacts = () => {
    const container = document.getElementById("footer-ekof-contacts");
    if (!container) return;
    const phones = [config.phone, config.phoneSecondary, ...(config.commercialPhones || [])]
      .filter(Boolean);
    const phoneMarkup = phones.map((phone) => `<a href="${phoneHref(phone)}">${escapeHtml(phone)}</a>`).join("");
    const whatsappMarkup = config.whatsappPhone
      ? `<a class="footer-whatsapp" href="https://wa.me/${escapeHtml(config.whatsappPhone)}" target="_blank" rel="noopener noreferrer"><span class="whatsapp-icon" aria-hidden="true">W</span><span>WhatsApp</span> ↗</a>`
      : "";
    const emailMarkup = config.email
      ? `<a class="footer-email" href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>`
      : "";
    container.innerHTML = `<div class="footer-phone-grid">${phoneMarkup}</div><div class="footer-contact-links">${whatsappMarkup}${emailMarkup}</div>`;
  };
  const formatPhoneHref = (phone) => {
    const digits = String(phone).replace(/\D/g, "");
    return phone ? `tel:+${digits.length === 8 ? `226${digits}` : digits}` : "";
  };
  const contactLinksMarkup = () => {
    const links = [];
    if (config.phone) links.push(`<a href="${formatPhoneHref(config.phone)}">${escapeHtml(config.phone)}</a>`);
    if (config.phoneSecondary) links.push(`<a href="${formatPhoneHref(config.phoneSecondary)}">${escapeHtml(config.phoneSecondary)}</a>`);
    (config.commercialPhones || []).forEach((phone) => links.push(`<a href="${formatPhoneHref(phone)}">${escapeHtml(phone)}</a>`));
    if (config.whatsappPhone) links.push(`<a href="https://wa.me/${escapeHtml(config.whatsappPhone)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
    if (config.email) links.push(`<a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>`);
    return links.length ? links.join("<br>") : "<span>Coordonnées EKOF à confirmer.</span>";
  };

  const faqMarkup = () => `<section class="section-block faq-section"><div class="section-heading"><div><p class="eyebrow">Aide</p><h2>Questions fréquentes</h2></div></div><div class="faq-list">
      <details><summary>Où puis-je consulter les produits EKOF ?</summary><p>Le catalogue présente les produits publiés par EKOF Burkina. Chaque fiche permet de consulter les informations disponibles et de demander une confirmation.</p></details>
      <details><summary>Comment vérifier la disponibilité ou obtenir un devis ?</summary><p>Utilisez le bouton WhatsApp de la fiche ou la page Contact. Indiquez le produit, sa référence ou le lien de la page pour obtenir une confirmation auprès de l'équipe EKOF.</p></details>
      <details><summary>Les prix affichés sont-ils définitifs ?</summary><p>Les prix publiés doivent être confirmés auprès de EKOF Burkina avant toute commande, car ils peuvent évoluer ou varier selon les disponibilités.</p></details>
      <details><summary>Comment connaître les modalités de livraison ou de paiement ?</summary><p>Ces modalités doivent être confirmées directement avec EKOF Burkina avant la commande, puisque aucune politique officielle n'est actuellement intégrée au catalogue.</p></details>
      </div></section>`;

  const videoMarkup = () => `<section class="section-block video-section"><div class="section-heading"><div><p class="eyebrow">EKOF en mouvement</p><h2>Découvrez EKOF BURKINA en vidéo</h2></div></div><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/KTjRMKTfcBY" title="Présentation vidéo EKOF BURKINA" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></section>`;

  const testimonialsMarkup = () => !Array.isArray(config.testimonials) || !config.testimonials.length ? "" : `<section class="section-block testimonials-section"><div class="section-heading"><div><p class="eyebrow">Avis clients</p><h2>Ils nous font confiance</h2></div></div><div class="testimonial-grid">${config.testimonials.map((testimonial) => `<article class="testimonial-card"><p class="testimonial-quote">${escapeHtml(testimonial.quote)}</p><strong>${escapeHtml(testimonial.name)}</strong><span>${escapeHtml(testimonial.service || "")}</span></article>`).join("")}</div></section>`;

  const locationMarkup = () => `<section class="location-section"><div class="location-copy"><p class="eyebrow">Nous rencontrer</p><h2>Retrouvez EKOF BURKINA</h2>${config.address
      ? `<p>${escapeHtml(config.address)}</p>`
      : `<p>L'adresse officielle EKOF Burkina doit encore être confirmée avant l'affichage public du texte complet.</p>`}${config.googleMapsUrl ? `<a class="button button-outline" href="${escapeHtml(config.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir dans Google Maps ↗</a>` : `<button class="button button-outline" type="button" disabled>Ouvrir dans Google Maps</button>`}</div><div class="map-frame">${config.googleMapsEmbedUrl ? `<iframe src="${escapeHtml(config.googleMapsEmbedUrl)}" title="Localisation EKOF Burkina sur Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>` : `<div class="map-placeholder"><span>Carte à configurer</span></div>`}</div></section>`;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  populateFooterContacts();

  const plainText = (html) => {
    const parsed = new DOMParser().parseFromString(String(html ?? ""), "text/html");
    return (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
  };

  const catalogueSourceNote = () => window.location.protocol === "file:"
    ? `Aperçu local capturé le ${window.EKOF_CATALOGUE_APERCU?.capturedAt || "date non précisée"} ; prix et disponibilités à confirmer auprès d'EKOF.`
    : "Prix et disponibilités du catalogue EKOF à confirmer auprès de l'équipe avant toute commande.";

  const loadLocalPreviewData = () => new Promise((resolve, reject) => {
    if (window.EKOF_CATALOGUE_APERCU) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = new URL("./catalogue-apercu.js", window.location.href).href;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Impossible de charger catalogue-apercu.js. Placez-le dans le même dossier qu'index.html."));
    document.head.append(script);
  });

  const safeImageUrl = (image, preferThumbnail = false) => {
    const candidate = preferThumbnail
      ? image?.thumbnail || image?.src || ""
      : image?.src || image?.thumbnail || "";
    try {
      const url = new URL(candidate);
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  };

  const money = (product) => {
    const price = Number(product?.prices?.price);
    if (!Number.isFinite(price) || price < 0 || !product?.prices?.currency_code) {
      return "Prix sur demande";
    }
    return `${currency.format(price)} ${product.prices.currency_code === "XOF" ? "FCFA" : product.prices.currency_code}`;
  };

  const availability = (product) => product?.is_in_stock === true
    ? "Indiqué en stock · à confirmer"
    : product?.is_on_backorder === true
      ? "Sur commande · à confirmer"
      : product?.is_in_stock === false
        ? "Indiqué indisponible · contactez EKOF"
        : "Disponibilité à confirmer";

  const priceMarkup = (product) => {
    const price = Number(product?.prices?.price);
    const regularPrice = Number(product?.prices?.regular_price);
    const currencyCode = product?.prices?.currency_code;
    const formattedRegularPrice = Number.isFinite(regularPrice) && currencyCode
      ? `${currency.format(regularPrice)} ${currencyCode === "XOF" ? "FCFA" : currencyCode}`
      : "";
    if (product?.on_sale === true && Number.isFinite(price) && Number.isFinite(regularPrice) && regularPrice > price) {
      return `<p class="product-price">${escapeHtml(money(product))} <del>${escapeHtml(formattedRegularPrice)}</del><small>Promotion publiée par EKOF</small></p>`;
    }
    return `<p class="product-price">${escapeHtml(money(product))}</p>`;
  };

  const productUrl = (product) =>
    window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? product.permalink || `https://ekofburkina.com/produit/${encodeURIComponent(product.slug)}/`
      : new URL(`./?produit=${encodeURIComponent(product.slug)}&id=${encodeURIComponent(product.id)}`, window.location.href).href;

  const whatsappUrl = (message) => {
    const phone = String(config?.whatsappPhone || "").replace(/\D/g, "");
    const destination = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    return `${destination}?text=${encodeURIComponent(message)}`;
  };

  const whatsappMessage = (product, intent = "disponibilité") => {
    const lines = [
      `Bonjour EKOF, je souhaite vérifier la ${intent} de ce produit.`,
      `Produit : ${plainText(product.name)}`,
      `Référence : ${product.sku || "non communiquée"}`,
      `Prix affiché : ${money(product)}`,
      `Lien : ${productUrl(product)}`
    ];
    return lines.join("\n");
  };

  const contactMessage = (subject = "un renseignement") =>
    `Bonjour EKOF, je souhaite vous contacter pour ${subject}.`;

  const waLink = (message, label, className = "button button-whatsapp") =>
    `<a class="${className}" href="${escapeHtml(whatsappUrl(message))}" target="_blank" rel="noopener noreferrer">${label}</a>`;

  const route = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      view: params.get("vue") || (params.has("produit") ? "produit" : "accueil"),
      productId: params.get("id") || "",
      productSlug: params.get("produit") || "",
      category: params.get("categorie") || "",
      brand: params.get("marque") || "",
      search: params.get("q") || "",
      sort: params.get("tri") || "menu_order",
      page: Math.max(1, Number(params.get("page") || 1))
    };
  };

  const navigate = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) query.set(key, String(value));
    });
    const queryString = query.toString();
    const next = queryString ? `?${queryString}` : "./";
    window.history.pushState({}, "", next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
  };

  const parseApiJson = (text) => {
    const start = text.indexOf("[");
    const objectStart = text.indexOf("{");
    const jsonStart = start < 0 ? objectStart : objectStart < 0 ? start : Math.min(start, objectStart);
    if (jsonStart < 0) throw new Error("La réponse du catalogue n'est pas un JSON exploitable.");
    try {
      return JSON.parse(text.slice(jsonStart));
    } catch {
      throw new Error("Le catalogue EKOF a renvoyé une réponse invalide.");
    }
  };

  const fetchApi = async (path, params = {}) => {
    if (!config?.catalogApi) throw new Error("L'adresse de l'API du catalogue n'est pas configurée.");
    if (window.location.protocol === "file:") {
      return fetchLocalPreviewApi(path, params);
    }
    try {
      const url = new URL(`${config.catalogApi.replace(/\/$/, "")}/${path}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) url.searchParams.set(key, String(value));
      });
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      let response;
      let body;
      response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
      body = await response.text();
      window.clearTimeout(timeout);
      const payload = parseApiJson(body);
      if (!response.ok) {
        throw new Error(`Le catalogue EKOF répond avec le statut ${response.status}.`);
      }
      return { payload, response };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Catalogue EKOF en direct indisponible : affichage de l'aperçu enregistré.");
      }
      if (window.EKOF_CATALOGUE_APERCU) {
        return fetchLocalPreviewApi(path, params);
      }
      throw error instanceof Error && error.message
        ? error
        : new Error("Connexion au catalogue EKOF impossible. Vérifiez votre connexion Internet.");
    }
  };

  const fetchLocalPreviewApi = (path, params) => {
    const snapshot = window.EKOF_CATALOGUE_APERCU;
    if (!snapshot) {
      throw new Error("Le catalogue d'aperçu local n'a pas été chargé. Vérifiez la présence de catalogue-apercu.js à côté d'index.html.");
    }

    if (path === "products/categories") {
      return { payload: snapshot.categories, response: createLocalApiResponse(1) };
    }
    if (path === "products/brands") {
      return { payload: snapshot.brands, response: createLocalApiResponse(1) };
    }
    const productId = path.match(/^products\/(\d+)$/);
    if (productId) {
      const product = snapshot.products.find((item) => String(item.id) === productId[1]);
      return { payload: product || null, response: createLocalApiResponse(1) };
    }
    if (path !== "products") {
      throw new Error("Cette route n'est pas disponible dans l'aperçu local du catalogue.");
    }

    let products = [...snapshot.products];
    const search = String(params.search || "").trim().toLocaleLowerCase("fr");
    if (search) {
      products = products.filter((product) =>
        [product.name, product.slug, product.sku, product.short_description, product.description]
          .some((value) => plainText(value).toLocaleLowerCase("fr").includes(search))
      );
    }
    if (params.category) {
      products = products.filter((product) =>
        (product.categories || []).some((category) => String(category.id) === String(params.category))
      );
    }
    if (params.brand) {
      products = products.filter((product) =>
        (product.brands || []).some((brand) => String(brand.id) === String(params.brand))
      );
    }
    if (params.orderby === "price") {
      products.sort((first, second) => Number(first.prices?.price || 0) - Number(second.prices?.price || 0));
    } else if (params.orderby === "title") {
      products.sort((first, second) => plainText(first.name).localeCompare(plainText(second.name), "fr"));
    } else if (params.orderby === "date") {
      products.sort((first, second) => Number(second.id) - Number(first.id));
    }
    if (params.order === "desc") products.reverse();

    const perPage = Math.max(1, Number(params.per_page) || pageSize);
    const page = Math.max(1, Number(params.page) || 1);
    const totalPages = Math.ceil(products.length / perPage);
    products = products.slice((page - 1) * perPage, page * perPage);
    return { payload: products, response: createLocalApiResponse(totalPages) };
  };

  const createLocalApiResponse = (totalPages) => ({
    ok: true,
    status: 200,
    headers: { get: (name) => name.toLowerCase() === "x-wp-totalpages" ? String(totalPages) : null }
  });

  const loadCategories = async () => {
    const { payload } = await fetchApi("products/categories", { per_page: 100 });
    if (!Array.isArray(payload)) throw new Error("La liste des catégories reçue est invalide.");
    categories = payload
      .filter((category) => category && Number.isFinite(Number(category.id)) && category.name)
      .map((category) => ({
        id: String(category.id),
        name: plainText(category.name),
        slug: String(category.slug || "")
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  };

  const loadBrands = async () => {
    const { payload } = await fetchApi("products/brands", { per_page: 100 });
    if (!Array.isArray(payload)) throw new Error("La liste des marques reçue est invalide.");
    brands = payload
      .filter((brand) => brand && Number.isFinite(Number(brand.id)) && brand.name)
      .map((brand) => ({
        id: String(brand.id),
        name: plainText(brand.name),
        slug: String(brand.slug || "")
      }));
  };

  const getProducts = async ({ page = 1, perPage = pageSize, search = "", category = "", brand = "", sort = "menu_order" } = {}) => {
    const params = { per_page: perPage, page, orderby: sort };
    if (sort === "price" || sort === "title") params.order = "asc";
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (brand) params.brand = brand;
    const { payload, response } = await fetchApi("products", params);
    if (!Array.isArray(payload)) throw new Error("La liste des produits reçue est invalide.");
    const totalPages = Number(response.headers.get("X-WP-TotalPages"));
    return {
      products: payload.filter((product) => product && product.id && product.name && product.slug),
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : null
    };
  };

  const getProduct = async (id, slug) => {
    if (id && /^\d+$/.test(id)) {
      const { payload } = await fetchApi(`products/${encodeURIComponent(id)}`);
      if (payload && payload.id) return payload;
    }
    if (!slug) return null;
    const { products } = await getProducts({ perPage: 100, search: slug });
    return products.find((product) => product.slug === slug) || null;
  };

  const img = (product, className = "", preferThumbnail = false) => {
    const image = safeImageUrl(product.images?.[0], preferThumbnail);
    if (!image) return `<div class="product-image-placeholder ${className}" role="img" aria-label="Image non disponible"><span>EKOF</span></div>`;
    const alt = plainText(product.images?.[0]?.alt || product.name);
    return `<img class="product-image ${className}" src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="product-image-placeholder ${className}" hidden aria-label="Image indisponible"><span>EKOF</span></div>`;
  };

  const productCard = (product) => {
    const productUrl = `./?produit=${encodeURIComponent(product.slug)}&id=${encodeURIComponent(product.id)}`;
    const brand = product.brands?.[0]?.name ? plainText(product.brands[0].name) : "";
    const category = product.categories?.[0]?.name ? plainText(product.categories[0].name) : "";
    const msg = whatsappMessage(product, "disponibilité");
    return `<article class="product-card">
      <a class="product-visual" href="${productUrl}" aria-label="Voir ${escapeHtml(product.name)}">
        ${img(product, "", true)}
        ${brand ? `<span class="product-tag">${escapeHtml(brand)}</span>` : ""}
      </a>
      <div class="product-card-content">
        ${category ? `<p class="eyebrow">${escapeHtml(category)}</p>` : ""}
        <h3><a href="${productUrl}">${escapeHtml(plainText(product.name))}</a></h3>
        ${priceMarkup(product)}
        <p class="product-stock">${escapeHtml(availability(product))}</p>
        <div class="product-actions">
          <a class="button button-outline" href="${productUrl}">Voir le produit</a>
          ${waLink(msg, "WhatsApp ↗", "text-link")}
        </div>
      </div>
    </article>`;
  };

  const productGrid = (products, className = "") => products.length
    ? `<div class="product-grid ${className}">${products.map(productCard).join("")}</div>`
    : `<div class="empty-state"><span class="empty-mark">EKOF</span><h3>Aucun produit correspondant</h3><p>Essayez une autre recherche ou choisissez une autre catégorie.</p></div>`;

  const categoryCards = () => {
    const selected = categories.filter((category) => category.name && category.id).slice(0, 6);
    if (!selected.length) return "";
    return `<div class="category-grid">${selected.map((category, index) =>
      `<a class="category-card category-tone-${index % 4}" href="./?vue=boutique&categorie=${encodeURIComponent(category.id)}">
        <span class="category-number">0${index + 1}</span><strong>${escapeHtml(category.name)}</strong><span class="category-arrow">↗</span>
      </a>`).join("")}</div>`;
  };

  const setMeta = (title, description, canonical = window.location.href) => {
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute("content", description);
    document.querySelector('meta[property="og:title"]').setAttribute("content", title);
    document.querySelector('meta[property="og:description"]').setAttribute("content", description);
    document.querySelector('link[rel="canonical"]').setAttribute("href", canonical);
  };

  const pageShell = (eyebrow, title, lead, content, extraClass = "") =>
    `<section class="page-section ${extraClass}"><div class="content-wrap">
      <div class="page-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${lead}</p></div>
      ${content}
    </div></section>`;

  const renderHome = async (version) => {
    setMeta("EKOF Burkina — ce qu'il vous faut", "Mobilier, électroménager et équipements : explorez le catalogue EKOF Burkina, consultez les prix et demandez une disponibilité.");
    const [productsResult] = await Promise.all([
      getProducts({ page: 1, perPage: 4, sort: "date" })
    ]);
    if (version !== requestVersion) return;
    const products = productsResult.products;
    view.innerHTML = `<section class="hero">
      <div class="hero-copy">
        <p class="eyebrow eyebrow-light">EKOF BURKINA · CE QU'IL VOUS FAUT</p>
        <h1>La qualité au meilleur prix, <em>à votre portée.</em></h1>
        <p>Mobilier, électroménager et équipements : découvrez le catalogue EKOF et échangez directement avec notre équipe.</p>
        <div class="hero-actions"><a class="button button-light" href="./?vue=boutique">Découvrir le catalogue <span aria-hidden="true">↗</span></a>${waLink(contactMessage("découvrir vos produits"), "Écrire à EKOF <span aria-hidden=\"true\">↗</span>", "button button-hero-whatsapp")}</div>
        <p class="hero-caption">Prix et disponibilité à confirmer directement auprès d'EKOF.</p>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="hero-ring"></div><div class="hero-orbit"></div><div class="hero-art-label"><span>EKOF</span><small>MOBILIER · ÉQUIPEMENT</small></div><div class="hero-stamp">BURKINA<br><b>FASO</b></div></div>
      <div class="hero-bottom"><span>01 — Mobilier & décoration</span><span>02 — Électroménager</span><span>03 — EBEN Production</span></div>
    </section>
    <section class="section-block categories-section"><div class="section-heading"><div><p class="eyebrow">Explorer</p><h2>Nos univers</h2></div><a class="text-link" href="./?vue=boutique">Tout le catalogue <span>↗</span></a></div>
      ${categoryCards() || `<p class="inline-note">Les catégories du catalogue sont momentanément indisponibles.</p>`}
    </section>
    <section class="section-block products-section"><div class="section-heading"><div><p class="eyebrow">Sélection du catalogue</p><h2>À découvrir</h2></div><a class="text-link" href="./?vue=boutique">Voir tous les produits <span>↗</span></a></div>
      ${productGrid(products)}
      <p class="catalog-disclaimer">${escapeHtml(catalogueSourceNote())}</p>
    </section>
    <section class="eben-band"><div class="eben-band-art" aria-hidden="true"><div class="eben-block eben-block-one"></div><div class="eben-block eben-block-two"></div><div class="eben-block eben-block-three"></div></div><div class="eben-band-copy"><p class="eyebrow eyebrow-light">Savoir-faire local</p><h2>EBEN PRODUCTION<br><em>le mobilier prend forme.</em></h2><p>Le catalogue EKOF référence des créations de la marque EBEN Production. Contactez l'équipe pour découvrir les modèles et discuter de vos besoins sur mesure.</p><a class="button button-light" href="./?vue=eben">Découvrir EBEN Production <span>↗</span></a></div></section>
    ${videoMarkup()}
    ${testimonialsMarkup()}
    ${faqMarkup()}
    <section class="contact-strip"><div><p class="eyebrow">Un produit vous intéresse ?</p><h2>Parlons-en directement.</h2><p>Disponibilité, options et modalités : contactez l'équipe EKOF.</p></div><a class="button button-dark" href="./?vue=contact">Voir les moyens de contact <span>↗</span></a></section>`;
  };

  const renderCatalog = async (current, version) => {
    setMeta("Catalogue et produits | EKOF Burkina", "Recherchez mobilier, électroménager et équipements dans le catalogue EKOF Burkina.");
    view.innerHTML = pageShell("Catalogue EKOF", "Les produits qu'il vous faut.", "Explorez le catalogue, comparez les prix affichés et contactez EKOF pour vérifier la disponibilité.", `<div class="catalog-toolbar">
      <label class="search-field"><span class="sr-only">Rechercher un produit</span><input id="catalog-search" type="search" value="${escapeHtml(current.search)}" placeholder="Rechercher un produit…" autocomplete="off"><span aria-hidden="true">⌕</span></label>
      <label class="select-field"><span class="sr-only">Filtrer par catégorie</span><select id="category-filter"><option value="">Toutes les catégories</option>${categories.map((category) => `<option value="${escapeHtml(category.id)}" ${current.category === category.id ? "selected" : ""}>${escapeHtml(category.name)}</option>`).join("")}</select></label>
      <label class="select-field"><span class="sr-only">Trier les produits</span><select id="sort-filter">
        <option value="menu_order" ${current.sort === "menu_order" ? "selected" : ""}>Tri recommandé</option>
        <option value="price" ${current.sort === "price" ? "selected" : ""}>Prix croissant</option>
        <option value="date" ${current.sort === "date" ? "selected" : ""}>Nouveautés</option>
        <option value="title" ${current.sort === "title" ? "selected" : ""}>Nom A à Z</option>
      </select></label>
      <label class="select-field"><span class="sr-only">Filtrer par marque</span><select id="brand-filter"><option value="">Toutes les marques</option>${brands.map((brand) => `<option value="${escapeHtml(brand.id)}" ${current.brand === brand.id ? "selected" : ""}>${escapeHtml(brand.name)}</option>`).join("")}</select></label>
    </div>${categoryLoadError || brandLoadError ? `<p class="inline-note">Certains filtres sont indisponibles : ${escapeHtml([categoryLoadError, brandLoadError].filter(Boolean).join(" · "))}</p>` : ""}<div id="catalog-status" class="catalog-status" role="status">Chargement des produits…</div>
    <div id="catalog-products"></div><div id="catalog-pagination" class="pagination"></div>
    <p class="catalog-disclaimer">${escapeHtml(catalogueSourceNote())}</p>`, "catalog-page");
    const searchInput = document.getElementById("catalog-search");
    const categoryFilter = document.getElementById("category-filter");
    const sortFilter = document.getElementById("sort-filter");
    const brandFilter = document.getElementById("brand-filter");
    let debounce;
    searchInput.addEventListener("input", () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => navigate({ vue: "boutique", q: searchInput.value, categorie: categoryFilter.value, marque: brandFilter.value, tri: sortFilter.value }), 350);
    });
    categoryFilter.addEventListener("change", () => navigate({ vue: "boutique", q: searchInput.value, categorie: categoryFilter.value, marque: brandFilter.value, tri: sortFilter.value }));
    sortFilter.addEventListener("change", () => navigate({ vue: "boutique", q: searchInput.value, categorie: categoryFilter.value, marque: brandFilter.value, tri: sortFilter.value }));
    brandFilter.addEventListener("change", () => navigate({ vue: "boutique", q: searchInput.value, categorie: categoryFilter.value, marque: brandFilter.value, tri: sortFilter.value }));
    try {
      const result = await getProducts({
        page: current.page,
        search: current.search,
        category: current.category,
        brand: current.brand,
        sort: current.sort
      });
      if (version !== requestVersion) return;
      document.getElementById("catalog-status").textContent = result.products.length
        ? `${result.products.length} produit${result.products.length > 1 ? "s" : ""} sur cette page`
        : "";
      document.getElementById("catalog-products").innerHTML = productGrid(result.products);
      const pageCount = result.totalPages || (result.products.length === pageSize ? current.page + 1 : current.page);
      const hasPrevious = current.page > 1;
      const hasNext = current.page < pageCount && result.products.length > 0;
      document.getElementById("catalog-pagination").innerHTML = `${hasPrevious ? `<button class="button button-outline" type="button" data-page="${current.page - 1}">← Précédent</button>` : "<span></span>"}<span>Page ${current.page}${result.totalPages ? ` sur ${result.totalPages}` : ""}</span>${hasNext ? `<button class="button button-outline" type="button" data-page="${current.page + 1}">Suivant →</button>` : "<span></span>"}`;
      document.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () =>
        navigate({ vue: "boutique", q: current.search, categorie: current.category, marque: current.brand, tri: sortFilter.value, page: button.dataset.page })));
    } catch (error) {
      if (version !== requestVersion) return;
      showError("catalog-status", error);
    }
  };

  const renderProduct = async (current, version) => {
    view.innerHTML = `<section class="loading-panel"><span class="loader" aria-hidden="true"></span><p>Chargement de la fiche produit…</p></section>`;
    try {
      const product = await getProduct(current.productId, current.productSlug);
      if (version !== requestVersion) return;
      if (!product) {
        renderNotFound();
        return;
      }
      const productName = plainText(product.name);
      const description = plainText(product.description || product.short_description);
      const brand = product.brands?.[0]?.name ? plainText(product.brands[0].name) : "";
      const category = product.categories?.[0]?.name ? plainText(product.categories[0].name) : "";
      const currentProductUrl = productUrl(product);
      const message = whatsappMessage(product, "disponibilité et commande");
      setMeta(`${productName} | EKOF Burkina`, `${productName} : prix, informations et demande de disponibilité auprès d'EKOF Burkina.`, currentProductUrl);
      const galleryImages = (product.images || [])
        .map((image) => ({
          src: safeImageUrl(image),
          thumbnail: safeImageUrl(image, true),
          alt: plainText(image.alt || productName)
        }))
        .filter((image) => image.src);
      const imageMarkup = galleryImages.length
        ? `<div class="detail-gallery"><div class="detail-image"><img id="detail-main-image" class="detail-product-image" src="${escapeHtml(galleryImages[0].src)}" alt="${escapeHtml(galleryImages[0].alt)}" fetchpriority="high"><span class="image-index">01 / ${String(galleryImages.length).padStart(2, "0")}</span></div>${galleryImages.length > 1 ? `<div class="detail-thumbnails" aria-label="Photos du produit">${galleryImages.map((image, index) => `<button type="button" class="detail-thumbnail ${index === 0 ? "is-current" : ""}" data-gallery-index="${index}" aria-label="Afficher la photo ${index + 1}"><img src="${escapeHtml(image.thumbnail)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}</div>`
        : `<div class="detail-gallery"><div class="detail-image">${img(product, "detail-product-image")}</div></div>`;
      view.innerHTML = `<section class="product-detail content-wrap">
        <nav class="breadcrumbs" aria-label="Fil d'Ariane"><a href="./">Accueil</a><span>/</span><a href="./?vue=boutique">Catalogue</a>${category ? `<span>/</span><a href="./?vue=boutique&categorie=${encodeURIComponent(product.categories[0].id)}">${escapeHtml(category)}</a>` : ""}<span>/</span><span>${escapeHtml(productName)}</span></nav>
        <div class="detail-layout">${imageMarkup}<div class="detail-copy">
          <p class="eyebrow">${escapeHtml(category || "Catalogue EKOF")}${brand ? ` · ${escapeHtml(brand)}` : ""}</p>
          <h1>${escapeHtml(productName)}</h1>
          ${priceMarkup(product).replace('class="product-price"', 'class="detail-price product-price"')}
          <p class="product-stock">${escapeHtml(availability(product))}</p>
          <p class="detail-disclaimer">${escapeHtml(catalogueSourceNote())}</p>
          ${product.sku ? `<p class="detail-reference">Référence : <strong>${escapeHtml(product.sku)}</strong></p>` : ""}
          ${description ? `<div class="detail-description"><h2>À propos de ce produit</h2><p>${escapeHtml(description)}</p></div>` : `<div class="detail-description"><h2>Informations</h2><p>Contactez EKOF pour obtenir les détails et les caractéristiques de ce produit.</p></div>`}
          <div class="detail-actions">${waLink(message, "Vérifier et commander sur WhatsApp <span>↗</span>")}<a class="text-link" href="./?vue=boutique">← Retour au catalogue</a></div>
          <p class="fine-print">Aucun paiement n'est effectué sur ce site. La commande et ses modalités sont confirmées directement avec EKOF.</p>
        </div></div>
      </section>`;
      document.querySelectorAll("[data-gallery-index]").forEach((button) => button.addEventListener("click", () => {
        const index = Number(button.dataset.galleryIndex);
        const image = galleryImages[index];
        const mainImage = document.getElementById("detail-main-image");
        if (!image || !mainImage) return;
        mainImage.src = image.src;
        mainImage.alt = image.alt;
        document.querySelector(".image-index").textContent = `${String(index + 1).padStart(2, "0")} / ${String(galleryImages.length).padStart(2, "0")}`;
        document.querySelectorAll(".detail-thumbnail").forEach((thumbnail) => thumbnail.classList.toggle("is-current", thumbnail === button));
      }));
      addProductStructuredData(product);
    } catch (error) {
      if (version !== requestVersion) return;
      view.innerHTML = `<section class="error-panel"><p class="eyebrow">Fiche produit</p><h1>Impossible de charger ce produit</h1><p>${escapeHtml(error.message)}</p><a class="button button-dark" href="./?vue=boutique">Retour au catalogue</a></section>`;
    }
  };

  const addProductStructuredData = (product) => {
    document.getElementById("product-structured-data")?.remove();
    const price = Number(product?.prices?.price);
    if (!Number.isFinite(price) || product?.prices?.currency_code !== "XOF") return;
    const data = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: plainText(product.name),
      description: plainText(product.description || product.short_description),
      image: (product.images || []).map(safeImageUrl).filter(Boolean),
      sku: product.sku || undefined,
      brand: product.brands?.[0]?.name ? { "@type": "Brand", name: plainText(product.brands[0].name) } : undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "XOF",
        price,
        url: window.location.href
      }
    };
    if (typeof product.is_in_stock === "boolean") {
      data.offers.availability = product.is_in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    }
    const script = document.createElement("script");
    script.id = "product-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.append(script);
  };

  const renderEben = async (version) => {
    setMeta("EBEN Production | EKOF Burkina", "Découvrez EBEN Production, le centre de production associé à EKOF Burkina, et demandez des informations sur les meubles et projets sur mesure.");
    const ebenBrands = brands.filter((brand) => ["ebene-production", "ebene-pro-academie"].includes(brand.slug));
    const productGroups = await Promise.all(ebenBrands.map(async (brand) => {
      try {
        const { products } = await getProducts({ perPage: 4, brand: brand.id });
        return { brand, products, error: "" };
      } catch (error) {
        return { brand, products: [], error: error.message };
      }
    }));
    const catalogMessage = !ebenBrands.length
      ? `<p class="inline-note">${brandLoadError
        ? `Impossible de charger la liste des marques EBEN : ${escapeHtml(brandLoadError)}`
        : "Aucune marque EBEN n'est référencée dans le catalogue public actuel."}</p>`
      : "";
    const productGroupsMarkup = productGroups.map(({ brand, products, error }) =>
      `<div class="eben-brand-group"><div class="section-heading"><div><p class="eyebrow">Catalogue EKOF · ${escapeHtml(brand.name)}</p><h3>${escapeHtml(brand.name)}</h3></div></div>${error
        ? `<p class="inline-note">Impossible de charger cette sélection : ${escapeHtml(error)}</p>`
        : productGrid(products)}<a class="text-link" href="./?vue=boutique&marque=${encodeURIComponent(brand.id)}">Voir tous les produits ${escapeHtml(brand.name)} <span>↗</span></a></div>`
    ).join("");
    if (version !== requestVersion) return;
    view.innerHTML = pageShell("Savoir-faire local · EBEN Production", "Des meubles pensés pour vos espaces.", "EBEN Production est le centre de production associé à EKOF. Le catalogue EKOF présente des produits de la marque EBEN Production.", `<div class="eben-feature">
      <div class="eben-feature-art" aria-hidden="true"><span class="eben-monogram">EB<br><small>PRODUCTION</small></span><i></i><b></b></div>
      <div class="eben-feature-copy"><p class="eyebrow">Une marque présente au catalogue EKOF</p><h2>Le mobilier, selon vos envies.</h2><p>Parcourez les produits EBEN Production publiés dans le catalogue EKOF. Pour une création personnalisée, un conseil ou un devis, échangez directement avec l'équipe.</p><ul class="check-list"><li>Produits EBEN identifiés dans le catalogue EKOF</li><li>Demande de renseignements et de devis sur WhatsApp</li><li>Prix, options et délais confirmés au cas par cas</li></ul><a class="button button-dark" href="./?vue=boutique">Voir le catalogue EKOF <span>↗</span></a></div>
    </div><section class="eben-products"><div class="section-heading"><div><p class="eyebrow">Catalogue public</p><h2>Produits EBEN Production</h2></div></div>${catalogMessage || productGroupsMarkup}</section><div class="eben-note"><strong>Vous avez un projet de mobilier sur mesure ?</strong><span>Les détails, matériaux, dimensions, prix et délais sont à définir avec l'équipe EBEN Production.</span>${waLink(contactMessage("un projet de mobilier sur mesure"), "Demander un devis <span>↗</span>")}</div>`, "eben-page");
  };

  const renderAbout = () => {
    setMeta("À propos d'EKOF | EKOF Burkina", "EKOF Burkina, une offre de mobilier, électroménager et équipements, avec EBEN Production pour le mobilier.");
    view.innerHTML = pageShell("La marque", "EKOF, ce qu'il vous faut.", "Avec EKOF, c'est la qualité au meilleur prix.", `<div class="about-layout">
      <div class="about-mark"><img src="./ekof_Plan%20de%20travail%201.png" alt="Logo EKOF Burkina"></div>
      <div class="about-copy"><p class="eyebrow">Une offre pour la maison et les espaces de travail</p><h2>Des produits à découvrir. Un échange direct pour choisir.</h2><p>EKOF Burkina propose un catalogue de mobilier, d'électroménager et d'équipements. Consultez les fiches et les tarifs disponibles, puis contactez l'équipe pour confirmer les caractéristiques, le prix et la disponibilité.</p><p>EBEN Production est le centre de production associé à EKOF et sa marque apparaît sur des références de mobilier du catalogue.</p><a class="button button-dark" href="./?vue=boutique">Explorer le catalogue <span>↗</span></a></div>
    </div><div class="about-values"><article><span>01</span><h3>Choisir</h3><p>Parcourez les produits et les catégories publiés au catalogue.</p></article><article><span>02</span><h3>Échanger</h3><p>Demandez une disponibilité, une précision ou un devis à EKOF.</p></article><article><span>03</span><h3>Confirmer</h3><p>Les conditions et modalités sont convenues directement avec l'équipe.</p></article></div>`, "about-page");
  };

  const renderContact = () => {
    setMeta("Contact | EKOF Burkina", "Contactez EKOF Burkina pour connaître la disponibilité, les prix et les modalités d'un produit ou demander un devis.");
    view.innerHTML = pageShell("Nous sommes à votre écoute", "Parlons de votre projet.", "Une question sur un produit ou un besoin sur mesure ? Envoyez votre demande.", `<div class="contact-layout"><div class="contact-intro"><p class="eyebrow">Contact</p><h2>Un contact simple, sans détour.</h2><p>Pour un produit du catalogue, indiquez sa référence ou partagez sa fiche. L'équipe pourra vous confirmer les détails et les modalités.</p><div class="contact-detail"><span class="contact-icon">W</span><div><strong>Contacts EKOF</strong><p>${contactLinksMarkup()}</p></div></div><div class="contact-detail"><span class="contact-icon">f</span><div><strong>Facebook</strong><p>Retrouvez EKOF sur sa page officielle.</p><a href="${escapeHtml(config?.facebookEkof || "https://web.facebook.com/EkofBurkina")}" target="_blank" rel="noopener noreferrer">Ouvrir Facebook EKOF ↗</a></div></div></div>
      <div class="contact-card"><p class="eyebrow">Écrivez-nous</p><h2>Votre demande, en quelques lignes.</h2><p>Indiquez votre besoin dans votre application de messagerie ou contactez directement EKOF via les coordonnées confirmées.</p>${config.whatsappPhone ? waLink(contactMessage("un renseignement, une disponibilité ou un devis"), "Préparer mon message WhatsApp <span>↗</span>") : '<button class="button button-whatsapp" type="button" disabled>WhatsApp à configurer</button>'}<p class="fine-print">Aucun paiement en ligne n'est proposé.</p></div></div>${locationMarkup()}`, "contact-page");
  };

  const renderNotFound = () => {
    setMeta("Page introuvable | EKOF Burkina", "Cette page n'existe pas dans le site EKOF Burkina.");
    view.innerHTML = `<section class="error-panel"><p class="eyebrow">Erreur 404</p><h1>Cette page n'est pas disponible.</h1><p>Le produit a peut-être été retiré du catalogue. Vous pouvez explorer les autres références EKOF.</p><a class="button button-dark" href="./?vue=boutique">Retour au catalogue</a></section>`;
  };

  const showError = (elementId, error) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.innerHTML = `<div class="inline-error"><strong>Le catalogue EKOF n'est pas accessible pour le moment.</strong><span>${escapeHtml(error.message)}</span><button type="button" class="button button-outline" id="retry-catalog">Réessayer</button></div>`;
    document.getElementById("retry-catalog")?.addEventListener("click", render);
  };

  const render = async () => {
    const version = ++requestVersion;
    const current = route();
    document.getElementById("product-structured-data")?.remove();
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    document.querySelector(".primary-nav").classList.remove("is-open");
    document.querySelectorAll(".primary-nav > a[data-route]").forEach((link) => {
      const isProduct = Boolean(current.productSlug || current.view === "produit");
      const activeRoute = isProduct ? "boutique" : current.view;
      const isActive = link.dataset.route === activeRoute;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    try {
      if (current.productSlug || current.view === "produit") return await renderProduct(current, version);
      switch (current.view) {
        case "accueil":
          await renderHome(version);
          break;
        case "boutique":
          await renderCatalog(current, version);
          break;
        case "eben":
          await renderEben(version);
          break;
        case "a-propos":
          renderAbout();
          break;
        case "contact":
          renderContact();
          break;
        default:
          renderNotFound();
      }
    } catch (error) {
      if (version !== requestVersion) return;
      view.innerHTML = `<section class="error-panel"><p class="eyebrow">Catalogue EKOF</p><h1>Une erreur empêche l'affichage du site.</h1><p>${escapeHtml(error.message)}</p><button id="retry-page" class="button button-dark" type="button">Réessayer</button></section>`;
      document.getElementById("retry-page")?.addEventListener("click", render);
    }
  };

  window.addEventListener("popstate", render);
  document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    document.querySelector(".primary-nav").classList.toggle("is-open", !isOpen);
  });

  const previewNotice = document.getElementById("preview-mode-notice");
  if (window.location.protocol === "file:") {
    previewNotice.hidden = false;
    previewNotice.textContent = "Aperçu local du catalogue — données incluses avec le site ; prix et disponibilités à confirmer auprès d’EKOF.";
  }

  const initialize = async () => {
    await loadLocalPreviewData();
    await Promise.all([
      loadCategories().catch((error) => {
        categoryLoadError = error.message;
        console.error("Chargement des catégories EKOF impossible :", error);
      }),
      loadBrands().catch((error) => {
        brandLoadError = error.message;
        console.error("Chargement des marques EKOF impossible :", error);
      })
    ]);
    await render();
  };
  initialize().catch((error) => {
    console.error("Initialisation de la vitrine EKOF impossible :", error);
    view.innerHTML = `<section class="error-panel"><p class="eyebrow">Aperçu EKOF</p><h1>Impossible d'ouvrir l'aperçu.</h1><p>${escapeHtml(error.message)}</p><p>Vérifiez que <strong>index.html</strong>, <strong>app.js</strong>, <strong>styles.css</strong>, <strong>site-config.js</strong> et <strong>catalogue-apercu.js</strong> sont tous dans le même dossier.</p></section>`;
  });
})();
