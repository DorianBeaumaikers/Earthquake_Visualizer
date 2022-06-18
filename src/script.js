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
 async function fetchEarthquakes(limit = 20, mag = 0) {
    const response = await fetch('https://www.seismicportal.eu/fdsnws/event/1/query?orderby=time&limit='+limit+'&format=json&minmag='+mag);
    // waits until the request completes...
    return await response.json();
}

/**
 * Converti une latitude et longitude en une position x,y et z
 */
function convertLatLonToCartesian(lat, lon, radius){
    var phi = (90-lat) * (Math.PI/180);
    var theta = (lon+180) * (Math.PI/180);

    let x = radius * -(Math.sin(phi) * Math.cos(theta));
    let y = radius * Math.cos(phi);
    let z = radius * (Math.sin(phi) * Math.sin(theta));
    return {
        x, y, z
    }
}

/**
 * Crée un marqueur pour chaque tremblement de terre
 */
export async function createPins(limit, mag){
    const earthquakesData = await fetchEarthquakes(limit, mag);

    console.log(earthquakesData.features)

    let listeDiv = document.querySelector("#liste");

    earthquakesData.features.forEach(earthquake => {

        let date = new Date(earthquake.properties.time);

        let li = document.createElement("li");
        li.innerHTML = `
                <form class="quake">
                    <input type="hidden" name="region" value="${earthquake.properties.flynn_region}">
                    <input type="hidden" name="lat" value="${earthquake.properties.lat}">
                    <input type="hidden" name="lon" value="${earthquake.properties.lon}">
                    <input type="hidden" name="depth" value="${earthquake.properties.depth}">
                    <input type="hidden" name="mag" value="${earthquake.properties.mag}">
                    <input type="hidden" name="time" value="${date.toLocaleString('en-GB')}">
                    <p class="time">${date.toLocaleString('en-GB')}</p>
                    <input type="submit" value="Centrer caméra">
                    <p>${earthquake.properties.flynn_region} - ${earthquake.properties.mag}</p>
                </form>
        `;
        listeDiv.append(li);

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
        pin.time = date.toLocaleString('en-GB');

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

            default:
                break;
        }

        let pos = convertLatLonToCartesian(earthquake.properties.lat, earthquake.properties.lon, 1);

        pin.position.set(pos.x, pos.y, pos.z)

        scene.add(pin);

        pins.push(pin);
    });

    document.querySelectorAll("#liste .quake").forEach(quake => {
        quake.onsubmit = function(e){
            e.preventDefault();
            
            let pos = convertLatLonToCartesian(Number(e.target.elements.lat.value), Number(e.target.elements.lon.value), 2);
    
            camera.position.set(pos.x, pos.y, pos.z);

            let infos = document.querySelector("#infos");

            infos.querySelector("#region").innerHTML = e.target.elements.region.value;
            infos.querySelector("#lat").innerHTML = e.target.elements.lat.value;
            infos.querySelector("#lon").innerHTML = e.target.elements.lon.value;
            infos.querySelector("#depth").innerHTML = e.target.elements.depth.value + " km";
            infos.querySelector("#mag").innerHTML = e.target.elements.mag.value;
            infos.querySelector("#time").innerHTML = e.target.elements.time.value;

            infos.style.visibility = "visible";
        }
    });
}

/**
 * Non-ThreeJS
 */

let events = true;

const disableEvents = document.querySelectorAll(".disable-event");

disableEvents.forEach(disableEvent => {
    disableEvent.addEventListener("mouseenter", () => (events = false));
    disableEvent.addEventListener("mouseleave", () => (events = true));
});

document.querySelector('#filter').onsubmit = function(e){
    e.preventDefault();
    let limit = e.target.elements.limit.value;
    let mag = e.target.elements.mag.value;

    document.querySelector("#liste").innerHTML = "";

    pins.forEach(pin => {
        pin.material.dispose();
        pin.geometry.dispose();
        scene.remove(pin)
    });

    createPins(limit, mag);
};

document.querySelector("#openPanel").addEventListener("click", function(e) {
    document.querySelector("#interactPanel").style.left = "0";
})

document.querySelector("#closePanel").addEventListener("click", function(e) {
    document.querySelector("#interactPanel").style.left = "-500px";
})

document.querySelector("#openMoreInfos").addEventListener("click", function(e) {
    document.querySelector("#moreInfos").style.right = "0";
})

document.querySelector("#closeMoreInfos").addEventListener("click", function(e) {
    document.querySelector("#moreInfos").style.right = "-35%";
})


/**
 * ThreeJS
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
 * Raycaster
 */
 const raycaster = new THREE.Raycaster();

 let currentIntersect = null;
 let lastClicked = null;

 const objectsToTest = pins;

  /**
 * Mouse
 */
const mouse = new THREE.Vector2()
let drag = true;

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;

    drag = true;
})

window.addEventListener('mousedown', () => {
    drag = false;
 })

 window.addEventListener('click', () =>
{
    if(drag == false){
        let infos = document.querySelector("#infos");
        if(currentIntersect)
        {
            if(lastClicked != null){
                if(currentIntersect != lastClicked){
                    //lastClicked.object.material.color.set('#FF0000');
                }
            }
            //currentIntersect.object.material.color.set('#00FF00');
            lastClicked = currentIntersect;
            
            infos.querySelector("#region").innerHTML = currentIntersect.object.region;
            infos.querySelector("#lat").innerHTML = currentIntersect.object.lat;
            infos.querySelector("#lon").innerHTML = currentIntersect.object.lon;
            infos.querySelector("#depth").innerHTML = currentIntersect.object.depth + " km";
            infos.querySelector("#mag").innerHTML = currentIntersect.object.mag;
            infos.querySelector("#time").innerHTML = currentIntersect.object.time;

            infos.style.visibility = "visible";
        }
        else{
            if(events){
                infos.style.visibility = "hidden";
            }
        }
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    clouds.rotation.y = elapsedTime * 0.005;

    // Cast a ray
    const rayOrigin = new THREE.Vector3(- 3, 0, 0)
    const rayDirection = new THREE.Vector3(1, 0, 0)
    rayDirection.normalize()
    
    raycaster.set(rayOrigin, rayDirection)

    raycaster.setFromCamera(mouse, camera)
    
    const intersects = raycaster.intersectObjects(objectsToTest);

    for(const intersect of intersects)
    {
        intersect.object.scale.set(2, 2, 2);
    }

    for(const object of objectsToTest)
    {
        if(!intersects.find(intersect => intersect.object === object))
        {
            object.scale.set(1, 1, 1);
        }
    }

    if(intersects.length)
    {
        if(!currentIntersect)
        {
            //console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            //console.log('mouse leave')
        }
        
        currentIntersect = null;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();