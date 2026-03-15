const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 360;

let sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' };

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(sprite.x, sprite.y);
    ctx.rotate(sprite.angle * Math.PI / 180);
    ctx.fillStyle = sprite.color;
    ctx.fillRect(-sprite.size/2, -sprite.size/2, sprite.size, sprite.size);
    ctx.restore();
}

window.moveSprite = (steps) => { sprite.x += steps; draw(); };
window.rotateSprite = (deg) => { sprite.angle += deg; draw(); };
window.changeColor = (newColor) => { sprite.color = newColor; draw(); };
window.changeSize = (n) => { sprite.size += n; draw(); };

window.resetSprite = () => {
    sprite = { x: 320, y: 180, angle: 0, size: 40, color: '#007acc' };
    draw();
};

window.createNewProject = () => {
    if(confirm("New project? Unsaved changes will be lost.")) {
        document.getElementById('project-name').value = "Untitled Project";
        resetSprite();
    }
};

function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function handleSignUp() {
    const user = document.getElementById('reg-user').value;
    if (user) {
        document.getElementById('auth-section').innerHTML = `<span style="color: #007acc; font-weight: bold;">Hi, ${user}</span>`;
        closeModal('signup-modal');
    }
}

function handleSignIn() {
    const user = document.getElementById('login-user').value;
    if (user) {
        document.getElementById('auth-section').innerHTML = `<span style="color: #007acc; font-weight: bold;">Hi, ${user}</span>`;
        closeModal('signin-modal');
    }
}

draw();