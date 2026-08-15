import * as THREE from "three";

/* Contorno de canto arredondado, no plano XY. */
function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s;
}

/* Uma placa com o contorno arredondado e a borda chanfrada — o perfil
   que um bloco de alumínio usinado tem, e que uma caixa não tem.
   Sai deitada no plano XZ, centrada na origem. */
export function slabGeometry(
  w: number,
  d: number,
  thickness: number,
  corner: number,
  bevel: number,
): THREE.ExtrudeGeometry {
  const depth = Math.max(0.001, thickness - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, corner), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 24,
  });
  // Extrude cresce em +Z, de -bevel a depth+bevel; deitar leva isso para
  // +Y, então a peça precisa descer meia espessura para centrar.
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel - thickness / 2, 0);
  geo.computeVertexNormals();
  return geo;
}
