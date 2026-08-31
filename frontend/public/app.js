const entities = [
  { id: "model-gdc", type: "Model", name: "Genomic Data Commons", handle: "GDC", model: "GDC", version: "3.0", definition: "A harmonized data model for genomic and clinical cancer research data.", nodes: 42, relationships: 71, properties: 638, related: ["case", "diagnosis", "sample"] },
  { id: "node-case", type: "Node", name: "case", handle: "case", model: "GDC", version: "3.0", definition: "The collection of all data related to a specific subject in a cancer study.", relationships: "diagnosis, demographic, sample", related: ["diagnosis", "sample", "demographic"] },
  { id: "property-diagnosis", type: "Property", name: "primary_diagnosis", handle: "primary_diagnosis", model: "GDC", version: "3.0", definition: "The text term used to describe the primary pathologic diagnosis.", valueType: "string", permissible: "Primary Diagnosis Value Set", cde: "C154625", related: ["diagnosis", "tumor_grade"] },
  { id: "model-ccdi", type: "Model", name: "Childhood Cancer Data Initiative", handle: "CCDI", model: "CCDI", version: "2.1", definition: "A cross-program model for childhood cancer research data interoperability.", nodes: 36, relationships: 54, properties: 481, related: ["participant", "diagnosis", "specimen"] },
  { id: "node-participant", type: "Node", name: "participant", handle: "participant", model: "CCDI", version: "2.1", definition: "A person represented in a childhood cancer research study.", relationships: "diagnosis, survival, specimen", related: ["diagnosis", "survival", "specimen"] },
  { id: "property-disease", type: "Property", name: "disease_phase", handle: "disease_phase", model: "CCDI", version: "2.1", definition: "The phase of disease at the time of an observation or intervention.", valueType: "enumeration", permissible: "Disease Phase Value Set", cde: "C124453", related: ["diagnosis", "treatment"] },
  { id: "model-ctdc", type: "Model", name: "Clinical Trial Data Commons", handle: "CTDC", model: "CTDC", version: "1.4", definition: "A model for harmonized clinical trial research data.", nodes: 29, relationships: 44, properties: 352, related: ["participant", "study", "treatment"] },
  { id: "node-specimen", type: "Node", name: "specimen", handle: "specimen", model: "CTDC", version: "1.4", definition: "A material sample collected from a participant for analysis.", relationships: "participant, sample_collection, assay", related: ["participant", "assay", "sample_collection"] },
  { id: "property-age", type: "Property", name: "age_at_diagnosis", handle: "age_at_diagnosis", model: "CTDC", version: "1.4", definition: "Age of a participant at the time the diagnosis was established.", valueType: "integer", permissible: "Non-negative integer", cde: "C124437", related: ["participant", "diagnosis"] }
];

const terms = [
  { id: "term-neoplasm", type: "Term", name: "Malignant neoplasm", handle: "Malignant neoplasm", model: "NCI Thesaurus", version: "24.08", definition: "A neoplasm characterized by invasive growth and the potential to metastasize.", origin: "NCIt", originId: "C9305", originUrl: "https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&ns=ncit&code=C9305", permissible: "Primary Diagnosis Value Set", related: ["primary_diagnosis", "disease_type"] },
  { id: "term-relapse", type: "Term", name: "Relapse", handle: "Relapse", model: "NCI Thesaurus", version: "24.08", definition: "The return of a disease after a period of improvement or remission.", origin: "NCIt", originId: "C38155", originUrl: "https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&ns=ncit&code=C38155", permissible: "Disease Phase Value Set", related: ["disease_phase", "event_type"] },
  { id: "term-specimen", type: "Term", name: "Biospecimen", handle: "Biospecimen", model: "caDSR", version: "4.0", definition: "A biological material collected for research, diagnosis, or treatment purposes.", origin: "caDSR", originId: "C70699", originUrl: "https://cadsr.cancer.gov/", permissible: "Specimen Type Value Set", related: ["specimen_type", "sample_type"] },
  { id: "term-remission", type: "Term", name: "Complete remission", handle: "Complete remission", model: "NCI Thesaurus", version: "24.08", definition: "The disappearance of all signs of cancer in response to treatment.", origin: "NCIt", originId: "C4870", originUrl: "https://ncit.nci.nih.gov/", permissible: "Disease Response Value Set", related: ["response", "disease_phase"] }
];

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

const state = { mode: "entities", model: "all", query: "", selectedId: "property-diagnosis", sort: "relevance", strategy: "nodes" };

const el = (id) => document.getElementById(id);
const resultsList = el("resultsList");
const modelList = el("modelList");
const entityDetail = el("entityDetail");
const loadingTemplate = el("loadingTemplate");

function activeData() { return state.mode === "terms" ? terms : entities; }
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
  return rows;
}

function renderDetail() {
  const all = [...entities, ...terms];
  let item = all.find(record => record.id === state.selectedId);
  if (!item || !activeData().some(record => record.id === item.id)) {
    item = activeData()[0];
    state.selectedId = item.id;
  }
  const rows = detailRows(item).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const link = item.originUrl ? `<a class="origin-link" href="${item.originUrl}" target="_blank" rel="noreferrer">Open origin resource</a>` : "";
  entityDetail.innerHTML = `<article class="entity-detail"><p class="detail-breadcrumb">${escapeHtml(item.model)} / ${escapeHtml(item.version)}</p><p class="detail-kicker">${escapeHtml(item.type)}</p><h3 id="entity-title">${escapeHtml(item.handle)}</h3><p class="detail-definition">${escapeHtml(item.definition)}</p><dl class="detail-list">${rows}</dl><section class="detail-section"><h4>${item.type === "Term" ? "Defines these entities" : "Related entities"}</h4><ul class="related-list">${item.related.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul></section>${link}</article>`;
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
  const enabled = new Set([...document.querySelectorAll('input[name="equivalence"]:checked')].map(input => input.value));
  const criterionFor = basis => basis === "Exact name" ? "string" : basis === "Normalized name" ? "normalized" : basis.startsWith("CDE") ? "cde" : basis === "Value set" ? "valueset" : null;
  const rows = comparisonRows[state.strategy].flatMap(row => {
    const criterion = criterionFor(row[1]);
    if (criterion && !enabled.has(criterion) && row[0] && row[2]) {
      return [[row[0], "Not paired", null, "unique"], [null, "Not paired", row[2], "unique"]];
    }
    return [row];
  });
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

document.querySelectorAll(".mode-tab").forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
document.querySelectorAll("[data-set-mode]").forEach(link => link.addEventListener("click", () => setMode(link.dataset.setMode)));
el("clearModel").addEventListener("click", () => { state.model = "all"; renderModels(); renderResults(); });
el("searchForm").addEventListener("submit", event => { event.preventDefault(); state.query = el("searchInput").value; resultsList.replaceChildren(loadingTemplate.content.cloneNode(true)); window.setTimeout(renderResults, 420); });
el("definitionsToggle").addEventListener("change", () => { state.query = el("searchInput").value; renderResults(); });
el("sortSelect").addEventListener("change", event => { state.sort = event.target.value; renderResults(); });
document.querySelectorAll('input[name="strategy"]').forEach(input => input.addEventListener("change", event => { state.strategy = event.target.value; renderComparison(); }));
document.querySelectorAll('input[name="equivalence"]').forEach(input => input.addEventListener("change", renderComparison));
el("runCompare").addEventListener("click", () => {
  const button = el("runCompare");
  button.disabled = true;
  button.textContent = "Calculating";
  window.setTimeout(() => { renderComparison(); button.disabled = false; button.textContent = "Calculate diff"; }, 520);
});

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

setMode("entities");
renderComparison();
