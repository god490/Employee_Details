// inside render() function where header tools are created
function renderToolbar(view) {
    const toolbar = document.getElementById("toolbar");
    toolbar.innerHTML = "";

    // show toolbar only if NOT home
    if (view !== "home") {
        toolbar.innerHTML = `
            <div class="flex flex-wrap items-center gap-2">
                <input type="text" id="searchInput" 
                    placeholder="Search..." 
                    class="border p-2 rounded w-48" />
                
                <select id="sortSelect" class="border p-2 rounded">
                    <option value="">Sort By</option>
                    <option value="name">Name</option>
                    <option value="role">Role</option>
                    <option value="status">Status</option>
                </select>
                
                <select id="statusFilter" class="border p-2 rounded">
                    <option value="">All Status</option>
                    <option value="0">Yet To Start</option>
                    <option value="1">Incomplete</option>
                    <option value="2">Complete</option>
                    <option value="-1">On Hold</option>
                </select>
                
                <button id="clearBtn" class="bg-gray-200 px-3 py-2 rounded">Clear</button>
            </div>
        `;
    }
}
