// Application State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Element References
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  
  searchInput.addEventListener('input', renderTasks);
  categoryFilter.addEventListener('change', renderTasks);
});

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task
function handleAddTask(e) {
  e.preventDefault();

  const newTask = {
    id: Date.now().toString(),
    title: taskTitle.value.trim(),
    description: taskDesc.value.trim(),
    category: taskCategory.value,
    priority: taskPriority.value,
    status: 'todo'
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Reset form fields
  taskForm.reset();
}

// Update status of a task
function updateTaskStatus(id, newStatus) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, status: newStatus } : task
  );
  saveTasks();
  renderTasks();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Render tasks onto the board based on status and filters
function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  // Clear lists
  const lists = {
    'todo': document.getElementById('list-todo'),
    'in-progress': document.getElementById('list-in-progress'),
    'completed': document.getElementById('list-completed')
  };

  Object.values(lists).forEach(list => list.innerHTML = '');

  // Track counts
  const counts = { 'todo': 0, 'in-progress': 0, 'completed': 0 };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Append elements
  filteredTasks.forEach(task => {
    counts[task.status]++;
    const cardHtml = createTaskCard(task);
    if (lists[task.status]) {
      lists[task.status].appendChild(cardHtml);
    }
  });

  // Update counts in DOM
  document.getElementById('count-todo').textContent = counts['todo'];
  document.getElementById('count-in-progress').textContent = counts['in-progress'];
  document.getElementById('count-completed').textContent = counts['completed'];
}

// Helper: Create Task DOM element
function createTaskForm() {
  const form = document.createElement('div');
  form.className = 'task-card';

  form.innerHTML = `
    <form id="task-form" class="task-form">
      <div class="task-form-title">
        <input type="text" id="task-title" placeholder="Task title..." required />
      </div>
      <div class="task-form-desc">
        <textarea  id="task-description" placeholder="Task description..." />
      </div>
      <div class="task-form-meta">
        <div class="task-form-category">
          <select id="task-category" required>
            <option value="" disabled selected>Select Category</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
        <div class="task-form-priority">
          <select id="task-priority" required>
            <option value="" disabled selected>Select Priority</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>
      </div>
      <div class="task-form-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button class="btn btn-mute btn-danger" onclick="cancelTaskForm()">Cancel</button>
      </div>
    </form>
  `;

  return form;
}

// Security: Helper function to escape basic HTML injection
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}