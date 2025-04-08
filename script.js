// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhVGPaF3gWYxOB19qskDrdQ5HxaTuDrM8xPmjUjWXLna59CEl7hPSFZNvKGCGUeK2kPw/exec"; // <<< COLOQUE A URL CORRETA AQUI
// Não precisa mais da estrutura schoolClasses aqui
// ----------------------------------------------

// --- Elementos da Página ---
// const schoolSelect = document.getElementById('schoolSelect'); // Removido
const sheetSelect = document.getElementById('sheetSelect');   // Dropdown de turma (com opções no HTML)
// const bimesterSelect = document.getElementById('bimesterSelect'); // Removido
const loadSheetButton = document.getElementById('loadSheetButton');
const attendanceTable = document.getElementById('attendanceTable');
const tableHead = attendanceTable.querySelector('thead');
const tableBody = attendanceTable.querySelector('tbody');
const loadingElement = document.getElementById('loading');
const updateStatusElement = document.getElementById('updateStatus');
const newStudentNameInput = document.getElementById('newStudentName');
const addStudentButton = document.getElementById('addStudentButton');
// addDateButton Removido
// --------------------------

// --- Funções Auxiliares (formatHeaderDateToDDMM, showLoading, showStatus) ---
// (Copie as funções da resposta #51)
function showLoading(isLoading, message = "Carregando/Processando...") { loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false) { updateStatusElement.textContent = message; updateStatusElement.className = 'status-message'; if (message) { updateStatusElement.classList.add(isError ? 'error' : 'success'); } }
function formatHeaderDateToDDMM(dateString) { if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// -----------------------------------------------------------------------

// --- Funções Dropdowns Dinâmicos (REMOVIDAS) ---
// function populateClassDropdown() { ... } // Removida
// function populateSchoolDropdown() { ... } // Removida
// --------------------------------------------

// --- Funções Principais ---
async function loadSheetData() {
    const selectedSheet = sheetSelect.value; // <<< Pega direto do select com opções fixas
    // const selectedBimester = bimesterSelect.value; // Removido

    if (!selectedSheet) {
        showStatus("Por favor, selecione uma turma/aba.", true);
        return;
    }

    showLoading(true, `Carregando dados da turma: ${selectedSheet}...`); // Mensagem sem bimestre
    showStatus(""); tableHead.innerHTML = '<tr><th>Carregando...</th></tr>'; tableBody.innerHTML = '<tr><td>Carregando...</td></tr>';

    // Constrói a URL base - SEM PARÂMETRO BIMESTER
    let fetchUrl = `${SCRIPT_URL}?sheet=${encodeURIComponent(selectedSheet)}`;

    console.log("Attempting to fetch sheet data from:", fetchUrl); // Log sem bimestre
    try {
        // ... (lógica fetch, tratamento de erro e chamada a renderAttendanceTable igual à resposta #51) ...
        const response = await fetch(fetchUrl);
        if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if(d && d.message) errorMsg += ` Detalhe: ${d.message}`;} catch(e){} throw new Error(errorMsg); }
        const data = await response.json();
        if (data.status === 'error') { throw new Error(data.message || "Erro Apps Script."); }
        if (!data.headers || typeof data.students === 'undefined') { throw new Error("Formato dados inesperado."); }
        renderAttendanceTable(data.headers, data.students); // Renderiza todos os dados recebidos
        showStatus(data.students.length > 0 ? "Dados carregados." : "Dados carregados (sem alunos).", false);
        if (data.message && data.students.length > 0) { showStatus(updateStatusElement.textContent + " | Aviso: " + data.message, false); }
        else if (data.message) { showStatus("Aviso: " + data.message, false); }
    } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); tableHead.innerHTML = '<tr><th>Erro</th></tr>'; tableBody.innerHTML = '<tr><td>Não foi possível carregar. Verifique console (F12).</td></tr>';}
    finally { showLoading(false); }
}

function renderAttendanceTable(originalHeaders, students) {
    // ... (Função igual à resposta #51 - que usa formatHeaderDateToDDMM) ...
     tableHead.innerHTML = ''; tableBody.innerHTML = ''; const headerRow = tableHead.insertRow(); const thName = document.createElement('th'); thName.textContent = 'Nome do Aluno'; headerRow.appendChild(thName); const formattedHeaders = [];
     if (originalHeaders && originalHeaders.length > 0) { originalHeaders.forEach(h => { const th = document.createElement('th'); const fh = formatHeaderDateToDDMM(h); th.textContent = fh; headerRow.appendChild(th); formattedHeaders.push(fh); });} else { console.warn("Nenhum header de data.");}
     if (!students || students.length === 0) { const colspan = formattedHeaders.length + 1; tableBody.innerHTML = `<tr><td colspan="${colspan}">Nenhum aluno.</td></tr>`; return; }
     students.forEach(student => {
         if (!student || !student.name) return; const tr = tableBody.insertRow(); const tdName = tr.insertCell(); tdName.textContent = student.name;
         formattedHeaders.forEach((fh, index) => {
             const tdCheck = tr.insertCell(); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.studentName = student.name; cb.dataset.date = fh;
             cb.checked = (student.attendance && Array.isArray(student.attendance) && student.attendance[index] === true);
             if (!fh || !/^\d{1,2}\/\d{1,2}$/.test(fh)) {}
             cb.addEventListener('change', handleAttendanceChange); tdCheck.appendChild(cb);
         });
     });
}

async function handleAttendanceChange(event) {
    // ... (Função igual à resposta #51 - que envia action: "update") ...
    const checkbox = event.target; const studentName = checkbox.dataset.studentName; const dateString = checkbox.dataset.date; const isAbsent = checkbox.checked; const selectedSheet = sheetSelect.value;
    if (!selectedSheet || !dateString || !studentName || !/^\d{1,2}\/\d{1,2}$/.test(dateString)) { showStatus("Erro interno ou data inválida.", true); checkbox.checked = !isAbsent; return; }
    showStatus(`Atualizando ${studentName} em ${dateString}...`); const payload = { action: "update", sheet: selectedSheet, student: studentName, date: dateString, absent: isAbsent };
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow'});
        if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if (d && d.message) errorMsg += ` Detalhe: ${d.message}`; } catch(e){} throw new Error(errorMsg); }
        const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Status atualizado!`, false); } else { throw new Error(result.message || "Erro ao atualizar."); }
    } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); checkbox.checked = !isAbsent; }
}

async function addStudent() {
    // ... (Função igual à resposta #51 - que envia action: "addStudent") ...
    const studentName = newStudentNameInput.value.trim(); const selectedSheet = sheetSelect.value;
    if (!studentName) { showStatus("Digite o nome.", true); newStudentNameInput.focus(); return; } if (!selectedSheet) { showStatus("Selecione uma turma.", true); return; }
    showLoading(true, `Adicionando ${studentName}...`); showStatus(""); const payload = { action: "addStudent", sheet: selectedSheet, student: studentName };
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
        if (!response.ok) { throw new Error(`Erro HTTP ${response.status}.`); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Aluno adicionado!`, false); newStudentNameInput.value = ''; loadSheetData(); } else { throw new Error(result.message || "Erro ao adicionar."); }
    } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); } finally { showLoading(false); }
}

// async function addDate() { ... } // <<< FUNÇÃO REMOVIDA

// --- INICIALIZAÇÃO SIMPLIFICADA ---
window.addEventListener('DOMContentLoaded', (event) => {
    // Não popula dropdowns dinamicamente
    // Adiciona listener ao botão de carregar
    loadSheetButton.addEventListener('click', loadSheetData);
    // Listeners dos botões de gerenciamento
    addStudentButton.addEventListener('click', addStudent);
    // Listener de addDate removido
    showStatus("Selecione uma turma e clique em 'Carregar Turma'.");
});
// -----------------------------

// --- Registro do Service Worker ---
if ('serviceWorker' in navigator) { /* ... (código SW mantido) ... */ }
// -------------------------------------------------------