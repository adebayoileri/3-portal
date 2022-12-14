import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";
import * as THREE from "three";

export const firefliesShaderMaterial = (opts) => {
  return new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    ...opts,
  });
};
