// ========================================================
// INÍCIO DO CÓDIGO COMPLETO script.js (Com Scroll TOTAL e Populando Escolas)
// ========================================================

// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhVGPaF3gWYxOB19qskDrdQ5HxaTuDrM8xPmjUjWXLna59CEl7hPSFZNvKGCGUeK2kPw/exec"; // <<< VERIFIQUE SUA URL

// --- ESTRUTURA Escola -> Nomes das Abas ---
// IMPORTANTE: VERIFIQUE CUIDADOSAMENTE A SINTAXE E OS NOMES AQUI!
const schoolClasses = {
  // Exemplo - SUBSTITUA PELOS SEUS DADOS REAIS (NOMES DE ABA EM MAIÚSCULAS)
  "CRISTÃO 3R": [
    "C3R_3A", "C3R_3B", "C3R_4A", "C3R_4B", "C3R_5A", "C3R_5B",
    "C3R_6A", "C3R_6B", "C3R_7A", "C3R_7B", "C3R_8A", "C3R_8B"
  ], // <-- Atenção à vírgula
  "PAULISTA SANTA BARBARA": [
    "PSB_6A", "PSB_7A", "PSB_8A", "PSB_9A"
  ], // <-- Atenção à vírgula
  "PAULISTA RODOLFO PIRANI": [
    "PRP_6B", "PRP_7B", "PRP_8B", "PRP_9B",
    "PRP_1EM", "PRP_2EM", "PRP_3EM"
  ] // <-- SEM vírgula no último
};
// ----------------------------------------------------------------

// --- Elementos da Página ---
const schoolSelect = document.getElementById('schoolSelect');
const sheetSelect = document.getElementById('sheetSelect');
const bimesterSelect = document.getElementById('bimesterSelect');
const loadSheetButton = document.getElementById('loadSheetButton');
const attendanceTable = document.getElementById('attendanceTable');
const tableHead = attendanceTable.querySelector('thead');
const tableBody = attendanceTable.querySelector('tbody');
const loadingElement = document.getElementById('loading');
const updateStatusElement = document.getElementById('updateStatus');
const newStudentNameInput = document.getElementById('newStudentName');
const addStudentButton = document.getElementById('addStudentButton');
// const schoolLogoElement = document.getElementById('schoolLogo'); // Logo comentado
// --------------------------

// --- Funções Auxiliares ---
function showLoading(isLoading, message = "Carregando/Processando...") { loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false) { updateStatusElement.textContent = message; updateStatusElement.className = 'status-message'; if (message) { updateStatusElement.classList.add(isError ? 'error' : 'success'); } }
function formatHeaderDateToDDMM(dateString) { if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `<span class="math-inline">\{parts\[0\]\.padStart\(2, '0'\)\}/</span>{parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `<span class="math-inline">\{day\}/</span>{month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// --------------------------

// --- Funções Dropdowns Dinâmicos ---
function populateClassDropdown() {
    console.log("Iniciando populateClassDropdown...");
    const selectedSchool = schoolSelect.value;
    console.log("Colégio selecionado:", selectedSchool);
    sheetSelect.length = 1; sheetSelect.selectedIndex = 0; // Limpa turmas

    // Popula dropdown de turmas
    if (selectedSchool && schoolClasses[selectedSchool]) {
        console.log("Encontradas classes para o colégio:", schoolClasses[selectedSchool]);
        const classes = schoolClasses[selectedSchool];
        classes.forEach(sheetName => {
             const option = document.createElement('option'); option.value = sheetName; const nameParts = sheetName.split('_'); const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName; option.textContent = friendlyName; sheetSelect.appendChild(option);
        });
        sheetSelect.disabled = false;
        console.log("Dropdown de turmas populado. Total de opções:", sheetSelect.options.length);
    } else {
        console.log("Nenhum colégio selecionado ou sem turmas definidas para:", selectedSchool);
        sheetSelect.disabled = true;
    }
    tableHead.innerHTML = '<tr><th></th></tr>'; tableBody.innerHTML = '<tr><td>...</td></tr>'; showStatus("Selecione uma turma.");
}

function populateSchoolDropdown() {
     console.log("Iniciando populateSchoolDropdown..."); // DEBUG
     // Verifica se schoolClasses existe e tem chaves antes de prosseguir
     if (!schoolClasses || typeof schoolClasses !== 'object' || Object.keys(schoolClasses).length === 0) {
          console.error("!!! Estrutura schoolClasses está vazia, inválida ou não definida !!!"); // DEBUG
          showStatus("Erro: Configuração de escolas/turmas inválida no script.js.", true);
          return; // Interrompe a função aqui
     }
     try {
          const schools = Object.keys(schoolClasses);
          console.log("Colégios encontrados na estrutura:", schools); // DEBUG
          schools.sort();
          schools.forEach(schoolName => {
               const option = document.createElement('option'); option.value = schoolName; option.textContent = schoolName; schoolSelect.appendChild(option);
          });
          console.log("Finalizou populateSchoolDropdown. Total de opções:", schoolSelect.options.length); // DEBUG
     } catch (error) {
          console.error("Erro dentro de populateSchoolDropdown:", error); // DEBUG
          showStatus("Erro ao carregar lista de colégios.", true);
     }
}
// --------------------------------------------

// --- Funções Principais ---
async function loadSheetData() {
    const selectedSheet = sheetSelect.value; const selectedBimester = bimesterSelect.value;
    if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); return; }
    showLoading(true, `Carregando...`); showStatus(""); tableHead.innerHTML = '<tr><th>Carregando...</th></tr>'; tableBody.innerHTML = '<tr><td>Carregando...</td></tr>';
    let fetchUrl = `<span class="math-inline">\{SCRIPT\_URL\}?sheet\=</span>{encodeURIComponent(selectedSheet)}`; if (selectedBimester !== "0") { fetchUrl += `&bimester=${encodeURIComponent(selectedBimester)}`; }
    console.log("Fetching from:", fetchUrl);
    try {
        const response = await fetch(fetchUrl); if (!response.ok) { let eMsg = `Erro HTTP ${response.status}.`; try{const d=await response.json();