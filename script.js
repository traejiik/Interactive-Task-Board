// Application State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Element References
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const createTaskNav = document.getElementById('nav-create-task');
const createTaskCol = document.querySelectorAll('.col-footer button');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();

  searchInput.addEventListener('input', renderTasks);
  categoryFilter.addEventListener('change', renderTasks);
  createTaskNav.addEventListener('click', () => renderTaskForm('todo'))
  createTaskCol.forEach((btn) => {
    const column = btn.closest('.column');
    const status = column.dataset.status;
    btn.addEventListener('click', () => renderTaskForm(status));
  });
  formListener();
});

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task
function formListener() {
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'task-form') {
      e.preventDefault();

      const formData = new FormData(e.target);
      const dataObject = Object.fromEntries(formData.entries());
      const status = e.target.dataset.status;

      handleAddTask(dataObject, status);
      e.target.closest('.task-editor').remove();
    }
  });
}

function handleAddTask(data, status) {
  const newTask = {
    id: Date.now().toString(),
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    priority: data.priority,
    status: status,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

// Update status of a task
function updateTaskStatus(id, newStatus) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, status: newStatus } : task,
  );
  saveTasks();
  renderTasks();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

// Render tasks onto the board based on status and filters
function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  // Clear lists
  const lists = {
    todo: document.getElementById('list-todo'),
    'in-progress': document.getElementById('list-in-progress'),
    completed: document.getElementById('list-completed'),
  };

  Object.values(lists).forEach((list) => (list.innerHTML = ''));

  // Track counts
  const counts = { todo: 0, 'in-progress': 0, completed: 0 };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === 'All' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Append elements
  filteredTasks.forEach((task) => {
    counts[task.status]++;
    const cardHtml = createTaskCard(task);
    if (lists[task.status]) {
      lists[task.status].appendChild(cardHtml);
    }
  });

  // Update counts in DOM
  document.getElementById('count-todo').textContent = counts['todo'];
  document.getElementById('count-in-progress').textContent =
    counts['in-progress'];
  document.getElementById('count-completed').textContent = counts['completed'];
  document.querySelector('.active-content').textContent =
    counts['todo'] + counts['in-progress'];
  document.querySelector('.complete-content').textContent = counts['completed'];
}

function renderTaskForm(status) {
  const column = document.querySelector(`div[data-status="${status}"] .editor`);
  const form = createTaskForm(status);
  column.appendChild(form);
}

// Helper: Task DOM elements
function createTaskForm(status) {
  const form = document.createElement('div');
  form.classList.add('task-card', 'task-editor');

  form.innerHTML = `
    <form id="task-form" class="task-form" data-status="${status}">
      <div class="task-form-title">
        <input name="title" type="text" id="task-title" placeholder="Task title..." required />
      </div>
      <div class="task-form-desc">
        <textarea name="description" id="task-description" placeholder="Task description..."></textarea>
      </div>
      <div class="task-form-meta">
        <div class="task-form-category">
          <select name="category" id="task-category" required>
            <option value="" disabled selected>Select Category</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
        <div class="task-form-priority">
          <select name="priority" id="task-priority" required>
            <option value="" disabled selected>Select Priority</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>
      </div>
      <div class="task-form-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button class="btn btn-mute btn-danger" onclick="this.closest('.task-editor').remove()">Cancel</button>
      </div>
    </form>
  `;

  return form;
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.setAttribute('data-priority', task.priority);

  card.innerHTML = `
    <div class="task-card-title">${escapeHtml(task.title)}</div>
    <div class="task-description">${escapeHtml(task.description)}</div>
    <div class="task-meta">
      <span>${task.category}</span>
      <span>${task.priority} Priority</span>
    </div>
    <div class="task-actions">
      <select onchange="updateTaskStatus('${task.id}', this.value)">
        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
      </select>
      <button class="btn btn-danger" onclick="deleteTask('${task.id}')">Delete</button>
    </div>
  `;

  return card;
}

// Security: Helper function to escape basic HTML injection
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
