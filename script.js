const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
canvas.width = 640; canvas.height = 360;
let sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' };

// --- CONFIG ---
const ADMIN_USER = "Vertex"; // Change this to your preferred admin name

// --- DATA STORAGE ---
let communityProjects = JSON.parse(localStorage.getItem('vertex_global_projects')) || [];
let likedProjects = JSON.parse(localStorage.getItem('vertex_liked_list')) || [];

function saveGlobal() { 
    localStorage.setItem('vertex_global_projects', JSON.stringify(communityProjects)); 
}

// --- OWNER PANEL LOGIC ---
function checkAdmin() {
    const user = localStorage.getItem('vertex_session');
    const panel = document.getElementById('owner-panel');
    if (user === ADMIN_USER) {
        panel.style.display = "block";
        updateAdminStats();
    } else {
        panel.style.display = "none";
    }
}

function updateAdminStats() {
    const totalUsers = Object.keys(localStorage).filter(k => k.startsWith('user_data_')).length;
    document.getElementById('admin-stats').innerHTML = `
        <span class="owner-badge">OWNER TOOLS</span>
        <p>Total Registered Users: <strong>${totalUsers}</strong> | 
        Total Projects: <strong>${communityProjects.length}</strong></p>
    `;
}

function forceFeature(projectId) {
    const project = communityProjects.find(p => p.id === projectId);
    if (project) {
        project.likes = 500; // Instantly features it
        saveGlobal();
        renderHub();
    }
}

// --- HUB RENDERING ---
function renderHub() {
    const featuredList = document.getElementById('featured-list');
    const communityList = document.getElementById('community-list');
    const currentUser = localStorage.getItem('vertex_session');

    featuredList.innerHTML = ""; communityList.innerHTML = "";
    checkAdmin();

    communityProjects.forEach(p => {
        const isLiked = likedProjects.includes(p.id);
        const isOwner = (currentUser && p.author === currentUser);
        const isAdmin = (currentUser === ADMIN_USER);

        const cardHTML = `
            <div class="project-card">
                <div>
                    <strong>${p.title}</strong><br>
                    <small style="color: #aaa;">by ${p.author}</small>
                    <div style="margin-top:5px;">
                        ${isOwner || isAdmin ? `<button class="delete-btn" onclick="deleteProject('${p.id}')">Delete</button>` : ''}
                        ${isAdmin && p.likes < 500 ? `<button class="admin-tool-btn" onclick="forceFeature('${p.id}')">Force Feature</button>` : ''}
                    </div>
                </div>
                <div class="like-section">
                    <span style="font-weight: bold;">${p.likes}</span>
                    <button class="like-btn" onclick="addLike('${p.id}')" ${isLiked ? 'disabled' : ''}>
                        ${isLiked ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        `;
        if (p.likes >= 500) featuredList.innerHTML += cardHTML;
        else communityList.innerHTML += cardHTML;
    });
}

// --- PROJECT ACTIONS ---
function addLike(projectId) {
    const user = localStorage.getItem('vertex_session');
    if (!user) return alert("Log in to like projects!");
    if (likedProjects.includes(projectId)) return;

    const project = communityProjects.find(p => p.id === projectId);
    if (project) {
        project.likes += 1;
        likedProjects.push(projectId);
        saveGlobal();
        localStorage.setItem('vertex_liked_list', JSON.stringify(likedProjects));
        renderHub();
    }
}

function shareProject() {
    const user = localStorage.getItem('vertex_session');
    const title = document.getElementById('project-name').value;
    if(!user) return alert("Sign in to share!");
    
    const newProject = { id: "proj_" + Date.now(), author: user, title: title || "Untitled", likes: 0 };
    communityProjects.unshift(newProject);
    saveGlobal();
    showHub();
}

function deleteProject(projectId) {
    if (confirm("Delete this project?")) {
        communityProjects = communityProjects.filter(p => p.id !== projectId);
        saveGlobal();
        renderHub();
    }
}

// --- DATA TRANSFER ---
function exportProject() {
    const projectName = document.getElementById('project-name').value;
    const projectData = { name: projectName, sprite: sprite };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
    const a = document.createElement('a');
    a.href = dataStr; a.download = projectName + ".vertex"; a.click();
}

function importProject() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.vertex';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = re => {
            const content = JSON.parse(re.target.result);
            sprite = content.sprite;
            document.getElementById('project-name').value = content.name;
            draw();
            alert("Loaded!");
        }
    }; input.click();
}

// --- SEARCH & AUTH ---
function searchPlayer() {
    const query = document.getElementById('search-input').value;
    const rawData = localStorage.getItem('user_data_' + query);
    if (rawData) {
        const data = JSON.parse(rawData);
        const count = communityProjects.filter(p => p.author === query).length;
        document.getElementById('profile-name').innerText = query;
        document.getElementById('profile-date').innerHTML = `Joined: ${data.joinDate}<br><span style="color: #ffab19;">Total Projects: ${count}</span>`;
        openModal('profile-modal');
    } else { alert("Player not found!"); }
}

function handleSignUp() {
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    if (!user || !pass) return alert("Fill fields");
    const userData = { password: pass, joinDate: new Date().toLocaleDateString() };
    localStorage.setItem('user_data_' + user, JSON.stringify(userData));
    localStorage.setItem('vertex_session', user);
    location.reload();
}

function handleSignIn() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const data = JSON.parse(localStorage.getItem('user_data_' + user));
    if (data && data.password === pass) {
        localStorage.setItem('vertex_session', user);
        location.reload();
    } else { alert("Error"); }
}

// --- UI NAV ---
function showHub() { 
    document.getElementById('vertex-hub').style.display = "block"; 
    document.getElementById('app').style.display = "none"; 
    renderHub();
}

function startCreating() {
    document.getElementById('vertex-hub').style.display = "none";
    document.getElementById('app').style.display = "flex";
    const controls = document.querySelector('.project-controls');
    if (localStorage.getItem('vertex_session') && !document.getElementById('export-btn')) {
        document.getElementById('share-btn').style.display = "block";
        controls.innerHTML += `<button id="export-btn" class="cloud-btn" onclick="exportProject()">Save</button><button id="import-btn" class="cloud-btn" onclick="importProject()">Load</button>`;
    }
    draw();
}

window.onload = () => {
    const session = localStorage.getItem('vertex_session');
    if (session) {
        document.getElementById('auth-section').innerHTML = `<span style="font-weight: bold; color: #007acc;">${session}</span> <span onclick="logout()" style="color:#ff4d4d; cursor:pointer; margin-left:10px; font-size: 12px;">Logout</span>`;
    }
    renderHub();
    draw();
};

function logout() { localStorage.removeItem('vertex_session'); location.reload(); }
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
function draw() { ctx.clearRect(0,0,640,360); ctx.fillStyle=sprite.color; ctx.fillRect(sprite.x-20,sprite.y-20,40,40); }
window.moveSprite = (n) => { sprite.x += n; draw(); };
window.resetSprite = () => { sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' }; draw(); };
