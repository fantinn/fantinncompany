import * as THREE from "three";
import type { Anatomy } from "./data";
import { layerTexture } from "./texture";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* A tela do notebook é uma viewport: mostra só uma faixa da página
   (uWindow) e desliza por ela conforme o visitante rola (uScroll).
   Preto é o neutro do blending aditivo, então "apagar" uma camada é
   escurecê-la até zero — o alpha não teria efeito aqui. */
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uStrength;
  uniform float uScroll;
  uniform float uWindow;
  varying vec2 vUv;
  void main() {
    float top = 1.0 - uWindow - uScroll * (1.0 - uWindow);
    vec3 t = texture2D(uMap, vec2(vUv.x, top + vUv.y * uWindow)).rgb;
    // Uma tela emite luz: sobrepõe o ganho que o tone mapping tira.
    gl_FragColor = vec4(t * uStrength * 1.55, 1.0);
  }
`;

/* Fração da página visível na tela — mantém a proporção do desenho. */
export const SCREEN_WINDOW = 0.495;

const cache = new Map<string, THREE.ShaderMaterial[]>();

export function anatomyMaterials(anatomy: Anatomy): THREE.ShaderMaterial[] {
  const hit = cache.get(anatomy.id);
  if (hit) return hit;

  const made = anatomy.layers.map(
    (layer) =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uMap: { value: layerTexture(anatomy.id, layer) },
          uStrength: { value: 0 },
          uScroll: { value: 0 },
          uWindow: { value: SCREEN_WINDOW },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
  );
  cache.set(anatomy.id, made);
  return made;
}
