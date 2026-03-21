const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
canvas.width = 640; canvas.height = 360;
let sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' };

// --- DATA STORAGE ---
let communityProjects = JSON.parse(localStorage.getItem('vertex_global_projects')) || [];
let likedProjects = JSON.parse(localStorage.getItem('vertex_liked_list')) || [];

function saveGlobal() { 
    localStorage.setItem('vertex_global_projects', JSON.stringify(communityProjects)); 
}

// --- NEW: CROSS-DEVICE DATA SAVING (FILE SYSTEM) ---

function exportProject() {
    const projectName = document.getElementById('project-name').value;
    const projectData = {
        name: projectName,
        sprite: sprite,
        version: "1.0"
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", projectName + ".vertex");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vertex';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            const content = JSON.parse(readerEvent.target.result);
            sprite = content.sprite;
            document.getElementById('project-name').value = content.name;
            draw();
            alert("Project Loaded Successfully!");
        }
    }
    input.click();
}

// --- HUB RENDERING ---
function renderHub() {
    const featuredList = document.getElementById('featured-list');
    const communityList = document.getElementById('community-list');
    const currentUser = localStorage.getItem('vertex_session');

    featuredList.innerHTML = ""; communityList.innerHTML = "";

    communityProjects.forEach(p => {
        const isLiked = likedProjects.includes(p.id);
        const isOwner = (currentUser && p.author === currentUser);

        const cardHTML = `
            <div class="project-card">
                <div>
                    <strong>${p.title}</strong><br>
                    <small style="color: #aaa;">by ${p.author}</small>
                    ${isOwner ? `<br><button class="delete-btn" onclick="deleteProject('${p.id}')">Delete Project</button>` : ''}
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
    
    const newProject = { 
        id: "proj_" + Date.now(), 
        author: user, 
        title: title || "Untitled", 
        likes: 0 
    };
    communityProjects.unshift(newProject);
    saveGlobal();
    alert("Project shared to the hub!");
    showHub();
}

function deleteProject(projectId) {
    if (confirm("Delete this project forever?")) {
        communityProjects = communityProjects.filter(p => p.id !== projectId);
        saveGlobal();
        renderHub();
    }
}

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

// --- NAVIGATION & AUTH ---
function showHub() { 
    document.getElementById('vertex-hub').style.display = "block"; 
    document.getElementById('app').style.display = "none"; 
    renderHub();
}

function startCreating() {
    document.getElementById('vertex-hub').style.display = "none";
    document.getElementById('app').style.display = "flex";
    
    // Add Save/Load buttons to the UI if logged in
    const controls = document.querySelector('.project-controls');
    if (localStorage.getItem('vertex_session') && !document.getElementById('export-btn')) {
        document.getElementById('share-btn').style.display = "block";
        controls.innerHTML += `
            <button id="export-btn" class="cloud-btn" onclick="exportProject()">Save File</button>
            <button id="import-btn" class="cloud-btn" onclick="importProject()">Load File</button>
        `;
    }
    draw();
}

window.onload = () => {
    const session = localStorage.getItem('vertex_session');
    if (session) {
        document.getElementById('auth-section').innerHTML = `
            <span style="font-weight: bold; color: #007acc;">${session}</span> 
            <span onclick="logout()" style="color:#ff4d4d; cursor:pointer; margin-left:10px; font-size: 12px;">Logout</span>
        `;
    }
    renderHub();
    draw();
};

function logout() { localStorage.removeItem('vertex_session'); location.reload(); }
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// --- SPRITE ACTIONS ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(sprite.x, sprite.y);
    ctx.rotate(sprite.angle * Math.PI / 180);
    ctx.fillStyle = sprite.color;
    ctx.fillRect(-sprite.size/2, -sprite.size/2, sprite.size, sprite.size);
    ctx.restore();
}
window.moveSprite = (n) => { sprite.x += n; draw(); };
window.rotateSprite = (n) => { sprite.angle += n; draw(); };
window.resetSprite = () => { sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' }; draw(); };
