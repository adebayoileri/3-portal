import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";
import * as THREE from "three";

export const portalShaderMaterial = (opts) => {
  return new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    ...opts,
  });
};
