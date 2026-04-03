const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
canvas.width = 480; canvas.height = 360;
let sprite = { x: 240, y: 180, angle: 0, size: 40, color: '#007acc' };

const ADMIN_USER = "Owner"; 
let communityProjects = JSON.parse(localStorage.getItem('vertex_global_projects')) || [];
let likedProjects = JSON.parse(localStorage.getItem('vertex_liked_list')) || [];
let currentAnnouncement = localStorage.getItem('vertex_announcement') || "";

function saveGlobal() { localStorage.setItem('vertex_global_projects', JSON.stringify(communityProjects)); }

function checkAnnouncement() {
    let bar = document.getElementById('announcement-bar');
    if (!bar) { bar = document.createElement('div'); bar.id="announcement-bar"; document.body.prepend(bar); }
    if (currentAnnouncement) { bar.innerText = "📢 " + currentAnnouncement; bar.style.display = "block"; } 
    else { bar.style.display = "none"; }
}

function renderHub() {
    const feat = document.getElementById('featured-list');
    const comm = document.getElementById('community-list');
    const user = localStorage.getItem('vertex_session');
    feat.innerHTML = ""; comm.innerHTML = "";
    checkAdmin(); checkAnnouncement();

    communityProjects.forEach(p => {
        const isLiked = likedProjects.includes(p.id);
        const card = `
            <div class="project-card">
                <div>
                    <b>${p.title}</b><br><small>by ${p.author}</small><br>
                    ${(user === p.author || user === ADMIN_USER) ? `<button class="delete-btn" onclick="deleteProject('${p.id}')">Delete</button>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>${p.likes}</span>
                    <button class="like-btn" onclick="addLike('${p.id}')" ${isLiked?'disabled':''}>${isLiked?'❤️':'🤍'}</button>
                </div>
            </div>`;
        if (p.likes >= 500) feat.innerHTML += card; else comm.innerHTML += card;
    });
}

function checkAdmin() {
    const user = localStorage.getItem('vertex_session');
    const panel = document.getElementById('owner-panel');
    if (user === ADMIN_USER) {
        panel.style.display = "block";
        document.getElementById('admin-stats').innerHTML = `
            <b>Admin Panel</b> | Projects: ${communityProjects.length}
            <br><input type="text" id="admin-msg" class="admin-input" placeholder="New announcement...">
            <button class="cloud-btn" onclick="postAnnounce()">Post</button>
            <button class="cloud-btn" style="background:red" onclick="clearAnnounce()">X</button>`;
    }
}

function postAnnounce() {
    currentAnnouncement = document.getElementById('admin-msg').value;
    localStorage.setItem('vertex_announcement', currentAnnouncement);
    renderHub();
}

function clearAnnounce() { currentAnnouncement = ""; localStorage.removeItem('vertex_announcement'); renderHub(); }

function addLike(id) {
    if (!localStorage.getItem('vertex_session')) return alert("Login first!");
    const p = communityProjects.find(x => x.id === id);
    if (p && !likedProjects.includes(id)) {
        p.likes++; likedProjects.push(id);
        localStorage.setItem('vertex_liked_list', JSON.stringify(likedProjects));
        saveGlobal(); renderHub();
    }
}

function shareProject() {
    const title = document.getElementById('project-name').value;
    communityProjects.unshift({id: 'p'+Date.now(), author: localStorage.getItem('vertex_session'), title, likes: 0});
    saveGlobal(); showHub();
}

function deleteProject(id) { if(confirm("Delete?")) { communityProjects = communityProjects.filter(x=>x.id!==id); saveGlobal(); renderHub(); } }

function exportProject() {
    const data = JSON.stringify({name: document.getElementById('project-name').value, sprite});
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(data);
    a.download = "project.vertex"; a.click();
}

function importProject() {
    const input = document.createElement('input'); input.type = 'file';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = re => { const d = JSON.parse(re.target.result); sprite = d.sprite; draw(); };
        reader.readAsText(e.target.files[0]);
    }; input.click();
}

function showHub() { document.getElementById('vertex-hub').style.display="block"; document.getElementById('app').style.display="none"; renderHub(); }
function startCreating() {
    document.getElementById('vertex-hub').style.display="none"; document.getElementById('app').style.display="flex";
    if (localStorage.getItem('vertex_session') && !document.getElementById('exp-btn')) {
        document.getElementById('share-btn').style.display="block";
        document.querySelector('.project-controls').innerHTML += `<button id="exp-btn" class="cloud-btn" onclick="exportProject()">Save</button><button class="cloud-btn" onclick="importProject()">Load</button>`;
    }
}

function handleSignUp() { localStorage.setItem('vertex_session', document.getElementById('reg-user').value); location.reload(); }
function handleSignIn() { localStorage.setItem('vertex_session', document.getElementById('login-user').value); location.reload(); }
function logout() { localStorage.removeItem('vertex_session'); location.reload(); }

function draw() { ctx.clearRect(0,0,480,360); ctx.fillStyle=sprite.color; ctx.fillRect(sprite.x-20,sprite.y-20,40,40); }
window.moveSprite = (n) => { sprite.x += n; draw(); };
window.rotateSprite = (n) => { sprite.angle += n; draw(); };
window.onload = () => { if(localStorage.getItem('vertex_session')) document.getElementById('auth-section').innerHTML = `<b>${localStorage.getItem('vertex_session')}</b> <button onclick="logout()">Logout</button>`; renderHub(); draw(); };
function openModal(id) { document.getElementById(id).style.display="block"; }
function closeModal(id) { document.getElementById(id).style.display="none"; }
