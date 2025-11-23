let scene, camera, renderer, brain, particles = [], moneyObjects = [];
let time = 0;
let chargeLevel = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Create brain (sphere with rough surface)
  const geometry = new THREE.SphereGeometry(1.2, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0x333333, emissive: 0x000000, shininess: 10 });
  brain = new THREE.Mesh(geometry, material);
  scene.add(brain);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 0, 10);
  pointLight.position.set(0, 0, 3);
  scene.add(pointLight);

  // Create energy particles
  for (let i = 0; i < 200; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.3 + Math.random() * 0.3;
    particle.position.x = Math.cos(angle) * radius;
    particle.position.y = (Math.random() - 0.5) * 2;
    particle.position.z = Math.sin(angle) * radius;
    particle.visible = false;
    particles.push(particle);
    scene.add(particle);
  }

  // Create money symbols
  for (let i = 0; i < 30; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.3, 0.3, 1);
    sprite.position.set((Math.random() - 0.5) * 4, -3 + Math.random() * 0.5, (Math.random() - 0.5) * 2);
    sprite.visible = false;
    moneyObjects.push(sprite);
    scene.add(sprite);
  }

  animate();
  startSequence();
}

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;
  brain.rotation.y += 0.005;

  particles.forEach((p, i) => {
    if (p.visible) {
      const speed = 0.02 * (1 + chargeLevel);
      p.position.y += Math.sin(time + i) * 0.01;
      p.position.x = Math.cos(time * speed + i) * (1.3 + Math.sin(time + i) * 0.2);
      p.position.z = Math.sin(time * speed + i) * (1.3 + Math.cos(time + i) * 0.2);
    }
  });

  moneyObjects.forEach((m, i) => {
    if (m.visible) {
      m.position.y += 0.02;
      m.rotation.z += 0.05;
      if (m.position.y > 3) m.position.y = -3;
    }
  });

  renderer.render(scene, camera);
}

function fadeIn(element, duration = 1000) {
  element.style.opacity = '0';
  element.style.display = 'block';
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    element.style.opacity = Math.min(progress / duration, 1);
    if (progress < duration) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function fadeOut(element, duration = 1000) {
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    element.style.opacity = 1 - Math.min(progress / duration, 1);
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      element.style.display = 'none';
    }
  }
  requestAnimationFrame(step);
}

function chargeBrain(level, color, emissive, lightIntensity) {
  brain.material.color.setHex(color);
  brain.material.emissive.setHex(emissive);
  const pointLight = scene.children.find(c => c instanceof THREE.PointLight);
  pointLight.intensity = lightIntensity;
  pointLight.color.setHex(emissive);
  chargeLevel = level;
}

function showLightning(labelId, duration = 500) {
  const label = document.getElementById(labelId);
  label.style.left = `${30 + Math.random() * 40}%`;
  label.style.top = `${20 + Math.random() * 30}%`;
  fadeIn(label, 200);
  setTimeout(() => fadeOut(label, 200), duration);
  const flash = document.createElement('div');
  flash.style.position = 'absolute';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.width = '100%';
  flash.style.height = '100%';
  flash.style.background = 'rgba(255,255,255,0.3)';
  flash.style.pointerEvents = 'none';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 100);
}

async function startSequence() {
  fadeIn(document.getElementById('text1'));
  fadeIn(document.getElementById('battery'));
  fadeIn(document.getElementById('money'));
  await sleep(4000);
  fadeOut(document.getElementById('text1'));
  await sleep(1000);

  showLightning('label1');
  chargeBrain(0.25, 0x4488aa, 0x002244, 0.5);
  updateBattery(25);
  updateMoney(2000);
  showParticles(50);
  await sleep(3000);

  showLightning('label2');
  chargeBrain(0.5, 0xaa6622, 0x442200, 1.0);
  updateBattery(50);
  updateMoney(7000);
  showParticles(100);
  showMoney(10);
  await sleep(3000);

  showLightning('label3');
  chargeBrain(0.75, 0xcc8822, 0x664400, 1.5);
  updateBattery(75);
  updateMoney(25000);
  showMoney(20);
  await sleep(2000);

  chargeBrain(1.0, 0xffaa00, 0xffdd00, 3.0);
  updateBattery(100);
  updateMoney(100000);
  showParticles(200);
  showMoney(30);
  await sleep(4000);

  fadeOut(document.getElementById('battery'));
  fadeOut(document.getElementById('money'));
  fadeIn(document.getElementById('text2'));
  await sleep(4000);

  fadeOut(document.getElementById('text2'));
  await sleep(500);
  fadeIn(document.getElementById('text3'));
  await sleep(5000);

  location.reload();
}

function updateBattery(percent) {
  document.getElementById('battery').textContent = `🔋 ${percent}%`;
}

function updateMoney(amount) {
  const formatted = amount >= 1000 ? `$${(amount/1000).toFixed(0)}K` : `$${amount}`;
  document.getElementById('money').textContent = formatted;
}

function showParticles(count) {
  for (let i = 0; i < count; i++) {
    particles[i].visible = true;
  }
}

function showMoney(count) {
  for (let i = 0; i < count; i++) {
    moneyObjects[i].visible = true;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
