// ========================================================
// INÍCIO DO CÓDIGO COMPLETO script.js (vCom Limpeza Modal)
// ========================================================

// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2DzC7c_qphZTCzJeU8PUh1k0Cz-XhYmojokRLsZ_PT1TaXM1dtHzxtz1Rw6vR5g7k/exec"; // <<< SUA URL ATUAL

// --- ESTRUTURA Escola -> Nomes das Abas ---
const schoolClasses = { /* ... (igual) ... */ "CRISTÃO 3R": ["C3R_3A", "C3R_3B", "C3R_4A", "C3R_4B", "C3R_5A", "C3R_5B", "C3R_6A", "C3R_6B", "C3R_7A", "C3R_7B", "C3R_8A", "C3R_8B"], "PAULISTA SANTA BARBARA": ["PSB_6A", "PSB_7A", "PSB_8A", "PSB_9A"], "PAULISTA RODOLFO PIRANI": ["PRP_6B", "PRP_7B", "PRP_8B", "PRP_9B", "PRP_1EM", "PRP_2EM", "PRP_3EM"] };
// --- MAPEAMENTO Nome Escola -> Arquivo de Logo ---
const schoolLogos = { /* ... (igual) ... */ "CRISTÃO 3R": "logos/LOGO_3R.svg", "PAULISTA SANTA BARBARA": "logos/LOGO_PAULISTA.svg", "PAULISTA RODOLFO PIRANI": "logos/LOGO_PAULISTA.svg" };
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
const schoolLogoElement = document.getElementById('school-logo');
const contentEditButton = document.getElementById('content-edit-button');
// --- Elementos do Modal ---
const modalBackdrop = document.getElementById('modal-backdrop');
const contentModal = document.getElementById('content-modal');
const closeModalButton = document.getElementById('close-modal-button');
const contentDateSelect = document.getElementById('content-date-select');
const contentTextarea = document.getElementById('content-textarea');
const saveContentButton = document.getElementById('save-content-button');
const contentSaveStatus = document.getElementById('content-save-status');
// --------------------------
// --- Variável Global para Armazenar Subtítulo ---
let currentSubtitle = '';
// ------------------------------------------------

// --- Funções Auxiliares ---
function showLoading(isLoading, message = "Carregando/Processando...") { /* ... (igual) ... */ loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false, element = updateStatusElement, isInline = false) { /* ... (igual, com auto-limpeza) ... */ const targetElement = element || updateStatusElement; targetElement.textContent = message; targetElement.className = isInline ? 'status-message-inline' : 'status-message'; if (message) { targetElement.classList.add(isError ? 'error' : 'success'); } if (message && !isError) { setTimeout(() => { if (targetElement.textContent === message) { targetElement.textContent = ''; targetElement.className = isInline ? 'status-message-inline' : 'status-message'; } }, 4000); } }
function formatHeaderDateToDDMM(dateString) { /* ... (igual) ... */ if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// --------------------------

// --- Funções do Modal (AJUSTADA openContentModal) ---
function openContentModal() {
    if (contentModal && modalBackdrop) {
        // Limpa estado anterior ao abrir
        if (contentSaveStatus) {
            contentSaveStatus.textContent = '';
            contentSaveStatus.className = 'status-message-inline';
        }
        if (contentDateSelect) {
            contentDateSelect.selectedIndex = 0; // <<< Redefine para "-- Selecione a Data --"
        }
        if (contentTextarea) {
            contentTextarea.value = ''; // <<< Limpa o texto
        }
        // TODO (Opcional futuro): Carregar conteúdo existente para a data selecionada (se houver uma seleção inicial)

        modalBackdrop.classList.add('visible');
        contentModal.classList.add('visible');
        console.log("Modal de conteúdo aberto e campos limpos.");
    }
}

function closeContentModal() {
    if (contentModal && modalBackdrop) {
        modalBackdrop.classList.remove('visible');
        contentModal.classList.remove('visible');
        console.log("Modal de conteúdo fechado.");
        // Opcional: Limpar status ao fechar também, caso tenha ficado alguma msg de erro
         if (contentSaveStatus) {
             contentSaveStatus.textContent = '';
             contentSaveStatus.className = 'status-message-inline';
         }
    }
}
// -------------------------


// --- Funções Dropdowns Dinâmicos ---
function populateClassDropdown() { /* ... (igual, já desabilita contentEditButton e limpa subtitle/logo) ... */ console.log("Iniciando populateClassDropdown..."); const selectedSchool = schoolSelect.value; console.log("Colégio selecionado:", selectedSchool); currentSubtitle = ''; if (subtitleInfo) subtitleInfo.textContent = currentSubtitle; if (contentEditButton) contentEditButton.disabled = true; const logoPath = schoolLogos[selectedSchool] || ""; if (schoolLogoElement) schoolLogoElement.src = logoPath; sheetSelect.length = 1; sheetSelect.selectedIndex = 0; if (selectedSchool && schoolClasses[selectedSchool]) { console.log("Encontradas classes para o colégio:", schoolClasses[selectedSchool]); const classes = schoolClasses[selectedSchool]; classes.forEach(sheetName => { const option = document.createElement('option'); option.value = sheetName; const nameParts = sheetName.split('_'); const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName; option.textContent = friendlyName; sheetSelect.appendChild(option); }); sheetSelect.disabled = false; console.log("Dropdown de turmas populado. Total de opções:", sheetSelect.options.length); } else { console.log("Nenhum colégio selecionado ou sem turmas definidas para:", selectedSchool); sheetSelect.disabled = true; } tableHead.innerHTML = '<tr><th></th></tr>'; tableBody.innerHTML = '<tr><td>Selecione uma turma.</td></tr>'; if(contentDateSelect) { contentDateSelect.innerHTML = '<option value="">-- Selecione a Data --</option>'; } showStatus("Selecione uma turma."); }
function populateSchoolDropdown() { /* ... (igual) ... */ console.log("Iniciando populateSchoolDropdown..."); if (!schoolClasses || typeof schoolClasses !== 'object' || Object.keys(schoolClasses).length === 0) { console.error("!!! Estrutura schoolClasses está vazia, inválida ou não definida !!!"); showStatus("Erro: Configuração de escolas/turmas inválida.", true); return; } try { const schools = Object.keys(schoolClasses); console.log("Colégios encontrados:", schools); schools.sort(); schools.forEach(schoolName => { const option = document.createElement('option'); option.value = schoolName; option.textContent = schoolName; schoolSelect.appendChild(option); }); console.log("Finalizou populateSchoolDropdown. Total de opções:", schoolSelect.options.length); } catch (error) { console.error("Erro dentro de populateSchoolDropdown:", error); showStatus("Erro ao carregar colégios.", true); } }
// --------------------------------------------

// --- Funções Principais ---
async function loadSheetData() { /* ... (igual, já desabilita/habilita contentEditButton e limpa/define currentSubtitle) ... */ const selectedSheet = sheetSelect.value; const selectedBimester = bimesterSelect.value; if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); currentSubtitle = ''; if (subtitleInfo) subtitleInfo.textContent = currentSubtitle; if (contentEditButton) contentEditButton.disabled = true; return; } if (collapsibleSection && !collapsibleSection.classList.contains('hidden')) { collapsibleSection.classList.add('hidden'); if (hamburgerMenu) { hamburgerMenu.textContent = '☰'; hamburgerMenu.setAttribute('aria-label', 'Expandir Controles'); } console.log("Controles recolhidos automaticamente."); } showLoading(true, `Carregando ${selectedSheet}...`); showStatus(""); currentSubtitle = ''; if (subtitleInfo) subtitleInfo.textContent = currentSubtitle; if (contentEditButton) contentEditButton.disabled = true; tableHead.innerHTML = '<tr><th>Carregando...</th></tr>'; tableBody.innerHTML = '<tr><td>Carregando...</td></tr>'; let fetchUrl = `${SCRIPT_URL}?sheet=${encodeURIComponent(selectedSheet)}`; if (selectedBimester !== "0") { fetchUrl += `&bimester=${encodeURIComponent(selectedBimester)}`; } console.log("Fetching from:", fetchUrl); try { const response = await fetch(fetchUrl); if (!response.ok) { let eMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if (d && d.message) eMsg += ` Detalhe: ${d.message}`; } catch (e) {} throw new Error(eMsg); } const data = await response.json(); if (data.status === 'error') { throw new Error(data.message || "Erro Apps Script."); } if (!data.headers || typeof data.students === 'undefined') { throw new Error("Formato dados inesperado."); } renderAttendanceTable(data.headers, data.students); const schoolName = schoolSelect.options[schoolSelect.selectedIndex].text; const className = sheetSelect.options[sheetSelect.selectedIndex].text; if (subtitleInfo && schoolName && className && schoolName !== '-- Selecione o Colégio --' && className !== '-- Selecione a Turma --') { currentSubtitle = `${schoolName} - ${className}`; subtitleInfo.textContent = currentSubtitle; } else { currentSubtitle = ''; if (subtitleInfo) subtitleInfo.textContent = currentSubtitle; } if (contentEditButton && data.headers && data.headers.length > 0) { contentEditButton.disabled = false; } showStatus(data.students.length > 0 ? "Dados carregados." : "Dados carregados (sem alunos).", false); if (data.message && data.students.length > 0) { showStatus(updateStatusElement.textContent + " | Aviso: " + data.message, false); } else if (data.message) { showStatus("Aviso: " + data.message, false); } setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); console.log("Scrolled to bottom."); }, 50); } catch (error) { console.error("Erro em loadSheetData:", error); showStatus(`Erro ao carregar: ${error.message}`, true); tableHead.innerHTML = '<tr><th>Erro</th></tr>'; tableBody.innerHTML = '<tr><td>Não foi possível carregar.</td></tr>'; currentSubtitle = ''; if (subtitleInfo) subtitleInfo.textContent = currentSubtitle; if (contentEditButton) contentEditButton.disabled = true; } finally { showLoading(false); } }

function renderAttendanceTable(originalHeaders, students) { /* ... (igual, já popula contentDateSelect) ... */ tableHead.innerHTML = ''; tableBody.innerHTML = ''; if (contentDateSelect) { contentDateSelect.innerHTML = '<option value="">-- Selecione a Data --</option>'; if (originalHeaders && originalHeaders.length > 0) { originalHeaders.forEach(h => { const formattedDate = formatHeaderDateToDDMM(h); if (formattedDate && /^\d{1,2}\/\d{1,2}$/.test(formattedDate)) { const option = document.createElement('option'); option.value = formattedDate; option.textContent = formattedDate; contentDateSelect.appendChild(option); } }); } console.log("Dropdown de datas do modal populado."); } const headerRow = tableHead.insertRow(); const thName = document.createElement('th'); thName.textContent = 'Nome do Aluno'; headerRow.appendChild(thName); const formattedHeaders = []; if (originalHeaders && originalHeaders.length > 0) { originalHeaders.forEach(h => { const th = document.createElement('th'); const fh = formatHeaderDateToDDMM(h); th.textContent = fh; headerRow.appendChild(th); formattedHeaders.push(fh); }); } else { console.warn("Nenhum header de data para tabela."); } if (!students || students.length === 0) { const colspan = formattedHeaders.length + 1; tableBody.innerHTML = `<tr><td colspan="${colspan}">Nenhum aluno encontrado para esta turma/bimestre.</td></tr>`; return; } students.forEach(student => { if (!student || !student.name) return; const tr = tableBody.insertRow(); const tdName = tr.insertCell(); tdName.textContent = student.name; formattedHeaders.forEach((fh, index) => { const tdCheck = tr.insertCell(); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.studentName = student.name; cb.dataset.date = fh; cb.checked = (student.attendance && Array.isArray(student.attendance) && student.attendance[index] === true); if (!fh || !/^\d{1,2}\/\d{1,2}$/.test(fh)) {} cb.addEventListener('change', handleAttendanceChange); tdCheck.appendChild(cb); }); }); }

async function handleAttendanceChange(event) { /* ... (igual) ... */ const checkbox = event.target; const studentName = checkbox.dataset.studentName; const dateString = checkbox.dataset.date; const isAbsent = checkbox.checked; const selectedSheet = sheetSelect.value; if (!selectedSheet || !dateString || !studentName || !/^\d{1,2}\/\d{1,2}$/.test(dateString)) { showStatus("Erro interno ou data inválida.", true); checkbox.checked = !isAbsent; return; } showStatus(`Atualizando ${studentName} em ${dateString}...`); const payload = { action: "update", sheet: selectedSheet, student: studentName, date: dateString, absent: isAbsent }; try { const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow'}); if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if (d && d.message) errorMsg += ` Detalhe: ${d.message}`; } catch(e){} throw new Error(errorMsg); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Status atualizado!`, false); } else { throw new Error(result.message || "Erro ao atualizar."); } } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); checkbox.checked = !isAbsent; } }

async function addStudent() { /* ... (igual) ... */ const studentName = newStudentNameInput.value.trim(); const selectedSheet = sheetSelect.value; if (!studentName) { showStatus("Digite o nome.", true); newStudentNameInput.focus(); return; } if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); return; } showLoading(true, `Adicionando ${studentName}...`); showStatus(""); const payload = { action: "addStudent", sheet: selectedSheet, student: studentName }; try { const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' }); if (!response.ok) { throw new Error(`Erro HTTP ${response.status}.`); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Aluno adicionado!`, false); newStudentNameInput.value = ''; loadSheetData(); } else { throw new Error(result.message || "Erro ao adicionar."); } } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); } finally { showLoading(false); } }

// --- FUNÇÃO PARA SALVAR CONTEÚDO ---
async function saveContent() { /* ... (igual) ... */ const selectedDate = contentDateSelect.value; const contentText = contentTextarea.value.trim(); const currentSheet = sheetSelect.value; if (!selectedDate) { showStatus("Por favor, selecione uma data.", true, contentSaveStatus, true); return; } if (!contentText) { showStatus("Por favor, digite o conteúdo.", true, contentSaveStatus, true); return; } if (!currentSheet) { showStatus("Erro: Turma não selecionada.", true, contentSaveStatus, true); return; } showStatus("Salvando conteúdo...", false, contentSaveStatus, true); saveContentButton.disabled = true; const payload = { action: "saveContent", sheet: currentSheet, date: selectedDate, content: contentText }; try { const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' }); if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if (d && d.message) errorMsg += ` Detalhe: ${d.message}`; } catch(e){} throw new Error(errorMsg); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || "Conteúdo salvo!", false, contentSaveStatus, true); } else { throw new Error(result.message || "Erro ao salvar conteúdo."); } } catch (error) { console.error("Erro ao salvar conteúdo:", error); showStatus(`Erro: ${error.message}`, true, contentSaveStatus, true); } finally { saveContentButton.disabled = false; } }
// -----------------------------------------------------------------------------

// --- INICIALIZAÇÃO ---
window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM carregado. Iniciando configuração...");
    try {
        // Limpa estados iniciais
        currentSubtitle = ''; if (subtitleInfo) subtitleInfo.textContent = currentSubtitle;
        if (schoolLogoElement) schoolLogoElement.src = '';
        if (contentEditButton) contentEditButton.disabled = true;
        if(contentDateSelect) contentDateSelect.innerHTML = '<option value="">-- Selecione a Data --</option>';
        if(contentTextarea) contentTextarea.value = '';
        if(contentSaveStatus) contentSaveStatus.textContent = '';

        // Configura listeners principais
        if (!schoolSelect) { /* ... (verificação igual) ... */ console.error("Elemento 'schoolSelect' NÃO encontrado!"); showStatus("Erro crítico: Elemento 'schoolSelect' não encontrado.", true); return; }
        populateSchoolDropdown(); console.log("populateSchoolDropdown chamado.");
        if(schoolSelect) { schoolSelect.addEventListener('change', populateClassDropdown); console.log("Listener 'change' adicionado a schoolSelect."); }
        if(bimesterSelect) { /* ... (listener igual) ... */ bimesterSelect.addEventListener('change', () => { if (sheetSelect.value) { loadSheetData(); } }); console.log("Listener 'change' adicionado a bimesterSelect."); }
        if(loadSheetButton) { loadSheetButton.addEventListener('click', loadSheetData); console.log("Listener 'click' adicionado a loadSheetButton."); }
        if(addStudentButton) { addStudentButton.addEventListener('click', addStudent); console.log("Listener 'click' adicionado a addStudentButton."); }

        // --- Listener Menu Hambúrguer ---
        if (hamburgerMenu && collapsibleSection) { /* ... (lógica igual anterior) ... */ hamburgerMenu.addEventListener('click', () => { const isNowHidden = collapsibleSection.classList.toggle('hidden'); if (isNowHidden) { hamburgerMenu.textContent = '☰'; hamburgerMenu.setAttribute('aria-label', 'Expandir Controles'); if (subtitleInfo) subtitleInfo.textContent = currentSubtitle; } else { hamburgerMenu.textContent = '✕'; hamburgerMenu.setAttribute('aria-label', 'Recolher Controles'); if (subtitleInfo) subtitleInfo.textContent = ''; } }); hamburgerMenu.textContent = '✕'; hamburgerMenu.setAttribute('aria-label', 'Recolher Controles'); console.log("Listener 'click' adicionado a hamburgerMenu."); }
        else { console.error("Erro: Elemento hamburgerMenu ou collapsibleSection não encontrado!"); }

        // --- Listeners do Modal ---
        if (contentEditButton) { contentEditButton.addEventListener('click', openContentModal); console.log("Listener 'click' adicionado a contentEditButton."); }
        if (closeModalButton) { closeModalButton.addEventListener('click', closeContentModal); console.log("Listener 'click' adicionado a closeModalButton."); }
        if (modalBackdrop) { modalBackdrop.addEventListener('click', closeContentModal); console.log("Listener 'click' adicionado a modalBackdrop."); }
        if (saveContentButton) { saveContentButton.addEventListener('click', saveContent); console.log("Listener 'click' adicionado a saveContentButton."); }

        // --- ADICIONADO: Listener para limpar textarea ao mudar data no modal ---
        if (contentDateSelect) {
            contentDateSelect.addEventListener('change', () => {
                if (contentTextarea) {
                    contentTextarea.value = ''; // Limpa o textarea
                }
                if (contentSaveStatus) { // Limpa o status também
                    contentSaveStatus.textContent = '';
                    contentSaveStatus.className = 'status-message-inline';
                }
                // Futuro: carregar conteúdo existente aqui
                console.log("Data no modal alterada, textarea limpo.");
            });
            console.log("Listener 'change' adicionado a contentDateSelect.");
        }
        // --- FIM Listener Limpar Textarea ---


        showStatus("Selecione um colégio para ver as turmas.");
        console.log("Configuração inicial concluída.");
    } catch (error) { console.error("Erro durante a inicialização DOMContentLoaded:", error); showStatus("Erro crítico ao inicializar a página.", true); }
});
// -----------------------------

// --- Registro do Service Worker ---
if ('serviceWorker' in navigator) { /* ... (igual) ... */ window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered.', reg)).catch(err => console.log('SW registration failed: ', err)); });} else { console.log('Service workers not supported.');}
// -------------------------------------------------------

// ========================================================
// FIM DO CÓDIGO COMPLETO script.js
// ========================================================