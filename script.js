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

// --- HUB RENDERING & LOGIC ---
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
        // Count how many projects this player has published
        const count = communityProjects.filter(p => p.author === query).length;
        
        document.getElementById('profile-name').innerText = query;
        document.getElementById('profile-date').innerHTML = `
            Joined: ${data.joinDate}<br>
            <span style="color: #ffab19;">Total Projects: ${count}</span>
        `;
        openModal('profile-modal');
    } else { alert("Player not found!"); }
}

// --- SYSTEM NAVIGATION ---
function showHub() { 
    document.getElementById('vertex-hub').style.display = "block"; 
    document.getElementById('app').style.display = "none"; 
    renderHub();
}

function startCreating() {
    document.getElementById('vertex-hub').style.display = "none";
    document.getElementById('app').style.display = "flex";
    if (localStorage.getItem('vertex_session')) {
        document.getElementById('share-btn').style.display = "block";
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

function handleSignUp() {
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    if (!user || !pass) return alert("Fill out all fields!");
    if (localStorage.getItem('user_data_' + user)) return alert("User already exists!");

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
    } else { alert("Invalid credentials!"); }
}

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
