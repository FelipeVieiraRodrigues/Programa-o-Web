const API_BASE = 'https://proweb.leoproti.com.br/alunos';

const form = document.getElementById('aluno-form');
const idField = document.getElementById('aluno-id');
const nomeField = document.getElementById('nome');
const turmaField = document.getElementById('turma');
const cursoField = document.getElementById('curso');
const matriculaField = document.getElementById('matricula');
const tableBody = document.querySelector('#alunos-table tbody');
const alerts = document.getElementById('alerts');
const refreshBtn = document.getElementById('refresh-btn');
const resetBtn = document.getElementById('reset-btn');

const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
let deleteId = null;

function showAlert(msg, type = 'success', time = 3000) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  alert.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  alerts.appendChild(alert);
  setTimeout(() => alert.remove(), time);
}

async function listarAlunos() {
  tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-3">Carregando...</td></tr>`;
  try {
    const res = await fetch(API_BASE);
    const alunos = await res.json();
    renderTable(alunos);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${err.message}</td></tr>`;
  }
}

function renderTable(alunos) {
  if (!alunos || alunos.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-3">Nenhum aluno encontrado</td></tr>`;
    return;
  }

  tableBody.innerHTML = alunos.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.nome}</td>
      <td>${a.turma}</td>
      <td>${a.curso}</td>
      <td>${a.matricula}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${a.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${a.id}">Excluir</button>
      </td>
    </tr>
  `).join('');
}

async function salvarAluno(e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const aluno = {
    nome: nomeField.value.trim(),
    turma: turmaField.value.trim(),
    curso: cursoField.value.trim(),
    matricula: matriculaField.value.trim(),
  };

  try {
    const method = idField.value ? 'PUT' : 'POST';
    const url = idField.value ? `${API_BASE}/${idField.value}` : API_BASE;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno),
    });

    showAlert('Aluno salvo com sucesso!', 'success');
    form.reset();
    idField.value = '';
    await listarAlunos();
  } catch (err) {
    showAlert('Erro ao salvar aluno.', 'danger');
  }
}

async function editarAluno(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const aluno = await res.json();

    idField.value = aluno.id;
    nomeField.value = aluno.nome;
    turmaField.value = aluno.turma;
    cursoField.value = aluno.curso;
    matriculaField.value = aluno.matricula;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    showAlert('Erro ao carregar aluno.', 'danger');
  }
}

async function excluirAluno() {
  try {
    await fetch(`${API_BASE}/${deleteId}`, { method: 'DELETE' });
    showAlert('Aluno excluído com sucesso!', 'warning');
    await listarAlunos();
  } catch {
    showAlert('Erro ao excluir aluno.', 'danger');
  } finally {
    confirmDeleteModal.hide();
  }
}

tableBody.addEventListener('click', e => {
  if (e.target.classList.contains('btn-edit')) editarAluno(e.target.dataset.id);
  if (e.target.classList.contains('btn-delete')) {
    deleteId = e.target.dataset.id;
    confirmDeleteModal.show();
  }
});

form.addEventListener('submit', salvarAluno);
resetBtn.addEventListener('click', () => {
  form.reset();
  form.classList.remove('was-validated');
});
refreshBtn.addEventListener('click', listarAlunos);
document.getElementById('confirm-delete-btn').addEventListener('click', excluirAluno);

listarAlunos();
