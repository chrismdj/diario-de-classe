// ========================================================
// INÍCIO DO CÓDIGO COMPLETO script.js
// ========================================================

// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhVGPaF3gWYxOB19qskDrdQ5HxaTuDrM8xPmjUjWXLna59CEl7hPSFZNvKGCGUeK2kPw/exec"; // <<< COLOQUE A URL CORRETA AQUI
const schoolClasses = { /* ... Sua estrutura de colégios e turmas (MAIÚSCULAS)... */ };
const schoolLogos = { /* ... Seu mapeamento de colégios para logos (se for usar depois)... */ };
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
const schoolLogoElement = document.getElementById('schoolLogo'); // Referência do logo (mesmo que não usada agora)
const toggleControlsButton = document.getElementById('toggleControlsButton'); // <<< BOTÃO HAMBÚRGUER
const collapsibleControls = document.getElementById('collapsibleControls'); // <<< CONTAINER DOS CONTROLES
// --------------------------

// --- Funções Auxiliares (showLoading, showStatus, formatHeaderDateToDDMM) ---
// (Mantenha as funções da resposta #75)
function showLoading(isLoading, message = "Carregando/Processando...") { loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false) { updateStatusElement.textContent = message; updateStatusElement.className = 'status-message'; if (message) { updateStatusElement.classList.add(isError ? 'error' : 'success'); } }
function formatHeaderDateToDDMM(dateString) { if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// -----------------------------------------------------------------------

// --- Funções Dropdowns Dinâmicos ---
// (Função populateClassDropdown PRECISA ser ajustada para NÃO mexer no logo se deixamos para depois)
function populateClassDropdown() {
    const selectedSchool = schoolSelect.value;
    sheetSelect.length = 1; sheetSelect.selectedIndex = 0; // Limpa turmas

    // --- LÓGICA DO LOGO (COMENTADA POR ENQUANTO, conforme solicitado) ---
    /*
    if (selectedSchool && schoolLogos[selectedSchool]) {
        schoolLogoElement.src = schoolLogos[selectedSchool];
        schoolLogoElement.style.display = 'inline-block';
        schoolLogoElement.alt = `Logo ${selectedSchool}`;
    } else {
        schoolLogoElement.style.display = 'none';
        schoolLogoElement.src = '';
        schoolLogoElement.alt = 'Logo do Colégio';
    }
    */
    // --- FIM LOGO ---

    // Popula dropdown de turmas
    if (selectedSchool && schoolClasses[selectedSchool]) {
        const classes = schoolClasses[selectedSchool];
        classes.forEach(sheetName => { const option = document.createElement('option'); option.value = sheetName; const nameParts = sheetName.split('_'); const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName; option.textContent = friendlyName; sheetSelect.appendChild(option); });
        sheetSelect.disabled = false;
    } else { sheetSelect.disabled = true; }

    // Limpa tabela e status
    tableHead.innerHTML = '<tr><th></th></tr>'; tableBody.innerHTML = '<tr><td>...</td></tr>'; showStatus("Selecione uma turma.");
}
function populateSchoolDropdown() { const schools = Object.keys(schoolClasses); schools.sort(); schools.forEach(schoolName => { const option = document.createElement('option'); option.value = schoolName; option.textContent = schoolName; schoolSelect.appendChild(option); });}
// --------------------------------------------

// --- Funções Principais (loadSheetData, renderAttendanceTable, handleAttendanceChange, addStudent) ---
// (Mantenha as funções da resposta #75)
async function loadSheetData() { /* ... */ }
function renderAttendanceTable(originalHeaders, students) { /* ... */ }
async function handleAttendanceChange(event) { /* ... */ }
async function addStudent() { /* ... */ }
// -----------------------------------------------------------------------------

// --- INICIALIZAÇÃO MODIFICADA ---
window.addEventListener('DOMContentLoaded', (event) => {
    populateSchoolDropdown();
    schoolSelect.addEventListener('change', populateClassDropdown);
    bimesterSelect.addEventListener('change', loadSheetData);
    loadSheetButton.addEventListener('click', loadSheetData);
    addStudentButton.addEventListener('click', addStudent);

    // --- LISTENER PARA O BOTÃO HAMBÚRGUER ---
    if (toggleControlsButton && collapsibleControls) { // Verifica se os elementos existem
        toggleControlsButton.addEventListener('click', () => {
            const isCollapsed = collapsibleControls.classList.contains('collapsed');
            if (isCollapsed) {
                collapsibleControls.classList.remove('collapsed');
                toggleControlsButton.setAttribute('aria-expanded', 'true');
            } else {
                collapsibleControls.classList.add('collapsed');
                toggleControlsButton.setAttribute('aria-expanded', 'false');
            }
        });
        // Garante estado inicial consistente com a classe HTML
        if (collapsibleControls.classList.contains('collapsed')) {
             toggleControlsButton.setAttribute('aria-expanded', 'false');
        } else {
             toggleControlsButton.setAttribute('aria-expanded', 'true');
        }

    } else {
        console.error("Botão de toggle ou container não encontrado!");
    }
    // --- FIM LISTENER HAMBÚRGUER ---

    showStatus("Selecione um colégio para ver as turmas.");
});
// -----------------------------

// --- Registro do Service Worker (Mantido) ---
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered.', reg)).catch(err => console.log('SW registration failed: ', err)); });} else { console.log('Service workers not supported.');}
// -------------------------------------------------------

// ========================================================
// FIM DO CÓDIGO COMPLETO script.js
// ========================================================