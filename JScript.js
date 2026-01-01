let itemCounter = parseInt(localStorage.getItem('itemCounter')) || 0;

const userInputField = document.getElementById('todoInput');
const notificationArea = document.getElementById('errorMessage');
const inputForm = document.getElementById('taskForm');
const modalTitle = document.getElementById("delete-title");
const modalMessage = document.getElementById("delete-message");
const actionButton = document.getElementById("confirm");
let currentAction = 'single';

const checkTextValidity = (content, displayArea) => {
  if (!content) {
    displayArea.innerText = 'Task cannot be empty';
    displayArea.style.display = 'block';
    return false;
  }

  if (!isNaN(content[0])) {
    displayArea.innerText = 'Task cannot start with a number';
    displayArea.style.display = 'block';
    return false;
  }

  if (content.length < 5) {
    displayArea.innerText = 'Task must be at least 5 characters long';
    displayArea.style.display = 'block';
    return false;
  }

  displayArea.innerText = '';
  displayArea.style.display = 'none';
  return true;
};

const displayNotification = (message) => {
    notificationArea.innerText = message;
    notificationArea.style.display = 'block';
};

const clearNotification = () => {
    notificationArea.innerText = '';
    notificationArea.style.display = 'none';
};

const persistTasks = () => {
  let savedItems = [];

  document.querySelectorAll('.todo-list li').forEach(element => {
    let content = element.querySelector('.inner-todo').innerText.trim();
    let isDone = element.classList.contains('completed');
    let identifier = element.id;

    if (content){
      savedItems.push({identifier, content, isDone});
    }
  });

  localStorage.setItem('tasks', JSON.stringify(savedItems));
};

const updateDeleteButtonStates = () => {
  const allElements = document.querySelectorAll(".todo-list li");
  const completedElements = document.querySelectorAll(".todo-list li.completed");

  const removeAllBtn = document.getElementById("deleteAllTasks");
  const removeCompletedBtn = document.getElementById("deleteDoneTasks");

  removeAllBtn.disabled = allElements.length === 0;
  removeCompletedBtn.disabled = completedElements.length === 0;
};

const restoreTasks = () => {
  const savedItems = JSON.parse(localStorage.getItem('tasks')) || [];

  savedItems.forEach(item => {
    const listElement = document.createElement('li');
    listElement.id = item.identifier;
    listElement.classList.toggle('completed', item.isDone);
    listElement.style.display = 'flex';

    const iconMarkup = item.isDone
      ? '<i class="fa-regular fa-check-square"></i>'
      : '<i class="fa-regular fa-square"></i>';

    listElement.innerHTML = `
      <span class="inner-todo">${item.content}</span>
      <div class="icons">
        <button class="check">${iconMarkup}</button>
        <button class="edit"><i class="fa-solid fa-pen"></i></button>
        <button class="delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    document.querySelector('.todo-list').appendChild(listElement);
  });

  if (savedItems.length > 0) {
    const lastIdNum = Math.max(...savedItems.map(item => parseInt(item.identifier.split('-')[1])));
    itemCounter = lastIdNum + 1;
    localStorage.setItem('itemCounter', itemCounter);
  }
};

let taskList = document.querySelector(".todo-list");

const toggleModal = (id, className) => document.getElementById(id).classList.toggle(className);

const filterDisplay = (filterType) => {
    document.querySelectorAll("#clssification-btns button").forEach((btn) => {
    btn.classList.remove("active-button");
  });

  document.getElementById(filterType).classList.add("active-button");
};

const showAll = () => {
  document.querySelectorAll(".todo-list li").forEach(item => { 
    item.style.display = "flex";
  });
};

const showCompleted = () => {
  document.querySelectorAll(".todo-list li").forEach(item => { 
    item.style.display = item.classList.contains("completed") ? "flex" : "none";
  });
};

const showPending = () => {
  document.querySelectorAll(".todo-list li").forEach(item => { 
    item.style.display = item.classList.contains("completed") ? "none" : "flex";
  });
};

inputForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const userText = userInputField.value.trim();

  if (!checkTextValidity(userText, notificationArea)) return;

    clearNotification();

    const listItem = document.createElement('li');
    listItem.id = `item-${itemCounter++}`;
    localStorage.setItem('itemCounter', itemCounter);

    listItem.innerHTML = `
        <span class="inner-todo">${userText}</span>
        <div class="icons">
            <button class="check">
                <i class="fa-regular fa-square"></i>
            </button>
            <button class="edit">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    listItem.style.display="flex";

    taskList.appendChild(listItem);
    persistTasks();
    updateDeleteButtonStates();
    userInputField.value = '';
});

taskList.addEventListener("click", (event) => {
    let checkBtn = event.target.closest(".check");
    if (checkBtn){
        let element = checkBtn.closest("li");
        let iconElement = checkBtn.querySelector("i");

        iconElement.classList.toggle("fa-square");
        iconElement.classList.toggle("fa-check-square");
        element.classList.toggle("completed");
        persistTasks();
        updateDeleteButtonStates();
        return;
    }

    let editBtn = event.target.closest(".edit");
    if (editBtn){
        let element = editBtn.closest("li");
        let taskContent = element.querySelector(".inner-todo");
        document.getElementById("input-edition").value = taskContent.innerText;
        document.getElementById("save").dataset.targetId = element.id;

        toggleModal("edit-opacity", "edit-opacity");
        toggleModal("edit-overlay", "edit-overlay");
        return;
    }

    let removeBtn = event.target.closest(".delete");
    
    if (removeBtn){
        let element = removeBtn.closest("li");
        document.getElementById("confirm").dataset.targetId = element.id;
        
        currentAction = 'single';
        modalTitle.innerText = "Delete Task";
        modalMessage.innerText = "Are you sure you want to delete this task?";

        toggleModal("delete-opacity", "delete-opacity");
        toggleModal("delete-overlay", "delete-overlay");
        return;
    }
});

document.getElementById("save").addEventListener("click", () => {
  const modificationInput = document.getElementById("input-edition");
  const modificationError = document.getElementById("errorMessage-edition");
  const updatedText = modificationInput.value.trim();

  if (!checkTextValidity(updatedText, modificationError)) return;

  clearNotification();
  let elementId = document.getElementById("save").dataset.targetId;
  let targetElement = document.getElementById(elementId);

  if (targetElement) {
    targetElement.querySelector(".inner-todo").innerText = document.getElementById("input-edition").value;
    persistTasks();
  }

  toggleModal("edit-opacity", "edit-opacity");
  toggleModal("edit-overlay", "edit-overlay");
});

document.getElementById("edit-cancel").addEventListener("click", () => {
  toggleModal("edit-opacity", "edit-opacity");
  toggleModal("edit-overlay", "edit-overlay");
});

document.getElementById("delete-cancel").addEventListener("click", () => {
  toggleModal("delete-opacity", "delete-opacity");
  toggleModal("delete-overlay", "delete-overlay");
});

document.getElementById("confirm").addEventListener("click", () => {
  if (currentAction === 'single') {
    let elementId = document.getElementById("confirm").dataset.targetId;
    let targetElement = document.getElementById(elementId);
    if (targetElement) targetElement.remove();
  }

  if (currentAction === 'done') {
    document.querySelectorAll(".todo-list li.completed").forEach(task => task.remove());
  }

  if (currentAction === 'all') {
    document.querySelectorAll(".todo-list li").forEach(task => task.remove());
    localStorage.setItem('itemCounter', 0);
    itemCounter = 0;
  }

  currentAction = 'single';
  document.getElementById("confirm").removeAttribute("data-target-id");
  persistTasks();
  updateDeleteButtonStates();

  toggleModal("delete-opacity", "delete-opacity");
  toggleModal("delete-overlay", "delete-overlay");
});

document.getElementById("all").addEventListener("click", () => {
    filterDisplay("all");
    showAll();
});

document.getElementById("done").addEventListener("click", () => {
    filterDisplay("done");
    showCompleted();
});

document.getElementById("todo").addEventListener("click", () => {
    filterDisplay("todo");
    showPending();
});

document.getElementById("deleteDoneTasks").addEventListener("click", () => {
  const completedTasks = document.querySelectorAll(".todo-list li.completed");

  if (completedTasks.length === 0) {
    displayNotification("No Done tasks to be deleted.");
    return;
  }

  currentAction = 'done';
  modalTitle.innerText = "Delete Done Tasks";
  modalMessage.innerText = "Are you sure you want to delete all done tasks?";
  toggleModal("delete-opacity", "delete-opacity");
  toggleModal("delete-overlay", "delete-overlay");
});

document.getElementById("deleteAllTasks").addEventListener("click", () => {
  const allTasks = document.querySelectorAll(".todo-list li");

  if (allTasks.length === 0) {
    displayNotification("No tasks to be deleted.");
    return;
  }

  currentAction = 'all';
  modalTitle.innerText = "Delete All Tasks";
  modalMessage.innerText = "Are you sure you want to delete all tasks?";
  toggleModal("delete-opacity", "delete-opacity");
  toggleModal("delete-overlay", "delete-overlay");
});

window.addEventListener("DOMContentLoaded", () => {
  restoreTasks();
  updateDeleteButtonStates();
});
