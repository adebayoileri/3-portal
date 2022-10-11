import "./style.css";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// import { Dire } from "three/examples/jsm/helpers";
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

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
      //  &&
      // child.material instanceof THREE.MeshBasicMaterial
    ) {
      child.material.envMapIntensity = 1;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

const cmaeraLight = new THREE.AmbientLight(0x404040); // soft white light

cmaeraLight.position.set(5, 5, 0);
cmaeraLight.lookAt(0, 0, 0);
scene.add(cmaeraLight);

let col = 0x605050;
scene.background = new THREE.Color(col);
scene.fog = new THREE.Fog(col, 400, 480);

const width = 100;
const height = 100;
const intensity = 1;

const rectLight = new THREE.DirectionalLight("#ffffff", 4);
// rectLight.position.set( 0, 5, 5);
// rectLight.lookAt( 0, 5, 5 );
rectLight.castShadow = true;
rectLight.shadow.camera.far = 15;
rectLight.shadow.mapSize.set(1024, 1024);
rectLight.shadow.normalBias = 0.05;
rectLight.position.set(3, 3, -2.25);

// const helper = new RectAreaLightHelper( rectLight );
// rectLight.add(helper)
scene.add(rectLight);

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

// E7E545
// const firefliesMaterial = new THREE.PointsMaterial({
//     size: 0.1,
//     sizeAttenuation: true
// })

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

const updateMaterials = () => {};

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

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
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("portals.glb", (gltf) => {
  // console.log(gltf.scene);
  // gltf.scene.traverse((child) => {
  //   console.log(child.isMesh, child);

  // if (child.isMesh) {
  //   child.castShadow = true;
  //   child.receiveShadow = true;
  // }

  updateAllMaterials();

  // })
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
let mixer = null;

let fox = null;

gltfLoader.load("/models/Fox/glTF/Fox.gltf", (gltf) => {
  fox = gltf;
  mixer = new THREE.AnimationMixer(fox.scene);
  const action = mixer.clipAction(fox.animations[2]);

  // fox.scene.traverse(function (child) {

  //   // console.log(child.isMesh, child);
  //   // if (child.isMesh) {
  //     child.castShadow = true;
  //     child.receiveShadow = true;
  //   // }
  // });

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
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
if (mixer) {

console.log({fox});
}
// fox.position.z = 0.000001 ;
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
// console.log({fox});
    if(fox){
      fox.scene.position.z -= 0.02;
      if (fox.scene.position.z <= -0.199995) {
        fox.scene.position.y += 0.004;
      }

      if(fox.scene.position.z <= -2.3){
        // console.log();

        scene.remove(fox.scene)

        fox = null
        // scene.traverse((child) => {
        //   if (child instanceof THREE.Mesh) {
        //     child.geometry.dispose();

        //     for (const key in child.material) {
        //       const value = child.material[key];
        //       if (value && typeof value?.dispose === "function") {
        //         value.dispose();
        //       }
        //     }
        //   }
        // });
      }

    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
