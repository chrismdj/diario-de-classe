// ---------- CONFIGURAÇÃO OBRIGATÓRIA ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhVGPaF3gWYxOB19qskDrdQ5HxaTuDrM8xPmjUjWXLna59CEl7hPSFZNvKGCGUeK2kPw/exec"; // <<< COLOQUE A URL CORRETA AQUI

// --- ESTRUTURA Escola -> Nomes das Abas (USE OS NOMES EM MAIÚSCULAS QUE VOCÊ CRIOU) ---
const schoolClasses = {
  // Exemplo - SUBSTITUA PELOS SEUS DADOS REAIS
  "CRISTÃO 3R": [
    "C3R_3A", "C3R_3B", "C3R_4A", "C3R_4B", "C3R_5A", "C3R_5B",
    "C3R_6A", "C3R_6B", "C3R_7A", "C3R_7B", "C3R_8A", "C3R_8B"
  ],
  "PAULISTA SANTA BARBARA": [ // Nome do colégio atualizado
    "PSB_6A", "PSB_7A", "PSB_8A", "PSB_9A"
  ],
  "PAULISTA RODOLFO PIRANI": [
    "PRP_6B", "PRP_7B", "PRP_8B", "PRP_9B",
    "PRP_1EM", "PRP_2EM", "PRP_3EM"
  ]
  // Adicione mais colégios/turmas aqui
};
// ----------------------------------------------------------------

// --- Elementos da Página ---
const schoolSelect = document.getElementById('schoolSelect');
const sheetSelect = document.getElementById('sheetSelect');
const bimesterSelect = document.getElementById('bimesterSelect'); // <<< NOVO ELEMENTO
const loadSheetButton = document.getElementById('loadSheetButton');
const attendanceTable = document.getElementById('attendanceTable');
const tableHead = attendanceTable.querySelector('thead');
const tableBody = attendanceTable.querySelector('tbody');
const loadingElement = document.getElementById('loading');
const updateStatusElement = document.getElementById('updateStatus');
const newStudentNameInput = document.getElementById('newStudentName');
const addStudentButton = document.getElementById('addStudentButton');
const addDateButton = document.getElementById('addDateButton');
// --------------------------

// --- Funções Auxiliares (formatHeaderDateToDDMM, showLoading, showStatus) ---
// (Mantenha as funções da resposta #36)
function showLoading(isLoading, message = "Carregando/Processando...") { loadingElement.textContent = message; loadingElement.style.display = isLoading ? 'block' : 'none'; }
function showStatus(message, isError = false) { updateStatusElement.textContent = message; updateStatusElement.className = 'status-message'; if (message) { updateStatusElement.classList.add(isError ? 'error' : 'success'); } }
function formatHeaderDateToDDMM(dateString) { if (!dateString || typeof dateString !== 'string') return dateString ? dateString.toString() : ""; try { if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(dateString.trim())) { const parts = dateString.trim().split('/'); return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`; } const dateObj = new Date(dateString); if (isNaN(dateObj.getTime())) { console.warn("Parse date header failed:", dateString); return dateString.trim(); } const day = String(dateObj.getDate()).padStart(2, '0'); const month = String(dateObj.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; } catch (e) { console.error("Format date header error:", dateString, e); return dateString.trim(); } }
// -----------------------------------------------------------------------

// --- Funções Dropdowns Dinâmicos ---
function populateClassDropdown() {
    const selectedSchool = schoolSelect.value;
    sheetSelect.length = 1; sheetSelect.selectedIndex = 0; // Limpa e reseta
    if (selectedSchool && schoolClasses[selectedSchool]) {
        const classes = schoolClasses[selectedSchool];
        classes.forEach(sheetName => {
            const option = document.createElement('option'); option.value = sheetName;
            const nameParts = sheetName.split('_'); // Usa '_' como separador
            const friendlyName = nameParts.length > 1 ? nameParts.slice(1).join('_') : sheetName; // Pega tudo depois do primeiro '_'
            option.textContent = friendlyName; sheetSelect.appendChild(option);
        });
        sheetSelect.disabled = false;
    } else { sheetSelect.disabled = true; }
     tableHead.innerHTML = '<tr><th></th></tr>'; tableBody.innerHTML = '<tr><td>Selecione colégio/turma/bimestre e clique "Carregar".</td></tr>'; showStatus("Selecione uma turma.");
}
function populateSchoolDropdown() {
     const schools = Object.keys(schoolClasses); schools.sort();
     schools.forEach(schoolName => { const option = document.createElement('option'); option.value = schoolName; option.textContent = schoolName; schoolSelect.appendChild(option); });
}
// --------------------------------------------

// --- Funções Principais ---
async function loadSheetData() {
    const selectedSheet = sheetSelect.value;
    const selectedBimester = bimesterSelect.value; // <<< LER BIMESTRE SELECIONADO

    if (!selectedSheet) { showStatus("Por favor, selecione um colégio e uma turma.", true); return; }

    showLoading(true, `Carregando dados [Bim: ${selectedBimester === '0' ? 'Todos' : selectedBimester}] da turma: ${selectedSheet}...`);
    showStatus(""); tableHead.innerHTML = '<tr><th>Carregando...</th></tr>'; tableBody.innerHTML = '<tr><td>Carregando...</td></tr>';

    // Constrói a URL base
    let fetchUrl = `${SCRIPT_URL}?sheet=${encodeURIComponent(selectedSheet)}`;
    // Adiciona o parâmetro bimester APENAS se não for '0' (Todos)
    if (selectedBimester !== "0") {
        fetchUrl += `&bimester=${encodeURIComponent(selectedBimester)}`; // <<< ADICIONA PARÂMETRO BIMESTER
    }

    console.log("Attempting to fetch sheet data from:", fetchUrl);
    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}.`; try { const d = await response.json(); if(d && d.message) errorMsg += ` Detalhe: ${d.message}`;} catch(e){} throw new Error(errorMsg); }
        const data = await response.json();
        if (data.status === 'error') { throw new Error(data.message || "Erro Apps Script."); }
        if (!data.headers || typeof data.students === 'undefined') { throw new Error("Formato dados inesperado."); } // Checa students
        renderAttendanceTable(data.headers, data.students);
        showStatus(data.students.length > 0 ? "Dados carregados." : "Dados carregados (sem alunos nesta turma).", false);
        if (data.message && data.students.length > 0) { showStatus(updateStatusElement.textContent + " | Aviso: " + data.message, false); }
        else if (data.message) { showStatus("Aviso: " + data.message, false); } // Mostra aviso mesmo sem alunos
    } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); tableHead.innerHTML = '<tr><th>Erro</th></tr>'; tableBody.innerHTML = '<tr><td>Não foi possível carregar. Verifique console (F12).</td></tr>';}
    finally { showLoading(false); }
}

function renderAttendanceTable(originalHeaders, students) {
    // ... Nenhuma alteração desde a resposta #36 (que incluiu formatHeaderDateToDDMM) ...
    // (Copie a função renderAttendanceTable da resposta #36)
     tableHead.innerHTML = ''; tableBody.innerHTML = ''; const headerRow = tableHead.insertRow(); const thName = document.createElement('th'); thName.textContent = 'Nome do Aluno'; headerRow.appendChild(thName); const formattedHeaders = [];
     if (originalHeaders && originalHeaders.length > 0) { originalHeaders.forEach(h => { const th = document.createElement('th'); const fh = formatHeaderDateToDDMM(h); th.textContent = fh; headerRow.appendChild(th); formattedHeaders.push(fh); });} else { console.warn("Nenhum cabeçalho de data para renderizar.");}
     if (!students || students.length === 0) { const colspan = formattedHeaders.length + 1; tableBody.innerHTML = `<tr><td colspan="${colspan}">Nenhum aluno encontrado nesta turma.</td></tr>`; return; }
     students.forEach(student => {
         if (!student || !student.name) return; const tr = tableBody.insertRow(); const tdName = tr.insertCell(); tdName.textContent = student.name;
         formattedHeaders.forEach((fh, index) => {
             const tdCheck = tr.insertCell(); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.studentName = student.name; cb.dataset.date = fh;
             cb.checked = (student.attendance && Array.isArray(student.attendance) && student.attendance[index] === true);
             if (!fh || !/^\d{1,2}\/\d{1,2}$/.test(fh)) { /* cb.disabled = true; */ }
             cb.addEventListener('change', handleAttendanceChange); tdCheck.appendChild(cb);
         });
     });
}

async function handleAttendanceChange(event) {
    // ... Nenhuma alteração desde a resposta #44 (que adicionou action: "update") ...
    // (Copie a função handleAttendanceChange da resposta #44)
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
    // ... Nenhuma alteração desde a resposta #44 ...
    // (Copie a função addStudent da resposta #44)
    const studentName = newStudentNameInput.value.trim(); const selectedSheet = sheetSelect.value;
    if (!studentName) { showStatus("Digite o nome.", true); newStudentNameInput.focus(); return; } if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); return; }
    showLoading(true, `Adicionando ${studentName}...`); showStatus(""); const payload = { action: "addStudent", sheet: selectedSheet, student: studentName };
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
        if (!response.ok) { throw new Error(`Erro HTTP ${response.status}.`); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Aluno adicionado!`, false); newStudentNameInput.value = ''; loadSheetData(); } else { throw new Error(result.message || "Erro ao adicionar."); }
    } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); } finally { showLoading(false); }
}

async function addDate() {
    // ... Nenhuma alteração desde a resposta #44 ...
    // (Copie a função addDate da resposta #44)
     const selectedSheet = sheetSelect.value; if (!selectedSheet) { showStatus("Selecione colégio/turma.", true); return; } if (!confirm(`Adicionar data de hoje (${new Date().toLocaleDateString('pt-BR')}) à turma ${selectedSheet}?`)) { return; }
     showLoading(true, `Adicionando data...`); showStatus(""); const payload = { action: "addDate", sheet: selectedSheet };
     try {
         const response = await fetch(SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
         if (!response.ok) { throw new Error(`Erro HTTP ${response.status}.`); } const result = await response.json(); if (result.status === 'success') { showStatus(result.message || `Data adicionada!`, false); loadSheetData(); } else { throw new Error(result.message || "Erro ao adicionar."); }
     } catch (error) { console.error("Erro:", error); showStatus(`Erro: ${error.message}`, true); } finally { showLoading(false); }
}
// -----------------------------------------------------------------------------

// --- INICIALIZAÇÃO MODIFICADA ---
window.addEventListener('DOMContentLoaded', (event) => {
    // 1. Popula o dropdown de colégios
    populateSchoolDropdown();

    // 2. Adiciona listener para quando o COLÉGIO mudar -> popula turmas
    schoolSelect.addEventListener('change', populateClassDropdown);

    // 3. Adiciona listener para recarregar dados quando o BIMESTRE mudar também
    bimesterSelect.addEventListener('change', loadSheetData); // <<< NOVO LISTENER

    // 4. Listener do botão de carregar TURMA (ainda funciona, caso precise recarregar o mesmo bimestre)
    loadSheetButton.addEventListener('click', loadSheetData);

    // 5. Listeners dos botões de gerenciamento
    addStudentButton.addEventListener('click', addStudent);
    addDateButton.addEventListener('click', addDate);

    // 6. Mensagem inicial
    showStatus("Selecione um colégio para ver as turmas.");
});
// -----------------------------


// --- Registro do Service Worker (Mantido) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => { console.log('SW registered: ', registration); })
      .catch(error => { console.log('SW registration failed: ', error); });
  });
}
// -------------------------------------------------------