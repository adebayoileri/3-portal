import "./style.css";
import * as dat from "lil-gui";
import * as THREE from "three";
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

// console.log('hash', window.location.hash);
let gui;
if (window.location.hash === "#debug") {
  gui = new dat.GUI({
    width: 400,
  });

  gui?.addColor(debugObject, "clearColor").onChange(() => {
    renderer.setClearColor(debugObject.clearColor);
  });

  gui?.addColor(debugObject, "portalColorStart").onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart);
  });

  gui?.addColor(debugObject, "portalColorEnd").onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
  });
}



// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// const cmaeraLight = new THREE.AmbientLight( 0x404040 ); // soft white light

// cmaeraLight.position.set( 5, 5, 0 );
// cmaeraLight.lookAt( 0, 0, 0 );
// scene.add(cmaeraLight)

// let col = 0x605050;
// scene.background = new THREE.Color( col );
// scene.fog = new THREE.Fog( col, 500, 1500 );


const width = 100;
const height = 100;
const intensity = 1;
const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
rectLight.position.set( 5, 5, 0 );
rectLight.lookAt( 0, 0, 0 );
scene.add( rectLight )


const floorGeometry = new THREE.PlaneGeometry(100, 100, 20);
const floorMaterial = new THREE.MeshBasicMaterial({ color: '#E7E545', side: THREE.DoubleSide });


// const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// floor.rotation.x = - Math.PI * .5;
// floor.position.y =  -.01

// scene.add(floor)

const fireFliesGeomtery = new THREE.BufferGeometry();
const firefliesCount = 20;

const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);


for (let index = 0; index < firefliesCount; index++) {
  positionArray[index * 3] = (Math.random() - 0.5) * 6;
  positionArray[index * 3 + 1] = Math.random() * 1.5;
  positionArray[index * 3 + 2] = (Math.random() - 0.5) * 6;

  scaleArray[index ] = Math.random();

}

fireFliesGeomtery.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);


fireFliesGeomtery.setAttribute(
    "aScale",
    new THREE.BufferAttribute(scaleArray, 1)
  );


  // E7E545
// const firefliesMaterial = new THREE.PointsMaterial({
//     size: 0.1,
//     sizeAttenuation: true
// })

const firefliesMaterial = firefliesShaderMaterial({
  uniforms: {
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 100 },
    uTime: { value: 0 }
  },
});
if (window.location.hash === "#debug") {

gui
  .add(firefliesMaterial.uniforms.uSize, "value", 0, 500, 1)
  .name("firefliesSize");
}

const fireflies = new THREE.Points(fireFliesGeomtery, firefliesMaterial);

scene.add(fireflies);

const updateMaterials = () => {};

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.encoding = THREE.sRGBEncoding;
bakedTexture.flipY = false;

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

const portalLightMaterial = portalShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value:  new THREE.Color(debugObject.portalColorStart) },
    uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
  },
})



const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("portals.glb", (gltf) => {
  // console.log(gltf.scene);

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

  //   gltf.scene.traverse((child) => {
  //     let emmisions = ["portalLight", "poleLightA", "poleLightB"];
  //     console.log(child.name);
  //     if (emmisions.includes(child.name)) {
  //       if (child.name === "portalLight") {
  //         child.material = portalLightMaterial;
  //       } else {
  //         child.material = poleLightMaterial;
  //       }
  //     } else {
  //       child.material = bakedMaterial;
  //     }
  //     // child.receiveShadow =true
  //     // child.castShadow  =true
  //   });
  scene.add(gltf.scene);
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
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
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
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  portalLightMaterial.uniforms.uTime.value = elapsedTime;


  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
