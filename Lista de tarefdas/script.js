
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const progressDetail = document.getElementById('progress-detail');
const listTitle = document.getElementById('list-title');
const clearDoneBtn = document.getElementById('clear-done');
const filterButtons = document.querySelectorAll('.filter');

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem('my-todo-tasks'));
  if (Array.isArray(saved)) {
    tasks = saved.filter(task =>
      task &&
      typeof task.id === 'string' &&
      typeof task.text === 'string' &&
      typeof task.done === 'boolean'
    );
  }
} catch {
  tasks = [];
}

let currentFilter = 'all';

const titles = {
  all: 'Todas as tarefas',
  pending: 'Tarefas pendentes',
  done: 'Tarefas concluídas'
};

function saveTasks() {
  try {
    localStorage.setItem('my-todo-tasks', JSON.stringify(tasks));
  } catch {
    alert('Não foi possível salvar as tarefas neste navegador.');
  }
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.done).length;
  const percentage = total ? Math.round(completed / total * 100) : 0;

  progressText.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
  progressDetail.textContent =
    `${completed} de ${total} tarefas concluídas`;

  taskCount.textContent =
    `${total} ${total === 1 ? 'tarefa' : 'tarefas'}`;

  clearDoneBtn.disabled = completed === 0;
  clearDoneBtn.style.opacity = completed === 0 ? '0.45' : '1';
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.done ? ' completed' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-check';
  checkbox.checked = task.done;
  checkbox.setAttribute('aria-label', `Concluir ${task.text}`);

  checkbox.addEventListener('change', () => {
    task.done = checkbox.checked;
    saveTasks();
    renderTasks();
  });

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.type = 'button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Excluir ${task.text}`);

  deleteButton.addEventListener('click', () => {
    tasks = tasks.filter(item => item.id !== task.id);
    saveTasks();
    renderTasks();
  });

  li.append(checkbox, span, deleteButton);
  return li;
}

function renderTasks() {
  taskList.replaceChildren();

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.done;
    if (currentFilter === 'done') return task.done;
    return true;
  });

  filteredTasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  emptyState.hidden = filteredTasks.length > 0;
  listTitle.textContent = titles[currentFilter];

  updateProgress();
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false
  });

  saveTasks();
  currentFilter = 'all';

  filterButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.filter === 'all');
  });

  input.value = '';
  renderTasks();
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    renderTasks();
  });
});

clearDoneBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  renderTasks();
});

filterButtons.forEach(button => {
  button.setAttribute(
    'aria-pressed',
    String(button.dataset.filter === currentFilter)
  );
});

renderTasks();