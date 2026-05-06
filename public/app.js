/* =============================================
   API Client
   ============================================= */
const API = '/api/tasks';

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro desconhecido.');
  }
  return data;
}

/* =============================================
   State
   ============================================= */
let filterStatus = '';
let filterPriority = '';
let deleteTargetId = null;
let editMode = false;

/* =============================================
   DOM References
   ============================================= */
const taskForm       = document.getElementById('task-form');
const taskIdInput    = document.getElementById('task-id');
const titleInput     = document.getElementById('task-title');
const descInput      = document.getElementById('task-description');
const statusSelect   = document.getElementById('task-status');
const prioritySelect = document.getElementById('task-priority');
const submitBtn      = document.getElementById('submit-btn');
const cancelBtn      = document.getElementById('cancel-btn');
const formTitle      = document.getElementById('form-title');
const formError      = document.getElementById('form-error');
const taskList       = document.getElementById('task-list');
const loading        = document.getElementById('loading');
const emptyMsg       = document.getElementById('empty-message');
const modalOverlay   = document.getElementById('modal-overlay');
const confirmDelBtn  = document.getElementById('confirm-delete-btn');
const cancelDelBtn   = document.getElementById('cancel-delete-btn');

/* =============================================
   Labels
   ============================================= */
const STATUS_LABELS = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
};

const PRIORITY_LABELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

/* =============================================
   Render
   ============================================= */
function renderTask(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.status}`;
  li.dataset.id = task.id;

  const descHtml = task.description
    ? `<p class="task-description">${escapeHtml(task.description)}</p>`
    : '';

  li.innerHTML = `
    <div class="task-body">
      <div class="task-header">
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="badge badge-status-${task.status}">${STATUS_LABELS[task.status]}</span>
        <span class="badge badge-priority-${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
      </div>
      ${descHtml}
      <div class="task-meta">
        <span>Criado: ${formatDate(task.created_at)}</span>
        ${task.updated_at !== task.created_at ? `<span>· Atualizado: ${formatDate(task.updated_at)}</span>` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="btn-edit" data-id="${task.id}">✏️ Editar</button>
      <button class="btn-delete" data-id="${task.id}">🗑️ Excluir</button>
    </div>
  `;

  li.querySelector('.btn-edit').addEventListener('click', () => startEdit(task));
  li.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(task.id));

  return li;
}

async function loadTasks() {
  loading.style.display = 'block';
  emptyMsg.style.display = 'none';
  taskList.innerHTML = '';

  const params = new URLSearchParams();
  if (filterStatus)   params.set('status',   filterStatus);
  if (filterPriority) params.set('priority', filterPriority);
  const query = params.toString() ? '?' + params.toString() : '';

  try {
    const tasks = await apiFetch(API + query);
    loading.style.display = 'none';

    if (tasks.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      tasks.forEach(task => taskList.appendChild(renderTask(task)));
    }

    updateStats(tasks);
  } catch (err) {
    loading.textContent = 'Erro ao carregar tarefas.';
  }
}

function updateStats(tasks) {
  document.getElementById('stat-total').textContent = tasks.length;
  document.getElementById('stat-pendente').textContent   = tasks.filter(t => t.status === 'pendente').length;
  document.getElementById('stat-andamento').textContent  = tasks.filter(t => t.status === 'em_andamento').length;
  document.getElementById('stat-concluida').textContent  = tasks.filter(t => t.status === 'concluida').length;
}

/* =============================================
   Form Submission (Create / Update)
   ============================================= */
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';

  const payload = {
    title:       titleInput.value,
    description: descInput.value,
    status:      statusSelect.value,
    priority:    prioritySelect.value,
  };

  try {
    if (editMode && taskIdInput.value) {
      await apiFetch(`${API}/${taskIdInput.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch(API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    resetForm();
    loadTasks();
  } catch (err) {
    formError.textContent = err.message;
  }
});

function startEdit(task) {
  editMode = true;
  taskIdInput.value       = task.id;
  titleInput.value        = task.title;
  descInput.value         = task.description || '';
  statusSelect.value      = task.status;
  prioritySelect.value    = task.priority;
  formTitle.textContent   = 'Editar Tarefa';
  submitBtn.textContent   = 'Salvar Alterações';
  cancelBtn.style.display = 'inline-block';
  titleInput.focus();
  taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  editMode = false;
  taskForm.reset();
  taskIdInput.value       = '';
  formTitle.textContent   = 'Nova Tarefa';
  submitBtn.textContent   = 'Adicionar Tarefa';
  cancelBtn.style.display = 'none';
  formError.textContent   = '';
  prioritySelect.value    = 'media';
  statusSelect.value      = 'pendente';
}

/* =============================================
   Delete
   ============================================= */
function openDeleteModal(id) {
  deleteTargetId = id;
  modalOverlay.style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  modalOverlay.style.display = 'none';
}

confirmDelBtn.addEventListener('click', async () => {
  if (!deleteTargetId) return;
  try {
    await apiFetch(`${API}/${deleteTargetId}`, { method: 'DELETE' });
    closeDeleteModal();
    loadTasks();
  } catch (err) {
    closeDeleteModal();
  }
});

cancelDelBtn.addEventListener('click', closeDeleteModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeDeleteModal();
});

/* =============================================
   Filters
   ============================================= */
document.querySelectorAll('[data-filter-status]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterStatus = btn.dataset.filterStatus;
    loadTasks();
  });
});

document.querySelectorAll('[data-filter-priority]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-priority]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterPriority = btn.dataset.filterPriority;
    loadTasks();
  });
});

/* =============================================
   Utilities
   ============================================= */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/* =============================================
   Bootstrap
   ============================================= */
loadTasks();
