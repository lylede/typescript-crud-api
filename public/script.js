const STORAGE_KEY = "fullstack_app_db";
let currentUser = null;

window.db = {
  accounts: [],
  departments: [],
  employees: [],
  requests: []
};

/* ---------------- Persistence ---------------- */
async function saveDB() {
  const response = await fetch('http://localhost:3000/api/login',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,password})});
}

function loadDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) window.db = JSON.parse(raw);
}

/* ---------------- Toast ---------------- */
function showToast(message, type = "primary") {
  const area = document.getElementById("toastArea");
  if (!area) return;

  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.role = "alert";
  el.ariaLive = "assertive";
  el.ariaAtomic = "true";

  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  area.appendChild(el);
  const toast = new bootstrap.Toast(el, { delay: 2200 });
  toast.show();

  el.addEventListener("hidden.bs.toast", () => el.remove());
}

/* ---------------- Helpers ---------------- */
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function findAccountByEmail(email) {
  const e = normalizeEmail(email);
  return window.db.accounts.find(a => normalizeEmail(a.email) === e) || null;
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId)?.classList.add("active");
}

function navigateTo(hash) {
  window.location.hash = hash;
}

/* ---------------- Auth UI State ---------------- */
function setAuthState(isAuth, user = null) {
  currentUser = isAuth ? user : null;

  document.body.classList.toggle("authenticated", isAuth);
  document.body.classList.toggle("not-authenticated", !isAuth);

  const isAdmin = !!(currentUser && currentUser.role === "Admin");
  document.body.classList.toggle("is-admin", isAdmin);

  const navUsername = document.getElementById("navUsername");
  if (navUsername) navUsername.textContent = currentUser ? currentUser.firstName : "User";
}

function renderProfile() {
  if (!currentUser) return;
  document.getElementById("profileName").textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById("profileEmail").textContent = currentUser.email;
  document.getElementById("profileRole").textContent = currentUser.role;
}

/* ---------------- Router ---------------- */
function handleRouting() {
  const hash = window.location.hash || "#/";

  const routes = {
    "#/": "home-page",
    "#/login": "login-page",
    "#/register": "register-page",
    "#/verify-email": "verify-email-page",
    "#/profile": "profile-page",
    "#/employees": "employees-page",
    "#/departments": "departments-page",
    "#/accounts": "accounts-page",
    "#/requests": "requests-page",
  };

  const protectedRoutes = new Set(["#/profile", "#/requests", "#/employees", "#/departments", "#/accounts"]);
  const adminRoutes = new Set(["#/employees", "#/departments", "#/accounts"]);

  if (protectedRoutes.has(hash) && !currentUser) {
    navigateTo("#/login");
    return;
  }

  if (adminRoutes.has(hash) && (!currentUser || currentUser.role !== "Admin")) {
    navigateTo("#/");
    return;
  }

  const pageId = routes[hash] || "home-page";
  showPage(pageId);

  if (hash === "#/verify-email") {
    const email = localStorage.getItem("unverified_email") || "";
    document.getElementById("verifyEmailTarget").textContent = email || "—";
  }

  if (hash === "#/profile") renderProfile();
  if (hash === "#/accounts") renderAccountsTable(document.getElementById("accountsSearch")?.value || "");
  if (hash === "#/departments") renderDepartmentsTable(document.getElementById("departmentsSearch")?.value || "");
  if (hash === "#/employees") {
    renderDepartmentDropdown();
    renderEmployeesTable(document.getElementById("employeesSearch")?.value || "");
  }
  if (hash === "#/requests") renderMyRequests();
}

/* ---------------- Auth ---------------- */
function registerAccount({ firstName, lastName, email, password }) {
  const e = normalizeEmail(email);

  if (findAccountByEmail(e)) {
    showToast("Email already exists.", "danger");
    return;
  }

  window.db.accounts.push({
    id: crypto.randomUUID(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: e,
    password,
    role: "user",
    verified: false
  });

  saveDB();
  localStorage.setItem("unverified_email", e);
  showToast("Account created! Please verify email.", "success");
  navigateTo("#/verify-email");
}

function simulateVerifyEmail() {
  const e = normalizeEmail(localStorage.getItem("unverified_email"));
  const acc = findAccountByEmail(e);

  if (!acc) {
    showToast("No account found to verify.", "danger");
    return;
  }

  acc.verified = true;
  saveDB();
  localStorage.removeItem("unverified_email");

  showToast("Email verified! You can now login.", "success");
  navigateTo("#/login");
}

function showDashboard(user){
  currentUser = user;
  showToast("Login successful!", "success");

  if(user.role === "admin"){
    navigateTo("#/accounts");
  } else {
    navigateTo("#/profile");
  }
}


function getAuthHeader() {

  const token = sessionStorage.getItem("authToken");

  return token ? { Authorization: `Bearer ${token}` } : {};

}

async function loadAdminDashboard() {

  const res = await fetch("http://localhost:3000/api/admin/dashboard", {
    headers: getAuthHeader()
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("content").innerText = data.message;
  } else {
    document.getElementById("content").innerText = "Access denied!";
  }

}

function logout() {
  sessionStorage.removeItem("authToken");
  setAuthState(false);
  showToast("Logged out.", "secondary");
  navigateTo("#/");
}

/* ---------------- Seeds ---------------- */
function seedAdminIfEmpty() {
  if (window.db.accounts.length > 0) return;

  window.db.accounts.push({
    id: crypto.randomUUID(),
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "Password123!",
    role: "admin",
    verified: true
  });

  saveDB();
}

function seedDepartmentsIfEmpty() {
  if (window.db.departments.length > 0) return;

  window.db.departments.push(
    { id: crypto.randomUUID(), name: "Engineering", description: "Builds and maintains systems." },
    { id: crypto.randomUUID(), name: "HR", description: "Handles people and hiring." }
  );

  saveDB();
}

/* ---------------- Accounts CRUD ---------------- */
function renderAccountsTable(filterText = "") {
  const tbody = document.getElementById("accountsTbody");
  if (!tbody) return;

  const q = String(filterText || "").toLowerCase();
  const list = window.db.accounts.filter(acc => {
    const fullName = `${acc.firstName} ${acc.lastName}`.toLowerCase();
    return fullName.includes(q) || acc.email.toLowerCase().includes(q) || String(acc.role).toLowerCase().includes(q);
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">No accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(acc => {
    const fullName = `${acc.firstName} ${acc.lastName}`;
    const verifiedText = acc.verified ? "✓" : "—";

    return `
      <tr>
        <td>${fullName}</td>
        <td>${acc.email}</td>
        <td>${acc.role}</td>
        <td>${verifiedText}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${acc.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${acc.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function openAccountModal(mode, account = null) {
  const modalEl = document.getElementById("accountModal");
  const form = document.getElementById("accountForm");
  const title = document.getElementById("accountModalTitle");

  form.reset();
  form.elements.id.value = "";
  form.elements.password.required = (mode === "add");
  title.textContent = mode === "add" ? "Add Account" : "Edit Account";

  if (account) {
    form.elements.id.value = account.id;
    form.elements.firstName.value = account.firstName;
    form.elements.lastName.value = account.lastName;
    form.elements.email.value = account.email;
    form.elements.role.value = account.role;
    form.elements.verified.checked = !!account.verified;
  }

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function saveAccountFromForm(fd) {
  const id = fd.get("id");
  const firstName = fd.get("firstName").trim();
  const lastName = fd.get("lastName").trim();
  const email = normalizeEmail(fd.get("email"));
  const password = fd.get("password");
  const role = fd.get("role");
  const verified = fd.get("verified") === "on";

  const emailUsed = window.db.accounts.some(a => normalizeEmail(a.email) === email && a.id !== id);
  if (emailUsed) {
    showToast("Email already exists.", "danger");
    return false;
  }

  if (!id) {
    if (!password || password.length < 6) {
      showToast("Password must be at least 6 characters.", "danger");
      return false;
    }

    window.db.accounts.push({
      id: crypto.randomUUID(),
      firstName, lastName, email,
      password, role, verified
    });

    showToast("Account added!", "success");
  } else {
    const acc = window.db.accounts.find(a => a.id === id);
    if (!acc) return false;

    acc.firstName = firstName;
    acc.lastName = lastName;
    acc.email = email;
    acc.role = role;
    acc.verified = verified;

    if (password) {
      if (password.length < 6) {
        showToast("New password must be at least 6 characters.", "danger");
        return false;
      }
      acc.password = password;
    }

    if (currentUser && currentUser.id === acc.id) {
      setAuthState(true, acc);
      renderProfile();
    }

    showToast("Account updated!", "success");
  }

  saveDB();
  renderAccountsTable(document.getElementById("accountsSearch")?.value || "");
  renderEmployeesTable(document.getElementById("employeesSearch")?.value || "");
  return true;
}

function deleteAccount(accountId) {
  const acc = window.db.accounts.find(a => a.id === accountId);
  if (!acc) return;

  if (currentUser && currentUser.id === acc.id) {
    showToast("You cannot delete your own account.", "danger");
    return;
  }

  const ok = confirm(`Delete account for ${acc.email}?`);
  if (!ok) return;

  window.db.accounts = window.db.accounts.filter(a => a.id !== accountId);
  window.db.employees = window.db.employees.filter(e => e.userId !== accountId);

  saveDB();
  renderAccountsTable(document.getElementById("accountsSearch")?.value || "");
  renderEmployeesTable(document.getElementById("employeesSearch")?.value || "");
  showToast("Account deleted.", "secondary");
}

/* ---------------- Departments CRUD ---------------- */
async function renderDepartmentsTable() {
  const tbody = document.getElementById("departmentsTbody");
  if (!tbody) return;

  try {
    const res = await fetch("http://localhost:4000/departments");
    const departments = await res.json();

    if (departments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">No departments found</td></tr>`;
      return;
    }

    tbody.innerHTML = departments.map(d => `
      <tr>
        <td>${d.name}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${d.id})">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3">Error loading data</td></tr>`;
  }
}

function renderDepartmentDropdown() {
  const sel = document.getElementById("employeeDeptSelect");
  if (!sel) return;
  sel.innerHTML = window.db.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
}

function renderEmployeeModalDeptDropdown(selectedId = null) {
  const sel = document.getElementById("employeeModalDeptSelect");
  if (!sel) return;

  sel.innerHTML = window.db.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
  if (selectedId) sel.value = selectedId;
}

function openDepartmentModal(mode, dept = null) {
  const modalEl = document.getElementById("departmentModal");
  const form = document.getElementById("departmentForm");
  const title = document.getElementById("departmentModalTitle");

  form.reset();
  form.elements.id.value = "";
  title.textContent = mode === "add" ? "Add Department" : "Edit Department";

  if (dept) {
    form.elements.id.value = dept.id;
    form.elements.name.value = dept.name;
    form.elements.description.value = dept.description || "";
  }

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function saveDepartmentFromForm(fd) {
  const name = fd.get("name");

  try {
    await fetch("http://localhost:4000/departments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    showToast("Department added!", "success");

    renderDepartmentsTable(); // reload data
    return true;

  } catch (err) {
    console.error(err);
    showToast("Error adding department", "danger");
    return false;
  }
}

async function deleteDepartment(id) {
  const ok = confirm("Delete this department?");
  if (!ok) return;

  try {
    await fetch(`http://localhost:4000/departments/${id}`, {
      method: "DELETE"
    });

    showToast("Deleted!", "success");
    renderDepartmentsTable();

  } catch (err) {
    console.error(err);
    showToast("Delete failed", "danger");
  }
}

/* ---------------- Employees CRUD ---------------- */
function renderEmployeesTable(filterText = "") {
  const tbody = document.getElementById("employeesTbody");
  if (!tbody) return;

  const q = String(filterText || "").toLowerCase();

  const list = window.db.employees.filter(emp => {
    const user = window.db.accounts.find(a => a.id === emp.userId);
    const dept = window.db.departments.find(d => d.id === emp.deptId);
    const blob = [emp.empId, user?.email || "", emp.position, dept?.name || "", emp.hireDate].join(" ").toLowerCase();
    return blob.includes(q);
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No employees found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(emp => {
    const user = window.db.accounts.find(a => a.id === emp.userId);
    const dept = window.db.departments.find(d => d.id === emp.deptId);

    return `
      <tr>
        <td>${emp.empId}</td>
        <td>${user ? user.email : "—"}</td>
        <td>${emp.position}</td>
        <td>${dept ? dept.name : "—"}</td>
        <td>${emp.hireDate}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" data-empedit="${emp.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-empdel="${emp.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function addEmployee({ empId, userEmail, position, deptId, hireDate }) {
  if (window.db.employees.some(e => e.empId === empId)) {
    showToast("Employee ID already exists.", "danger");
    return;
  }

  const user = findAccountByEmail(userEmail);
  if (!user) {
    showToast("User Email must match an existing account.", "danger");
    return;
  }

  window.db.employees.push({
    id: crypto.randomUUID(),
    empId,
    userId: user.id,
    deptId,
    position,
    hireDate
  });

  saveDB();
  renderEmployeesTable(document.getElementById("employeesSearch")?.value || "");
  showToast("Employee added!", "success");
}

function openEmployeeModal(emp) {
  const modalEl = document.getElementById("employeeModal");
  const form = document.getElementById("employeeModalForm");
  const user = window.db.accounts.find(a => a.id === emp.userId);

  form.reset();
  form.elements.id.value = emp.id;
  form.elements.empId.value = emp.empId;
  form.elements.userEmail.value = user ? user.email : "";
  form.elements.position.value = emp.position;
  form.elements.hireDate.value = emp.hireDate;

  renderEmployeeModalDeptDropdown(emp.deptId);
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function saveEmployeeFromModal(fd) {
  const id = fd.get("id");
  const empId = String(fd.get("empId") || "").trim();
  const userEmail = String(fd.get("userEmail") || "").trim();
  const position = String(fd.get("position") || "").trim();
  const deptId = fd.get("deptId");
  const hireDate = fd.get("hireDate");

  const idUsed = window.db.employees.some(e => e.empId === empId && e.id !== id);
  if (idUsed) {
    showToast("Employee ID already exists.", "danger");
    return false;
  }

  const user = findAccountByEmail(userEmail);
  if (!user) {
    showToast("User Email must match an existing account.", "danger");
    return false;
  }

  const emp = window.db.employees.find(e => e.id === id);
  if (!emp) return false;

  emp.empId = empId;
  emp.userId = user.id;
  emp.position = position;
  emp.deptId = deptId;
  emp.hireDate = hireDate;

  saveDB();
  renderEmployeesTable(document.getElementById("employeesSearch")?.value || "");
  showToast("Employee updated!", "success");
  return true;
}

/* ---------------- Requests ---------------- */
function statusBadge(status) {
  if (status === "Approved") return `<span class="badge text-bg-success">${status}</span>`;
  if (status === "Rejected") return `<span class="badge text-bg-danger">${status}</span>`;
  return `<span class="badge text-bg-warning">${status}</span>`;
}

function createItemRow(name = "", qty = 1) {
  const row = document.createElement("div");
  row.className = "row g-2 align-items-end border rounded p-2";

  row.innerHTML = `
    <div class="col-md-7">
      <label class="form-label">Item Name</label>
      <input class="form-control item-name" value="${name}" placeholder="e.g., Laptop" />
    </div>
    <div class="col-md-3">
      <label class="form-label">Qty</label>
      <input class="form-control item-qty" type="number" min="1" value="${qty}" />
    </div>
    <div class="col-md-2 d-grid">
      <button class="btn btn-outline-danger btnRemoveItem" type="button">× Remove</button>
    </div>
  `;

  row.querySelector(".btnRemoveItem").addEventListener("click", () => row.remove());
  return row;
}

function openRequestModal() {
  const modalEl = document.getElementById("requestModal");
  const form = document.getElementById("requestForm");
  const itemsContainer = document.getElementById("itemsContainer");

  form.reset();
  itemsContainer.innerHTML = "";
  itemsContainer.appendChild(createItemRow());

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function collectItemsFromModal() {
  const container = document.getElementById("itemsContainer");
  const rows = Array.from(container.querySelectorAll(".row"));

  return rows.map(r => {
    const name = r.querySelector(".item-name").value.trim();
    const qty = parseInt(r.querySelector(".item-qty").value, 10);
    return { name, qty: Number.isFinite(qty) ? qty : 0 };
  }).filter(it => it.name.length > 0 && it.qty >= 1);
}

function submitRequest(type, items) {
  if (!items || items.length === 0) {
    showToast("Please add at least one item.", "danger");
    return false;
  }

  window.db.requests.push({
    id: crypto.randomUUID(),
    type,
    items,
    status: "Pending",
    date: new Date().toLocaleDateString(),
    employeeEmail: currentUser.email
  });

  saveDB();
  renderMyRequests();
  showToast("Request submitted!", "success");
  return true;
}

/**
 * USER: sees only their requests (no actions)
 * ADMIN: sees all requests + approve/reject/delete (buttons inside Status)
 */
function renderMyRequests() {
  const tbody = document.getElementById("requestsTbody");
  if (!tbody) return;
  if (!currentUser) { tbody.innerHTML = ""; return; }

  const isAdmin = currentUser.role === "admin";
  const q = String(document.getElementById("requestsSearch")?.value || "").toLowerCase();

  const baseList = isAdmin
    ? window.db.requests
    : window.db.requests.filter(r => r.employeeEmail === currentUser.email);

  const list = baseList.filter(r => {
    const blob = [
      r.date,
      r.employeeEmail,
      r.type,
      r.status,
      r.items.map(it => `${it.name} ${it.qty}`).join(" ")
    ].join(" ").toLowerCase();
    return blob.includes(q);
  });

  const colspan = isAdmin ? 5 : 4;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-muted">No requests found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    const itemsText = r.items.map(it => `${it.name} (x${it.qty})`).join(", ");
    const emailCell = isAdmin ? `<td>${r.employeeEmail}</td>` : ``;

    const statusCell = isAdmin ? `
      <td class="text-center align-middle">
        <div class="status-wrap">
          ${statusBadge(r.status)}
          <div class="req-actions">
            <button class="btn btn-sm btn-outline-success" data-reqact="approve" data-id="${r.id}">Approve</button>
            <button class="btn btn-sm btn-outline-danger" data-reqact="reject" data-id="${r.id}">Reject</button>
            <button class="btn btn-sm btn-outline-secondary" data-reqact="delete" data-id="${r.id}">Delete</button>
          </div>
        </div>
      </td>
    ` : `
      <td class="text-center align-middle">${statusBadge(r.status)}</td>
    `;

    return `
      <tr>
        <td>${r.date}</td>
        ${emailCell}
        <td>${r.type}</td>
        <td>${itemsText}</td>
        ${statusCell}
      </tr>
    `;
  }).join("");
}

/* ---------------- Init + Events ---------------- */
window.addEventListener("hashchange", handleRouting);

window.addEventListener("DOMContentLoaded", () => {
  loadDB();
  seedAdminIfEmpty();
  seedDepartmentsIfEmpty();

  // Restore session
  const tokenEmail = normalizeEmail(localStorage.getItem("auth_token"));
  if (tokenEmail) {
    const acc = findAccountByEmail(tokenEmail);
    if (acc && acc.verified) setAuthState(true, acc);
  }

  if (!window.location.hash) window.location.hash = "#/";
  handleRouting();

  // ✅ Dropdown auto-close (works for SPA hash links)
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".dropdown-menu .dropdown-item");
    if (!item) return;

    const dropdown = item.closest(".dropdown");
    if (!dropdown) return;

    const toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
    if (!toggle) return;

    bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
  });

  // Register
  document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    registerAccount({
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      password: fd.get("password")
    });
  });

  // Verify
  document.getElementById("btnSimulateVerify")?.addEventListener("click", simulateVerifyEmail);

  // Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(e.target);
  const email = fd.get("email");
  const password = fd.get("password");

  try {
    const res = await fetch("http://localhost:4000/users/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      showToast("Login successful!", "success");

      // 👇 IMPORTANT: set current user
      setAuthState(true, data);

      if (data.role === "Admin") {
        navigateTo("#/accounts");
      } else {
        navigateTo("#/profile");
      }
    } else {
      showToast(data.message || "Login failed", "danger");
    }

  } catch (err) {
    console.error(err);
    showToast("Server error", "danger");
  }
});

  // Logout (prevent jump)
  document.getElementById("btnLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // Edit Profile (open modal)
  document.getElementById("btnEditProfile")?.addEventListener("click", () => {
    if (!currentUser) return;

    const form = document.getElementById("editProfileForm");
    form.elements.firstName.value = currentUser.firstName;
    form.elements.lastName.value = currentUser.lastName;
    form.elements.email.value = currentUser.email;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("editProfileModal")).show();
  });

  // Edit Profile (save)
  document.getElementById("editProfileForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const fd = new FormData(e.target);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();

    if (!firstName || !lastName) {
      showToast("Please fill in your name.", "danger");
      return;
    }

    const acc = window.db.accounts.find(a => a.id === currentUser.id);
    if (!acc) return;

    acc.firstName = firstName;
    acc.lastName = lastName;

    saveDB();
    setAuthState(true, acc);
    renderProfile();
    renderAccountsTable(document.getElementById("accountsSearch")?.value || "");

    bootstrap.Modal.getOrCreateInstance(document.getElementById("editProfileModal")).hide();
    showToast("Profile updated!", "success");
  });

  // Search listeners
  document.getElementById("accountsSearch")?.addEventListener("input", (e) => renderAccountsTable(e.target.value));
  document.getElementById("departmentsSearch")?.addEventListener("input", (e) => renderDepartmentsTable(e.target.value));
  document.getElementById("employeesSearch")?.addEventListener("input", (e) => renderEmployeesTable(e.target.value));
  document.getElementById("requestsSearch")?.addEventListener("input", renderMyRequests);

  // Accounts events
  document.getElementById("btnAddAccount")?.addEventListener("click", () => openAccountModal("add"));

  document.getElementById("accountsTbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const acc = window.db.accounts.find(a => a.id === id);

    if (action === "edit") openAccountModal("edit", acc);
    if (action === "delete") deleteAccount(id);
  });

  document.getElementById("accountForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = saveAccountFromForm(new FormData(e.target));
    if (!ok) return;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("accountModal")).hide();
  });

  // Departments events
  document.getElementById("btnAddDepartment")?.addEventListener("click", () => openDepartmentModal("add"));

  document.getElementById("departmentsTbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-deptact]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.deptact;
    const dept = window.db.departments.find(d => d.id === id);

    if (action === "edit") openDepartmentModal("edit", dept);
    if (action === "delete") deleteDepartment(id);
  });

  document.getElementById("departmentForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = saveDepartmentFromForm(new FormData(e.target));
    if (!ok) return;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("departmentModal")).hide();
  });

  // Employees events
  document.getElementById("employeeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    addEmployee({
      empId: String(fd.get("empId") || "").trim(),
      userEmail: String(fd.get("userEmail") || "").trim(),
      position: String(fd.get("position") || "").trim(),
      deptId: fd.get("deptId"),
      hireDate: fd.get("hireDate")
    });

    e.target.reset();
    renderDepartmentDropdown();
  });

  document.getElementById("employeesTbody")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest("button[data-empedit]");
    if (editBtn) {
      const id = editBtn.dataset.empedit;
      const emp = window.db.employees.find(x => x.id === id);
      if (emp) openEmployeeModal(emp);
      return;
    }

    const delBtn = e.target.closest("button[data-empdel]");
    if (!delBtn) return;

    const id = delBtn.dataset.empdel;
    const ok = confirm("Delete this employee?");
    if (!ok) return;

    window.db.employees = window.db.employees.filter(emp => emp.id !== id);
    saveDB();
    renderEmployeesTable(document.getElementById("employeesSearch")?.value || "");
    showToast("Employee deleted.", "secondary");
  });

  document.getElementById("employeeModalForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = saveEmployeeFromModal(new FormData(e.target));
    if (!ok) return;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("employeeModal")).hide();
  });

  // Requests (User submit)
  document.getElementById("btnNewRequest")?.addEventListener("click", openRequestModal);

  document.getElementById("btnAddItemRow")?.addEventListener("click", () => {
    document.getElementById("itemsContainer").appendChild(createItemRow());
  });

  document.getElementById("requestForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const type = fd.get("type");
    const items = collectItemsFromModal();

    const ok = submitRequest(type, items);
    if (!ok) return;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("requestModal")).hide();
    navigateTo("#/requests");
  });

  // Requests actions (ADMIN ONLY)
  document.getElementById("requestsTbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-reqact]");
    if (!btn) return;

    if (!currentUser || currentUser.role !== "admin") return;

    const id = btn.dataset.id;
    const action = btn.dataset.reqact;

    const req = window.db.requests.find(r => r.id === id);
    if (!req) return;

    if (action === "approve") req.status = "Approved";
    if (action === "reject") req.status = "Rejected";
    if (action === "delete") {
      const ok = confirm("Delete this request?");
      if (!ok) return;
      window.db.requests = window.db.requests.filter(r => r.id !== id);
    }

    saveDB();
    renderMyRequests();
  });
});
