"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { slabGeometry } from "../anatomy/shell";
import { deckTexture } from "../anatomy/texture";
import { dashboardTexture } from "./dashboard";

const BODY_W = 3.4;
const BASE_D = 2.34;
const BASE_H = 0.085;
const LID_H = 2.24;
const LID_T = 0.048;
const SCREEN_W = 3.2;
const SCREEN_H = 1.99;

const LID_OPEN = -0.3;
const CASE = "#c2c7cc";

type Props = {
  pointer: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  reduced: boolean;
};

export default function HeroLaptop({ pointer, scrollRef, reduced }: Props) {
  const rig = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Group>(null);
  const intro = useRef(0);
  const eased = useRef({ px: 0, py: 0, scroll: 0 });
  const viewport = useThree((s) => s.viewport);

  const baseGeo = useMemo(() => slabGeometry(BODY_W, BASE_D, BASE_H, 0.085, 0.014), []);
  const lidGeo = useMemo(() => slabGeometry(BODY_W, LID_H, LID_T, 0.08, 0.009), []);

  useEffect(() => () => void baseGeo.dispose(), [baseGeo]);
  useEffect(() => () => void lidGeo.dispose(), [lidGeo]);

  const fit = Math.min(0.94, Math.max(0.48, viewport.width / 5.8));
  // Acompanha o mesmo degradê do parallax em CSS.
  const pf = Math.min(1, fit / 0.94);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const e = eased.current;
    const t = state.clock.elapsedTime;

    intro.current = THREE.MathUtils.damp(intro.current, 1, reduced ? 40 : 2.6, dt);
    const lifted = intro.current;

    const p = pointer.current ?? { x: 0, y: 0 };
    if (!reduced) {
      e.px = THREE.MathUtils.damp(e.px, p.x, 3, dt);
      e.py = THREE.MathUtils.damp(e.py, p.y, 3, dt);
    }
    e.scroll = THREE.MathUtils.damp(e.scroll, scrollRef.current ?? 0, 7, dt);

    const r = rig.current;
    if (r) {
      // Entra pela direita e assenta.
      const enter = 1 - lifted;
      // Recuado da borda direita. Quanto mais estreita a tela, mais ele
      // se afasta — é lá que a headline chega perto.
      r.position.x = 0.12 + (1 - pf) * 0.9 + enter * 2.6;
      // Baixo o bastante para pousar na crista, não pairar sobre ela.
      r.position.y = -1.02 - e.scroll * 0.5;
      r.position.z = -enter * 1.2;

      // O objeto reage como se tivesse massa: amplitude curta, nunca
      // perseguindo o cursor. Cai junto com a tela.
      r.rotation.y = -0.46 + e.px * 0.085 * pf - e.scroll * 0.18;
      r.rotation.x = 0.12 - e.py * 0.042 * pf + e.scroll * 0.1;
      r.rotation.z = 0.032;
      r.scale.setScalar(fit * (0.94 + lifted * 0.06) * (1 - e.scroll * 0.06));
    }

    // Flutuação contínua: ciclo de ~6s, deslocamento pequeno.
    if (float.current && !reduced) {
      float.current.position.y = Math.sin(t * 1.05) * 0.055;
      float.current.rotation.z = Math.sin(t * 0.78) * 0.012;
      float.current.rotation.x = Math.cos(t * 0.62) * 0.008;
    }

    if (shadow.current) {
      shadow.current.position.set(0.12 + (1 - pf) * 0.9, -1.58 - e.scroll * 0.5, 0);
      shadow.current.scale.setScalar(fit);
    }
  });

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[-2, 1.5, 4]} scale={[8, 0.5, 1]} />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#ec1b2e"
          position={[4.5, 0, 1]}
          rotation-y={-Math.PI / 3}
          scale={[5, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[-5, 0.5, 2]}
          rotation-y={Math.PI / 3}
          scale={[5, 6, 1]}
        />
      </Environment>

      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} />
      <pointLight color="#ec1b2e" position={[3.4, -0.6, 1.6]} intensity={22} distance={10} />
      {/* luz rasante vinda de baixo: acende a aresta inferior do corpo */}
      <pointLight color="#ff2f3f" position={[0.5, -1.5, 1.4]} intensity={16} distance={6} />

      <group ref={shadow}>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.72}
          scale={12}
          blur={3.4}
          far={3.4}
          resolution={512}
          color="#000000"
        />
      </group>

      <group ref={rig}>
        <group ref={float}>
          <mesh geometry={baseGeo}>
            <meshStandardMaterial
              color={CASE}
              metalness={1}
              roughness={0.3}
              envMapIntensity={1.15}
            />
          </mesh>

          {[
            [-1.42, -0.92],
            [1.42, -0.92],
            [-1.42, 0.92],
            [1.42, 0.92],
          ].map(([x, z]) => (
            <mesh key={`${x}:${z}`} position={[x, -BASE_H / 2 - 0.008, z]}>
              <cylinderGeometry args={[0.05, 0.05, 0.016, 12]} />
              <meshStandardMaterial color="#131315" roughness={0.85} metalness={0} />
            </mesh>
          ))}

          <mesh position={[0, BASE_H / 2 + 0.0012, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.95, 2.14]} />
            <meshStandardMaterial
              map={deckTexture()}
              transparent
              roughness={0.6}
              metalness={0.2}
              envMapIntensity={0.6}
            />
          </mesh>

          <mesh
            position={[0, BASE_H / 2 - 0.012, -BASE_D / 2 + 0.045]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.032, 0.032, BODY_W - 0.62, 16]} />
            <meshStandardMaterial color="#1b1d20" metalness={0.85} roughness={0.5} />
          </mesh>

          <group position={[0, BASE_H / 2 - 0.012, -BASE_D / 2 + 0.045]} rotation={[LID_OPEN, 0, 0]}>
            <mesh geometry={lidGeo} position={[0, LID_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color={CASE}
                metalness={1}
                roughness={0.3}
                envMapIntensity={1.15}
              />
            </mesh>

            <group position={[0, LID_H / 2, LID_T / 2 + 0.002]}>
              <mesh>
                <planeGeometry args={[BODY_W - 0.1, LID_H - 0.1]} />
                <meshStandardMaterial
                  color="#0a0a0b"
                  roughness={0.3}
                  metalness={0.2}
                  envMapIntensity={0.4}
                />
              </mesh>

              <mesh position={[0, LID_H / 2 - 0.088, 0.001]}>
                <planeGeometry args={[0.44, 0.072]} />
                <meshBasicMaterial color="#08080a" />
              </mesh>

              {/* a interface */}
              <mesh position={[0, -0.02, 0.003]}>
                <planeGeometry args={[SCREEN_W, SCREEN_H]} />
                <meshBasicMaterial map={dashboardTexture()} toneMapped={false} />
              </mesh>

              <pointLight position={[0, -0.3, 0.7]} intensity={2.4} distance={2.4} color="#8fa6bd" />
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
