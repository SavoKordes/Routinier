const TASKS_KEY = "routineTasks";
let tasks = {};

window.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

function addTask(taskText = "", checked = false, taskId = null) {
  taskId = taskId || "task-" + Date.now();

  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = taskId;
  checkbox.checked = checked;

  const label = document.createElement("label");
  label.htmlFor = taskId;
  label.textContent = taskText;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.onclick = () => {
    li.remove();
    delete tasks[taskId];
    saveTasks();
  };

  checkbox.addEventListener("change", () => {
    tasks[taskId].checked = checkbox.checked;
    saveTasks();
  });

  li.appendChild(checkbox);
  li.appendChild(label);
  li.appendChild(deleteBtn);
  document.getElementById("routineList").appendChild(li);

  tasks[taskId] = { text: taskText, checked };
  saveTasks();
}

function handleAddTaskFromInput() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText === "") return;

  addTask(taskText);
  input.value = "";
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  if (!saved) return;
  tasks = JSON.parse(saved);
  Object.entries(tasks).forEach(([id, task]) => {
    addTask(task.text, task.checked, id);
  });
}

document.getElementById("reset-btn")?.addEventListener("click", () => {
  localStorage.removeItem(TASKS_KEY);
  tasks = {};
  const routineList = document.getElementById("routineList");
  routineList.innerHTML = "";
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then(reg => {
    console.log("Service Worker registered:", reg.scope);
    if (reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }).catch(err => console.error("SW registration failed:", err));

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}