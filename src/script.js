import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/**
 * Functions
 */

/**
 * Récupère une liste des 20 derniers tremblements de terre
 */
 async function fetchEarthquakes() {
    const response = await fetch('https://www.seismicportal.eu/fdsnws/event/1/query?limit=20&format=json');
    // waits until the request completes...
    return await response.json();
}

/**
 * Converti une latitude et longitude en une position x,y et z
 */
function convertLatLonToCartesian(lat, lon){
    var phi = (90-lat) * (Math.PI/180);
    var theta = (lon+180) * (Math.PI/180);

    let x = -(Math.sin(phi) * Math.cos(theta));
    let y = Math.cos(phi);
    let z = (Math.sin(phi) * Math.sin(theta));
    return {
        x, y, z
    }
}

/**
 * Crée un marqueur pour chaque tremblement de terre
 */
export async function createPins(){
    const earthquakesData = await fetchEarthquakes();

    //console.log(earthquakesData.features)

    earthquakesData.features.forEach(earthquake => {
        const pin = new THREE.Mesh(
            new THREE.SphereGeometry(0.015, 20, 20),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        )

        // Enregistre les propriétés du tremblement de terre
        pin.mag = earthquake.properties.mag;
        pin.lat = earthquake.properties.lat;
        pin.lon = earthquake.properties.lon;
        pin.depth = earthquake.properties.depth;
        pin.region = earthquake.properties.flynn_region;
        pin.time = earthquake.properties.time;

        // Donne une couleur au marqueur selon la magnitude
        switch (Math.floor(earthquake.properties.mag)) {
            case 0:
                pin.material.color.set("#6fcdb1");
                break;
            
            case 1:
                pin.material.color.set("#6fcdb1");
                break;

            case 2:
                pin.material.color.set("#67d276");
                break;

            case 3:
                pin.material.color.set("#94d158");
                break;

            case 4:
                pin.material.color.set("#c2cc49");
                break;

            case 5:
                pin.material.color.set("#cdb659");
                break;

            case 6:
                pin.material.color.set("#c79443");
                break;

            case 7:
                pin.material.color.set("#c66629");
                break;

            case 8:
                pin.material.color.set("#ce3114");
                break;

            case 9:
                pin.material.color.set("#cc0001");
                break;

            case 10:
                pin.material.color.set("#ae0001");
                break;

            default:
                break;
        }

        let pos = convertLatLonToCartesian(earthquake.properties.lat, earthquake.properties.lon);

        pin.position.set(pos.x, pos.y, pos.z)

        scene.add(pin);

        pins.push(pin);
    });
}

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.hide();

// Propriétés
const pins = [];

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

// Marqueurs
createPins();

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