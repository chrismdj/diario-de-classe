// ========================================================
// INÍCIO DO CÓDIGO COMPLETO script.js (COM LOGS DE DEBUG)
// ========================================================

// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhVGPaF3gWYxOB19qskDrdQ5HxaTuDrM8xPmjUjWXLna59CEl7hPSFZNvKGCGUeK2kPw/exec"; // <<< VERIFIQUE SUA URL
const schoolClasses = { /* ... Sua estrutura (MAIÚSCULAS) ... */ };
const schoolLogos = { /* ... Mapeamento logos (se for usar depois) ... */ };
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
const schoolLogoElement = document.getElementById('schoolLogo');
// Não precisamos da referência ao botão toggle aqui se removemos
// --------------------------

// --- Funções Auxiliares ---
function showLoading(isLoading, message = "Carregando/Processando...") { /* ... */ }
function showStatus(message, isError = false) { /* ... */ }
function formatHeaderDateToDDMM(dateString) { /* ... */ }
// --------------------------

// --- Funções Dropdowns Dinâmicos ---
function populateClassDropdown() {
    console.log("Iniciando populateClassDropdown..."); // DEBUG
    const selectedSchool = schoolSelect.value;
    console.log("Colégio selecionado:", selectedSchool); // DEBUG
    sheetSelect.length = 1; sheetSelect.selectedIndex = 0;

    // Lógica do Logo (Comentada)
    /*
    if (selectedSchool && schoolLogos[selectedSchool]) {
        schoolLogoElement.src = schoolLogos[selectedSchool]; schoolLogoElement.style.display = 'inline-block'; schoolLogoElement.alt = `Logo ${selectedSchool}`;
    } else {
        schoolLogoElement.style.display = 'none'; schoolLogoElement.src = ''; schoolLogoElement.alt = 'Logo do Colégio';
    }
    */

    // Popula dropdown de turmas
    if (selectedSchool && schoolClasses[selectedSchool]) {
        console.log("Encontradas classes para o colégio:", schoolClasses[selectedSchool]); // DEBUG
        const classes = schoolClasses[selectedSchool];
        classes.forEach(sheetName => {
            // console.log("Adicionando turma:", sheetName); // DEBUG (Opcional, pode gerar muito log)
            const option = document.createElement('option'); option.value = sheetName; const nameParts = sheetName.split('_'); const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName; option.textContent = friendlyName; sheetSelect.appendChild(option);
        });
        sheetSelect.disabled = false;
        console.log("Dropdown de turmas populado. Total de opções:", sheetSelect.options.length); // DEBUG
    } else {
        console.log("Nenhum colégio selecionado ou sem turmas definidas para:", selectedSchool); // DEBUG
        sheetSelect.disabled = true;
    }
    tableHead.innerHTML = '<tr><th></th></tr>'; tableBody.innerHTML = '<tr><td>...</td></tr>'; showStatus("Selecione uma turma.");
}

function populateSchoolDropdown() {
     console.log("Iniciando populateSchoolDropdown..."); // <<< DEBUG
     if (!schoolClasses || Object.keys(schoolClasses).length === 0) {
          console.error("!!! Estrutura schoolClasses está vazia ou inválida !!!"); // <<< DEBUG
          showStatus("Erro: Configuração de escolas/turmas inválida.", true);
          return;
     }
     try {
          const schools = Object.keys(schoolClasses);
          console.log("Colégios encontrados na estrutura:", schools); // <<< DEBUG
          schools.sort();
          schools.forEach(schoolName => {
              // console.log("Adicionando opção de colégio:", schoolName); // <<< DEBUG (Opcional)
              const option = document.createElement('option');
              option.value = schoolName;
              option.textContent = schoolName;
              schoolSelect.appendChild(option);
          });
          console.log("Finalizou populateSchoolDropdown. Total de opções:", schoolSelect.options.length); // <<< DEBUG
     } catch (error) {
          console.error("Erro dentro de populateSchoolDropdown:", error); // <<< DEBUG
          showStatus("Erro ao carregar lista de colégios.", true);
     }
}
// --------------------------------------------

// --- Funções Principais (loadSheetData, renderAttendanceTable, handleAttendanceChange, addStudent) ---
// (Mantenha as funções como na resposta #86 / #93)
async function loadSheetData() { /* ... */ }
function renderAttendanceTable(originalHeaders, students) { /* ... */ }
async function handleAttendanceChange(event) { /* ... */ }
async function addStudent() { /* ... */ }
// -----------------------------------------------------------------------------

// --- INICIALIZAÇÃO ---
window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM carregado. Iniciando configuração..."); // <<< DEBUG
    try {
        populateSchoolDropdown(); // Chama a função para popular colégios
        console.log("populateSchoolDropdown chamado."); // DEBUG

        if(schoolSelect) {
            schoolSelect.addEventListener('change', populateClassDropdown);
            console.log("Listener 'change' adicionado a schoolSelect."); // DEBUG
        } else { console.error("Elemento schoolSelect não encontrado!"); }

        if(bimesterSelect) {
             bimesterSelect.addEventListener('change', loadSheetData);
             console.log("Listener 'change' adicionado a bimesterSelect."); // DEBUG
        } else { console.error("Elemento bimesterSelect não encontrado!"); }

        if(loadSheetButton) {
             loadSheetButton.addEventListener('click', loadSheetData);
             console.log("Listener 'click' adicionado a loadSheetButton."); // DEBUG
         } else { console.error("Elemento loadSheetButton não encontrado!"); }

         if(addStudentButton) {
             addStudentButton.addEventListener('click', addStudent);
             console.log("Listener 'click' adicionado a addStudentButton."); // DEBUG
         } else { console.error("Elemento addStudentButton não encontrado!"); }

        showStatus("Selecione um colégio para ver as turmas.");
        console.log("Configuração inicial concluída."); // DEBUG
    } catch (error) {
         console.error("Erro durante a inicialização DOMContentLoaded:", error); // DEBUG
         showStatus("Erro crítico ao inicializar a página.", true);
    }
});
// -----------------------------


// --- Registro do Service Worker ---
// (Mantido como na resposta #93)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => { console.log('SW registered:', registration); })
      .catch(error => { console.log('SW registration failed: ', error); });
  });
} else { console.log('Service workers not supported.'); }
// -------------------------------------------------------

// ========================================================
// FIM DO CÓDIGO COMPLETO script.js
// ========================================================