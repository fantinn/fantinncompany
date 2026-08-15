"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Anatomy } from "./data";
import { anatomyMaterials } from "./materials";
import { deckTexture, glareTexture } from "./texture";
import { slabGeometry } from "./shell";

/* Proporções de um portátil de 14", em unidades de cena. */
const BODY_W = 3.4;
const BASE_D = 2.34;
const BASE_H = 0.085;
const LID_H = 2.24;
const LID_T = 0.048;
const SCREEN_W = 3.2;
const SCREEN_H = 1.99;

const LID_OPEN = -0.28; // ~106° — a inclinação em que se deixa um notebook
const LID_SHUT = Math.PI / 2;

const CASE = "#3b3e44"; // alumínio anodizado escuro

type Props = {
  anatomy: Anatomy;
  collapseRef: React.RefObject<number>;
  highlight: string | null;
  reduced: boolean;
};

export default function Laptop({ anatomy, collapseRef, highlight, reduced }: Props) {
  const rig = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Mesh | null)[]>([]);
  const intro = useRef(0);
  const swap = useRef(0);
  const eased = useRef({ collapse: 0, px: 0, py: 0 });
  const viewport = useThree((s) => s.viewport);

  const materials = anatomyMaterials(anatomy);
  const count = anatomy.layers.length;
  const fit = Math.min(1.05, Math.max(0.5, viewport.width / 5.2));

  const baseGeo = useMemo(
    () => slabGeometry(BODY_W, BASE_D, BASE_H, 0.085, 0.014),
    [],
  );
  const lidGeo = useMemo(() => slabGeometry(BODY_W, LID_H, LID_T, 0.08, 0.009), []);

  useEffect(() => () => void baseGeo.dispose(), [baseGeo]);
  useEffect(() => () => void lidGeo.dispose(), [lidGeo]);

  useEffect(() => {
    swap.current = 0;
    for (const m of anatomyMaterials(anatomy)) m.uniforms.uStrength.value = 0;
  }, [anatomy]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const e = eased.current;

    intro.current = THREE.MathUtils.damp(intro.current, 1, reduced ? 40 : 2.2, dt);
    swap.current = THREE.MathUtils.damp(swap.current, 1, 7, dt);

    const collapse = reduced ? 0 : (collapseRef.current ?? 0);
    e.collapse = THREE.MathUtils.damp(e.collapse, collapse, 6, dt);

    if (!reduced) {
      e.px = THREE.MathUtils.damp(e.px, state.pointer.x, 3.5, dt);
      e.py = THREE.MathUtils.damp(e.py, state.pointer.y, 3.5, dt);
    }

    const open = 1 - e.collapse;
    const lifted = intro.current;

    // A tampa abre no carregamento; o corpo gira para a frente ao rolar.
    if (lid.current) {
      lid.current.rotation.x = THREE.MathUtils.lerp(LID_SHUT, LID_OPEN, lifted);
    }

    const y = THREE.MathUtils.lerp(-1.02, -0.66, e.collapse);
    const r = rig.current;
    if (r) {
      r.rotation.y = (-0.5 * open + e.px * 0.16) * lifted;
      r.rotation.x = (0.19 * open + 0.02) * lifted - e.py * 0.07;
      r.position.y = y;
      r.position.z = e.collapse * 1.6;
      r.scale.setScalar(fit);
    }
    if (shadow.current) {
      shadow.current.position.y = y - 0.05;
      shadow.current.scale.setScalar(fit);
    }

    // A tela acende depois que a tampa já subiu.
    const power = THREE.MathUtils.smoothstep(lifted, 0.6, 0.97);

    for (let i = 0; i < count; i++) {
      const mesh = layers.current[i];
      if (!mesh) continue;
      const lit = highlight === null || highlight === anatomy.layers[i].id;
      const u = (mesh.material as THREE.ShaderMaterial).uniforms;

      u.uStrength.value = THREE.MathUtils.damp(
        u.uStrength.value,
        (lit ? 1 : 0.12) * swap.current * power,
        9,
        dt,
      );
      // Rolar a página real rola o site dentro da tela.
      u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, e.collapse, 6, dt);
    }
  });

  return (
    <>
      {/* Estúdio montado com painéis de luz — sem buscar HDR na rede.
          As faixas estreitas é que produzem os riscos de reflexo no metal. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[0, 1.5, 4]} scale={[10, 0.6, 1]} />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-5, 1.5, 2]}
          rotation-y={Math.PI / 3}
          scale={[6, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#ec1b2e"
          position={[5, 0.5, 1.5]}
          rotation-y={-Math.PI / 3}
          scale={[5, 7, 1]}
        />
        <Lightformer form="rect" intensity={0.6} position={[0, -3, 1]} scale={[8, 3, 1]} />
      </Environment>

      <ambientLight intensity={0.22} />
      <directionalLight position={[4, 6, 5]} intensity={1} />
      <pointLight color="#ec1b2e" position={[-3.4, 0.5, 2]} intensity={12} distance={9} />

      <group ref={shadow}>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.42}
          scale={9}
          blur={2.6}
          far={2.5}
          resolution={512}
          color="#2a2b30"
        />
      </group>

      <group ref={rig}>
        {/* base usinada */}
        <mesh geometry={baseGeo} castShadow>
          <meshStandardMaterial
            color={CASE}
            metalness={1}
            roughness={0.34}
            envMapIntensity={1.25}
          />
        </mesh>

        {/* pés de borracha */}
        {[
          [-1.42, -0.92],
          [1.42, -0.92],
          [-1.42, 0.92],
          [1.42, 0.92],
        ].map(([x, z]) => (
          <mesh key={`${x}:${z}`} position={[x, -BASE_H / 2 - 0.008, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.016, 16]} />
            <meshStandardMaterial color="#141416" roughness={0.85} metalness={0} />
          </mesh>
        ))}

        {/* teclado, grelhas e trackpad */}
        <mesh position={[0, BASE_H / 2 + 0.0012, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.95, 2.14]} />
          <meshStandardMaterial
            map={deckTexture()}
            transparent
            roughness={0.6}
            metalness={0.2}
            envMapIntensity={0.7}
          />
        </mesh>

        {/* dobradiça */}
        <mesh position={[0, BASE_H / 2 - 0.012, -BASE_D / 2 + 0.045]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, BODY_W - 0.62, 20]} />
          <meshStandardMaterial color="#1b1d20" metalness={0.85} roughness={0.5} />
        </mesh>

        {/* tampa — gira na dobradiça, na aresta traseira da base */}
        <group ref={lid} position={[0, BASE_H / 2 - 0.012, -BASE_D / 2 + 0.045]}>
          <mesh geometry={lidGeo} position={[0, LID_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={CASE}
              metalness={1}
              roughness={0.34}
              envMapIntensity={1.25}
            />
          </mesh>

          <group position={[0, LID_H / 2, LID_T / 2 + 0.002]}>
            {/* bezel */}
            <mesh>
              <planeGeometry args={[BODY_W - 0.1, LID_H - 0.1]} />
              <meshStandardMaterial
                color="#0a0a0b"
                roughness={0.28}
                metalness={0.2}
                envMapIntensity={0.5}
              />
            </mesh>

            {/* notch */}
            <mesh position={[0, LID_H / 2 - 0.088, 0.001]}>
              <planeGeometry args={[0.44, 0.072]} />
              <meshBasicMaterial color="#08080a" />
            </mesh>

            {/* tela */}
            <mesh position={[0, -0.02, 0.002]}>
              <planeGeometry args={[SCREEN_W, SCREEN_H]} />
              <meshBasicMaterial color="#050506" />
            </mesh>
            {anatomy.layers.map((layer, i) => (
              <mesh
                key={layer.id}
                ref={(el) => {
                  layers.current[i] = el;
                }}
                position={[0, -0.02, 0.003 + i * 0.0006]}
                renderOrder={i + 1}
                material={materials[i]}
              >
                <planeGeometry args={[SCREEN_W, SCREEN_H]} />
              </mesh>
            ))}

            {/* reflexo do vidro */}
            <mesh position={[0, -0.02, 0.008]} renderOrder={20}>
              <planeGeometry args={[SCREEN_W, SCREEN_H]} />
              <meshBasicMaterial
                map={glareTexture()}
                transparent
                opacity={0.45}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* a tela ilumina o teclado */}
            <pointLight position={[0, -0.3, 0.6]} intensity={2} distance={2.6} color="#9fb4c9" />
          </group>
        </group>
      </group>
    </>
  );
}
