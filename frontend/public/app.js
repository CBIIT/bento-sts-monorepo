const entities = [
  { id: "model-gdc", type: "Model", name: "Genomic Data Commons", handle: "GDC", model: "GDC", version: "3.0", definition: "A harmonized data model for genomic and clinical cancer research data.", nodes: 42, relationships: 71, properties: 638, related: ["case", "diagnosis", "sample"] },
  { id: "node-case", type: "Node", name: "case", handle: "case", model: "GDC", version: "3.0", definition: "The collection of all data related to a specific subject in a cancer study.", relationships: "diagnosis, demographic, sample", related: ["diagnosis", "sample", "demographic"] },
  { id: "property-diagnosis", type: "Property", name: "primary_diagnosis", handle: "primary_diagnosis", model: "GDC", version: "3.0", definition: "The text term used to describe the primary pathologic diagnosis.", valueType: "string", permissible: "Primary Diagnosis Value Set", cde: "C154625", related: ["diagnosis", "tumor_grade"] },
  { id: "model-ccdi", type: "Model", name: "Childhood Cancer Data Initiative", handle: "CCDI", model: "CCDI", version: "2.1", definition: "A cross-program model for childhood cancer research data interoperability.", nodes: 36, relationships: 54, properties: 481, related: ["participant", "diagnosis", "specimen"] },
  { id: "node-participant", type: "Node", name: "participant", handle: "participant", model: "CCDI", version: "2.1", definition: "A person represented in a childhood cancer research study.", relationships: "diagnosis, survival, specimen", related: ["diagnosis", "survival", "specimen"] },
  { id: "property-disease", type: "Property", name: "disease_phase", handle: "disease_phase", model: "CCDI", version: "2.1", definition: "The phase of disease at the time of an observation or intervention.", valueType: "enumeration", permissible: "Disease Phase Value Set", cde: "C124453", related: ["diagnosis", "treatment"] },
  { id: "model-ctdc", type: "Model", name: "Clinical Trial Data Commons", handle: "CTDC", model: "CTDC", version: "1.4", definition: "A model for harmonized clinical trial research data.", nodes: 29, relationships: 44, properties: 352, related: ["participant", "study", "treatment"] },
  { id: "node-specimen", type: "Node", name: "specimen", handle: "specimen", model: "CTDC", version: "1.4", definition: "A material sample collected from a participant for analysis.", relationships: "participant, sample_collection, assay", related: ["participant", "assay", "sample_collection"] },
  { id: "property-age", type: "Property", name: "age_at_diagnosis", handle: "age_at_diagnosis", model: "CTDC", version: "1.4", definition: "Age of a participant at the time the diagnosis was established.", valueType: "integer", permissible: "Non-negative integer", cde: "C124437", related: ["participant", "diagnosis"] },
  { id: "PROP-DIAGNOSIS-CODE", modelId: "MODEL-CLINICAL-1", type: "Property", name: "diagnosis_code", handle: "PROP-DIAGNOSIS-CODE", model: "Clinical Research Model", version: "1.0", definition: "Coded diagnosis recorded for a clinical research participant.", valueType: "enumeration", permissible: "Diagnosis Response Values", valueSetId: "VS-RESPONSE-VALUES", cde: "C154625", related: ["diagnosis", "primary_diagnosis"] }
];

const terms = [
  { id: "term-neoplasm", type: "Term", name: "Malignant neoplasm", handle: "Malignant neoplasm", model: "NCI Thesaurus", version: "24.08", definition: "A neoplasm characterized by invasive growth and the potential to metastasize.", origin: "NCIt", originId: "C9305", originUrl: "https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&ns=ncit&code=C9305", permissible: "Primary Diagnosis Value Set", related: ["primary_diagnosis", "disease_type"] },
  { id: "term-relapse", type: "Term", name: "Relapse", handle: "Relapse", model: "NCI Thesaurus", version: "24.08", definition: "The return of a disease after a period of improvement or remission.", origin: "NCIt", originId: "C38155", originUrl: "https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&ns=ncit&code=C38155", permissible: "Disease Phase Value Set", related: ["disease_phase", "event_type"] },
  { id: "term-specimen", type: "Term", name: "Biospecimen", handle: "Biospecimen", model: "caDSR", version: "4.0", definition: "A biological material collected for research, diagnosis, or treatment purposes.", origin: "caDSR", originId: "C70699", originUrl: "https://cadsr.cancer.gov/", permissible: "Specimen Type Value Set", related: ["specimen_type", "sample_type"] },
  { id: "term-remission", type: "Term", name: "Complete remission", handle: "Complete remission", model: "NCI Thesaurus", version: "24.08", definition: "The disappearance of all signs of cancer in response to treatment.", origin: "NCIt", originId: "C4870", originUrl: "https://ncit.nci.nih.gov/", permissible: "Disease Response Value Set", related: ["response", "disease_phase"] }
];

const valueSets = [
  { id: "VS-RESPONSE-VALUES", type: "Value Set", name: "Diagnosis Response Values", handle: "response_values", model: "Clinical Research Model", version: "1.0", definition: "Permissible coded responses used to represent diagnosis and disease response.", origin: "caDSR", originId: "VS-701001", originUrl: "https://cadsr.cancer.gov/", terms: ["Complete response", "Partial response", "Stable disease", "Progressive disease", "Not evaluated"], related: ["PROP-DIAGNOSIS-CODE", "response", "disease_phase"] },
  { id: "VS-PRIMARY-DIAGNOSIS", type: "Value Set", name: "Primary Diagnosis Value Set", handle: "primary_diagnosis_values", model: "GDC", version: "3.0", definition: "Permissible primary pathologic diagnosis concepts.", origin: "NCIt", originId: "VS-154625", originUrl: "https://ncit.nci.nih.gov/", terms: ["Malignant neoplasm", "Carcinoma", "Sarcoma", "Lymphoma"], related: ["primary_diagnosis"] },
  { id: "VS-DISEASE-PHASE", type: "Value Set", name: "Disease Phase Value Set", handle: "disease_phase_values", model: "CCDI", version: "2.1", definition: "Permissible phases of disease at observation.", origin: "NCIt", originId: "VS-124453", originUrl: "https://ncit.nci.nih.gov/", terms: ["Initial diagnosis", "Relapse", "Remission", "Progression"], related: ["disease_phase"] }
];

const valueSetStackData = {
  a: [
    { id: "VS-RESPONSE-VALUES", name: "Diagnosis Response Values", code: "VS-701001", status: "Changed", count: 5 },
    { id: "VS-PRIMARY-DIAGNOSIS", name: "Primary Diagnosis Value Set", code: "VS-154625", status: "Shared", count: 4 },
    { id: "VS-SPECIMEN-TYPE", name: "Specimen Type", code: "VS-19157", status: "Changed", count: 12 },
    { id: "VS-YES-NO", name: "Yes No Unknown", code: "VS-117120", status: "Shared", count: 3 },
    { id: "VS-TUMOR-GRADE", name: "Tumor Grade", code: "VS-28077", status: "Changed", count: 8 },
    { id: "VS-VITAL-STATUS", name: "Vital Status", code: "VS-25717", status: "Shared", count: 4 }
  ],
  b: [
    { id: "VS-RESPONSE-VALUES", name: "Diagnosis Response Values", code: "VS-701001", status: "Changed", count: 6 },
    { id: "VS-PRIMARY-DIAGNOSIS", name: "Primary Diagnosis Value Set", code: "VS-154625", status: "Shared", count: 4 },
    { id: "VS-DISEASE-PHASE", name: "Disease Phase Value Set", code: "VS-124453", status: "Changed", count: 4 },
    { id: "VS-YES-NO", name: "Yes No Unknown", code: "VS-117120", status: "Shared", count: 3 },
    { id: "VS-TREATMENT-INTENT", name: "Treatment Intent", code: "VS-15220", status: "Changed", count: 7 },
    { id: "VS-VITAL-STATUS", name: "Vital Status", code: "VS-25717", status: "Shared", count: 4 }
  ]
};

const comparisonRows = {
  nodes: [
    [{ name: "case", sub: "Node" }, "Exact name", { name: "case", sub: "Node" }, "exact"],
    [{ name: "diagnosis", sub: "Node" }, "Exact name", { name: "diagnosis", sub: "Node" }, "exact"],
    [{ name: "primary_diagnosis", sub: "Property in diagnosis" }, "Normalized name", { name: "primary diagnosis", sub: "Property in diagnosis" }, "changed"],
    [{ name: "sample", sub: "Node" }, "CDE C19157", { name: "specimen", sub: "Node" }, "changed"],
    [{ name: "tumor_grade", sub: "Property in diagnosis" }, "Unique", null, "unique"],
    [null, "Unique", { name: "disease_phase", sub: "Property in diagnosis" }, "unique"]
  ],
  flat: [
    [{ name: "age_at_diagnosis", sub: "diagnosis" }, "Normalized name", { name: "age-at-diagnosis", sub: "participant" }, "changed"],
    [{ name: "primary_diagnosis", sub: "diagnosis" }, "CDE C154625", { name: "primary_diagnosis", sub: "clinical_measure" }, "exact"],
    [{ name: "sample_type", sub: "sample" }, "Value set", { name: "specimen_type", sub: "specimen" }, "changed"],
    [{ name: "tumor_grade", sub: "diagnosis" }, "Unique", null, "unique"],
    [null, "Unique", { name: "disease_phase", sub: "diagnosis" }, "unique"]
  ]
};

const state = { mode: "entities", model: "all", query: "", selectedId: "property-diagnosis", sort: "relevance", strategy: "nodes", graphView: "side-by-side", stack: { a: { query: "", page: 1, statusFirst: "Changed", open: true }, b: { query: "", page: 1, statusFirst: "Changed", open: true } } };

const el = (id) => document.getElementById(id);
const resultsList = el("resultsList");
const modelList = el("modelList");
const entityDetail = el("entityDetail");
const loadingTemplate = el("loadingTemplate");

function activeData() {
  if (state.mode === "terms") return terms;
  const includeValueSets = el("valueSetsToggle") && el("valueSetsToggle").checked;
  return includeValueSets ? [...entities, ...valueSets] : entities;
}
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }

function renderModels() {
  const data = activeData();
  const groups = [...new Set(data.map(item => item.model))];
  modelList.innerHTML = groups.map(model => {
    const count = data.filter(item => item.model === model).length;
    return `<button class="model-filter ${state.model === model ? "is-active" : ""}" type="button" data-model="${escapeHtml(model)}"><strong>${escapeHtml(model)}</strong><span>${count} ${count === 1 ? "record" : "records"}</span></button>`;
  }).join("");
  modelList.querySelectorAll("[data-model]").forEach(button => button.addEventListener("click", () => {
    state.model = button.dataset.model;
    renderModels();
    renderResults();
  }));
}

function filteredData() {
  const q = state.query.trim().toLowerCase();
  let data = activeData().filter(item => state.model === "all" || item.model === state.model);
  if (q) {
    const includeDefinitions = el("definitionsToggle").checked;
    data = data.filter(item => item.name.toLowerCase().includes(q) || item.handle.toLowerCase().includes(q) || (includeDefinitions && item.definition.toLowerCase().includes(q)));
  }
  if (state.sort === "name") data.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "type") data.sort((a, b) => a.type.localeCompare(b.type));
  return data;
}

function renderResults() {
  const data = filteredData();
  el("recordCount").textContent = `${data.length} ${data.length === 1 ? "record" : "records"}`;
  el("resultsSummary").textContent = state.query ? `Matches for “${state.query}”` : "Grouped by model";
  if (!data.length) {
    resultsList.innerHTML = `<div class="empty-state"><h4>No matching records</h4><p>Try a broader handle, include definitions, or clear the selected model.</p></div>`;
    return;
  }
  const groups = [...new Set(data.map(item => item.model))];
  resultsList.innerHTML = groups.map(model => {
    const items = data.filter(item => item.model === model);
    return `<div class="result-group"><div class="result-group-title"><span>${escapeHtml(model)}</span><span>${items.length}</span></div>${items.map(item => `<button class="result-item ${state.selectedId === item.id ? "is-active" : ""}" type="button" data-entity="${item.id}"><span class="entity-type">${escapeHtml(item.type)}</span><span class="result-name"><strong>${escapeHtml(item.handle)}</strong><span>${escapeHtml(item.definition)}</span></span><span class="open-label">Open</span></button>`).join("")}</div>`;
  }).join("");
  resultsList.querySelectorAll("[data-entity]").forEach(button => button.addEventListener("click", () => {
    state.selectedId = button.dataset.entity;
    const item = [...entities, ...terms, ...valueSets].find(record => record.id === state.selectedId);
    if (item && item.type === "Value Set") window.location.hash = `/value-sets/${encodeURIComponent(item.id)}`;
    else if (item && item.type === "Property" && item.modelId) window.location.hash = `/models/${encodeURIComponent(item.modelId)}/properties/${encodeURIComponent(item.id)}`;
    renderResults();
    renderDetail();
    if (window.innerWidth < 1100) el("entityPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

function detailRows(item) {
  const rows = [["Model", item.model], ["Version", item.version]];
  if (item.type === "Model") rows.push(["Nodes", item.nodes], ["Relationships", item.relationships], ["Properties", item.properties]);
  if (item.type === "Node") rows.push(["Relationships", item.relationships]);
  if (item.type === "Property") rows.push(["Value type", item.valueType], ["Permissible set", item.permissible], ["CDE ID", item.cde]);
  if (item.type === "Term") rows.push(["Origin", item.origin], ["Origin ID", item.originId], ["Value set", item.permissible]);
  if (item.type === "Value Set") rows.push(["Origin", item.origin], ["Origin ID", item.originId], ["Permissible terms", item.terms.length]);
  return rows;
}

function renderDetail() {
  const all = [...entities, ...terms, ...valueSets];
  let item = all.find(record => record.id === state.selectedId);
  const routeSelected = item && (item.type === "Value Set" || activeData().some(record => record.id === item.id));
  if (!item || !routeSelected) {
    item = activeData()[0];
    state.selectedId = item.id;
  }
  const rows = detailRows(item).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const link = item.originUrl ? `<a class="origin-link" href="${item.originUrl}" target="_blank" rel="noreferrer">Open origin resource</a>` : "";
  const valueSetLink = item.valueSetId ? `<a class="origin-link" href="#/value-sets/${encodeURIComponent(item.valueSetId)}">Open value set detail</a>` : "";
  const termSection = item.type === "Value Set" ? `<section class="detail-section"><h4>Permissible values</h4><ul class="related-list">${item.terms.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul></section>` : "";
  entityDetail.innerHTML = `<article class="entity-detail"><p class="detail-breadcrumb">${escapeHtml(item.model)} / ${escapeHtml(item.version)}</p><p class="detail-kicker">${escapeHtml(item.type)}</p><h3 id="entity-title">${escapeHtml(item.handle)}</h3><p class="detail-definition">${escapeHtml(item.definition)}</p><dl class="detail-list">${rows}</dl>${termSection}<section class="detail-section"><h4>${item.type === "Term" ? "Defines these entities" : "Related entities"}</h4><ul class="related-list">${item.related.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul></section>${valueSetLink}${link}</article>`;
}

function setMode(mode) {
  state.mode = mode;
  state.model = "all";
  state.query = "";
  el("searchInput").value = "";
  document.querySelectorAll(".mode-tab").forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  el("searchLabel").textContent = mode === "terms" ? "Search terminology values" : "Search models, nodes, and properties";
  el("searchInput").placeholder = mode === "terms" ? "Try relapse, biospecimen, or remission" : "Try patient, diagnosis, or specimen";
  el("results-title").textContent = mode === "terms" ? "Terminology records" : "Current entities";
  state.selectedId = mode === "terms" ? terms[0].id : entities[2].id;
  renderModels();
  renderResults();
  renderDetail();
}

function renderComparison() {
  const rows = comparisonRows[state.strategy];
  el("leftHeading").textContent = el("leftModel").value;
  el("rightHeading").textContent = el("rightModel").value;
  el("comparisonBody").innerHTML = rows.map(([left, basis, right, status]) => {
    const cell = item => item ? `<div class="diff-entity"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.sub)}</span></div>` : `<span class="diff-empty">No paired entity</span>`;
    const matchClass = status === "exact" ? "match-exact" : status === "changed" ? "match-changed" : "";
    return `<tr><td>${cell(left)}</td><td><span class="${matchClass}">${escapeHtml(basis)}</span></td><td>${cell(right)}</td></tr>`;
  }).join("");
  const aligned = rows.filter(row => row[0] && row[2]).length;
  const uniqueA = rows.filter(row => row[0] && !row[2]).length;
  const uniqueB = rows.filter(row => !row[0] && row[2]).length;
  const modified = rows.filter(row => row[3] === "changed").length;
  el("diffSummary").innerHTML = `<span><strong>${aligned}</strong> aligned</span><span><strong>${modified}</strong> modified</span><span><strong>${uniqueA}</strong> unique to A</span><span><strong>${uniqueB}</strong> unique to B</span>`;
}

function renderValueSetStacks() {
  const pageSize = 3;
  el("valueSetStacks").innerHTML = ["a", "b"].map(side => {
    const stackState = state.stack[side];
    const source = valueSetStackData[side]
      .filter(item => `${item.name} ${item.code}`.toLowerCase().includes(stackState.query.toLowerCase()))
      .sort((first, second) => (first.status === stackState.statusFirst ? -1 : 1) - (second.status === stackState.statusFirst ? -1 : 1) || first.name.localeCompare(second.name));
    const pages = Math.max(1, Math.ceil(source.length / pageSize));
    stackState.page = Math.min(stackState.page, pages);
    const rows = source.slice((stackState.page - 1) * pageSize, stackState.page * pageSize);
    const list = rows.length ? rows.map(item => `<li><a href="#/value-sets/${encodeURIComponent(item.id)}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)} / ${item.count} values</small></span><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></a></li>`).join("") : `<li class="stack-empty">No matching value sets</li>`;
    const label = side === "a" ? el("leftModel").value : el("rightModel").value;
    return `<section class="value-stack ${stackState.open ? "is-open" : ""}" data-stack="${side}">
      <button class="value-stack-trigger" type="button" aria-expanded="${stackState.open}" aria-controls="value-stack-panel-${side}"><span>Model ${side.toUpperCase()}</span><strong>${escapeHtml(label)}</strong><span class="stack-chevron" aria-hidden="true">⌄</span></button>
      <div class="value-stack-panel" id="value-stack-panel-${side}" ${stackState.open ? "" : "hidden"}>
        <div class="value-stack-tools"><label>Search this stack<input type="search" data-stack-search="${side}" value="${escapeHtml(stackState.query)}" placeholder="Value set name or ID" /></label><div class="status-sort" aria-label="Sort status first"><span>Status first</span><button type="button" data-status-first="Changed" data-side="${side}" class="${stackState.statusFirst === "Changed" ? "is-active" : ""}">Changed</button><button type="button" data-status-first="Shared" data-side="${side}" class="${stackState.statusFirst === "Shared" ? "is-active" : ""}">Shared</button></div></div>
        <ul class="value-stack-list">${list}</ul>
        <div class="stack-pagination"><button type="button" data-page="prev" data-side="${side}" ${stackState.page === 1 ? "disabled" : ""}>Previous</button><span>Page ${stackState.page} of ${pages}</span><button type="button" data-page="next" data-side="${side}" ${stackState.page === pages ? "disabled" : ""}>Next</button></div>
      </div>
    </section>`;
  }).join("");
  document.querySelectorAll(".value-stack-trigger").forEach(button => button.addEventListener("click", () => { const side = button.closest("[data-stack]").dataset.stack; state.stack[side].open = !state.stack[side].open; renderValueSetStacks(); }));
  document.querySelectorAll("[data-stack-search]").forEach(input => input.addEventListener("input", () => { const side = input.dataset.stackSearch; state.stack[side].query = input.value; state.stack[side].page = 1; renderValueSetStacks(); const next = document.querySelector(`[data-stack-search="${side}"]`); next.focus(); next.setSelectionRange(next.value.length, next.value.length); }));
  document.querySelectorAll("[data-status-first]").forEach(button => button.addEventListener("click", () => { state.stack[button.dataset.side].statusFirst = button.dataset.statusFirst; state.stack[button.dataset.side].page = 1; renderValueSetStacks(); }));
  document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => { state.stack[button.dataset.side].page += button.dataset.page === "next" ? 1 : -1; renderValueSetStacks(); }));
}

document.querySelectorAll(".mode-tab").forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
el("clearModel").addEventListener("click", () => { state.model = "all"; renderModels(); renderResults(); });
el("searchForm").addEventListener("submit", event => { event.preventDefault(); state.query = el("searchInput").value; window.location.hash = `/search?q=${encodeURIComponent(state.query)}`; resultsList.replaceChildren(loadingTemplate.content.cloneNode(true)); window.setTimeout(renderResults, 420); });
el("heroSearchForm").addEventListener("submit", event => { event.preventDefault(); const query = el("heroSearchInput").value.trim(); window.location.hash = `/search?q=${encodeURIComponent(query)}`; });
el("definitionsToggle").addEventListener("change", () => { state.query = el("searchInput").value; renderResults(); });
el("valueSetsToggle").addEventListener("change", () => { state.model = "all"; renderModels(); renderResults(); renderDetail(); });
el("sortSelect").addEventListener("change", event => { state.sort = event.target.value; renderResults(); });
document.querySelectorAll('input[name="strategy"]').forEach(input => input.addEventListener("change", event => { state.strategy = event.target.value; renderComparison(); }));
document.querySelectorAll('input[name="graphView"]').forEach(input => input.addEventListener("change", event => { state.graphView = event.target.value; document.querySelector(".compare-workspace").dataset.graphView = state.graphView; }));
el("runCompare").addEventListener("click", () => {
  const button = el("runCompare");
  button.disabled = true;
  button.textContent = "Calculating";
  window.setTimeout(() => { renderComparison(); renderValueSetStacks(); button.disabled = false; button.textContent = "Calculate diff"; }, 520);
});

function setActiveNav(route) {
  document.querySelectorAll("[data-nav-route]").forEach(link => {
    const active = link.dataset.navRoute === route;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  });
}

function handleRoute() {
  const raw = window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "/";
  const [path, queryString = ""] = raw.split("?");
  const params = new URLSearchParams(queryString);
  if (path === "/search") {
    setActiveNav("search");
    setMode("entities");
    state.query = params.get("q") || "";
    el("searchInput").value = state.query;
    if (state.query.toLowerCase().includes("value")) el("valueSetsToggle").checked = true;
    renderModels(); renderResults(); renderDetail();
    el("explorer").scrollIntoView({ block: "start" });
    return;
  }
  if (path === "/models") { setActiveNav("models"); setMode("entities"); el("explorer").scrollIntoView({ block: "start" }); return; }
  if (path === "/terms") { setActiveNav("terms"); setMode("terms"); el("explorer").scrollIntoView({ block: "start" }); return; }
  if (path === "/compare") { setActiveNav("compare"); el("compare").scrollIntoView({ block: "start" }); return; }
  if (path.startsWith("/value-sets/")) {
    setActiveNav("search");
    el("valueSetsToggle").checked = true;
    setMode("entities");
    state.selectedId = decodeURIComponent(path.split("/").pop());
    renderModels(); renderResults(); renderDetail();
    el("entityPanel").scrollIntoView({ block: "start" });
    return;
  }
  if (path.includes("/properties/")) {
    setActiveNav("models");
    setMode("entities");
    state.selectedId = decodeURIComponent(path.split("/").pop());
    renderResults(); renderDetail();
    el("entityPanel").scrollIntoView({ block: "start" });
    return;
  }
  setActiveNav("home");
  el("top").scrollIntoView({ block: "start" });
}

const themeButton = el("themeButton");
themeButton.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.textContent = dark ? "Light mode" : "Dark mode";
});

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
}), { threshold: 0.13 });
document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

const heroVideos = document.querySelectorAll(".hero-background video");
heroVideos.forEach(heroVideo => {
  const setHeroPlaybackRate = () => { heroVideo.playbackRate = 0.55; };
  setHeroPlaybackRate();
  heroVideo.addEventListener("loadedmetadata", setHeroPlaybackRate, { once: true });
});

window.addEventListener("hashchange", handleRoute);
setMode("entities");
renderComparison();
renderValueSetStacks();
handleRoute();
