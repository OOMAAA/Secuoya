import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

console.log('✅ Script iniciado');

// ==========================================
// CONFIGURACIÓN INICIAL
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e27);
scene.fog = new THREE.Fog(0x0a0e27, 100, 1000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.0;  // Aumentado para mejor reflexión
document.body.appendChild(renderer.domElement);

console.log('✅ Renderer agregado al DOM');

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01;

// ==========================================
// ILUMINACIÓN
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(15, 25, 15);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x6699ff, 0.3);
fillLight.position.set(-15, 10, -15);
scene.add(fillLight);

// Cuadrícula
const gridHelper = new THREE.GridHelper(50, 50, 0x00d4ff, 0x1a3a4a);
gridHelper.position.y = -0.01;
scene.add(gridHelper);

console.log('✅ Iluminación y grid agregados');

// ==========================================
// CARGA DE HDRI (EXR)
// ==========================================
const exrLoader = new EXRLoader();
exrLoader.load('./hdri/environment.exr', function (texture) {
    try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        // scene.background = envMap;  ← Comentado para no mostrar el HDRI de fondo
        texture.dispose();
        pmremGenerator.dispose();
        console.log('✅ HDRI EXR cargado - Iluminación activa, fondo transparente');
    } catch (e) {
        console.warn('⚠️ Error procesando HDRI:', e);
    }
}, undefined, function (error) {
    console.log('⚠️ HDRI EXR no encontrado, continuando sin él');
});

// ==========================================
// DATOS Y LOADERS
// ==========================================
const textureMaterials = {
    'wall_curvo': null,
    'wall_plano': null,
    'tv_panel': null
};

const objects = {};
const initialPositions = {};
const loader = new GLTFLoader();

const elementosData = {
    cameras: [
        { id: 'cam1', nombre: '🎥 Cámara 1', color: 0xff6b6b, x: 0, z: 0, glbFile: 'cam1', hasToggle: true },
        { id: 'cam2', nombre: '🎥 Cámara 2', color: 0x4ecdc4, x: 0, z: 0, glbFile: 'cam2', hasToggle: true },
        { id: 'cam3', nombre: '🎥 Cámara 3', color: 0xffe66d, x: 0, z: 0, glbFile: 'cam3', hasToggle: true },
        { id: 'cam4', nombre: '🎥 Cámara 4', color: 0xa8dadc, x: 0, z: 0, glbFile: 'cam4', hasToggle: true }
    ],
    cranes: [
        { id: 'crane1', nombre: '🏗️ Pluma 1', color: 0xf38181, x: 0, z: 0, glbFile: 'pluma_1', hasToggle: true },
        { id: 'crane2', nombre: '🏗️ Pluma 2', color: 0x6bcf7f, x: 0, z: 0, glbFile: 'pluma_tv', hasToggle: true }
    ],
    robots: [
        { id: 'robot1', nombre: '🤖 Robot Tracking', color: 0x9d84b7, x: 0, z: 0, glbFile: 'brazo_robot', hasToggle: true }
    ],
    talent: [
        { id: 'talent1', nombre: '👥 Talento 1', color: 0xff6b9d, x: 0, z: 0, glbFile: 'talento_1', hasToggle: true },
        { id: 'talent2', nombre: '👥 Talento 2', color: 0xc44569, x: 0, z: 0, glbFile: 'talento_2', hasToggle: true },
        { id: 'talent3', nombre: '👥 Talento 3', color: 0xf8b500, x: 0, z: 0, glbFile: 'talento_3', hasToggle: true },
        { id: 'talent4', nombre: '👥 Talento 4', color: 0x00d4ff, x: 0, z: 0, glbFile: 'talento_4', hasToggle: true }
    ],
    generic: [
        { id: 'gen1', nombre: '📦 Elemento 1', color: 0x6c5ce7, x: 0, z: 0, glbFile: 'elemento_1', hasToggle: true },
        { id: 'gen2', nombre: '📦 Elemento 2', color: 0x00b894, x: 0, z: 0, glbFile: 'elemento_2', hasToggle: true }
    ],
    structure: [
        { id: 'struct_base', nombre: '🏢 Estructura Base', color: 0x4a4a6a, x: 0, z: 0, glbFile: 'estructura_base', hasToggle: true },
        { id: 'wall_curvo', nombre: '🌊 Wall Curvo', color: 0x5a6a7a, x: 0, z: 0, glbFile: 'wall_curvo', hasToggle: false },
        { id: 'wall_plano', nombre: '▭ Wall Plano', color: 0x6a7a8a, x: 0, z: 0, glbFile: 'wall_plano', hasToggle: false },
        { id: 'tv_panel', nombre: '📺 TV Panel', color: 0x2a4a6a, x: 0, z: 0, glbFile: 'tv_panel', hasToggle: false }
    ]
};

// ==========================================
// FUNCIÓN CARGAR ELEMENTO
// ==========================================
function loadElement(data) {
    // Crear placeholder SIN grupo
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.4,
        metalness: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.x, 0, data.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    objects[data.id] = mesh;
    // initialPositions se guardará cuando cargue el GLB

    // Intentar cargar GLB
    loader.load(
        `./models/${data.glbFile}.glb`,
        (gltf) => {
            scene.remove(mesh);
            
            // Extraer los children reales (no usar gltf.scene que es un Group)
            let modelToAdd;
            if (gltf.scene.children.length === 1) {
                modelToAdd = gltf.scene.children[0];
            } else {
                modelToAdd = gltf.scene;
            }
            
            // Guardar la posición original del GLB
            const originalPos = modelToAdd.position.clone();
            
            // Setear nueva posición + original (para preservar offset del GLB)
            modelToAdd.position.set(
                data.x + originalPos.x,
                originalPos.y,
                data.z + originalPos.z
            );
            
            modelToAdd.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    
                    if (['wall_curvo', 'wall_plano', 'tv_panel'].includes(data.id)) {
                        textureMaterials[data.id] = node.material;
                    }
                }
            });
            
            scene.add(modelToAdd);
            objects[data.id] = modelToAdd;
            
            // GUARDAR POSICIÓN INICIAL AQUÍ (después de actualizar posición)
            initialPositions[data.id] = {
                x: modelToAdd.position.x,
                z: modelToAdd.position.z,
                ry: 0
            };
            
            console.log(`✅ Cargado: ${data.nombre}`);
        },
        undefined,
        (error) => {
            console.log(`⚠️ Placeholder para: ${data.nombre}`);
            if (['wall_curvo', 'wall_plano', 'tv_panel'].includes(data.id)) {
                textureMaterials[data.id] = material;
            }
        }
    );
}

// Cargar todos los elementos
console.log('⏳ Cargando elementos...');
elementosData.cameras.forEach(cam => loadElement(cam));
elementosData.cranes.forEach(crane => loadElement(crane));
elementosData.robots.forEach(robot => loadElement(robot));
elementosData.talent.forEach(tal => loadElement(tal));
elementosData.generic.forEach(gen => loadElement(gen));
elementosData.structure.forEach(str => loadElement(str));

console.log('✅ Elementos cargados');

// (Etiquetas se crearán después)
function createControlItem(data, containerId) {
    const container = document.getElementById(containerId);
    const item = document.createElement('div');
    item.className = `control-item ${!data.hasToggle ? 'no-toggle' : ''}`;
    
    let htmlContent = `
        <div class="item-header" style="cursor: pointer; user-select: none;">
            <div class="item-name" style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <span class="collapse-icon">▼</span>
                <span>${data.nombre}</span>
            </div>
            <div class="item-controls">
                <button class="reset-item-btn" data-id="${data.id}">↺</button>
                ${data.hasToggle ? `<button class="toggle-btn" data-id="${data.id}"></button>` : ''}
            </div>
        </div>
        <div class="item-content" style="display: block;">
            <div class="slider-group">
                <div class="slider-label">
                    <span>Posición X</span>
                    <span class="slider-value" data-value="x">${data.x.toFixed(1)}</span>
                </div>
                <input type="range" class="slider-x" data-id="${data.id}" min="-20" max="20" step="0.1" value="${data.x}">
            </div>
            <div class="slider-group">
                <div class="slider-label">
                    <span>Posición Z</span>
                    <span class="slider-value" data-value="z">${data.z.toFixed(1)}</span>
                </div>
                <input type="range" class="slider-z" data-id="${data.id}" min="-20" max="20" step="0.1" value="${data.z}">
            </div>
            <div class="slider-group">
                <div class="slider-label">
                    <span>Rotación Y</span>
                    <span class="slider-value" data-value="ry">0.0</span>
                </div>
                <input type="range" class="slider-ry" data-id="${data.id}" min="${-Math.PI}" max="${Math.PI}" step="0.01" value="0">
            </div>
        </div>
    `;

    item.innerHTML = htmlContent;
    container.appendChild(item);

    // Toggle collapse/expand
    const header = item.querySelector('.item-header');
    const content = item.querySelector('.item-content');
    const icon = item.querySelector('.collapse-icon');
    let isExpanded = false;

    header.addEventListener('click', (e) => {
        // No toggle si hace click en los botones
        if (e.target.closest('.item-controls')) return;
        
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? 'block' : 'none';
        icon.textContent = isExpanded ? '▼' : '▶';
    });

    // Inicializar colapsado
    content.style.display = 'none';
    icon.textContent = '▶';

    // Reset individual
    const resetBtn = item.querySelector('.reset-item-btn');
    resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pos = initialPositions[data.id];
        objects[data.id].position.x = pos.x;
        objects[data.id].position.z = pos.z;
        objects[data.id].rotation.y = pos.ry;

        const sliderX = item.querySelector('.slider-x');
        const sliderZ = item.querySelector('.slider-z');
        const sliderRY = item.querySelector('.slider-ry');

        sliderX.value = pos.x;
        sliderZ.value = pos.z;
        sliderRY.value = pos.ry;

        sliderX.dispatchEvent(new Event('input'));
        sliderZ.dispatchEvent(new Event('input'));
        sliderRY.dispatchEvent(new Event('input'));

        resetBtn.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
            resetBtn.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    });

    // Toggle
    if (data.hasToggle) {
        const toggleBtn = item.querySelector('.toggle-btn');
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            objects[data.id].visible = !objects[data.id].visible;
            toggleBtn.classList.toggle('off');
        });
    }

    // Sliders
    const sliderX = item.querySelector('.slider-x');
    const sliderZ = item.querySelector('.slider-z');
    const sliderRY = item.querySelector('.slider-ry');

    const updateSliderBackground = (slider) => {
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.setProperty('--value', value + '%');
    };

    sliderX.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        objects[data.id].position.x = value;
        item.querySelector('[data-value="x"]').textContent = value.toFixed(1);
        updateSliderBackground(sliderX);
    });

    sliderZ.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        objects[data.id].position.z = value;
        item.querySelector('[data-value="z"]').textContent = value.toFixed(1);
        updateSliderBackground(sliderZ);
    });

    sliderRY.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        objects[data.id].rotation.y = value;
        item.querySelector('[data-value="ry"]').textContent = value.toFixed(2);
        updateSliderBackground(sliderRY);
    });

    updateSliderBackground(sliderX);
    updateSliderBackground(sliderZ);
    updateSliderBackground(sliderRY);
}

// Generar controles
elementosData.cameras.forEach(cam => createControlItem(cam, 'cameras-container'));
elementosData.cranes.forEach(crane => createControlItem(crane, 'cranes-container'));
elementosData.robots.forEach(robot => createControlItem(robot, 'robots-container'));
elementosData.talent.forEach(tal => createControlItem(tal, 'talent-container'));
elementosData.generic.forEach(gen => createControlItem(gen, 'generic-container'));
elementosData.structure.forEach(str => createControlItem(str, 'structure-container'));

console.log('✅ Controles de UI creados');

// ==========================================
// HACER COLAPSABLES LOS TÍTULOS DE CATEGORÍA
// ==========================================
document.querySelectorAll('.category-title').forEach(title => {
    const icon = title.querySelector('.category-icon');
    const content = title.nextElementSibling;
    let isExpanded = false;
    
    // Inicializar COLAPSADO
    icon.textContent = '▶';
    content.style.display = 'none';

    title.addEventListener('click', () => {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            content.style.display = 'block';
            icon.textContent = '▼';
        } else {
            content.style.display = 'none';
            icon.textContent = '▶';
        }
    });
});

// ==========================================
// CONTROLES DE TEXTURA
// ==========================================
function createTextureControl(elementId, elementName) {
    const container = document.getElementById('texture-controls');
    const control = document.createElement('div');
    control.className = 'texture-control';
    control.innerHTML = `
        <label class="texture-label">${elementName}</label>
        <div class="texture-input-wrapper">
            <input type="file" id="texture-input-${elementId}" class="texture-input" accept="image/*">
            <button class="texture-browse-btn" onclick="document.getElementById('texture-input-${elementId}').click()">📁 Examinar</button>
        </div>
        <div class="texture-status" id="texture-status-${elementId}">Sin textura</div>
    `;
    container.appendChild(control);

    const fileInput = document.getElementById(`texture-input-${elementId}`);
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(event.target.result, (texture) => {
                // Ajustes de orientación
                texture.flipY = false;
                
                // Aplicar textura al material
                if (textureMaterials[elementId]) {
                    textureMaterials[elementId].map = texture;
                    textureMaterials[elementId].needsUpdate = true;
                    
                    const statusEl = document.getElementById(`texture-status-${elementId}`);
                    statusEl.textContent = `✅ ${file.name}`;
                    statusEl.classList.add('loaded');
                    
                    console.log(`✅ Textura: ${file.name}`);
                }
            });
        };
        reader.readAsDataURL(file);
    });
}

createTextureControl('wall_curvo', '🌊 Wall Curvo');
createTextureControl('wall_plano', '▭ Wall Plano');
createTextureControl('tv_panel', '📺 TV Panel');

console.log('✅ Controles de textura creados');

// ==========================================
// BOTÓN RESET GLOBAL
// ==========================================
document.querySelector('.reset-button').addEventListener('click', () => {
    Object.keys(objects).forEach(id => {
        const pos = initialPositions[id];
        objects[id].position.x = pos.x;
        objects[id].position.z = pos.z;
        objects[id].rotation.y = pos.ry;

        const sliderX = document.querySelector(`input[data-id="${id}"].slider-x`);
        const sliderZ = document.querySelector(`input[data-id="${id}"].slider-z`);
        const sliderRY = document.querySelector(`input[data-id="${id}"].slider-ry`);

        if (sliderX) {
            sliderX.value = pos.x;
            sliderX.dispatchEvent(new Event('input'));
        }
        if (sliderZ) {
            sliderZ.value = pos.z;
            sliderZ.dispatchEvent(new Event('input'));
        }
        if (sliderRY) {
            sliderRY.value = pos.ry;
            sliderRY.dispatchEvent(new Event('input'));
        }
    });
});

// ==========================================
// BOTÓN SCREENSHOT
// ==========================================
document.getElementById('screenshot-btn').addEventListener('click', () => {
    renderer.render(scene, camera);
    const canvas = renderer.domElement;
    const link = document.createElement('a');
    
    const now = new Date();
    const dateString = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `studio-${dateString}.png`;
    
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
    
    console.log(`📸 Screenshot: ${filename}`);
});

// ==========================================
// BOTÓN TOGGLE PANEL CONTROLES
// ==========================================
let panelVisible = true;
const togglePanelBtn = document.getElementById('toggle-panel-btn');
const controlPanel = document.getElementById('control-panel');

if (togglePanelBtn) {
    togglePanelBtn.addEventListener('click', () => {
        panelVisible = !panelVisible;
        controlPanel.classList.toggle('panel-hidden');
        togglePanelBtn.textContent = panelVisible ? '☰' : '✕';
        console.log(`Panel ${panelVisible ? 'visible' : 'oculto'}`);
    });
}

// ==========================================
// LOOP DE RENDER
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('✅ ¡Estudio Virtual iniciado!');
animate();