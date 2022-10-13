import "./style.css";
import * as dat from "lil-gui";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { firefliesShaderMaterial } from "./shaders/fireflies";
import { portalShaderMaterial } from "./shaders/portal";

/**
 * Base
 */
// Debug
let debugObject = {};
debugObject.clearColor = "#201919";
debugObject.portalColorStart = "#d4ce11";
debugObject.portalColorEnd = "#fffff";

let gui;
if (window.location.hash === "#debug") {
  gui = new dat.GUI({
    width: 400,
  });

  gui?.addColor(debugObject, "clearColor").onChange(() => {
    renderer.setClearColor(debugObject.clearColor);
  });

  gui?.addColor(debugObject, "portalColorStart").onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(
      debugObject.portalColorStart
    );
  });

  gui?.addColor(debugObject, "portalColorEnd").onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(
      debugObject.portalColorEnd
    );
  });
}

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: {
      value: 1,
    },
  },
  vertexShader: `
        void main(){
            gl_Position =  vec4(position, 1.0);
        }
    `,
  fragmentShader: `
    uniform float uAlpha;
    void main(){
        gl_FragColor = vec4(vec3(0.0), uAlpha);
    }
    `,
});

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);

scene.add(overlay);

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 1;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

const amBLight = new THREE.AmbientLight(0x404040); // soft white light

amBLight.position.set(5, 5, 0);
amBLight.lookAt(0, 0, 0);
scene.add(amBLight);

let col = 0x605050;
scene.background = new THREE.Color(col);
scene.fog = new THREE.Fog(col, 400, 480);

const directLight = new THREE.DirectionalLight("#ffffff", 4);
directLight.castShadow = true;
directLight.shadow.camera.far = 15;
directLight.shadow.mapSize.set(1024, 1024);
directLight.shadow.normalBias = 0.05;
directLight.position.set(3, 3, -2.25);

scene.add(directLight);

const floorGeometry = new THREE.PlaneGeometry(100, 100, 20);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: "#E7E545",
  side: THREE.DoubleSide,
  fog: true,
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.01;
floor.receiveShadow = true;

scene.add(floor);

const fireFliesGeomtery = new THREE.BufferGeometry();
const firefliesCount = 20;

const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let index = 0; index < firefliesCount; index++) {
  positionArray[index * 3] = (Math.random() - 0.5) * 6;
  positionArray[index * 3 + 1] = Math.random() * 1.5;
  positionArray[index * 3 + 2] = (Math.random() - 0.5) * 6;

  scaleArray[index] = Math.random();
}

fireFliesGeomtery.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);

fireFliesGeomtery.setAttribute(
  "aScale",
  new THREE.BufferAttribute(scaleArray, 1)
);

// fireflies material
const firefliesMaterial = firefliesShaderMaterial({
  uniforms: {
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 100 },
    uTime: { value: 0 },
  },
});

if (window.location.hash === "#debug") {
  gui
    .add(firefliesMaterial.uniforms.uSize, "value", 0, 500, 1)
    .name("firefliesSize");
}

const fireflies = new THREE.Points(fireFliesGeomtery, firefliesMaterial);

scene.add(fireflies);

/**
 * Loaders
 */

let loadingBar = document.getElementById("loading-bar");
let fileBeingLoaded = document.getElementById("file-loaded");

const LoadingManager = new THREE.LoadingManager(
  () => {
    gsap.delayedCall(0.8, () => {
      loadingBar.classList.add("ended");
      loadingBar.style.transform = "";

      fileBeingLoaded.style.display = `none`;
      loadingBar.style.display = `none`;

      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
    });
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal).toFixed(1);

    loadingBar.style.transform = `scaleX(${progress})`;
    fileBeingLoaded.innerHTML = `Loading... ${progress * 100}%`;
  }
);

// Texture loader
const textureLoader = new THREE.TextureLoader(LoadingManager);

const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.encoding = THREE.sRGBEncoding;
bakedTexture.flipY = false;

const bakedMaterial = new THREE.MeshBasicMaterial({
  map: bakedTexture,
  fog: true,
});

const portalLightMaterial = portalShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
    uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
  },
});

const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

// Draco loader
const dracoLoader = new DRACOLoader(LoadingManager);
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader(LoadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("portals.glb", (gltf) => {
  updateAllMaterials();
  const bakedMesh = gltf.scene.children.find((child) => child.name === "baked");

  const portalMesh = gltf.scene.children.find(
    (child) => child.name === "portalLight"
  );
  const poleAMesh = gltf.scene.children.find(
    (child) => child.name === "poleLightA"
  );
  const poleBMesh = gltf.scene.children.find(
    (child) => child.name === "poleLightB"
  );

  bakedMesh.material = bakedMaterial;

  portalMesh.material = portalLightMaterial;
  poleAMesh.material = poleLightMaterial;
  poleBMesh.material = poleLightMaterial;

  scene.add(gltf.scene);
});
let mixer = null;

let fox = null;

gltfLoader.load("/models/Fox/glTF/Fox.gltf", (gltf) => {
  fox = gltf;
  mixer = new THREE.AnimationMixer(fox.scene);
  const action = mixer.clipAction(fox.animations[2]);

  action.play();
  fox.scene.rotation.y = Math.PI;
  fox.scene.position.z = 3.6;

  fox.scene.scale.set(0.005, 0.005, 0.005);

  scene.add(fox.scene);

  updateAllMaterials();
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  2000
);
camera.position.x = 0;
camera.position.y = 1;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(debugObject.clearColor);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  portalLightMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();
  if (mixer) {
    mixer.update(deltaTime);
    if (fox) {
      fox.scene.position.z -= 0.02;
      if (fox.scene.position.z <= -0.199995) {
        fox.scene.position.y += 0.004;
      }

      if (fox.scene.position.z <= -2.3) {
        scene.remove(fox.scene);

        fox = null;
      }
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
