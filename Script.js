// Load JSON file directly from /data folder
let companiesData = [];
let currentCompany = null;
let currentDepartment = null;

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/companies_todo_app.json")
    .then(res => res.json())
    .then(data => {
      companiesData = data.workspaces;
      renderCompanies();
    });

  document.getElementById("homeBtn").addEventListener("click", () => {
    currentCompany = null;
    currentDepartment = null;
    renderCompanies();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("sortSelect").value = "";
    renderDepartments(currentCompany);
  });

  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);
  document.getElementById("sortSelect").addEventListener("change", applyFilters);
});

// ================== UI Rendering ==================
function renderCompanies() {
  const content = document.getElementById("content");
  const breadcrumb = document.getElementById("breadcrumb");
  const controls = document.getElementById("controls");

  breadcrumb.innerHTML = "🏠 Home";
  controls.classList.add("hidden");
  content.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  content.innerHTML = companiesData.map(company => {
    const deptCount = company.lists.length;
    const empCount = company.lists.reduce((sum, d) => sum + d.tasks.length, 0);
    return `
      <div class="bg-white shadow-lg rounded-xl border border-violetLight p-6 hover:shadow-xl transition cursor-pointer"
           onclick="renderDepartments('${company.id}')">
        <h2 class="text-xl font-bold text-violetDark">${company.name}</h2>
        <p class="text-sm text-gray-600">ID: ${company.id}</p>
        <p class="mt-2 text-orangeDark font-semibold">Departments: ${deptCount}</p>
        <p class="text-violetDark font-semibold">Employees: ${empCount}</p>
      </div>`;
  }).join("");
}

function renderDepartments(companyId) {
  currentCompany = companiesData.find(c => c.id === companyId);
  const content = document.getElementById("content");
  const breadcrumb = document.getElementById("breadcrumb");
  const controls = document.getElementById("controls");

  breadcrumb.innerHTML = `🏠 Home / 🏢 ${currentCompany.name}`;
  controls.classList.remove("hidden");
  content.className = "space-y-4";

  content.innerHTML = `
    <table class="min-w-full bg-white shadow-lg rounded-xl overflow-hidden border border-violetLight">
      <thead class="bg-violetDark text-white">
        <tr>
          <th class="px-4 py-2">S.No</th>
          <th class="px-4 py-2">Department</th>
          <th class="px-4 py-2">Employees</th>
        </tr>
      </thead>
      <tbody>
        ${currentCompany.lists.map((dept, i) => `
          <tr class="hover:bg-violetLight/10 cursor-pointer" onclick="renderEmployees('${dept.id}')">
            <td class="px-4 py-2">${i + 1}</td>
            <td class="px-4 py-2 font-medium text-violetDark">${dept.name}</td>
            <td class="px-4 py-2 text-orangeDark">${dept.tasks.length}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderEmployees(deptId) {
  currentDepartment = currentCompany.lists.find(d => d.id === deptId);
  const content = document.getElementById("content");
  const breadcrumb = document.getElementById("breadcrumb");

  breadcrumb.innerHTML = `🏠 Home / 🏢 ${currentCompany.name} / 🏬 ${currentDepartment.name}`;
  content.className = "space-y-4";

  let employees = [...currentDepartment.tasks];
  employees = applySorting(employees);

  content.innerHTML = `
    <table class="min-w-full bg-white shadow-lg rounded-xl overflow-hidden border border-violetLight">
      <thead class="bg-orangeDark text-white">
        <tr>
          <th class="px-4 py-2">S.No</th>
          <th class="px-4 py-2">Employee</th>
          <th class="px-4 py-2">Role</th>
          <th class="px-4 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        ${employees.map((emp, i) => `
          <tr class="hover:bg-orangeLight/20 cursor-pointer" onclick="renderEmployeeDashboard('${emp.id}')">
            <td class="px-4 py-2">${i + 1}</td>
            <td class="px-4 py-2 font-semibold text-violetDark">${emp.title}</td>
            <td class="px-4 py-2">${emp.description.replace("Role: ", "")}</td>
            <td class="px-4 py-2">${renderStatus(emp.status)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderEmployeeDashboard(empId) {
  const emp = currentDepartment.tasks.find(t => t.id === empId);
  const content = document.getElementById("content");
  const breadcrumb = document.getElementById("breadcrumb");

  breadcrumb.innerHTML = `🏠 Home / 🏢 ${currentCompany.name} / 🏬 ${currentDepartment.name} / 👤 ${emp.title}`;
  content.className = "space-y-6";

  content.innerHTML = `
    <div class="bg-white shadow-lg rounded-xl border border-violetLight p-6">
      <h2 class="text-2xl font-bold text-violetDark mb-2">${emp.title}</h2>
      <p class="text-gray-700 mb-2"><strong>Role:</strong> ${emp.description.replace("Role: ", "")}</p>
      <p class="text-gray-700 mb-2"><strong>Department:</strong> ${currentDepartment.name}</p>
      <p class="text-gray-700 mb-2"><strong>Company:</strong> ${currentCompany.name}</p>
      <div class="mb-2">
        <strong>Skills:</strong>
        <div class="flex flex-wrap gap-2 mt-2">
          ${emp.tags.map(tag => `<span class="px-3 py-1 bg-orangeLight text-violetDark text-sm rounded-full">${tag}</span>`).join("")}
        </div>
      </div>
      <p><strong>Status:</strong> ${renderStatus(emp.status)}</p>
    </div>
  `;
}

// ================== Helpers ==================
function renderStatus(status) {
  const map = {
    "0": { text: "Yet To Start", color: "bg-gray-300 text-gray-800" },
    "1": { text: "Incomplete", color: "bg-red-200 text-red-800" },
    "2": { text: "Complete", color: "bg-green-200 text-green-800" },
    "-1": { text: "On Hold", color: "bg-yellow-200 text-yellow-800" }
  };
  const st = map[status];
  return `<span class="px-2 py-1 text-xs rounded-lg ${st.color}">${st.text}</span>`;
}

function applyFilters() {
  if (!currentDepartment) return;
  let employees = [...currentDepartment.tasks];

  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;

  if (search) {
    employees = employees.filter(e => e.title.toLowerCase().includes(search) || e.description.toLowerCase().includes(search));
  }
  if (status) {
    employees = employees.filter(e => String(e.status) === status);
  }

  employees = applySorting(employees);

  const tbody = employees.map((emp, i) => `
    <tr class="hover:bg-orangeLight/20 cursor-pointer" onclick="renderEmployeeDashboard('${emp.id}')">
      <td class="px-4 py-2">${i + 1}</td>
      <td class="px-4 py-2 font-semibold text-violetDark">${emp.title}</td>
      <td class="px-4 py-2">${emp.description.replace("Role: ", "")}</td>
      <td class="px-4 py-2">${renderStatus(emp.status)}</td>
    </tr>`).join("");

  document.querySelector("#content tbody").innerHTML = tbody;
}

function applySorting(employees) {
  const sort = document.getElementById("sortSelect").value;
  if (sort === "name") {
    employees.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "role") {
    employees.sort((a, b) => a.description.localeCompare(b.description));
  } else if (sort === "status") {
    employees.sort((a, b) => a.status - b.status);
  }
  return employees;
}
