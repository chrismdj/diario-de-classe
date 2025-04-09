// ========================================================
// INÍCIO DO CÓDIGO COMPLETO script.js (Com Scroll TOTAL para o FIM)
// ========================================================

// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhVGPaF3gWYxOB19qskDrdQ5HxaTuDrM8xPmjUjWXLna59CEl7hPSFZNvKGCGUeK2kPw/exec"; // <<< VERIFIQUE SUA URL
const schoolClasses = { /* ... Sua estrutura de colégios e turmas (MAIÚSCULAS)... */ };
// const schoolLogos = { /* ... Mapeamento logos (Comentado ou Removido) ... */ };
// ----------------------------------------------

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
// const schoolLogoElement = document.getElementById('schoolLogo'); // Removido ou Comentado
// --------------------------

// --- Funções Auxiliares ---
function showLoading(isLoading, message = "Carregando/Processando...") { loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false) { updateStatusElement.textContent = message; updateStatusElement.className = 'status-message'; if (message) { updateStatusElement.classList.add(isError ? 'error' : 'success'); } }
function formatHeaderDateToDDMM(dateString) { if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// --------------------------

// --- Funções Dropdowns Dinâmicos ---
function populateClassDropdown() { const selectedSchool = schoolSelect.value; sheetSelect.length = 1; sheetSelect.selectedIndex = 0; /* Logo logic commented out */ if (selectedSchool && schoolClasses[selectedSchool]) { const classes = schoolClasses[selectedSchool]; classes.forEach(sheetName => { const option = document.createElement('option'); option.value = sheetName; const nameParts = sheetName.split('_'); const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName; option.textContent = friendlyName; sheetSelect.appendChild(option); }); sheetSelect.disabled = false; } else { sheetSelect.disabled = true; } tableHead.innerHTML = '<tr><th></th></tr>'; tableBody.innerHTML = '<tr><td>...</td></tr>'; showStatus("Selecione uma turma."); }
function populateSchoolDropdown() { const schools = Object.keys(schoolClasses); schools.sort(); schools.forEach(schoolName => { const option = document.createElement('option'); option.value = schoolName; option.textContent = schoolName; schoolSelect.appendChild(option); });}
// --------------------------------------------

// --- Funções Principais ---
async function loadSheetData() {
    const selectedSheet = sheetSelect.value;
    const selectedBimester = bimesterSelect.value;
    if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); return; }
    showLoading(true, `Carregando...`); showStatus(""); tableHead.innerHTML = '<tr><th>Carregando...</th></tr>'; tableBody.innerHTML = '<tr><td>Carregando...</td></tr>';
    let fetchUrl = `${SCRIPT_URL}?sheet=${encodeURIComponent(selectedSheet)}`;
    if (selectedBimester !== "0") { fetchUrl += `&bimester=${encodeURIComponent(selectedBimester)}`; }
    console.log("Fetching from:", fetchUrl);
    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) { let eMsg = `Erro HTTP ${response.status}.`; try{const d=await response.json(); if(d && d.message) eMsg += ` Detalhe: ${d.message}`;} catch(e){} throw new Error(eMsg); }
        const data = await response.json();
        if (data.status === 'error') { throw new Error(data.message || "Erro Apps Script."); }
        if (!data.headers || typeof data.students === 'undefined') { throw new Error("Formato dados inesperado."); }

        // Renderiza a tabela
        renderAttendanceTable(data.headers, data.students);
        // Atualiza status
        showStatus(data.students.length > 0 ? "Dados carregados." : "Dados carregados (sem alunos).", false);
        if (data.message && data.students.length > 0) { showStatus(updateStatusElement.textContent + " | Aviso: " + data.message, false); }
        else if (data.message) { showStatus("Aviso: " + data.message, false); }

        // === SCROLL TOTAL PARA O FINAL DA PÁGINA ===
        // Usamos um pequeno setTimeout para dar tempo ao navegador de renderizar a tabela
        // e calcular a altura correta do scrollHeight. 50ms geralmente é suficiente.
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight, // <<< Rola para a altura total do corpo do documento
                behavior: 'smooth' // <<< Efeito de rolagem suave
            });
            console.log("Scrolled to bottom of page."); // Log para confirmar
        }, 50);
        // ============================================

    } catch (error) {
        console.error("Erro:", error);
        showStatus(`Erro: ${error.message}`, true);
        tableHead.innerHTML = '<tr><th>Erro</th></tr>';
        tableBody.innerHTML = '<tr><td>Não foi possível carregar.</td></tr>';
    } finally {
        showLoading(false);
    }
}

function renderAttendanceTable(originalHeaders, students) { /* ... (Função MANTIDA - igual resposta #99) ... */ }
async function handleAttendanceChange(event) { /* ... (Função MANTIDA - igual resposta #99) ... */ }
async function addStudent() { /* ... (Função MANTIDA - igual resposta #99) ... */ }
// -----------------------------------------------------------------------------

// --- INICIALIZAÇÃO ---
// (Mantida igual à resposta #99)
window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM carregado. Iniciando configuração...");
    try {
        populateSchoolDropdown(); console.log("populateSchoolDropdown chamado.");
        if(schoolSelect) { schoolSelect.addEventListener('change', populateClassDropdown); console.log("Listener 'change' adicionado a schoolSelect."); } else { console.error("Elemento schoolSelect não encontrado!"); }
        if(bimesterSelect) { bimesterSelect.addEventListener('change', loadSheetData); console.log("Listener 'change' adicionado a bimesterSelect."); } else { console.error("Elemento bimesterSelect não encontrado!"); }
        if(loadSheetButton) { loadSheetButton.addEventListener('click', loadSheetData); console.log("Listener 'click' adicionado a loadSheetButton."); } else { console.error("Elemento loadSheetButton não encontrado!"); }
        if(addStudentButton) { addStudentButton.addEventListener('click', addStudent); console.log("Listener 'click' adicionado a addStudentButton."); } else { console.error("Elemento addStudentButton não encontrado!"); }
        showStatus("Selecione um colégio para ver as turmas.");
        console.log("Configuração inicial concluída.");
    } catch (error) { console.error("Erro durante a inicialização DOMContentLoaded:", error); showStatus("Erro crítico ao inicializar a página.", true); }
});
// -----------------------------

// --- Registro do Service Worker ---
// (Mantido igual à resposta #99)
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered.', reg)).catch(err => console.log('SW registration failed: ', err)); });} else { console.log('Service workers not supported.');}
// -------------------------------------------------------

// ========================================================
// FIM DO CÓDIGO COMPLETO script.js
// ========================================================