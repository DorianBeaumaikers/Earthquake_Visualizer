import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.hide();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
 const textureLoader = new THREE.TextureLoader();
 const earthTexture = textureLoader.load('/textures/earth/earth_texture.jpg');
 const earthHeightTexture = textureLoader.load('/textures/earth/earth_height.jpg');
 const earthSpecularTexture = textureLoader.load('/textures/earth/earth_specular.jpg');
 const cloudsTexture = textureLoader.load('/textures/earth/clouds.png');

/**
 * Earth
 */
 // Planet
 const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({
        map: earthTexture,
        displacementMap: earthHeightTexture,
        displacementScale: 0.01,
        specularMap: earthSpecularTexture,
        specular: new THREE.Color('grey'),
        shininess: 15
    })
);
scene.add(earth);

// Clouds
const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.010, 32, 32),
    new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        transparent: true
    })
);
scene.add(clouds);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Directional Light
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5,3,5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.001, 1000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 1.2;
controls.maxDistance = 3;
controls.zoomSpeed = 0.2;
controls.rotateSpeed = 0.3;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    clouds.rotation.y = elapsedTime * 0.005;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();