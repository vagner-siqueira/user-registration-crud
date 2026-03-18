/////////// DOM REFERENCES
const userForm = document.getElementById("user-form");
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputAge = document.getElementById("age");
const inputRole = document.getElementById("role");
const inputSearch = document.getElementById("search");
const userList = document.getElementById("user-list");
const message = document.getElementById("message");
const buttonSave = document.getElementById("btn-save");
const buttonCancel = document.getElementById("btn-cancel");

////////// STATE VARIABLES
let users = [];
let userEditingId = null;
let timeoutId = null;

////////// MESSAGE FUNCTIONS
function clearMessage() {
    message.textContent = "";
    message.classList.remove("msg-error", "msg-success");
}

function showError(text) {
    if (timeoutId) clearTimeout(timeoutId);
    clearMessage();
    message.textContent = text;
    message.classList.add("msg-error");
}

function showSuccess(text) {
    if (timeoutId) clearTimeout(timeoutId);
    clearMessage();
    message.textContent = text;
    message.classList.add("msg-success");


timeoutId = setTimeout(() => {
    clearMessage();
    timeoutId = null;
    }, 3000);
}

////////// FORM FUNCTIONS
function getFormData() {
    return {
        name: inputName.value.trim(),
        email: inputEmail.value.trim(),
        age: Number(inputAge.value),
        role: inputRole.value.trim(),
    };
}

function resetForm() {
    userForm.reset();
    userEditingId = null;
    buttonSave.textContent = "Save";
    buttonCancel.classList.add("hidden");
}

function validateRequiredFields(name, email, age, role) {
    if (!name || !email || !age || !role) {
        showError("Please fill all fields.");
        return false;
    }
    return true;
}

function validateDuplicateEmail(email) {
    const exists = users.some(user =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.id !== userEditingId
    );
    if (exists) {
        showError("This email is already registered.");
        return false;
    }
    return true;
}

////////// CRUD FUNCTIONS
function createUser(name, email, age, role) {
    users.push({
        id: Date.now(),
        name,
        email,
        age,
        role
    });
}

function updateUser(name, email, age, role) {
    const index = users.findIndex(user => user.id === userEditingId);
    if (index === -1) return;
    users[index] = {
        id: userEditingId,
        name,
        email,
        age,
        role
    };
}

function deleteUser(id) {
    const confirmed = confirm("Are you sure you want to delete?");
    if (!confirmed) return;
    users = users.filter(user => user.id !== id);
    saveUsers();
    renderUsers();
    showSuccess("User deleted successfully.");
}

function editUser(id) {
    const user = users.find(user => user.id === id);
    if (!user) return;
    inputName.value = user.name;
    inputEmail.value = user.email;
    inputAge.value = user.age;
    inputRole.value = user.role;

    userEditingId = id;
    buttonSave.textContent = "Update";
    buttonCancel.classList.remove("hidden");
}

////////// RENDER
function createUserRow(user) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.age}</td>
        <td>${user.role}</td>
        <td class="actions-cell">
            <button data-action="edit" data-id="${user.id}">Edit</button>
            <button data-action="delete" data-id="${user.id}">Delete</button>
        </td>
    `;
    return row;
}

function renderUsers(list = users) {
    userList.innerHTML = "";
    if (list.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.classList.add("empty-state");
        td.textContent = users.length === 0
        ? "No users registered"
        : "No users found";
        row.appendChild(td);
        userList.appendChild(row);
        return;
    }
    list.forEach(user => {
        userList.appendChild(createUserRow(user));
    });
}

////////// SEARCH
function filterUsers(text) {
    return users.filter(user =>
    user.name.toLowerCase().includes(text) ||
    user.email.toLowerCase().includes(text) ||
    user.role.toLowerCase().includes(text) ||
    String(user.age).includes(text)
    );
}

////////// LOCAL STORAGE
function loadUsers() {
    users = JSON.parse(localStorage.getItem("users")) || [];
    renderUsers();
} 

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

////////// EVENTS
userForm.addEventListener("submit", e => {
    e.preventDefault();
    const { name, email, age, role } = getFormData();
    const editing = userEditingId !== null;
    if (!validateRequiredFields(name, email, age, role)) return;
    if (!validateDuplicateEmail(email)) return;
    if (editing) updateUser(name, email, age, role);
    else createUser(name, email, age, role);
    saveUsers();
    renderUsers();
    showSuccess(editing ? "User updated successfully." : "User created successfully.");
    resetForm();
});

buttonCancel.addEventListener("click", () => {
    resetForm();
    clearMessage();
});

inputSearch.addEventListener("input", () => {
    const filtered = filterUsers(inputSearch.value.toLowerCase());
    renderUsers(filtered);
});

userList.addEventListener("click", e => {
    const action = e.target.dataset.action;
    const id = Number(e.target.dataset.id);
    if (!action) return;
    if (action === "edit") editUser(id);
    if (action === "delete") deleteUser(id);
});

////////// INIT
resetForm();
clearMessage();
loadUsers();
