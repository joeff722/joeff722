// 這個應用程式負責管理待辦清單的新增、完成與刪除功能。
// 內容會保存到 localStorage，讓頁面重新整理後仍可保留資料。

const STORAGE_KEY = 'todo-list-data';
const THEME_STORAGE_KEY = 'todo-list-theme';
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoSummary = document.getElementById('todo-summary');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const themeToggleLabel = document.getElementById('theme-toggle-label');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
let currentFilter = 'all';

// 優先使用使用者儲存的主題，否則依照作業系統偏好設定。
function applyTheme(theme, savePreference = false) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggleIcon.textContent = isDark ? '☀️' : '🌙';
  themeToggleLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-pressed', String(isDark));

  if (savePreference) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
applyTheme(savedTheme || (themePreference.matches ? 'dark' : 'light'));

// 尚未手動選擇主題時，跟隨作業系統的即時設定。
themePreference.addEventListener('change', (event) => {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
});

// 讀取 localStorage 中的資料，若不存在則回傳空陣列。
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 將待辦資料儲存到 localStorage。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 計算未完成項目數量，並更新底部統計文字。
function updateSummary() {
  const remainingCount = todos.filter((todo) => !todo.completed).length;
  todoSummary.textContent = `未完成: ${remainingCount} 項`;
}

// 依照目前篩選條件渲染清單，並保留整份清單的統計數字。
function renderTodos() {
  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (visibleTodos.length === 0) {
    const emptyMessages = {
      all: '還沒有任何待辦事項，新增一個吧！',
      active: '目前沒有未完成的待辦事項。',
      completed: '目前沒有已完成的待辦事項。',
    };
    todoList.innerHTML = `<li class="empty-state">${emptyMessages[currentFilter]}</li>`;
    updateSummary();
    return;
  }

  todoList.innerHTML = visibleTodos
    .map(
      (todo) => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <div class="todo-content">
            <input
              class="todo-checkbox"
              type="checkbox"
              ${todo.completed ? 'checked' : ''}
              aria-label="標記為完成"
            />
            <span class="todo-text">${escapeHtml(todo.text)}</span>
          </div>
          <button class="todo-delete" type="button" aria-label="刪除待辦">刪除</button>
        </li>
      `
    )
    .join('');

  updateSummary();
}

// 轉義 HTML 字元，避免使用者輸入內容造成 XSS 問題。
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 新增待辦事項。
function addTodo(event) {
  event.preventDefault();

  const text = todoInput.value.trim();

  // 若輸入內容為空白，直接忽略並保留焦點。
  if (!text) {
    todoInput.value = '';
    todoInput.focus();
    return;
  }

  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
  };

  todos.unshift(newTodo);
  todoInput.value = '';
  saveTodos();
  renderTodos();
  todoInput.focus();
}

// 切換待辦完成狀態。
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}

// 刪除指定待辦事項。
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 表單提交時新增待辦。
todoForm.addEventListener('submit', addTodo);

// 切換清單篩選條件。
document.querySelector('.todo-filters').addEventListener('click', (event) => {
  const filterButton = event.target.closest('.filter-button');
  if (!filterButton) return;

  currentFilter = filterButton.dataset.filter;
  document.querySelectorAll('.filter-button').forEach((button) => {
    const isActive = button === filterButton;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  renderTodos();
});

// 透過事件代理處理勾選與刪除行為。
todoList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.todo-delete');
  if (deleteButton) {
    const item = deleteButton.closest('.todo-item');
    if (!item) return;

    const id = Number(item.dataset.id);
    deleteTodo(id);
    return;
  }
});

todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.todo-checkbox');
  if (!checkbox) return;

  const item = checkbox.closest('.todo-item');
  if (!item) return;

  const id = Number(item.dataset.id);
  toggleTodo(id);
});

// 首次載入頁面時，顯示現有資料。
renderTodos();
