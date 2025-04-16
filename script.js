// ========================================================
// INÍCIO DO CÓDIGO COMPLETO script.js (vCom Correções Finais)
// ========================================================

// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2DzC7c_qphZTCzJeU8PUh1k0Cz-XhYmojokRLsZ_PT1TaXM1dtHzxtz1Rw6vR5g7k/exec"; // <<< SUA URL ATUAL

// --- ESTRUTURA Escola -> Nomes das Abas ---
const schoolClasses = {
  "CRISTÃO 3R": [
    "C3R_3A", "C3R_3B", "C3R_4A", "C3R_4B", "C3R_5A", "C3R_5B",
    "C3R_6A", "C3R_6B", "C3R_7A", "C3R_7B", "C3R_8A", "C3R_8B"
  ],
  "PAULISTA SANTA BARBARA": [
    "PSB_6A", "PSB_7A", "PSB_8A", "PSB_9A"
  ],
  "PAULISTA RODOLFO PIRANI": [
    "PRP_6B", "PRP_7B", "PRP_8B", "PRP_9B",
    "PRP_1EM", "PRP_2EM", "PRP_3EM"
  ]
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
const hamburgerMenu = document.getElementById('hamburger-menu');
const collapsibleSection = document.getElementById('collapsible-section');
const subtitleInfo = document.getElementById('subtitle-info');
// --------------------------

// --- Variável Global para Armazenar Subtítulo ---
let currentSubtitle = ''; // Armazena o último subtítulo válido
// ------------------------------------------------

// --- Funções Auxiliares ---
function showLoading(isLoading, message = "Carregando/Processando...") { loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false) { updateStatusElement.textContent = message; updateStatusElement.className = 'status-message'; if (message) { updateStatusElement.classList.add(isError ? 'error' : 'success'); } }
function formatHeaderDateToDDMM(dateString) { if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// --------------------------

// --- Funções Dropdowns Dinâmicos ---
function populateClassDropdown() {
    console.log("Iniciando populateClassDropdown...");
    const selectedSchool = schoolSelect.value;
    console.log("Colégio selecionado:", selectedSchool);

    // Limpa subtítulo e variável ao trocar escola
    currentSubtitle = '';
    if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;

    sheetSelect.length = 1;
    sheetSelect.selectedIndex = 0;

    if (selectedSchool && schoolClasses[selectedSchool]) {
        console.log("Encontradas classes para o colégio:", schoolClasses[selectedSchool]);
        const classes = schoolClasses[selectedSchool];
        classes.forEach(sheetName => {
            const option = document.createElement('option');
            option.value = sheetName;
            const nameParts = sheetName.split('_');
            const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName;
            option.textContent = friendlyName;
            sheetSelect.appendChild(option);
        });
        sheetSelect.disabled = false;
        console.log("Dropdown de turmas populado. Total de opções:", sheetSelect.options.length);
    } else {
        console.log("Nenhum colégio selecionado ou sem turmas definidas para:", selectedSchool);
        sheetSelect.disabled = true;
    }
    tableHead.innerHTML = '<tr><th></th></tr>';
    tableBody.innerHTML = '<tr><td>Selecione uma turma.</td></tr>';
    showStatus("Selecione uma turma.");
}

function populateSchoolDropdown() {
    console.log("Iniciando populateSchoolDropdown...");
    if (!schoolClasses || typeof schoolClasses !== 'object' || Object.keys(schoolClasses).length === 0) { console.error("!!! Estrutura schoolClasses está vazia, inválida ou não definida !!!"); showStatus("Erro: Configuração de escolas/turmas inválida.", true); return; }
    try {
        const schools = Object.keys(schoolClasses);
        console.log("Colégios encontrados:", schools);
        schools.sort();
        schools.forEach(schoolName => {
            const option = document.createElement('option');
            option.value = schoolName;
            option.textContent = schoolName;
            schoolSelect.appendChild(option);
        });
        console.log("Finalizou populateSchoolDropdown. Total de opções:", schoolSelect.options.length);
    } catch (error) {
        console.error("Erro dentro de populateSchoolDropdown:", error);
        showStatus("Erro ao carregar colégios.", true);
    }
}
// --------------------------------------------

// --- Funções Principais ---
async function loadSheetData() {
    const selectedSheet = sheetSelect.value;
    const selectedBimester = bimesterSelect.value;
    if (!selectedSheet) {
        showStatus("Selecione colégio/turma.", true);
        // Limpa subtítulo e variável se tentar carregar sem turma
        currentSubtitle = '';
        if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;
        return;
    }

    // --- Recolher controles antes de carregar (LÓGICA CORRIGIDA ABAIXO) ---
    // Movido para DENTRO do listener do botão para evitar dupla execução
    let autoCollapsed = false; // Flag para saber se foi recolhido aqui
     if (collapsibleSection && !collapsibleSection.classList.contains('hidden')) {
         collapsibleSection.classList.add('hidden');
         if (hamburgerMenu) {
             // Ícone CORRIGIDO: Mostra 'Expandir' (☰) quando fecha automaticamente
             hamburgerMenu.textContent = '☰';
             hamburgerMenu.setAttribute('aria-label', 'Expandir Controles');
         }
         console.log("Controles recolhidos automaticamente.");
         autoCollapsed = true; // Marca que foi recolhido
     }
    // --- FIM ---

    showLoading(true, `Carregando ${selectedSheet}...`);
    showStatus("");
    // Limpa subtítulo e variável antes de carregar novos dados
    currentSubtitle = '';
    if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;

    tableHead.innerHTML = '<tr><th>Carregando...</th></tr>';
    tableBody.innerHTML = '<tr><td>Carregando...</td></tr>';

    let fetchUrl = `${SCRIPT_URL}?sheet=${encodeURIComponent(selectedSheet)}`;
    if (selectedBimester !== "0") {
        fetchUrl += `&bimester=${encodeURIComponent(selectedBimester)}`;
    }
    console.log("Fetching from:", fetchUrl);

    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            let eMsg = `Erro HTTP ${response.status}.`;
            try { const d = await response.json(); if (d && d.message) eMsg += ` Detalhe: ${d.message}`; } catch (e) {}
            throw new Error(eMsg);
        }
        const data = await response.json();
        if (data.status === 'error') { throw new Error(data.message || "Erro Apps Script."); }
        if (!data.headers || typeof data.students === 'undefined') { throw new Error("Formato dados inesperado."); }

        renderAttendanceTable(data.headers, data.students);

        // --- Define e ARMAZENA o subtítulo após sucesso ---
        const schoolName = schoolSelect.options[schoolSelect.selectedIndex].text;
        const className = sheetSelect.options[sheetSelect.selectedIndex].text;
        if (subtitleInfo && schoolName && className && schoolName !== '-- Selecione o Colégio --' && className !== '-- Selecione a Turma --') {
            currentSubtitle = `${schoolName} - ${className}`; // Armazena
            subtitleInfo.textContent = currentSubtitle; // Mostra
        } else {
            currentSubtitle = ''; // Limpa se seleção for inválida
             if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;
        }
        // --- FIM DA DEFINIÇÃO E ARMAZENAMENTO DO SUBTÍTULO ---

        showStatus(data.students.length > 0 ? "Dados carregados." : "Dados carregados (sem alunos).", false);
        if (data.message && data.students.length > 0) { showStatus(updateStatusElement.textContent + " | Aviso: " + data.message, false); }
        else if (data.message) { showStatus("Aviso: " + data.message, false); }

        // Scroll para o final
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            console.log("Scrolled to bottom.");
        }, 50);

    } catch (error) {
        console.error("Erro em loadSheetData:", error);
        showStatus(`Erro ao carregar: ${error.message}`, true);
        tableHead.innerHTML = '<tr><th>Erro</th></tr>';
        tableBody.innerHTML = '<tr><td>Não foi possível carregar.</td></tr>';
        // Limpa subtítulo e variável em caso de erro
        currentSubtitle = '';
        if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;
    } finally {
        showLoading(false);
    }
}

function renderAttendanceTable(originalHeaders, students) { tableHead.innerHTML = ''; tableBody.innerHTML = ''; const headerRow = tableHead.insertRow(); const thName = document.createElement('th'); thName.textContent = 'Nome do Aluno'; headerRow.appendChild(thName); const formattedHeaders = []; if (originalHeaders && originalHeaders.length > 0) { originalHeaders.forEach(h => { const th = document.createElement('th'); const fh = formatHeaderDateToDDMM(h); th.textContent = fh; headerRow.appendChild(th); formattedHeaders.push(fh); });} else { console.warn("Nenhum header de data.");} if (!students || students.length === 0) { const colspan = formattedHeaders.length + 1; tableBody.innerHTML = `<tr><td colspan="${colspan}">Nenhum aluno encontrado para esta turma/bimestre.</td></tr>`; return; } students.forEach(student => { if (!student || !student.name) return; const tr = tableBody.insertRow(); const tdName = tr.insertCell(); tdName.textContent = student.name; formattedHeaders.forEach((fh, index) => { const tdCheck = tr.insertCell(); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.studentName = student.name; cb.dataset.date = fh; cb.checked = (student.attendance && Array.isArray(student.attendance) && student.attendance[index] === true); if (!fh || !/^\d{1,2}\/\d{1,2}$/.test(fh)) {} cb.addEventListener('change', handleAttendanceChange); tdCheck.appendChild(cb); }); }); }

async function handleAttendanceChange(event) { const checkbox = event.target; const studentName = checkbox.dataset.studentName; const dateString = checkbox.dataset.date; const isAbsent = checkbox.checked; const selectedSheet = sheetSelect.value; if (!selectedSheet || !dateString || !studentName || !/^\d{1,2}\/\d{1,2}$/.test(dateString)) { showStatus("Erro interno ou data inválida.", true); checkbox.checked = !isAbsent; return; } showStatus(`Atualizando ${studentName} em ${dateString}...`); const payload = { action: "update", sheet: selectedSheet, student: studentName, date: dateString, absent: isAbsent }; try { const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow'}); if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if (d && d.message) errorMsg += ` Detalhe: ${d.message}`; } catch(e){} throw new Error(errorMsg); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Status atualizado!`, false); } else { throw new Error(result.message || "Erro ao atualizar."); } } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); checkbox.checked = !isAbsent; } }

async function addStudent() { const studentName = newStudentNameInput.value.trim(); const selectedSheet = sheetSelect.value; if (!studentName) { showStatus("Digite o nome.", true); newStudentNameInput.focus(); return; } if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); return; } showLoading(true, `Adicionando ${studentName}...`); showStatus(""); const payload = { action: "addStudent", sheet: selectedSheet, student: studentName }; try { const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' }); if (!response.ok) { throw new Error(`Erro HTTP ${response.status}.`); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Aluno adicionado!`, false); newStudentNameInput.value = ''; loadSheetData(); } else { throw new Error(result.message || "Erro ao adicionar."); } } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); } finally { showLoading(false); } }
// -----------------------------------------------------------------------------

// --- INICIALIZAÇÃO ---
window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM carregado. Iniciando configuração...");
    try {
        // Limpa subtítulo e variável na inicialização
        currentSubtitle = '';
        if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;

        if (!schoolSelect) { console.error("Elemento 'schoolSelect' NÃO encontrado!"); showStatus("Erro crítico: Elemento 'schoolSelect' não encontrado.", true); return; }
        populateSchoolDropdown(); console.log("populateSchoolDropdown chamado.");
        if(schoolSelect) { schoolSelect.addEventListener('change', populateClassDropdown); console.log("Listener 'change' adicionado a schoolSelect."); }
        if(bimesterSelect) {
             bimesterSelect.addEventListener('change', () => {
                 if (sheetSelect.value) {
                     loadSheetData();
                 }
             });
             console.log("Listener 'change' adicionado a bimesterSelect.");
         }
        if(loadSheetButton) { loadSheetButton.addEventListener('click', loadSheetData); console.log("Listener 'click' adicionado a loadSheetButton."); }
        if(addStudentButton) { addStudentButton.addEventListener('click', addStudent); console.log("Listener 'click' adicionado a addStudentButton."); }

        // --- LÓGICA DO MENU HAMBURGUER E SUBTÍTULO (CORRIGIDA) ---
        if (hamburgerMenu && collapsibleSection) {
            hamburgerMenu.addEventListener('click', () => {
                const isHidden = collapsibleSection.classList.toggle('hidden'); // Toggle retorna true se a classe FOI ADICIONADA (ficou hidden)

                if (isHidden) {
                    // Seção ficou ESCONDIDA (Recolheu)
                    hamburgerMenu.textContent = '☰'; // Ícone para EXPANDIR
                    hamburgerMenu.setAttribute('aria-label', 'Expandir Controles');
                    // Restaura o subtítulo que estava armazenado
                     if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;
                } else {
                    // Seção ficou VISÍVEL (Expandiu)
                    hamburgerMenu.textContent = '✕'; // Ícone para RECOLHER
                    hamburgerMenu.setAttribute('aria-label', 'Recolher Controles');
                    // Limpa o subtítulo ao expandir
                    if (subtitleInfo) subtitleInfo.textContent = '';
                }
            });
             // Define estado inicial do botão (começa visível)
             hamburgerMenu.textContent = '✕';
             hamburgerMenu.setAttribute('aria-label', 'Recolher Controles');

            console.log("Listener 'click' adicionado a hamburgerMenu.");
        } else {
             console.error("Erro: Elemento hamburgerMenu ou collapsibleSection não encontrado!");
        }
        // --- FIM DA LÓGICA ---

        showStatus("Selecione um colégio para ver as turmas.");
        console.log("Configuração inicial concluída.");
    } catch (error) { console.error("Erro durante a inicialização DOMContentLoaded:", error); showStatus("Erro crítico ao inicializar a página.", true); }
});
// -----------------------------

// --- Registro do Service Worker ---
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered.', reg)).catch(err => console.log('SW registration failed: ', err)); });} else { console.log('Service workers not supported.');}
// -------------------------------------------------------

// ========================================================
// FIM DO CÓDIGO COMPLETO script.js
// ========================================================