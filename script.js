const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
canvas.width = 640; canvas.height = 360;
let sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' };

// --- CONFIG ---
const ADMIN_USER = "Vertex"; 

// --- DATA STORAGE ---
let communityProjects = JSON.parse(localStorage.getItem('vertex_global_projects')) || [];
let likedProjects = JSON.parse(localStorage.getItem('vertex_liked_list')) || [];
let currentAnnouncement = localStorage.getItem('vertex_announcement') || "";

function saveGlobal() { 
    localStorage.setItem('vertex_global_projects', JSON.stringify(communityProjects)); 
}

// --- ANNOUNCEMENT SYSTEM ---
function checkAnnouncement() {
    const bar = document.getElementById('announcement-bar');
    if (!bar) {
        const newBar = document.createElement('div');
        newBar.id = "announcement-bar";
        document.body.prepend(newBar);
    }
    const barEl = document.getElementById('announcement-bar');
    if (currentAnnouncement) {
        barEl.innerText = "📢 " + currentAnnouncement;
        barEl.style.display = "block";
    } else {
        barEl.style.display = "none";
    }
}

function postAnnouncement() {
    const msg = document.getElementById('admin-msg').value;
    currentAnnouncement = msg;
    localStorage.setItem('vertex_announcement', msg);
    checkAnnouncement();
    alert("Announcement Posted!");
}

// --- OWNER PANEL ---
function checkAdmin() {
    const user = localStorage.getItem('vertex_session');
    const panel = document.getElementById('owner-panel');
    if (user === ADMIN_USER) {
        panel.style.display = "block";
        const totalUsers = Object.keys(localStorage).filter(k => k.startsWith('user_data_')).length;
        document.getElementById('admin-stats').innerHTML = `
            <span class="owner-badge">OWNER PANEL</span>
            <p>Users: <b>${totalUsers}</b> | Projects: <b>${communityProjects.length}</b></p>
            <input type="text" id="admin-msg" class="admin-input" placeholder="Type announcement here...">
            <button class="cloud-btn" onclick="postAnnouncement()">Broadcast</button>
            <button class="cloud-btn" style="background:#d44c4c" onclick="clearAnnouncement()">Clear</button>
        `;
    } else { panel.style.display = "none"; }
}

function clearAnnouncement() {
    currentAnnouncement = "";
    localStorage.removeItem('vertex_announcement');
    checkAnnouncement();
}

// --- HUB & LIKES ---
function renderHub() {
    const featuredList = document.getElementById('featured-list');
    const communityList = document.getElementById('community-list');
    const currentUser = localStorage.getItem('vertex_session');

    featuredList.innerHTML = ""; communityList.innerHTML = "";
    checkAdmin();
    checkAnnouncement();

    communityProjects.forEach(p => {
        const isLiked = likedProjects.includes(p.id);
        const isOwner = (currentUser && p.author === currentUser);
        const isAdmin = (currentUser === ADMIN_USER);

        const cardHTML = `
            <div class="project-card">
                <div>
                    <strong>${p.title}</strong><br><small>by ${p.author}</small>
                    <div style="margin-top:5px;">
                        ${isOwner || isAdmin ? `<button class="delete-btn" onclick="deleteProject('${p.id}')">Delete</button>` : ''}
                        ${isAdmin && p.likes < 500 ? `<button class="delete-btn" style="color:#ffab19" onclick="forceFeature('${p.id}')">Feature</button>` : ''}
                    </div>
                </div>
                <div class="like-section">
                    <span>${p.likes}</span>
                    <button class="like-btn" onclick="addLike('${p.id}')" ${isLiked ? 'disabled' : ''}>${isLiked ? '❤️' : '🤍'}</button>
                </div>
            </div>
        `;
        if (p.likes >= 500) featuredList.innerHTML += cardHTML;
        else communityList.innerHTML += cardHTML;
    });
}

function forceFeature(id) {
    const p = communityProjects.find(proj => proj.id === id);
    if(p) { p.likes = 500; saveGlobal(); renderHub(); }
}

function addLike(projectId) {
    const user = localStorage.getItem('vertex_session');
    if (!user) return alert("Log in to like!");
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

// --- FILE SYSTEM (LAPTOP TO MOBILE) ---
function exportProject() {
    const name = document.getElementById('project-name').value;
    const data = JSON.stringify({ name, sprite });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name + ".vertex"; a.click();
}

function importProject() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.vertex';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = re => {
            const content = JSON.parse(re.target.result);
            sprite = content.sprite;
            document.getElementById('project-name').value = content.name;
            draw();
        }; reader.readAsText(file);
    }; input.click();
}

// --- CORE ---
function shareProject() {
    const user = localStorage.getItem('vertex_session');
    const title = document.getElementById('project-name').value;
    if(!user) return alert("Sign in!");
    communityProjects.unshift({ id: "p"+Date.now(), author: user, title, likes: 0 });
    saveGlobal();
    showHub();
}

function deleteProject(id) {
    if (confirm("Delete?")) { communityProjects = communityProjects.filter(p => p.id !== id); saveGlobal(); renderHub(); }
}

function searchPlayer() {
    const q = document.getElementById('search-input').value;
    const raw = localStorage.getItem('user_data_' + q);
    if (raw) {
        const d = JSON.parse(raw);
        const count = communityProjects.filter(p => p.author === q).length;
        document.getElementById('profile-name').innerText = q;
        document.getElementById('profile-date').innerHTML = `Joined: ${d.joinDate}<br>Projects: ${count}`;
        openModal('profile-modal');
    } else { alert("Not found"); }
}

function showHub() { document.getElementById('vertex-hub').style.display = "block"; document.getElementById('app').style.display = "none"; renderHub(); }
function startCreating() {
    document.getElementById('vertex-hub').style.display = "none";
    document.getElementById('app').style.display = "flex";
    const controls = document.querySelector('.project-controls');
    if (localStorage.getItem('vertex_session') && !document.getElementById('export-btn')) {
        document.getElementById('share-btn').style.display = "block";
        controls.innerHTML += `<button id="export-btn" class="cloud-btn" onclick="exportProject()">Save</button><button id="import-btn" class="cloud-btn" onclick="importProject()">Load</button>`;
    }
}

window.onload = () => {
    const session = localStorage.getItem('vertex_session');
    if (session) { document.getElementById('auth-section').innerHTML = `<b>${session}</b> <span onclick="logout()" style="color:red;cursor:pointer;margin-left:10px">Logout</span>`; }
    renderHub();
    draw();
};

function handleSignUp() {
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    localStorage.setItem('user_data_'+u, JSON.stringify({password:p, joinDate: new Date().toLocaleDateString()}));
    localStorage.setItem('vertex_session', u);
    location.reload();
}

function handleSignIn() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const d = JSON.parse(localStorage.getItem('user_data_'+u));
    if(d && d.password === p) { localStorage.setItem('vertex_session', u); location.reload(); }
}

function logout() { localStorage.removeItem('vertex_session'); location.reload(); }
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
function draw() { ctx.clearRect(0,0,640,360); ctx.fillStyle=sprite.color; ctx.fillRect(sprite.x-20,sprite.y-20,40,40); }
window.moveSprite = (n) => { sprite.x += n; draw(); };
window.rotateSprite = (n) => { sprite.angle += n; draw(); };
window.resetSprite = () => { sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' }; draw(); };
