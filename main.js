// --- UI Interactions ---

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// --- Three.js Background Animation ---

// Set up Scene, Camera, Renderer
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();

// We don't want a solid background color; we let the CSS body color show through,
// or we can set it to the specific dark industrial blue.
// css: --bg-color: #050b14;
scene.background = new THREE.Color(0x050b14);

// Add some subtle fog for depth
scene.fog = new THREE.FogExp2(0x050b14, 0.02);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Procedural 3D Nut Asset ---

// Create a Hexagonal Shape
const shape = new THREE.Shape();
const outerRadius = 5;
for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    if (i === 0) shape.moveTo(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
    else shape.lineTo(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
}
shape.lineTo(outerRadius * Math.cos(0), outerRadius * Math.sin(0));

// Create Inner Circle Hole
const holePath = new THREE.Path();
holePath.absarc(0, 0, 2.8, 0, Math.PI * 2, false);
shape.holes.push(holePath);

const extrudeSettings = {
    depth: 3,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.3,
    bevelThickness: 0.3
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
geometry.computeBoundingBox();
// Center the geometry
geometry.translate(0, 0, -1.5); 

// Premium Metallic Material
const material = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Silver/Slate
    roughness: 0.2,  // Slightly polished
    metalness: 0.8,  // Highly metallic
});

// Create multiple floating nuts for a cooler background effect
// Map deterministic non-colliding positions for 3D elements
const nutConfigs = window.innerWidth > 768 ? [
    { x: 12, y: 2, z: -5, scale: 1.5, speed: 0.08 }, // Hero (Right center)
    { x: -18, y: 15, z: -15, scale: 0.8, speed: 0.04 }, // Top Left
    { x: 18, y: -12, z: -10, scale: 0.9, speed: 0.05 }, // Bottom Right
    { x: -14, y: -16, z: -8, scale: 1.1, speed: 0.06 }, // Bottom Left
    { x: 22, y: 18, z: -20, scale: 1.2, speed: 0.03 }   // Far Top Right
] : [
    { x: 0, y: 2, z: -5, scale: 1.2, speed: 0.08 }, // Hero (Center)
    { x: -10, y: -15, z: -12, scale: 0.8, speed: 0.05 }, // Bottom Left
    { x: 10, y: 15, z: -15, scale: 0.9, speed: 0.04 }    // Top Right
];

const nuts = [];

for(let i=0; i<nutConfigs.length; i++) {
    const config = nutConfigs[i];
    const mesh = new THREE.Mesh(geometry, material);
    
    // Set position safely apart
    mesh.position.set(config.x, config.y, config.z);
    
    // Set random initial rotations
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    // Scale variation
    mesh.scale.set(config.scale, config.scale, config.scale);
    
    // Store original data for animation math
    mesh.userData = {
        baseX: config.x,
        baseY: config.y,
        baseZ: config.z,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        scrollSpeedFactor: config.speed
    };
    
    scene.add(mesh);
    nuts.push(mesh);
}

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Primary Light (Warm Amber/Gold to match accent)
const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 1.5);
dirLight1.position.set(10, 20, 20);
scene.add(dirLight1);

// Secondary Light (Cool Blue)
const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 1);
dirLight2.position.set(-20, -10, 10);
scene.add(dirLight2);

// --- Animation Loop & Scroll Interaction ---
let currentScrollY = 0;
let targetScrollY = 0;

window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
});

// Update light positions slightly based on mouse move for subtle interaction
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (event) => {
    targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Lerp scroll position for smooth parallax
    currentScrollY += (targetScrollY - currentScrollY) * 0.05;
    
    // Lerp mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    
    // Update Camera slightly based on mouse
    camera.position.x = mouseX * 2;
    camera.position.y = mouseY * 2;
    camera.lookAt(scene.position);

    // Update Nuts
    nuts.forEach((nut, index) => {
        // Continuous idle rotation
        nut.rotation.x += nut.userData.rotSpeedX;
        nut.rotation.y += nut.userData.rotSpeedY;
        
        // Scroll-based rotation overlay
        nut.rotation.z = currentScrollY * 0.005 * (index % 2 === 0 ? 1 : -1);
        
        // Scroll-based vertical translation
        // Move them up as we scroll down
        nut.position.y = nut.userData.baseY + Math.sin(time + index) * 2 + (currentScrollY * nut.userData.scrollSpeedFactor);
        
        // Slight horizontal drift
        nut.position.x = nut.userData.baseX + Math.cos(time * 0.5 + index) * 1;
    });

    renderer.render(scene, camera);
}

animate();

// --- Responsive Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust hero nut position based on screen size
    if(nuts.length > 0) {
        nuts[0].userData.baseX = window.innerWidth > 768 ? 12 : 0;
    }
});
