// Minimal task app with localStorage
const KEY = 'routinier-tasks-v1';
let tasks = {}; // { id: { text, checked } }

window.addEventListener('DOMContentLoaded', () => {
  // Wire UI
  document.getElementById('addBtn').addEventListener('click', handleAdd);
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAdd();
  });
  document.getElementById('resetBtn').addEventListener('click', resetAll);

  // Load saved tasks
  const saved = localStorage.getItem(KEY);
  if (saved) {
    tasks = JSON.parse(saved);
    Object.entries(tasks).forEach(([id, t]) => renderTask(id, t));
  }
});

function persist() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

function handleAdd() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const id = 'task-' + Date.now();
  const t = { text, checked: false };
  tasks[id] = t;
  persist();
  renderTask(id, t);
  input.value = '';
  input.focus();
}

function renderTask(id, t) {
  const li = document.createElement('li');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = t.checked;
  box.addEventListener('change', () => {
    tasks[id].checked = box.checked;
    persist();
  });

  const span = document.createElement('span');
  span.textContent = t.text;
  span.style.flex = '1';

  const del = document.createElement('button');
  del.textContent = '🗑️';
  del.title = 'Delete task';
  del.addEventListener('click', () => {
    delete tasks[id];
    persist();
    li.remove();
  });

  li.appendChild(box);
  li.appendChild(span);
  li.appendChild(del);
  document.getElementById('list').appendChild(li);
}

function resetAll() {
  tasks = {};
  persist();
  document.getElementById('list').innerHTML = '';
}
